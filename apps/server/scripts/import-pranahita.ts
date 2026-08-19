#!/usr/bin/env node

/**
 * Scrape products from Pranahita Naturals and import into the FWN database.
 * Downloads product images to apps/web/public/images/products.
 */

import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import { config } from '../src/core/config';
import { logger } from '../src/core/middleware/logger';
import { Category } from '../src/modules/category/category.model';
import { Product } from '../src/modules/product/product.model';
import { generateVariantTemplates } from '../src/modules/product/variantTemplates';

const BASE = 'https://www.pranahitanaturals.com';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IMG_DIR = path.resolve(__dirname, '../../web/public/images/products');

interface ScrapedProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  image: string;
  imageUrl: string;
  url: string;
  category: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function cleanName(raw: string): string {
  const match = raw.match(/^[\x00-\x7F]+/);
  let name = match ? match[0] : raw;
  name = name.replace(/[-\s]+$/g, '').trim();
  return name || raw;
}

function resolveImageUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (url.startsWith('/')) {
    return `https://cdn2.zohoecommerce.com${url}?storefront_domain=www.pranahitanaturals.com`;
  }
  return url;
}

function imageFilenameFromUrl(url: string, slug: string): string {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const ext = path.extname(parts[i]).toLowerCase();
      if (ext && ext.length > 1) {
        return `${slug}-${Date.now().toString(36)}${ext}`;
      }
    }
  } catch {
    // ignore
  }
  return `${slug}-${Date.now().toString(36)}.jpg`;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

async function downloadImage(url: string, filename: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) {
      logger.warn(`Failed to fetch image ${url}: ${res.status}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = path.join(IMG_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/images/products/${filename}`;
  } catch (error) {
    logger.warn(`Failed to download image ${url}:`, error);
    return null;
  }
}

async function getCategories(): Promise<{ name: string; slug: string; url: string }[]> {
  const html = await fetchHtml(BASE);
  const $ = cheerio.load(html);
  const map = new Map<string, { name: string; slug: string; url: string }>();

  $('a[href^="/categories/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.includes('shop-by-category')) return;
    const name = $(el).text().trim() || $(el).find('img').attr('alt') || '';
    if (!name) return;
    const clean = name.replace(/&amp;/g, '&');
    const slug = slugify(clean);
    const url = new URL(href, BASE).toString();
    if (!map.has(url)) {
      map.set(url, { name: clean, slug, url });
    }
  });

  return Array.from(map.values());
}

async function getProductsFromCategory(category: { name: string; slug: string; url: string }): Promise<ScrapedProduct[]> {
  const html = await fetchHtml(category.url);
  const $ = cheerio.load(html);
  const products: ScrapedProduct[] = [];

  $('.theme-prod-box').each((_, el) => {
    const $box = $(el);
    const id = $box.attr('data-zs-product-id') || '';
    const $nameLink = $box.find('.theme-product-name a').first();
    const href = $nameLink.attr('href') || '';
    const rawName = $nameLink.text().trim();
    const name = cleanName(rawName);
    const alt = $box.find('img[alt]').first().attr('alt') || '';
    const imageUrl =
      $box.find('img[data-src]').first().attr('data-src') ||
      $box.find('img[src]').first().attr('src') ||
      '';
    const priceAttr = $box.find('[data-zs-selling-price]').first().attr('data-zs-selling-price') || '0';
    const price = parseFloat(priceAttr) || 0;

    if (!id || !name || !href) return;

    products.push({
      id,
      name: alt ? cleanName(alt) : name,
      slug: '',
      description: '',
      price,
      stock: 0,
      unit: '500g',
      image: '',
      imageUrl: resolveImageUrl(imageUrl),
      url: new URL(href, BASE).toString(),
      category: category.name,
    });
  });

  return products;
}

async function enrichProduct(product: ScrapedProduct): Promise<ScrapedProduct | null> {
  try {
    const html = await fetchHtml(product.url);
    const $ = cheerio.load(html);

    const rawTitle = $('h1[data-zs-product-name]').text().trim();
    product.name = cleanName(rawTitle) || product.name;

    const shortDesc = $('[data-zs-product-short-description]').text().trim();
    const details = $('[data-detail-tab-content="theme-product-detail-content"]').text().trim();
    product.description = [shortDesc, details].filter(Boolean).join('\n\n').substring(0, 5000);

    if (!product.description) {
      product.description = `${product.name} is a natural, organic product from Pranahita Naturals.`;
    }

    const prices: number[] = [];
    $('[data-zs-selling-price]').each((_, el) => {
      const v = parseFloat($(el).attr('data-zs-selling-price') || '0');
      if (v > 0) prices.push(v);
    });
    product.price = prices.length > 0 ? Math.min(...prices) : product.price;

    const inStock = $('[data-zs-product-outofstock] [data-stock-avail="true"]').length > 0;
    product.stock = inStock ? 100 : 0;

    const detailImage =
      $('img[data-image-resolution]').first().attr('data-image-resolution') ||
      $('img[data-zs-thumbnail-image]').first().attr('data-zs-thumbnail-image') ||
      $('img[src*="cdn2.zohoecommerce.com"]').first().attr('src') ||
      product.imageUrl;
    product.imageUrl = resolveImageUrl(detailImage);

    return product;
  } catch (error) {
    logger.warn(`Failed to enrich product ${product.id}:`, error);
    product.description = `${product.name} is a natural, organic product from Pranahita Naturals.`;
    return product;
  }
}

async function importPranahita() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  fs.mkdirSync(IMG_DIR, { recursive: true });

  await mongoose.connect(config.mongodbUri);
  logger.info('Connected to MongoDB for Pranahita import');

  const categories = await getCategories();
  logger.info(`Found ${categories.length} categories`);

  const categoryMap = new Map<string, mongoose.Types.ObjectId>();
  for (const cat of categories) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create({
        name: cat.name,
        slug: cat.slug,
        isActive: true,
      });
      logger.info(`Created category: ${cat.name}`);
    }
    categoryMap.set(cat.slug, existing._id as mongoose.Types.ObjectId);
  }

  const limitArg = process.argv.includes('--limit');
  const limitValue = limitArg ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10) || 50 : 1000;

  let allProducts: ScrapedProduct[] = [];
  for (const cat of categories) {
    try {
      const products = await getProductsFromCategory(cat);
      logger.info(`Category ${cat.name}: found ${products.length} products`);
      allProducts = allProducts.concat(products);
      await sleep(500);
    } catch (error) {
      logger.warn(`Failed to fetch category ${cat.name}:`, error);
    }
  }

  allProducts = allProducts.slice(0, limitValue);

  let created = 0;
  let skipped = 0;

  for (const product of allProducts) {
    try {
      const existing = await Product.findOne({ sku: `PT-${product.id}` });
      if (existing) {
        logger.info(`Product already exists: ${product.name}`);
        skipped++;
        continue;
      }

      await enrichProduct(product);
      await sleep(500);

      const categorySlug = slugify(product.category);
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        logger.warn(`Category not found for ${product.category}`);
        skipped++;
        continue;
      }

      let slug = slugify(product.name);
      const slugInUse = await Product.findOne({ slug });
      if (slugInUse) {
        slug = `${slug}-${product.id.slice(-6)}`;
      }

      let imagePath: string | null = null;
      if (product.imageUrl && !product.imageUrl.includes('no-preview-image')) {
        const filename = imageFilenameFromUrl(product.imageUrl, slug);
        imagePath = await downloadImage(product.imageUrl, filename);
      }

      const variants = generateVariantTemplates(
        categorySlug,
        product.name,
        `PT-${product.id}`,
        product.price,
        product.stock
      );

      await Product.create({
        sku: `PT-${product.id}`,
        name: product.name,
        slug,
        category: categoryId,
        description: product.description,
        price: product.price,
        unit: product.unit,
        stock: product.stock,
        images: imagePath ? [imagePath] : [],
        tags: ['organic', 'natural'],
        isActive: true,
        isBestSeller: false,
        nutrition: {},
        variants,
      });

      created++;
      logger.info(`Imported: ${product.name} (Rs. ${product.price})`);
    } catch (error) {
      logger.error(`Failed to import ${product.name}:`, error);
      skipped++;
    }
  }

  logger.info(`Pranahita import complete. Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

importPranahita().catch(err => {
  logger.error('Pranahita import failed:', err);
  process.exit(1);
});
