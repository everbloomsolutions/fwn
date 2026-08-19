#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables are set
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nodeEnv = process.env.NODE_ENV || 'development';
const checkOnly = process.argv.includes('--check-only');

// Required variables by workspace
const requiredVars = {
  backend: [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ],
  frontend: [
    'NEXT_PUBLIC_API_URL',
  ],
};

// Optional but recommended variables
const recommendedVars = {
  backend: [
    'REDIS_URL',
    'GOOGLE_MAPS_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
  ],
  frontend: [
    'NEXT_PUBLIC_SITE_URL',
  ],
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        env[key] = value;
      }
    }
  });
  
  return env;
}

function validateEnv() {
  console.log('🔍 Validating environment configuration...\n');
  
  // Load root env files
  const rootEnvDev = loadEnvFile(path.join(rootDir, '.env.development'));
  const rootEnvProd = loadEnvFile(path.join(rootDir, '.env.production'));
  const rootEnv = loadEnvFile(path.join(rootDir, '.env'));
  
  // Merge env files (priority: .env > environment-specific)
  const rootEnvMerged = nodeEnv === 'production' 
    ? { ...rootEnvProd, ...rootEnv }
    : { ...rootEnvDev, ...rootEnv };
  
  // Load workspace env files
  const backendEnv = loadEnvFile(path.join(rootDir, 'apps', 'server', '.env'));
  const frontendEnv = loadEnvFile(path.join(rootDir, 'apps', 'web', '.env.local'));
  
  // Merge root + workspace
  const backendMerged = { ...rootEnvMerged, ...backendEnv };
  const frontendMerged = { ...rootEnvMerged, ...frontendEnv };
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Validate backend
  console.log('📦 Backend (@fwn/server):');
  const backendMissing = requiredVars.backend.filter(v => !backendMerged[v] || backendMerged[v].includes('REPLACE_WITH') || backendMerged[v].includes('your-'));
  if (backendMissing.length > 0) {
    console.log(`  ❌ Missing required: ${backendMissing.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('  ✅ All required variables set');
  }
  
  const backendRecommended = recommendedVars.backend.filter(v => !backendMerged[v]);
  if (backendRecommended.length > 0 && !checkOnly) {
    console.log(`  ⚠️  Recommended: ${backendRecommended.join(', ')}`);
    hasWarnings = true;
  }
  
  // Validate frontend
  console.log('\n📦 Frontend (@fwn/web):');
  const frontendMissing = requiredVars.frontend.filter(v => !frontendMerged[v] || frontendMerged[v].includes('REPLACE_WITH'));
  if (frontendMissing.length > 0) {
    console.log(`  ❌ Missing required: ${frontendMissing.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('  ✅ All required variables set');
  }
  
  const frontendRecommended = recommendedVars.frontend.filter(v => !frontendMerged[v]);
  if (frontendRecommended.length > 0 && !checkOnly) {
    console.log(`  ⚠️  Recommended: ${frontendRecommended.join(', ')}`);
    hasWarnings = true;
  }
  
  // Check for common issues
  console.log('\n🔒 Security checks:');
  
  if (nodeEnv === 'production') {
    const hasPlaceholders = Object.values(backendMerged).some(v => 
      typeof v === 'string' && v.includes('REPLACE_WITH')
    );
    if (hasPlaceholders) {
      console.log('  ⚠️  Production env contains placeholders - fill in actual values!');
      hasWarnings = true;
    }
  }
  
  if (backendMerged.JWT_SECRET && backendMerged.JWT_SECRET.length < 32) {
    console.log('  ⚠️  JWT_SECRET is too short (minimum 32 characters recommended)');
    hasWarnings = true;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ Validation failed - fix missing required variables');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Validation passed with warnings');
    process.exit(0);
  } else {
    console.log('✅ All validations passed!');
    process.exit(0);
  }
}

validateEnv();

