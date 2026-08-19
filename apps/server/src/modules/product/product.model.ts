import mongoose, { Document, Schema } from 'mongoose';

export type MeasurementUnit = 'g' | 'kg' | 'ml' | 'ltr' | 'pcs' | 'unit';

export interface IProductVariant {
  _id: mongoose.Types.ObjectId;
  sku: string;
  quantity: number;
  measurement: MeasurementUnit;
  unit: string;
  price: number;
  stock: number;
  mrp?: number;
  isActive: boolean;
  position: number;
}

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
  isBestSeller: boolean;
  rating?: number;
  reviewCount?: number;
  nutrition?: Record<string, string>;
  ingredients?: string[];
  certifications?: string[];
  variants: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    measurement: {
      type: String,
      enum: ['g', 'kg', 'ml', 'ltr', 'pcs', 'unit'],
      required: true,
      default: 'g',
    },
    unit: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    mrp: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false }
);

productVariantSchema.pre('validate', function (next) {
  if (this.quantity && this.measurement) {
    this.unit = `${this.quantity}${this.measurement}`;
  }
  next();
});

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
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
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
    variants: [productVariantSchema],
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ 'variants.measurement': 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
