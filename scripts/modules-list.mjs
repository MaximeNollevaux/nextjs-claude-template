#!/usr/bin/env node

/**
 * List Available Modules
 * Shows all modules with their status (enabled/disabled)
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load module registry
const registryPath = join(PROJECT_ROOT, 'src', 'lib', 'modules', 'registry.ts');
const registryContent = readFileSync(registryPath, 'utf-8');

// Parse modules from registry (simple regex-based parsing)
const modules = [];
const moduleMatches = registryContent.matchAll(/'([a-z-]+)':\s*\{[^}]+name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*dependencies:\s*\[([^\]]*)\]/g);

for (const match of moduleMatches) {
  const [, key, name, description, deps] = match;
  modules.push({
    key,
    name,
    description,
    dependencies: deps
      .split(',')
      .map(d => d.trim().replace(/'/g, ''))
      .filter(Boolean),
  });
}

// Check which modules are enabled via environment
function isModuleEnabled(moduleKey) {
  const envKey = `NEXT_PUBLIC_MODULE_${moduleKey.toUpperCase().replace(/-/g, '_')}`;
  return process.env[envKey] === 'true';
}

// Display modules
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║             Available Modules - SaaS Factory             ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

modules.forEach(mod => {
  const enabled = isModuleEnabled(mod.key);
  const status = enabled ? '✅ ENABLED ' : '⬜ DISABLED';
  const deps = mod.dependencies.length > 0 ? `\n     Depends on: ${mod.dependencies.join(', ')}` : '';

  console.log(`${status} │ ${mod.key}`);
  console.log(`            ${mod.name}`);
  console.log(`            ${mod.description}${deps}\n`);
});

console.log('─────────────────────────────────────────────────────────────');
console.log(`Total: ${modules.length} modules`);
console.log(`Enabled: ${modules.filter(m => isModuleEnabled(m.key)).length} modules\n`);

console.log('💡 To enable a module, set in .env.local:');
console.log('   NEXT_PUBLIC_MODULE_TEAMS=true');
console.log('   NEXT_PUBLIC_MODULE_BILLING=true');
console.log('\n💡 Then run: npm run modules:apply\n');
