#!/usr/bin/env node

/**
 * Module Installation Script
 * Applies migrations for enabled modules and regenerates types
 *
 * Usage:
 *   npm run modules:apply              # Apply all enabled modules
 *   npm run modules:apply -- teams     # Apply specific module
 *   npm run modules:apply -- --seed    # Include seed data
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =====================================================
// Configuration
// =====================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_ROOT = join(__dirname, '..');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// =====================================================
// Module Registry
// =====================================================

const MODULE_MIGRATIONS = {
  teams: ['002_teams_setup.sql'],
  billing: ['004_billing_stripe_setup.sql'],
  'audit-log': ['005_audit_log_setup.sql'],
  'file-uploads': ['006_file_uploads_setup.sql'],
  emails: ['007_emails_setup.sql'],
  landing: [],
  'ai-features': ['008_ai_features_setup.sql'],
};

const CORE_MIGRATIONS = ['003_projects_modules_setup.sql'];

// =====================================================
// Utilities
// =====================================================

function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve =>
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    })
  );
}

function log(message, level = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    running: '⏳',
  };
  console.log(`${icons[level] || 'ℹ️'} ${message}`);
}

/**
 * Get enabled modules from environment variables
 */
function getEnabledModulesFromEnv() {
  const enabled = [];

  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_MODULE_') && process.env[key] === 'true') {
      const moduleKey = key
        .replace('NEXT_PUBLIC_MODULE_', '')
        .toLowerCase()
        .replace(/_/g, '-');
      enabled.push(moduleKey);
    }
  });

  // Always include core modules
  if (!enabled.includes('auth')) enabled.unshift('auth');
  if (!enabled.includes('landing')) enabled.push('landing');

  return enabled;
}

/**
 * Execute SQL via Supabase exec_sql function
 */
async function executeSql(sql, description) {
  try {
    log(`Running: ${description}`, 'running');

    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      log(`Failed: ${description}`, 'error');
      console.error(error);
      throw error;
    }

    log(`Success: ${description}`, 'success');
    return data;
  } catch (error) {
    log(`Error: ${description}`, 'error');
    throw error;
  }
}

/**
 * Check if a migration has been applied
 */
async function isMigrationApplied(migrationFile) {
  try {
    const { data, error } = await supabase
      .from('module_migrations')
      .select('id')
      .eq('migration_file', migrationFile)
      .eq('status', 'success')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = table doesn't exist (first run)
      return false;
    }

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Mark migration as applied
 */
async function markMigrationApplied(migrationFile, moduleKey, projectId = null) {
  try {
    await supabase.from('module_migrations').insert({
      project_id: projectId,
      module_key: moduleKey,
      migration_file: migrationFile,
      status: 'success',
    });
  } catch (error) {
    // Ignore errors if table doesn't exist yet (core migrations)
    if (error.code !== '42P01') {
      console.error('Error marking migration:', error);
    }
  }
}

/**
 * Apply a migration file
 */
async function applyMigration(migrationPath, migrationFile, moduleKey) {
  const fullPath = join(PROJECT_ROOT, migrationPath);

  if (!existsSync(fullPath)) {
    log(`Migration file not found: ${migrationPath}`, 'warning');
    return false;
  }

  // Check if already applied
  const applied = await isMigrationApplied(migrationFile);
  if (applied) {
    log(`Skipping ${migrationFile} (already applied)`, 'info');
    return true;
  }

  try {
    const sql = readFileSync(fullPath, 'utf-8');
    await executeSql(sql, `Migration: ${migrationFile}`);
    await markMigrationApplied(migrationFile, moduleKey);
    return true;
  } catch (error) {
    log(`Failed to apply ${migrationFile}`, 'error');
    console.error(error);
    return false;
  }
}

/**
 * Apply core migrations (projects, modules, etc.)
 */
async function applyCoreMigrations() {
  log('\n📦 Applying core migrations...', 'info');

  for (const migration of CORE_MIGRATIONS) {
    const migrationPath = join('src', 'lib', 'db', 'migrations', migration);
    await applyMigration(migrationPath, migration, 'core');
  }
}

/**
 * Apply migrations for a specific module
 */
async function applyModuleMigrations(moduleKey) {
  const migrations = MODULE_MIGRATIONS[moduleKey];

  if (!migrations || migrations.length === 0) {
    log(`No migrations for module: ${moduleKey}`, 'info');
    return true;
  }

  log(`\n🔧 Applying migrations for module: ${moduleKey}`, 'info');

  for (const migration of migrations) {
    const migrationPath = join('src', 'features', moduleKey, 'db', 'migrations', migration);
    const success = await applyMigration(migrationPath, migration, moduleKey);

    if (!success) {
      return false;
    }
  }

  return true;
}

/**
 * Regenerate TypeScript types from database
 */
async function regenerateTypes() {
  log('\n🔄 Regenerating TypeScript types...', 'running');

  try {
    execSync('npm run gen:types', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    log('TypeScript types regenerated', 'success');
  } catch (error) {
    log('Failed to regenerate types', 'warning');
    console.error(error);
  }
}

/**
 * Run seed data for a module
 */
async function runModuleSeed(moduleKey) {
  const seedPath = join(PROJECT_ROOT, 'src', 'features', moduleKey, 'db', 'seed.sql');

  if (!existsSync(seedPath)) {
    return;
  }

  log(`🌱 Running seed for module: ${moduleKey}`, 'running');

  try {
    const sql = readFileSync(seedPath, 'utf-8');
    await executeSql(sql, `Seed: ${moduleKey}`);
    log(`Seed applied for ${moduleKey}`, 'success');
  } catch (error) {
    log(`Failed to apply seed for ${moduleKey}`, 'warning');
    console.error(error);
  }
}

// =====================================================
// Main Script
// =====================================================

async function main() {
  const args = process.argv.slice(2);
  const specificModule = args.find(arg => !arg.startsWith('--'));
  const includeSeed = args.includes('--seed');
  const skipConfirm = args.includes('--yes') || args.includes('-y');

  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   Module Installation & Migration Tool       ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  // Determine which modules to apply
  let modulesToApply;

  if (specificModule) {
    log(`Targeting specific module: ${specificModule}`, 'info');
    modulesToApply = [specificModule];
  } else {
    modulesToApply = getEnabledModulesFromEnv();
    log(`Detected enabled modules from environment:`, 'info');
    modulesToApply.forEach(m => console.log(`  - ${m}`));
  }

  // Confirm with user
  if (!skipConfirm) {
    console.log('\n⚠️  This will apply database migrations.');
    const confirm = await question('Continue? (y/N): ');

    if (confirm.toLowerCase() !== 'y') {
      log('Aborted by user', 'warning');
      process.exit(0);
    }
  }

  console.log('');

  try {
    // Step 1: Apply core migrations
    await applyCoreMigrations();

    // Step 2: Apply module migrations
    for (const moduleKey of modulesToApply) {
      const success = await applyModuleMigrations(moduleKey);

      if (!success) {
        log(`Failed to apply migrations for ${moduleKey}`, 'error');
        process.exit(1);
      }

      // Apply seed if requested
      if (includeSeed) {
        await runModuleSeed(moduleKey);
      }
    }

    // Step 3: Regenerate types
    await regenerateTypes();

    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║   ✅ All migrations applied successfully!    ║');
    console.log('╚═══════════════════════════════════════════════╝\n');

    log(`Applied ${modulesToApply.length} module(s)`, 'success');
    log('Database is up to date', 'success');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
