/**
 * TSLA 5-Year Backfill Script
 * 
 * This script fetches 5 years of daily TSLA data from Alpha Vantage
 * and populates the Supabase database.
 * 
 * Usage: npm run backfill:tsla
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { supabasePriceService } from '../src/services/supabase/priceService';
import { supabaseEventService } from '../src/services/supabase/eventService';

async function main() {
  console.log('🚀 Starting TSLA 5-year backfill process...');
  console.log('=====================================');

  try {
    // Step 1: Backfill price data
    console.log('\n📊 Step 1: Backfilling 5 years of TSLA daily data...');
    const startTime = Date.now();
    await supabasePriceService.backfillDaily5Year('TSLA');
    const duration = Date.now() - startTime;
    
    console.log(`✅ Successfully completed backfill in ${duration}ms`);

    // Step 2: Populate events
    console.log('\n📅 Step 2: Populating TSLA events...');
    await supabaseEventService.populateTeslaEvents();
    console.log('✅ Successfully populated TSLA events');

    // Step 3: Refresh aggregates
    console.log('\n🔄 Step 3: Refreshing materialized views...');
    await supabasePriceService.refreshAggregates();
    console.log('✅ Successfully refreshed all aggregates');

    console.log('\n🎉 Backfill process completed!');
    console.log('=====================================');
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`   • Duration: ${duration}ms`);
    console.log(`   • Status: ✅ Success`);

  } catch (error) {
    console.error('💥 Fatal error during backfill:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}
