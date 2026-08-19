#!/usr/bin/env node

/**
 * One-time script: recalculate product salesCount from existing orders
 * and set isBestSeller for the top 10 products.
 */

import mongoose from 'mongoose';
import { config } from '../src/core/config';
import { logger } from '../src/core/middleware/logger';
import { Product } from '../src/modules/product/product.model';
import { Order } from '../src/modules/order/order.model';
import { updateTopBestSellers } from '../src/modules/product/product.service';

async function recalculateBestSellers() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(config.mongodbUri);
  logger.info('Connected to MongoDB for best-seller recalculation');

  // Reset counts
  await Product.updateMany({}, { $set: { salesCount: 0, isBestSeller: false } });

  const orders = await Order.find({ status: { $ne: 'cancelled' } });
  logger.info(`Processing ${orders.length} non-cancelled orders`);

  const salesMap = new Map<string, number>();

  for (const order of orders) {
    for (const item of order.items) {
      const productId = item.product.toString();
      salesMap.set(productId, (salesMap.get(productId) || 0) + item.quantity);
    }
  }

  for (const [productId, quantity] of salesMap.entries()) {
    await Product.updateOne({ _id: productId }, { $set: { salesCount: quantity } });
  }

  await updateTopBestSellers();

  const top = await Product.find({ isBestSeller: true }).sort({ salesCount: -1 }).select('name salesCount').exec();
  logger.info(`Top best sellers: ${top.map((p) => `${p.name} (${p.salesCount})`).join(', ')}`);

  await mongoose.disconnect();
  process.exit(0);
}

recalculateBestSellers().catch((err) => {
  logger.error('Recalculation failed:', err);
  process.exit(1);
});
