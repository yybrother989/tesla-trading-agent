/**
 * Daily Close Job
 * 
 * POST /api/jobs/daily-close
 * Fetches final adjusted daily bar post-market close and triggers aggregate refresh
 * Should be called after market close (e.g., 10 PM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabasePriceService } from '../../../../services/supabase/priceService';
import { createServiceClient } from '../../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify this is a scheduled job (in production, add authentication)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    const symbol = 'TSLA';
    const interval = '1d';

    console.log(`🌙 Starting daily close job for ${symbol}...`);

    // Fetch final daily bar from Alpha Vantage
    const dailyBar = await supabasePriceService.fetchLatestBar(symbol, interval);
    
    if (!dailyBar) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch daily bar',
        timestamp: new Date().toISOString()
      });
    }

    // Upsert daily bar to database
    const upsertSuccess = await supabasePriceService.upsertBar(dailyBar);
    
    if (!upsertSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Failed to upsert daily bar',
        timestamp: new Date().toISOString()
      });
    }

    // Trigger aggregate refresh (this would normally be done by pg_cron)
    // For now, we'll just log that aggregates should be refreshed
    console.log('📊 Daily bar ingested, aggregates should be refreshed');

    // Broadcast daily close status
    await supabase.channel('bars:TSLA').send({
      type: 'broadcast',
      event: 'status',
      payload: {
        ok: true,
        msg: 'Daily close bar ingested successfully',
        bar: {
          symbol: dailyBar.symbol,
          interval: dailyBar.interval,
          ts: dailyBar.ts,
          close: dailyBar.close
        },
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ Successfully ingested ${symbol} daily close bar at ${dailyBar.ts}`);

    return NextResponse.json({
      success: true,
      symbol,
      interval,
      bar: dailyBar,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error in daily close job:', error);
    
    // Try to broadcast error status
    try {
      const supabase = createServiceClient();
      await supabase.channel('bars:TSLA').send({
        type: 'broadcast',
        event: 'status',
        payload: {
          ok: false,
          msg: 'Daily close job failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      });
    } catch (broadcastError) {
      console.error('Failed to broadcast error status:', broadcastError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
