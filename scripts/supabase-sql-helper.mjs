/**
 * Supabase SQL Helper - Autonomous Migration Tool for Claude Code
 *
 * This helper provides utilities to execute SQL migrations autonomously:
 * - Execute raw SQL queries
 * - Test schema changes
 * - Validate data integrity
 * - Regenerate TypeScript types
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

class SupabaseSQLHelper {
  constructor(customUrl = null, customKey = null) {
    const url = customUrl || SUPABASE_URL;
    const key = customKey || SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.'
      );
    }

    this.supabase = createClient(url, key);
    this.verbose = true;
  }

  /**
   * Execute raw SQL query
   * @param {string} query - SQL query to execute
   * @param {boolean} readonly - If true, prevents modification queries
   * @returns {Promise<{success: boolean, data?: any, error?: string, rowCount?: number}>}
   */
  async execSQL(query, readonly = false) {
    if (this.verbose) {
      console.log(`\n🔧 Executing SQL ${readonly ? '(readonly)' : ''}:`);
      console.log(query.substring(0, 200) + (query.length > 200 ? '...' : ''));
    }

    const { data, error } = await this.supabase.rpc('exec_sql', {
      query,
      readonly
    });

    if (error) {
      console.error('❌ Error:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.success) {
      console.error('❌ Query failed:', data.error);
      return { success: false, error: data.error };
    }

    if (this.verbose) {
      console.log(`✅ Success! ${data.row_count || 0} rows affected`);
      if (data.data && data.data.length > 0 && data.data.length <= 5) {
        console.log('Data:', JSON.stringify(data.data, null, 2));
      } else if (data.data && data.data.length > 5) {
        console.log(`Data: ${data.data.length} rows returned (showing first 3):`);
        console.log(JSON.stringify(data.data.slice(0, 3), null, 2));
      }
    }

    return {
      success: true,
      data: data.data,
      rowCount: data.row_count
    };
  }

  /**
   * Execute SQL from a file
   * @param {string} filePath - Path to SQL file
   * @param {boolean} readonly - If true, prevents modification queries
   */
  async execSQLFile(filePath, readonly = false) {
    console.log(`\n📄 Executing SQL file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return { success: false, error: 'File not found' };
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      const result = await this.execSQL(statement, readonly);
      if (!result.success) {
        return result;
      }
    }

    return { success: true };
  }

  /**
   * List all tables in the public schema
   */
  async listTables() {
    console.log('\n📋 Listing all tables...');

    const result = await this.execSQL(`
      SELECT
        table_name,
        table_type,
        (SELECT COUNT(*)
         FROM information_schema.columns
         WHERE table_schema = 'public'
         AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `, true);

    return result;
  }

  /**
   * Get schema details for a specific table
   * @param {string} tableName - Name of the table
   */
  async getTableSchema(tableName) {
    console.log(`\n🔬 Getting schema for table: ${tableName}`);

    const result = await this.execSQL(`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = '${tableName}'
      ORDER BY ordinal_position
    `, true);

    return result;
  }

  /**
   * Test a query without modifying data
   * @param {string} query - SQL query to test (should be SELECT)
   */
  async testQuery(query) {
    console.log('\n🧪 Testing query...');
    return await this.execSQL(query, true);
  }

  /**
   * Create a new table
   * @param {string} tableName - Name of the table
   * @param {string} schema - Table schema definition (SQL CREATE TABLE body)
   */
  async createTable(tableName, schema) {
    console.log(`\n🆕 Creating table: ${tableName}`);

    const sql = `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        ${schema}
      );
    `;

    return await this.execSQL(sql);
  }

  /**
   * Add a column to an existing table
   * @param {string} tableName - Name of the table
   * @param {string} columnName - Name of the column
   * @param {string} columnType - Column type and constraints
   */
  async addColumn(tableName, columnName, columnType) {
    console.log(`\n➕ Adding column ${columnName} to ${tableName}`);

    const sql = `
      ALTER TABLE public.${tableName}
      ADD COLUMN IF NOT EXISTS ${columnName} ${columnType};
    `;

    return await this.execSQL(sql);
  }

  /**
   * Drop a column from a table
   * @param {string} tableName - Name of the table
   * @param {string} columnName - Name of the column
   */
  async dropColumn(tableName, columnName) {
    console.log(`\n➖ Dropping column ${columnName} from ${tableName}`);

    const sql = `
      ALTER TABLE public.${tableName}
      DROP COLUMN IF EXISTS ${columnName};
    `;

    return await this.execSQL(sql);
  }

  /**
   * Rename a column
   * @param {string} tableName - Name of the table
   * @param {string} oldName - Current column name
   * @param {string} newName - New column name
   */
  async renameColumn(tableName, oldName, newName) {
    console.log(`\n🔄 Renaming column ${oldName} to ${newName} in ${tableName}`);

    const sql = `
      ALTER TABLE public.${tableName}
      RENAME COLUMN ${oldName} TO ${newName};
    `;

    return await this.execSQL(sql);
  }

  /**
   * Create an index
   * @param {string} tableName - Name of the table
   * @param {string} columnName - Name of the column
   * @param {string} indexName - Optional custom index name
   */
  async createIndex(tableName, columnName, indexName = null) {
    const idxName = indexName || `idx_${tableName}_${columnName}`;
    console.log(`\n📑 Creating index ${idxName}`);

    const sql = `
      CREATE INDEX IF NOT EXISTS ${idxName}
      ON public.${tableName} (${columnName});
    `;

    return await this.execSQL(sql);
  }

  /**
   * Regenerate TypeScript types from Supabase schema
   */
  async regenerateTypes() {
    console.log('\n🔄 Regenerating TypeScript types...');

    try {
      execSync('npm run gen:types', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Types regenerated successfully!');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to regenerate types:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Run a complete migration with pre/post validation
   * @param {Object} migration - Migration object with up/down/validate functions
   */
  async runMigration(migration) {
    console.log(`\n🚀 Running migration: ${migration.name}`);
    console.log(`Description: ${migration.description || 'N/A'}`);

    // Pre-validation
    if (migration.preValidate) {
      console.log('\n✔️  Running pre-validation...');
      const preResult = await migration.preValidate(this);
      if (!preResult.success) {
        console.error('❌ Pre-validation failed:', preResult.error);
        return { success: false, error: 'Pre-validation failed' };
      }
    }

    // Execute migration
    console.log('\n⬆️  Executing migration...');
    const migrationResult = await migration.up(this);
    if (!migrationResult.success) {
      console.error('❌ Migration failed:', migrationResult.error);

      // Try to rollback
      if (migration.down) {
        console.log('\n⬇️  Attempting rollback...');
        await migration.down(this);
      }

      return migrationResult;
    }

    // Post-validation
    if (migration.postValidate) {
      console.log('\n✔️  Running post-validation...');
      const postResult = await migration.postValidate(this);
      if (!postResult.success) {
        console.error('❌ Post-validation failed:', postResult.error);

        // Rollback
        if (migration.down) {
          console.log('\n⬇️  Rolling back due to validation failure...');
          await migration.down(this);
        }

        return { success: false, error: 'Post-validation failed' };
      }
    }

    // Regenerate types if requested
    if (migration.regenerateTypes !== false) {
      await this.regenerateTypes();
    }

    console.log('\n✅ Migration completed successfully!');
    return { success: true };
  }
}

export default SupabaseSQLHelper;

// Export singleton instance (uses env variables)
export const sqlHelper = new SupabaseSQLHelper();
