/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Set workspace root to silence Next.js warning about multiple lockfiles
  // This tells Next.js where the actual workspace root is (two levels up)
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  reactStrictMode: true,
  eslint: {
    // Don't fail build on ESLint errors during migration
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Configure allowed image qualities for Next.js 16+
    // Includes common quality values used in the app (75, 80, 85, 90, 100)
    qualities: [75, 80, 85, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;

