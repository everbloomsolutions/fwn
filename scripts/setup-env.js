#!/usr/bin/env node

/**
 * Environment Setup Script
 * Interactive script to set up environment files from examples
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const rootDir = path.resolve(__dirname, '..');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function copyFileIfNotExists(source, dest) {
  if (fs.existsSync(dest)) {
    return false;
  }
  
  if (!fs.existsSync(source)) {
    console.error(`❌ Source file not found: ${source}`);
    return false;
  }
  
  fs.copyFileSync(source, dest);
  return true;
}

function updateSecretsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let updated = false;
  
  // Generate JWT secrets if they're placeholders
  if (content.includes('your-jwt-secret-key-change-in-production') || 
      content.includes('dev-secret-key-change-in-production')) {
    const jwtSecret = generateSecret(32);
    content = content.replace(
      /JWT_SECRET=.*/g,
      `JWT_SECRET=${jwtSecret}`
    );
    updated = true;
  }
  
  if (content.includes('your-refresh-secret-key-change-in-production') ||
      content.includes('dev-refresh-secret-key-change-in-production')) {
    const refreshSecret = generateSecret(32);
    content = content.replace(
      /JWT_REFRESH_SECRET=.*/g,
      `JWT_REFRESH_SECRET=${refreshSecret}`
    );
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('  ✓ Generated JWT secrets');
  }
}

async function setupEnvironment() {
  console.log('🚀 Setting up environment files...\n');
  
  // Check if .env already exists
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const answer = await question('⚠️  .env already exists. Overwrite? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  // Copy development example
  const devExample = path.join(rootDir, '.env.development.example');
  const envFile = path.join(rootDir, '.env');
  
  if (copyFileIfNotExists(devExample, envFile)) {
    console.log('✅ Created .env from .env.development.example');
    updateSecretsInFile(envFile);
  } else {
    console.log('⚠️  .env already exists, skipping...');
  }
  
  // Ask about production env
  const prodExample = path.join(rootDir, '.env.production.example');
  const prodEnvFile = path.join(rootDir, '.env.production');
  
  if (!fs.existsSync(prodEnvFile)) {
    const answer = await question('\n📦 Create .env.production? (y/N): ');
    if (answer.toLowerCase() === 'y') {
      if (copyFileIfNotExists(prodExample, prodEnvFile)) {
        console.log('✅ Created .env.production from .env.production.example');
        console.log('⚠️  Remember to fill in production values!');
      }
    }
  }
  
  // Check workspace env files
  console.log('\n📁 Checking workspace environment files...');
  
  const workspaces = [
    { name: 'server', dir: path.join(rootDir, 'apps', 'server') },
    { name: 'web', dir: path.join(rootDir, 'apps', 'web') },
  ];
  
  for (const workspace of workspaces) {
    const workspaceEnv = path.join(workspace.dir, '.env');
    if (!fs.existsSync(workspaceEnv)) {
      console.log(`  ✓ ${workspace.name}: No override file (using root .env)`);
    } else {
      console.log(`  ℹ️  ${workspace.name}: Has override file`);
    }
  }
  
  console.log('\n✅ Environment setup complete!');
  console.log('\n📝 Next steps:');
  console.log('  1. Review .env and update any values needed');
  console.log('  2. Start Redis: pnpm redis:start');
  console.log('  3. Start dev servers: pnpm dev');
  console.log('\n💡 Tip: Run "pnpm env:validate" to check your configuration');
  
  rl.close();
}

setupEnvironment().catch(error => {
  console.error('❌ Error setting up environment:', error);
  rl.close();
  process.exit(1);
});

