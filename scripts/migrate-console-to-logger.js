#!/usr/bin/env node

/**
 * Migration script to help identify and replace console statements
 * 
 * Usage:
 *   node scripts/migrate-console-to-logger.js --check
 *   node scripts/migrate-console-to-logger.js --migrate
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = ['node_modules', 'dist', '.next', 'build', 'coverage', 'scripts'];
const EXCLUDE_FILES = ['migrate-console-to-logger.js'];

// Patterns to find console statements
const CONSOLE_PATTERNS = {
  error: /console\.error\(/g,
  warn: /console\.warn\(/g,
  info: /console\.info\(/g,
  log: /console\.log\(/g,
  debug: /console\.debug\(/g,
};

// Files that should use logger
const LOGGER_MAP = {
  'web': {
    import: "import { logger } from '@/shared/utils/logger';",
    replace: {
      'console.error': 'logger.error',
      'console.warn': 'logger.warn',
      'console.info': 'logger.info',
      'console.log': 'logger.info', // or logger.debug for debug logs
      'console.debug': 'logger.debug',
    }
  },
  'server': {
    import: "import { logger } from '@/core/middleware/logger';",
    replace: {
      'console.error': 'logger.error',
      'console.warn': 'logger.warn',
      'console.info': 'logger.info',
      'console.log': 'logger.info',
      'console.debug': 'logger.debug',
    }
  }
};

function shouldExclude(filePath) {
  return EXCLUDE_DIRS.some(dir => filePath.includes(dir)) ||
         EXCLUDE_FILES.some(file => filePath.endsWith(file)) ||
         filePath.includes('test') ||
         filePath.includes('spec');
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function walk(currentPath) {
    if (!fs.existsSync(currentPath)) return;
    
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory() && !shouldExclude(fullPath)) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext) && !shouldExclude(fullPath)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const results = {
    file: filePath,
    errors: [],
    warnings: [],
    infos: [],
    logs: [],
    debugs: [],
    total: 0,
    lines: []
  };
  
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (CONSOLE_PATTERNS.error.test(line)) {
      results.errors.push({ line: index + 1, content: line.trim() });
      results.total++;
    }
    if (CONSOLE_PATTERNS.warn.test(line)) {
      results.warnings.push({ line: index + 1, content: line.trim() });
      results.total++;
    }
    if (CONSOLE_PATTERNS.info.test(line)) {
      results.infos.push({ line: index + 1, content: line.trim() });
      results.total++;
    }
    if (CONSOLE_PATTERNS.log.test(line)) {
      results.logs.push({ line: index + 1, content: line.trim() });
      results.total++;
    }
    if (CONSOLE_PATTERNS.debug.test(line)) {
      results.debugs.push({ line: index + 1, content: line.trim() });
      results.total++;
    }
  });
  
  return results.total > 0 ? results : null;
}

function checkMode() {
  console.log('🔍 Scanning codebase for console statements...\n');
  
  const workspaces = ['apps/web', 'apps/server'];
  const allResults = [];
  
  workspaces.forEach(workspace => {
    const workspacePath = path.join(ROOT_DIR, workspace);
    if (!fs.existsSync(workspacePath)) return;
    
    const srcPath = workspace === 'apps/server' 
      ? path.join(workspacePath, 'src')
      : workspacePath;
    
    if (!fs.existsSync(srcPath)) return;
    
    console.log(`📦 Scanning ${workspace}...`);
    const files = findFiles(srcPath);
    const workspaceResults = [];
    
    files.forEach(file => {
      const result = analyzeFile(file);
      if (result) {
        workspaceResults.push(result);
      }
    });
    
    if (workspaceResults.length > 0) {
      console.log(`   Found ${workspaceResults.length} files with console statements\n`);
      allResults.push({ workspace, results: workspaceResults });
    } else {
      console.log(`   ✅ No console statements found\n`);
    }
  });
  
  // Print summary
  console.log('\n📊 Summary:\n');
  allResults.forEach(({ workspace, results }) => {
    const total = results.reduce((sum, r) => sum + r.total, 0);
    console.log(`${workspace}:`);
    console.log(`  Files: ${results.length}`);
    console.log(`  Total console statements: ${total}`);
    console.log(`  - console.error: ${results.reduce((sum, r) => sum + r.errors.length, 0)}`);
    console.log(`  - console.warn: ${results.reduce((sum, r) => sum + r.warnings.length, 0)}`);
    console.log(`  - console.info: ${results.reduce((sum, r) => sum + r.infos.length, 0)}`);
    console.log(`  - console.log: ${results.reduce((sum, r) => sum + r.logs.length, 0)}`);
    console.log(`  - console.debug: ${results.reduce((sum, r) => sum + r.debugs.length, 0)}`);
    console.log('');
  });
  
  // Print detailed results
  if (allResults.length > 0) {
    console.log('\n📋 Detailed Results:\n');
    allResults.forEach(({ workspace, results }) => {
      results.forEach(result => {
        console.log(`\n${result.file}:`);
        if (result.errors.length > 0) {
          console.log('  console.error:');
          result.errors.forEach(e => console.log(`    Line ${e.line}: ${e.content.substring(0, 80)}...`));
        }
        if (result.warnings.length > 0) {
          console.log('  console.warn:');
          result.warnings.forEach(w => console.log(`    Line ${w.line}: ${w.content.substring(0, 80)}...`));
        }
        if (result.logs.length > 0) {
          console.log('  console.log:');
          result.logs.forEach(l => console.log(`    Line ${l.line}: ${l.content.substring(0, 80)}...`));
        }
      });
    });
  }
}

function getRelativeImportPath(filePath, workspace) {
  // Determine the relative path to logger based on file location
  if (workspace === 'apps/web') {
    // Check if file is in shared directory
    if (filePath.includes('shared')) {
      return "import { logger } from '@/shared/utils/logger';";
    }
    return "import { logger } from '@/shared/utils/logger';";
  } else if (workspace === 'apps/server') {
    // Check if file is in core directory
    if (filePath.includes('core')) {
      return "import { logger } from '../middleware/logger';";
    }
    return "import { logger } from '@/core/middleware/logger';";
  }
  return '';
}

function migrateFile(filePath, workspace) {
  const config = LOGGER_MAP[workspace];
  if (!config) return false;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Check if logger is already imported
  const hasLoggerImport = content.includes('logger') && 
    (content.includes("from '@/shared/utils/logger'") ||
     content.includes("from '../utils/logger'") ||
     content.includes("from '@/core/middleware/logger'") ||
     content.includes("from './logger'") ||
     content.includes("from '../../core/middleware/logger'") ||
     content.includes("from '../middleware/logger'"));
  
  // Replace console statements
  Object.entries(config.replace).forEach(([oldPattern, newPattern]) => {
    const regex = new RegExp(oldPattern.replace('.', '\\.'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newPattern);
      modified = true;
    }
  });
  
  // Add import if needed and file was modified
  if (modified && !hasLoggerImport) {
    // Find the last import statement
    const importRegex = /^import .+ from .+;$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      const importPath = getRelativeImportPath(filePath, workspace);
      content = content.slice(0, insertIndex) + '\n' + importPath + content.slice(insertIndex);
    } else {
      // No imports, add at the top
      const importPath = getRelativeImportPath(filePath, workspace);
      content = importPath + '\n\n' + content;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  
  return false;
}

function migrateMode() {
  console.log('🔄 Migrating console statements to logger...\n');
  
  const workspaces = ['apps/web', 'apps/server'];
  let totalMigrated = 0;
  
  workspaces.forEach(workspace => {
    const workspacePath = path.join(ROOT_DIR, workspace);
    if (!fs.existsSync(workspacePath)) return;
    
    const srcPath = workspace === 'apps/server' 
      ? path.join(workspacePath, 'src')
      : workspacePath;
    
    if (!fs.existsSync(srcPath)) return;
    
    console.log(`📦 Migrating ${workspace}...`);
    const files = findFiles(srcPath);
    let migrated = 0;
    
    files.forEach(file => {
      const result = analyzeFile(file);
      if (result && result.total > 0) {
        if (migrateFile(file, workspace)) {
          migrated++;
          console.log(`   ✅ Migrated: ${path.relative(ROOT_DIR, file)}`);
        }
      }
    });
    
    if (migrated > 0) {
      console.log(`   ✅ Migrated ${migrated} files\n`);
      totalMigrated += migrated;
    } else {
      console.log(`   ℹ️  No files to migrate\n`);
    }
  });
  
  console.log(`\n✅ Migration complete! Migrated ${totalMigrated} files total.`);
  console.log('\n⚠️  Please review the changes and test your application.');
  console.log('   Some console.log statements may need manual review.');
}

// Main
const mode = process.argv[2] === '--migrate' ? 'migrate' : 'check';

if (mode === 'check') {
  checkMode();
} else {
  console.log('⚠️  This will modify your files. Make sure you have committed your changes.');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  
  setTimeout(() => {
    migrateMode();
  }, 3000);
}

