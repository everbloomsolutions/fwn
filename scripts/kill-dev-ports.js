#!/usr/bin/env node

/**
 * Kill processes running on dev server ports before starting turbo dev
 * Ports: 5000 (frontend), 3000 (backend), 4000 (admin panel)
 */

const { killPortProcess } = require('kill-port');

const PORTS = [5000, 3000, 4000];

async function killDevPorts() {
  console.log('🧹 Cleaning up dev server ports...\n');

  const results = await Promise.allSettled(
    PORTS.map(async (port) => {
      try {
        await killPortProcess(port);
        return { port, success: true };
      } catch (error) {
        // Port might not be in use, which is fine
        return { port, success: false, error: error.message };
      }
    })
  );

  let cleanedPorts = [];
  let skippedPorts = [];

  results.forEach((result, index) => {
    const port = PORTS[index];
    if (result.status === 'fulfilled' && result.value.success) {
      cleanedPorts.push(port);
      console.log(`  ✓ Killed process on port ${port}`);
    } else {
      skippedPorts.push(port);
      // Silently skip - port not in use
    }
  });

  if (cleanedPorts.length > 0) {
    console.log(`\n✅ Cleaned ${cleanedPorts.length} port(s): ${cleanedPorts.join(', ')}`);
  } else {
    console.log('\n✅ No processes found on dev ports');
  }

  console.log('\n🚀 Starting dev servers...\n');
}

killDevPorts().catch((error) => {
  console.error('❌ Error cleaning ports:', error);
  process.exit(1);
});

