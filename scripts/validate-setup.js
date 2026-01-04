#!/usr/bin/env node

/**
 * Supabase Setup Validator
 * This script validates your Supabase configuration and database setup
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

async function validateSupabaseSetup() {
  console.log('🔍 Validating Supabase Setup...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('1. Checking Environment Variables:');
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? (supabaseUrl.includes('your-project') ? '❌ Placeholder' : 'Set') : '❌ Missing'}`);
  console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? (supabaseKey.includes('your-') ? '❌ Placeholder' : 'Set') : '❌ Missing'}`);
  console.log(`   ✅ SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? (serviceRoleKey.includes('your-') ? '❌ Placeholder' : 'Set (server-side only)') : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Environment variables not properly configured. Some features will be disabled.');
    console.log('   Please check your .env.local file and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('   App will continue to run but database features will be unavailable.');
  }

  // Check if URL is placeholder
  if (supabaseUrl.includes('your-project-ref')) {
    console.log('⚠️  SUPABASE_URL still contains placeholder values. Please update with your actual Supabase project URL.');
    console.log('   Example: https://abcdefghijklmnop.supabase.co');
    console.log('   App will run in limited mode without database features.');
  }

  if (supabaseKey.includes('your-supabase-anon-key')) {
    console.log('⚠️  SUPABASE_ANON_KEY still contains placeholder values. Please update with your actual anon key.');
    console.log('   This should be a long JWT token starting with "eyJ..."');
    console.log('   App will run in limited mode without database features.');
  }

  // Test connection
  console.log('2. Testing Supabase Connection:');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);

    if (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      console.log('   💡 This might be due to:');
      console.log('      - Incorrect credentials');
      console.log('      - Database not set up (run the migration script)');
      console.log('      - RLS policies blocking access');
    } else {
      console.log('   ✅ Connection successful');
    }
  } catch (error) {
    console.log(`   ❌ Connection error: ${error.message}`);
  }

  // Check database tables
  console.log('\n3. Checking Database Tables:');
  const tables = ['profiles', 'user_preferences', 'translation_history', 'api_usage_stats', 'glossary'];

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: Exists`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: Error - ${err.message}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Database check failed: ${error.message}`);
  }

  // Check authentication
  console.log('\n4. Checking Authentication:');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to get current user (should be null for unauthenticated request)
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error && !error.message.includes('Auth session missing')) {
      console.log(`   ❌ Auth check failed: ${error.message}`);
    } else {
      console.log('   ✅ Authentication system accessible');
    }
  } catch (error) {
    console.log(`   ❌ Auth check error: ${error.message}`);
  }

  // Check project accessibility
  console.log('\n5. Checking Project Accessibility:');
  try {
    const url = supabaseUrl.replace('https://', '').replace('http://', '');
    const projectRef = url.split('.')[0];

    // Simple health check
    const response = await new Promise((resolve) => {
      const req = https.request({
        hostname: `${projectRef}.supabase.co`,
        path: '/rest/v1/',
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }, (res) => {
        resolve(res.statusCode);
      });

      req.on('error', () => resolve(null));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(null);
      });
      req.end();
    });

    if (response === 200) {
      console.log('   ✅ Project is accessible');
    } else {
      console.log(`   ⚠️  Project response: ${response} (might be normal for empty database)`);
    }
  } catch (error) {
    console.log(`   ❌ Project accessibility check failed: ${error.message}`);
  }

  console.log('\n📋 Next Steps:');
  console.log('1. If any checks failed, follow the SUPABASE_SETUP.md guide');
  console.log('2. Run the database migration script in Supabase SQL Editor');
  console.log('3. Configure OAuth providers if needed');
  console.log('4. Test your app with: npm run dev');

  console.log('\n🎉 Setup validation complete!');
}

// Run validation if called directly
if (require.main === module) {
  validateSupabaseSetup().catch(console.error);
}

module.exports = { validateSupabaseSetup };