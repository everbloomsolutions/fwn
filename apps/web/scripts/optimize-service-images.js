#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Optimize Service Images
 * Compresses and optimizes service images for web use
 * Requires: sharp (npm install sharp --save-dev)
 */

const fs = require('fs');
const path = require('path');

const servicesImagesDir = path.join(__dirname, '../public/images/services');

async function optimizeImages() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (_error) {
    console.error('❌ Sharp is not installed. Installing...');
    console.log('Run: cd front-end && pnpm add -D sharp');
    console.log('\nNote: Next.js Image component will automatically optimize images at build time.');
    return;
  }

  if (!fs.existsSync(servicesImagesDir)) {
    console.log(`⚠️  Directory not found: ${servicesImagesDir}`);
    return;
  }

  const files = fs.readdirSync(servicesImagesDir).filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  if (files.length === 0) {
    console.log('⚠️  No images found to optimize');
    return;
  }

  console.log('🖼️  Optimizing service images...\n');

  for (const fileName of files) {
    const inputPath = path.join(servicesImagesDir, fileName);
    const outputPath = path.join(servicesImagesDir, fileName.replace(/\.(jpg|jpeg|png)$/i, '-optimized.jpg'));

    try {
      const stats = fs.statSync(inputPath);
      const originalSize = (stats.size / 1024).toFixed(2);

      // Optimize image
      await sharp(inputPath)
        .resize(800, 600, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          progressive: true,
          mozjpeg: true,
        })
        .toFile(outputPath);

      const optimizedStats = fs.statSync(outputPath);
      const optimizedSize = (optimizedStats.size / 1024).toFixed(2);
      const savings = ((1 - optimizedStats.size / stats.size) * 100).toFixed(1);

      console.log(`✅ ${fileName}`);
      console.log(`   Original: ${originalSize}KB → Optimized: ${optimizedSize}KB (${savings}% reduction)`);

      // Replace original with optimized
      fs.renameSync(outputPath, inputPath);
    } catch (error) {
      console.error(`❌ Error optimizing ${fileName}:`, error.message);
    }
  }

  console.log('\n✨ Image optimization complete!');
}

optimizeImages().catch(console.error);

