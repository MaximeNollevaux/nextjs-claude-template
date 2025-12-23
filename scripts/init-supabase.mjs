/**
 * Initialize Supabase Database for Claude Code Autonomy
 *
 * This script creates the exec_sql function in your Supabase database,
 * enabling Claude Code to autonomously manage database schema changes.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Initialize Supabase for Claude Code Autonomy            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Check if env variables are set
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('❌ Missing Supabase credentials!');
    console.log('\nPlease set the following in your .env.local file:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n');
    process.exit(1);
  }

  console.log('✅ Found Supabase credentials in environment');
  console.log(`📍 URL: ${url}\n`);

  const answer = await question('Do you want to create the exec_sql function? (y/n): ');

  if (answer.toLowerCase() !== 'y') {
    console.log('❌ Aborted');
    rl.close();
    process.exit(0);
  }

  console.log('\n🚀 Creating exec_sql function in Supabase...\n');

  const supabase = createClient(url, serviceKey);

  // The SQL to create the exec_sql function
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.exec_sql(
      query text,
      readonly boolean DEFAULT false
    )
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      result_data jsonb;
      row_count integer;
    BEGIN
      IF readonly AND (
        query ~* '^\\s*(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE)'
      ) THEN
        RAISE EXCEPTION 'Modification queries not allowed in readonly mode';
      END IF;

      IF query ~* '^\\s*SELECT' THEN
        EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || query || ') t'
        INTO result_data;
        GET DIAGNOSTICS row_count = ROW_COUNT;
        RETURN jsonb_build_object(
          'success', true,
          'data', COALESCE(result_data, '[]'::jsonb),
          'row_count', row_count
        );
      ELSE
        EXECUTE query;
        GET DIAGNOSTICS row_count = ROW_COUNT;
        RETURN jsonb_build_object(
          'success', true,
          'row_count', row_count,
          'message', format('%s rows affected', row_count)
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
      );
    END;
    $$;

    GRANT EXECUTE ON FUNCTION public.exec_sql(text, boolean) TO service_role;
    GRANT EXECUTE ON FUNCTION public.exec_sql(text, boolean) TO authenticated;

    COMMENT ON FUNCTION public.exec_sql(text, boolean) IS
    'Executes arbitrary SQL queries. Use readonly=true for SELECT queries.';
  `;

  // Try to create the function via RPC (if it already exists, this won't work)
  // We'll use a direct approach instead

  console.log('📝 Executing SQL to create exec_sql function...');
  console.log('ℹ️  Note: If this fails, you can manually run the SQL in Supabase SQL Editor\n');

  try {
    // We can't create functions via RPC, so we'll provide instructions
    console.log('⚠️  IMPORTANT: You need to manually create the function in Supabase\n');
    console.log('📋 Copy and paste this SQL in your Supabase SQL Editor:\n');
    console.log('─'.repeat(60));
    console.log(createFunctionSQL);
    console.log('─'.repeat(60));
    console.log('\nSteps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new');
    console.log('2. Paste the SQL above');
    console.log('3. Click "RUN"');
    console.log('4. Come back here and press Enter\n');

    await question('Press Enter when you\'ve created the function...');

    // Test if the function exists
    console.log('\n🧪 Testing if exec_sql function works...');

    const { data, error } = await supabase.rpc('exec_sql', {
      query: 'SELECT current_database(), current_user, now() as current_time',
      readonly: true
    });

    if (error) {
      console.error('❌ Function test failed:', error.message);
      console.log('\nPlease make sure you\'ve run the SQL in Supabase SQL Editor');
      rl.close();
      process.exit(1);
    }

    if (data && data.success) {
      console.log('✅ exec_sql function is working!');
      console.log('📊 Test result:', JSON.stringify(data.data, null, 2));
      console.log('\n🎉 Supabase is now configured for Claude Code autonomy!');
      console.log('\nClaude Code can now:');
      console.log('  ✅ Modify database schema');
      console.log('  ✅ Create/alter tables');
      console.log('  ✅ Run migrations autonomously');
      console.log('  ✅ Test changes safely\n');
    } else {
      console.error('❌ Function test failed:', data?.error);
      rl.close();
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

main().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
