import { Product, IProduct } from './product.model';
import { Category } from '../category/category.model';
import mongoose from 'mongoose';
import { generateVariantTemplates, getUnitDisplay } from './variantTemplates';

export interface CreateProductData {
  sku: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price?: number;
  unit?: string;
  stock?: number;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
  isBestSeller?: boolean;
  rating?: number;
  reviewCount?: number;
  nutrition?: Record<string, string>;
  ingredients?: string[];
  certifications?: string[];
  variants: {
    sku: string;
    quantity: number;
    measurement: string;
    unit: string;
    price: number;
    stock: number;
    mrp?: number;
    isActive?: boolean;
    position?: number;
  }[];
}

function normalizeVariantUnit(variant: CreateProductData['variants'][0]): void {
  if (variant.quantity && variant.measurement) {
    variant.unit = getUnitDisplay(variant.quantity, variant.measurement as 'g' | 'kg' | 'ml' | 'ltr' | 'pcs' | 'unit');
  }
}

function deriveBaseFields(data: CreateProductData): Partial<CreateProductData> {
  const activeVariants = data.variants.filter((v) => v.isActive !== false);
  activeVariants.forEach((v) => normalizeVariantUnit(v));
  const sorted = [...activeVariants].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const first = sorted[0] || activeVariants[0] || data.variants[0];
  const minPrice = Math.min(...activeVariants.map((v) => v.price));
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return {
    price: data.price ?? minPrice,
    unit: data.unit ?? first?.unit ?? '500g',
    stock: data.stock ?? totalStock,
  };
}

export const createProduct = async (data: CreateProductData): Promise<IProduct> => {
  const category = await Category.findById(data.category);
  if (!category) {
    throw new Error('Category not found');
  }

  data.variants.forEach((v) => normalizeVariantUnit(v));
  const derived = deriveBaseFields(data);

  const product = new Product({
    ...data,
    ...derived,
    category: new mongoose.Types.ObjectId(data.category),
  });
  return await product.save();
};

export interface GetProductsFilters {
  category?: string;
  active?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  unit?: string;
  measurement?: string;
  inStock?: boolean;
  isBestSeller?: boolean;
  sort?: 'popular' | 'best_selling' | 'price_asc' | 'price_desc' | 'newest';
}

export const getProducts = async (filters: GetProductsFilters = {}): Promise<IProduct[]> => {
  const query: Record<string, unknown> = {};

  if (filters.active !== undefined) {
    query.isActive = filters.active;
  }

  if (filters.category) {
    const category = await Category.findOne({ slug: filters.category });
    if (category) {
      query.category = category._id;
    }
  }

  if (filters.search) {
    query.$or = [
      { $text: { $search: filters.search } },
      { name: { $regex: filters.search, $options: 'i' } },
      { tags: { $in: [new RegExp(filters.search, 'i')] } },
    ];
  }

  if (filters.isBestSeller !== undefined) {
    query.isBestSeller = filters.isBestSeller;
  }

  if (filters.inStock) {
    query.stock = { $gt: 0 };
  }

  if (filters.unit) {
    query['variants.unit'] = filters.unit;
  }

  if (filters.measurement) {
    query['variants.measurement'] = filters.measurement;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) (query.price as Record<string, number>).$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) (query.price as Record<string, number>).$lte = filters.maxPrice;
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  switch (filters.sort) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'best_selling':
      sort = { isBestSeller: -1, createdAt: -1 };
      break;
    case 'popular':
      sort = { rating: -1, reviewCount: -1 };
      break;
    case 'newest':
    default:
      sort = { createdAt: -1 };
  }

  return await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .exec();
};

export const getProductBySlug = async (slug: string): Promise<IProduct | null> => {
  return await Product.findOne({ slug }).populate('category', 'name slug').exec();
};

export const getProductById = async (id: string): Promise<IProduct | null> => {
  return await Product.findById(id).populate('category', 'name slug').exec();
};

export const updateProduct = async (
  id: string,
  data: Partial<CreateProductData>
): Promise<IProduct | null> => {
  if (data.category) {
    const category = await Category.findById(data.category);
    if (!category) {
      throw new Error('Category not found');
    }
    data.category = category._id.toString();
  }

  if (data.variants) {
    data.variants.forEach((v) => normalizeVariantUnit(v));
    const derived = deriveBaseFields(data as CreateProductData);
    data.price = derived.price;
    data.unit = derived.unit;
    data.stock = derived.stock;
  }

  return await Product.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).populate('category', 'name slug').exec();
};

export const deleteProduct = async (id: string): Promise<IProduct | null> => {
  return await Product.findByIdAndDelete(id).exec();
};

export { generateVariantTemplates };
