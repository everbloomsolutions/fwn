import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  description: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  nutrition?: Record<string, string>;
  ingredients?: string[];
  certifications?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      default: '500g',
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [{
      type: String,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    nutrition: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ingredients: [{
      type: String,
      trim: true,
    }],
    certifications: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);
