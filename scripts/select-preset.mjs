/**
 * Preset Selection Helper
 * Helps users choose a project preset during setup
 */

import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const PRESETS = {
  'saas-starter': {
    name: 'SaaS Starter',
    description: 'Complete SaaS with auth, teams, billing, and essential features',
    modules: ['auth', 'teams', 'billing', 'emails', 'audit-log', 'landing'],
  },
  'ai-app': {
    name: 'AI Application',
    description: 'AI-powered app with Claude integration, usage tracking, and file uploads',
    modules: ['auth', 'ai-features', 'file-uploads', 'audit-log', 'landing'],
  },
  'internal-tool': {
    name: 'Internal Tool',
    description: 'Simple internal tool with authentication and audit logging',
    modules: ['auth', 'audit-log', 'file-uploads'],
  },
  'custom': {
    name: 'Custom',
    description: 'Choose your own modules',
    modules: [],
  },
};

export async function selectPreset() {
  console.log('\n🎨 Project Preset Selection');
  console.log('─'.repeat(60));
  console.log('Choose a preset to get started quickly:\n');

  Object.entries(PRESETS).forEach(([key, preset], index) => {
    console.log(`${index + 1}. ${preset.name}`);
    console.log(`   ${preset.description}`);
    if (preset.modules.length > 0) {
      console.log(`   Modules: ${preset.modules.join(', ')}`);
    }
    console.log('');
  });

  const choice = await question('Select preset (1-4, default: 1): ') || '1';
  const presetKeys = Object.keys(PRESETS);
  const selectedKey = presetKeys[parseInt(choice) - 1] || 'saas-starter';

  console.log(`\n✅ Selected: ${PRESETS[selectedKey].name}\n`);

  rl.close();
  return {
    key: selectedKey,
    ...PRESETS[selectedKey],
  };
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const preset = await selectPreset();
  console.log('Selected preset:', preset);
  process.exit(0);
}
