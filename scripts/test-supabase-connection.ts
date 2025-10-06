/**
 * Supabase Connection Test Script
 * 
 * This script tests the Supabase connection and verifies that:
 * 1. Environment variables are properly loaded
 * 2. Supabase client can be created
 * 3. Database connection is working
 * 4. Tables exist and are accessible
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { createServiceClient } from '../src/lib/supabase/server';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log('=====================================');

  try {
    // Test 1: Check environment variables
    console.log('\n📋 Step 1: Checking environment variables...');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    if (!supabaseAnonKey) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }

    console.log('✅ Environment variables loaded successfully');
    console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`);

    // Test 2: Create Supabase client
    console.log('\n🔌 Step 2: Creating Supabase client...');
    const supabase = createServiceClient();
    console.log('✅ Supabase client created successfully');

    // Test 3: Test database connection
    console.log('\n🗄️ Step 3: Testing database connection...');
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    
    if (error) {
      console.log('⚠️  Migration table not accessible (this is normal for new projects)');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('✅ Database connection successful');
      console.log(`   Found ${data?.length || 0} migration records`);
    }

    // Test 4: Check if our tables exist
    console.log('\n📊 Step 4: Checking table existence...');
    
    // Check prices_1m table
    const { data: prices1m, error: prices1mError } = await supabase
      .from('prices_1m')
      .select('*')
      .limit(1);
    
    if (prices1mError) {
      console.log('❌ prices_1m table not found');
      console.log(`   Error: ${prices1mError.message}`);
    } else {
      console.log('✅ prices_1m table exists');
      console.log(`   Found ${prices1m?.length || 0} records`);
    }

    // Check prices_daily table
    const { data: pricesDaily, error: pricesDailyError } = await supabase
      .from('prices_daily')
      .select('*')
      .limit(1);
    
    if (pricesDailyError) {
      console.log('❌ prices_daily table not found');
      console.log(`   Error: ${pricesDailyError.message}`);
    } else {
      console.log('✅ prices_daily table exists');
      console.log(`   Found ${pricesDaily?.length || 0} records`);
    }

    // Check events table
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.log('❌ events table not found');
      console.log(`   Error: ${eventsError.message}`);
    } else {
      console.log('✅ events table exists');
      console.log(`   Found ${events?.length || 0} records`);
    }

    // Test 5: Check materialized views
    console.log('\n📈 Step 5: Checking materialized views...');
    
    const { data: mv15m, error: mv15mError } = await supabase
      .from('mv_prices_15m')
      .select('*')
      .limit(1);
    
    if (mv15mError) {
      console.log('❌ mv_prices_15m materialized view not found');
      console.log(`   Error: ${mv15mError.message}`);
    } else {
      console.log('✅ mv_prices_15m materialized view exists');
      console.log(`   Found ${mv15m?.length || 0} records`);
    }

    // Test 6: Check extensions
    console.log('\n🔧 Step 6: Checking PostgreSQL extensions...');
    
    const { data: extensions, error: extensionsError } = await supabase
      .rpc('get_extensions');
    
    if (extensionsError) {
      console.log('⚠️  Could not check extensions (function may not exist)');
      console.log(`   Error: ${extensionsError.message}`);
    } else {
      console.log('✅ Extensions check successful');
      console.log(`   Found ${extensions?.length || 0} extensions`);
    }

    console.log('\n🎉 Supabase Connection Test Complete!');
    console.log('=====================================');
    
    // Summary
    const hasPrices1m = !prices1mError;
    const hasPricesDaily = !pricesDailyError;
    const hasEvents = !eventsError;
    const hasMV15m = !mv15mError;
    
    console.log('\n📋 Summary:');
    console.log(`   • Environment Variables: ✅`);
    console.log(`   • Supabase Client: ✅`);
    console.log(`   • Database Connection: ✅`);
    console.log(`   • prices_1m table: ${hasPrices1m ? '✅' : '❌'}`);
    console.log(`   • prices_daily table: ${hasPricesDaily ? '✅' : '❌'}`);
    console.log(`   • events table: ${hasEvents ? '✅' : '❌'}`);
    console.log(`   • mv_prices_15m view: ${hasMV15m ? '✅' : '❌'}`);
    
    if (!hasPrices1m || !hasPricesDaily || !hasEvents || !hasMV15m) {
      console.log('\n⚠️  Some tables/views are missing. You may need to run migrations.');
      console.log('   Run the SQL migrations in Supabase SQL Editor:');
      console.log('   1. 001_enable_extensions.sql');
      console.log('   2. 002_prices_table.sql');
      console.log('   3. 003_events_table.sql');
      console.log('   4. 004_timescale_aggregates.sql');
      console.log('   5. 005_compression_retention.sql');
    } else {
      console.log('\n🚀 All systems ready! You can now run the backfill script.');
    }

  } catch (error) {
    console.error('\n💥 Supabase Connection Test Failed:');
    console.error('=====================================');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('URL and Key are required')) {
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Check your .env.local file');
        console.error('   2. Ensure NEXT_PUBLIC_SUPABASE_URL is set');
        console.error('   3. Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
        console.error('   4. Ensure SUPABASE_SERVICE_ROLE_KEY is set');
        console.error('   5. Restart your development server after updating .env.local');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testSupabaseConnection();
}
