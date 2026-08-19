import { Cart, ICart } from './cart.model';
import { Product } from '../product/product.model';
import mongoose from 'mongoose';

interface AddItemData {
  productId: string;
  variantId: string;
  quantity: number;
}

function computeGrandTotal(cart: ICart): void {
  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  cart.grandTotal = Math.max(0, subtotal + cart.shipping - cart.discount);
}

function getCartSelector(userId?: string, guestId?: string): { userId?: mongoose.Types.ObjectId; guestId?: string } {
  if (userId) {
    return { userId: new mongoose.Types.ObjectId(userId) };
  }
  if (guestId) {
    return { guestId };
  }
  throw new Error('userId or guestId is required');
}

export const getOrCreateCart = async (userId?: string, guestId?: string): Promise<ICart> => {
  const selector = getCartSelector(userId, guestId);
  let cart = await Cart.findOne(selector);
  if (!cart) {
    cart = new Cart({ ...selector, items: [], shipping: 0, discount: 0, grandTotal: 0 });
    await cart.save();
  }
  return cart;
};

export const addItemToCart = async (data: AddItemData, userId?: string, guestId?: string): Promise<ICart> => {
  const product = await Product.findById(data.productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const variant = product.variants.find((v) => v._id.toString() === data.variantId);
  if (!variant) {
    throw new Error('Variant not found');
  }

  if (variant.stock < data.quantity) {
    throw new Error(`Only ${variant.stock} units available for ${variant.unit}`);
  }

  const cart = await getOrCreateCart(userId, guestId);
  const existing = cart.items.find(
    (item) => item.product.toString() === data.productId && item.variant.toString() === data.variantId
  );

  if (existing) {
    const newQuantity = existing.quantity + data.quantity;
    if (variant.stock < newQuantity) {
      throw new Error(`Only ${variant.stock} units available for ${variant.unit}`);
    }
    existing.quantity = newQuantity;
  } else {
    cart.items.push({
      product: product._id as mongoose.Types.ObjectId,
      variant: variant._id,
      name: product.name,
      unit: variant.unit,
      quantity: data.quantity,
      unitPrice: variant.price,
      discount: 0,
      image: product.images[0],
    });
  }

  computeGrandTotal(cart);
  await cart.save();
  return cart;
};

export const updateItemQuantity = async (
  variantId: string,
  quantity: number,
  userId?: string,
  guestId?: string
): Promise<ICart> => {
  const cart = await getOrCreateCart(userId, guestId);
  const item = cart.items.find((i) => i.variant.toString() === variantId);

  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity < 1) {
    cart.items = cart.items.filter((i) => i.variant.toString() !== variantId);
  } else {
    const product = await Product.findById(item.product);
    const variant = product?.variants.find((v) => v._id.toString() === variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }
    if (variant.stock < quantity) {
      throw new Error(`Only ${variant.stock} units available`);
    }
    item.quantity = quantity;
  }

  computeGrandTotal(cart);
  await cart.save();
  return cart;
};

export const removeItemFromCart = async (variantId: string, userId?: string, guestId?: string): Promise<ICart> => {
  const cart = await getOrCreateCart(userId, guestId);
  cart.items = cart.items.filter((i) => i.variant.toString() !== variantId);
  computeGrandTotal(cart);
  await cart.save();
  return cart;
};

export const clearCart = async (userId?: string, guestId?: string): Promise<void> => {
  await Cart.deleteOne(getCartSelector(userId, guestId));
};

export const assignCartToUser = async (guestId: string, userId: string): Promise<void> => {
  const guestCart = await Cart.findOne({ guestId });
  if (!guestCart || guestCart.items.length === 0) {
    return;
  }

  const userCart = await getOrCreateCart(userId);
  for (const guestItem of guestCart.items) {
    const existing = userCart.items.find(
      (i) => i.product.toString() === guestItem.product.toString() && i.variant.toString() === guestItem.variant.toString()
    );
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      userCart.items.push(guestItem);
    }
  }

  computeGrandTotal(userCart);
  await userCart.save();
  await Cart.deleteOne({ guestId });
};
