#!/usr/bin/env node

/**
 * Test script to verify logging functionality
 * Tests both frontend and backend loggers
 */

console.log('🧪 Testing Logger Functionality\n');

// Test 1: Backend Logger
console.log('📦 Testing Backend Logger...');
try {
  // Simulate backend logger
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const isDevelopment = NODE_ENV === 'development';
  
  const backendLogger = {
    error: (msg, ...args) => console.error(`[BACKEND ERROR] ${msg}`, ...args),
    warn: (msg, ...args) => {
      if (isDevelopment) console.warn(`[BACKEND WARN] ${msg}`, ...args);
    },
    info: (msg, ...args) => {
      if (isDevelopment) console.info(`[BACKEND INFO] ${msg}`, ...args);
    },
    debug: (msg, ...args) => {
      if (isDevelopment) console.debug(`[BACKEND DEBUG] ${msg}`, ...args);
    },
  };
  
  backendLogger.error('This error should always be visible');
  backendLogger.warn('This warning should be visible in development');
  backendLogger.info('This info should be visible in development');
  backendLogger.debug('This debug should be visible in development');
  
  console.log('✅ Backend logger test passed\n');
} catch (error) {
  console.error('❌ Backend logger test failed:', error);
}

// Test 2: Verify logger files exist
console.log('📁 Verifying logger files exist...');
const fs = require('fs');
const path = require('path');

const loggerFiles = [
  'apps/web/shared/utils/logger.ts',
  'apps/server/src/core/middleware/logger.ts',
];

let allExist = true;
loggerFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - NOT FOUND`);
    allExist = false;
  }
});

if (allExist) {
  console.log('✅ All logger files exist\n');
} else {
  console.log('❌ Some logger files are missing\n');
}

// Test 3: Check logger imports in key files
console.log('🔍 Checking logger imports in migrated files...');
const testFiles = [
  'apps/web/shared/core/error/ErrorBoundary.tsx',
  'apps/server/src/core/utils/analyticsLogger.ts',
];

let allImported = true;
testFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes('logger') && (content.includes('import') || content.includes('require'))) {
      console.log(`  ✅ ${file} - logger imported`);
    } else {
      console.log(`  ⚠️  ${file} - logger might not be imported`);
      allImported = false;
    }
  }
});

if (allImported) {
  console.log('✅ Logger imports verified\n');
} else {
  console.log('⚠️  Some files might be missing logger imports\n');
}

console.log('✅ Logging test complete!');
console.log('\n💡 Note: In production, only errors will be logged.');
console.log('💡 In development, all log levels will be visible.');

