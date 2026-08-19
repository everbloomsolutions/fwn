import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { config } from '../src/core/config';
import { Category } from '../src/modules/category/category.model';
import { Product } from '../src/modules/product/product.model';
import { logger } from '../src/core/middleware/logger';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sampleCategories = [
  { name: 'Cold-Pressed Oils', slug: 'cold-pressed-oils', image: 'https://images.unsplash.com/photo-1474979266404-7caddbed54e6?w=800&h=600&fit=crop' },
  { name: 'Organic Honey', slug: 'organic-honey', image: 'https://images.unsplash.com/photo-1587049352846-4a222e112d90?w=800&h=600&fit=crop' },
  { name: 'Whole Spices', slug: 'whole-spices', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=600&fit=crop' },
  { name: 'Grains & Pulses', slug: 'grains-pulses', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop' },
  { name: 'Natural Sweeteners', slug: 'natural-sweeteners', image: 'https://images.unsplash.com/photo-1622484212850-eb936d1f3644?w=800&h=600&fit=crop' },
];

const sampleProducts = [
  { sku: 'FWN-CP-001', name: 'Cold-Pressed Groundnut Oil', slug: 'cold-pressed-groundnut-oil', category: 'cold-pressed-oils', price: 420, unit: '1L', stock: 50, images: ['https://images.unsplash.com/photo-1474979266404-7caddbed54e6?w=800&h=600&fit=crop'], tags: ['oil', 'groundnut', 'cold-pressed'], ingredients: ['Groundnuts'], certifications: ['FSSAI'] },
  { sku: 'FWN-CP-002', name: 'Cold-Pressed Sesame Oil', slug: 'cold-pressed-sesame-oil', category: 'cold-pressed-oils', price: 380, unit: '500ml', stock: 40, images: ['https://images.unsplash.com/photo-1607603756572-7d7f0e6e91d3?w=800&h=600&fit=crop'], tags: ['oil', 'sesame', 'cold-pressed'], ingredients: ['Sesame seeds'], certifications: ['FSSAI'] },
  { sku: 'FWN-HO-001', name: 'Raw Wildflower Honey', slug: 'raw-wildflower-honey', category: 'organic-honey', price: 650, unit: '500g', stock: 80, images: ['https://images.unsplash.com/photo-1587049352846-4a222e112d90?w=800&h=600&fit=crop'], tags: ['honey', 'raw', 'organic'], ingredients: ['Honey'], certifications: ['FSSAI'] },
  { sku: 'FWN-SP-001', name: 'Garam Masala Whole Spices', slug: 'garam-masala-whole-spices', category: 'whole-spices', price: 220, unit: '250g', stock: 100, images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=600&fit=crop'], tags: ['spices', 'masala', 'whole'], ingredients: ['Cinnamon, cloves, cardamom, pepper, cumin'], certifications: ['FSSAI'] },
  { sku: 'FWN-GR-001', name: 'Sonamasuri Brown Rice', slug: 'sonamasuri-brown-rice', category: 'grains-pulses', price: 180, unit: '1kg', stock: 120, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop'], tags: ['rice', 'brown', 'grains'], ingredients: ['Brown rice'], certifications: ['FSSAI'] },
  { sku: 'FWN-SW-001', name: 'Organic Jaggery Blocks', slug: 'organic-jaggery-blocks', category: 'natural-sweeteners', price: 140, unit: '500g', stock: 60, images: ['https://images.unsplash.com/photo-1622484212850-eb936d1f3644?w=800&h=600&fit=crop'], tags: ['jaggery', 'sweetener', 'organic'], ingredients: ['Sugarcane juice'], certifications: ['FSSAI'] },
];

const seedProducts = async (): Promise<void> => {
  try {
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(config.mongodbUri);
    logger.info('Connected to MongoDB for product seeding');

    await Product.deleteMany({});
    await Category.deleteMany({});
    logger.info('Cleared existing products and categories');

    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const cat of sampleCategories) {
      const created = await Category.create(cat);
      categoryMap.set(cat.slug, created._id as mongoose.Types.ObjectId);
      logger.info(`Created category: ${cat.name}`);
    }

    for (const prod of sampleProducts) {
      const categoryId = categoryMap.get(prod.category);
      if (!categoryId) {
        logger.warn(`Category not found for ${prod.category}`);
        continue;
      }

      await Product.create({
        ...prod,
        description: `${prod.name} is a premium natural product sourced responsibly for your healthy lifestyle.`,
        category: categoryId,
        isActive: true,
        nutrition: { energy: '120 kcal', protein: '2g', fat: '10g', carbs: '5g' },
      });
      logger.info(`Created product: ${prod.name}`);
    }

    logger.info('Product seeding completed');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Product seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedProducts();
