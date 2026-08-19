#!/usr/bin/env node

/**
 * One-time migration: convert flat products into Product + Variants.
 * Existing 81 Pranahita products will get 500g/1kg/2kg variants.
 * Safe to re-run: only updates products whose `variants` array is missing or empty.
 */

import mongoose from 'mongoose';
import { config } from '../src/core/config';
import { logger } from '../src/core/middleware/logger';
import { Product } from '../src/modules/product/product.model';

async function migrateProductsToVariants() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(config.mongodbUri);
  logger.info('Connected to MongoDB for variant migration');

  const products = await Product.find({ $or: [{ variants: { $exists: false } }, { variants: { $size: 0 } }] });
  logger.info(`Found ${products.length} products without variants`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      const basePrice = product.price || 0;
      const baseStock = product.stock > 0 ? Math.max(1, Math.floor(product.stock / 3)) : 0;
      const productId = product.sku;

      const variants = [
        { sku: `${productId}-500g`, unit: '500g', price: basePrice, stock: baseStock, position: 0, isActive: true },
        { sku: `${productId}-1kg`, unit: '1kg', price: basePrice * 2, stock: baseStock, position: 1, isActive: true },
        { sku: `${productId}-2kg`, unit: '2kg', price: basePrice * 4, stock: baseStock, position: 2, isActive: true },
      ];

      product.variants = variants as any;
      product.price = basePrice;
      product.unit = '500g';
      product.stock = product.stock;
      product.isBestSeller = false;

      await product.save();
      updated++;
      logger.info(`Migrated ${product.name} with ${variants.length} variants`);
    } catch (error) {
      logger.warn(`Failed to migrate ${product.name}:`, error);
      skipped++;
    }
  }

  logger.info(`Migration complete. Updated: ${updated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

migrateProductsToVariants().catch((err) => {
  logger.error('Variant migration failed:', err);
  process.exit(1);
});
