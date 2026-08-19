#!/usr/bin/env ts-node
/**
 * Route Verification Script
 * Verifies that all routes are properly configured after the (marketing) -> (public) rename
 */

import { existsSync } from 'fs';
import { join } from 'path';

const appDir = join(process.cwd(), 'app');

interface RouteCheck {
  path: string;
  exists: boolean;
  type: 'page' | 'layout' | 'loading' | 'error';
}

const expectedRoutes: RouteCheck[] = [
  // Base layout
  { path: 'app/layout.tsx', exists: false, type: 'layout' },
  
  // Public routes (formerly marketing)
  { path: 'app/(public)/layout.tsx', exists: false, type: 'layout' },
  { path: 'app/(public)/page.tsx', exists: false, type: 'page' },
  { path: 'app/(public)/about/page.tsx', exists: false, type: 'page' },
  { path: 'app/(public)/services/page.tsx', exists: false, type: 'page' },
  { path: 'app/(public)/contact/page.tsx', exists: false, type: 'page' },
  { path: 'app/(public)/loading.tsx', exists: false, type: 'loading' },
  { path: 'app/(public)/error.tsx', exists: false, type: 'error' },
  
  // Auth routes
  { path: 'app/(auth)/layout.tsx', exists: false, type: 'layout' },
  { path: 'app/(auth)/login/page.tsx', exists: false, type: 'page' },
  { path: 'app/(auth)/register/page.tsx', exists: false, type: 'page' },
  { path: 'app/(auth)/loading.tsx', exists: false, type: 'loading' },
  { path: 'app/(auth)/error.tsx', exists: false, type: 'error' },
  
  // User routes (app)
  { path: 'app/(user)/layout.tsx', exists: false, type: 'layout' },
  { path: 'app/(user)/dashboard/page.tsx', exists: false, type: 'page' },
  { path: 'app/(user)/profile/page.tsx', exists: false, type: 'page' },
  { path: 'app/(user)/settings/page.tsx', exists: false, type: 'page' },
  { path: 'app/(user)/loading.tsx', exists: false, type: 'loading' },
  { path: 'app/(user)/error.tsx', exists: false, type: 'error' },
];

// Check if old marketing directory still exists (should not)
const oldMarketingExists = existsSync(join(appDir, '(marketing)'));
const oldMarketingLayoutExists = existsSync(join(appDir, '(marketing)', 'layout.tsx'));

console.log('🔍 Verifying route structure...\n');

// Check all expected routes
let allRoutesExist = true;
const missingRoutes: string[] = [];
const foundRoutes: string[] = [];

expectedRoutes.forEach((route) => {
  const fullPath = join(process.cwd(), route.path);
  const exists = existsSync(fullPath);
  route.exists = exists;
  
  if (exists) {
    foundRoutes.push(route.path);
    console.log(`✅ ${route.path}`);
  } else {
    missingRoutes.push(route.path);
    console.log(`❌ ${route.path} - MISSING`);
    allRoutesExist = false;
  }
});

console.log('\n📊 Summary:');
console.log(`   Found: ${foundRoutes.length}/${expectedRoutes.length} routes`);
console.log(`   Missing: ${missingRoutes.length} routes`);

// Check for old marketing directory
console.log('\n🗑️  Checking for old (marketing) directory:');
if (oldMarketingExists) {
  console.log('   ❌ Old (marketing) directory still exists!');
  allRoutesExist = false;
} else {
  console.log('   ✅ Old (marketing) directory removed');
}

if (oldMarketingLayoutExists) {
  console.log('   ❌ Old (marketing)/layout.tsx still exists!');
  allRoutesExist = false;
}

// Expected URL routes mapping
console.log('\n🌐 Expected URL Routes:');
console.log('   Public Routes:');
console.log('     / → app/(public)/page.tsx');
console.log('     /about → app/(public)/about/page.tsx');
console.log('     /services → app/(public)/services/page.tsx');
console.log('     /contact → app/(public)/contact/page.tsx');
console.log('\n   Auth Routes:');
console.log('     /login → app/(auth)/login/page.tsx');
console.log('     /register → app/(auth)/register/page.tsx');
console.log('\n   User Routes:');
console.log('     /dashboard → app/(user)/dashboard/page.tsx');
console.log('     /profile → app/(user)/profile/page.tsx');
console.log('     /settings → app/(user)/settings/page.tsx');

// Final result
console.log('\n' + '='.repeat(50));
if (allRoutesExist && !oldMarketingExists) {
  console.log('✅ All routes verified successfully!');
  process.exit(0);
} else {
  console.log('❌ Route verification failed!');
  if (missingRoutes.length > 0) {
    console.log('\nMissing routes:');
    missingRoutes.forEach((route) => console.log(`   - ${route}`));
  }
  process.exit(1);
}

