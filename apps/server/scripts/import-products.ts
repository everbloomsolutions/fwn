import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../src/core/config';
import { Category } from '../src/modules/category/category.model';
import { Product } from '../src/modules/product/product.model';
import { logger } from '../src/core/middleware/logger';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  if (!content) return [];

  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of content) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current) lines.push(current);

  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

function parseLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values.map(v => v.replace(/^"|"$/g, ''));
}

function parseArray(value: string): string[] {
  if (!value) return [];
  return value.split('|').map(v => v.trim()).filter(Boolean);
}

const importProducts = async (): Promise<void> => {
  try {
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    const filePath = process.argv[2] || path.resolve(__dirname, '../data/products.csv');
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    await mongoose.connect(config.mongodbUri);
    logger.info(`Connected to MongoDB for CSV import: ${filePath}`);

    const rows = parseCSV(filePath);
    const categories = await Category.find({});
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();
    categories.forEach(cat => categoryMap.set(cat.slug, cat._id as mongoose.Types.ObjectId));

    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      if (!row.sku || !row.name || !row.slug) {
        logger.warn('Skipping invalid row:', row);
        skipped++;
        continue;
      }

      const existing = await Product.findOne({ sku: row.sku });
      if (existing) {
        logger.warn(`Product with SKU ${row.sku} already exists, skipping`);
        skipped++;
        continue;
      }

      const categoryId = categoryMap.get(row.category);
      if (!categoryId) {
        logger.warn(`Category not found: ${row.category}`);
        skipped++;
        continue;
      }

      await Product.create({
        sku: row.sku,
        name: row.name,
        slug: row.slug,
        category: categoryId,
        description: row.description || `${row.name} - natural food product.`,
        price: parseFloat(row.price) || 0,
        unit: row.unit || '500g',
        stock: parseInt(row.stock, 10) || 0,
        images: parseArray(row.images),
        tags: parseArray(row.tags),
        ingredients: parseArray(row.ingredients),
        certifications: parseArray(row.certifications),
        isActive: row.isActive?.toLowerCase() !== 'false',
        nutrition: {},
      });
      created++;
      logger.info(`Imported product: ${row.name}`);
    }

    logger.info(`CSV import complete. Created: ${created}, Skipped: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('CSV import failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

importProducts();
