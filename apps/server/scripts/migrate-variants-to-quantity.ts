#!/usr/bin/env node

/**
 * One-time migration: regenerate variants with quantity + measurement.
 * Converts variants to 200g/500g/1kg (or 200ml/500ml/1ltr for oils, pcs for eco).
 * Uses the 500g/500ml/pcs price as the base when present; otherwise product.price.
 */

import mongoose from 'mongoose';
import { config } from '../src/core/config';
import { logger } from '../src/core/middleware/logger';
import { Product } from '../src/modules/product/product.model';
import { Category } from '../src/modules/category/category.model';
import { generateVariantTemplates } from '../src/modules/product/variantTemplates';

async function migrateVariantsToQuantity() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(config.mongodbUri);
  logger.info('Connected to MongoDB for quantity/measurement migration');

  const products = await Product.find({});
  logger.info(`Found ${products.length} products to migrate`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      const category = await Category.findById(product.category);
      const categorySlug = category?.slug || '';
      const productId = product.sku;

      // Try to use the 500g/500ml/1pcs variant price as base; fall back to product price
      const old = product.variants || [];
      const base500 = old.find((v) => v.unit === '500g' || v.unit === '500ml' || v.unit === '1pcs');
      const basePrice = base500?.price || product.price || 0;
      const baseStock = product.stock || 0;

      const variants = generateVariantTemplates(categorySlug, product.name, productId, basePrice, baseStock);

      product.variants = variants as any;
      product.price = Math.min(...variants.map((v) => v.price));
      product.unit = variants[0]?.unit || product.unit;
      product.stock = variants.reduce((sum, v) => sum + v.stock, 0);

      await product.save();
      updated++;
      logger.info(`Migrated ${product.name} — ${variants.map((v) => v.unit).join(', ')}`);
    } catch (error) {
      logger.warn(`Failed to migrate ${product.name}:`, error);
      skipped++;
    }
  }

  logger.info(`Migration complete. Updated: ${updated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

migrateVariantsToQuantity().catch((err) => {
  logger.error('Quantity/measurement migration failed:', err);
  process.exit(1);
});
