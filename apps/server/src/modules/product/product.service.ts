import { Product, IProduct } from './product.model';
import { Category } from '../category/category.model';
import mongoose from 'mongoose';

export interface CreateProductData {
  sku: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
  nutrition?: Record<string, string>;
  ingredients?: string[];
  certifications?: string[];
}

export const createProduct = async (data: CreateProductData): Promise<IProduct> => {
  const category = await Category.findById(data.category);
  if (!category) {
    throw new Error('Category not found');
  }

  const product = new Product({
    ...data,
    category: new mongoose.Types.ObjectId(data.category),
  });
  return await product.save();
};

export const getProducts = async (
  categorySlug?: string,
  active?: boolean
): Promise<IProduct[]> => {
  const query: Record<string, unknown> = {};

  if (active !== undefined) {
    query.isActive = active;
  }

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug });
    if (category) {
      query.category = category._id;
    }
  }

  return await Product.find(query)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
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

  return await Product.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).populate('category', 'name slug').exec();
};

export const deleteProduct = async (id: string): Promise<IProduct | null> => {
  return await Product.findByIdAndDelete(id).exec();
};
