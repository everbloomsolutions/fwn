#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Optimize Hero Images
 * Compresses and optimizes hero images for web use
 * Requires: sharp (npm install sharp --save-dev)
 */

const fs = require('fs');
const path = require('path');

const heroImagesDir = path.join(__dirname, '../public/images/hero');
const images = ['Hero1.jpg', 'Hero2.jpg', 'Hero3.jpg', 'Hero4.jpg'];

async function optimizeImages() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('❌ Sharp is not installed. Installing...');
    console.log('Run: cd front-end && npm install sharp --save-dev');
    console.log('\nNote: Next.js Image component will automatically optimize images at build time.');
    console.log('The images will work fine without pre-optimization.');
    return;
  }

  console.log('🖼️  Optimizing hero images...\n');

  for (const imageName of images) {
    const inputPath = path.join(heroImagesDir, imageName);
    const outputPath = path.join(heroImagesDir, imageName.replace('.jpg', '-optimized.jpg'));

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${imageName} not found, skipping...`);
      continue;
    }

    try {
      const stats = fs.statSync(inputPath);
      const originalSize = (stats.size / 1024).toFixed(2);

      // Optimize image
      await sharp(inputPath)
        .resize(1920, 1080, {
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

      console.log(`✅ ${imageName}`);
      console.log(`   Original: ${originalSize}KB → Optimized: ${optimizedSize}KB (${savings}% reduction)`);

      // Replace original with optimized
      fs.renameSync(outputPath, inputPath);
    } catch (error) {
      console.error(`❌ Error optimizing ${imageName}:`, error.message);
    }
  }

  console.log('\n✨ Image optimization complete!');
}

optimizeImages().catch(console.error);

