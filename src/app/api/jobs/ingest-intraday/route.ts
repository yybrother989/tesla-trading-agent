/**
 * Intraday Ingestion Job
 * 
 * POST /api/jobs/ingest-intraday
 * Fetches latest 1-minute bar from Alpha Vantage and broadcasts via Supabase Realtime
 * Should be called every minute during market hours
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
    const interval = '1m';

    console.log(`🔄 Starting intraday ingestion for ${symbol} ${interval}...`);

    // Fetch latest bar from Alpha Vantage
    const latestBar = await supabasePriceService.fetchLatestBar(symbol, interval);
    
    if (!latestBar) {
      // Broadcast error status
      await supabase.channel('bars:TSLA').send({
        type: 'broadcast',
        event: 'status',
        payload: {
          ok: false,
          msg: 'Failed to fetch latest bar from Alpha Vantage',
          timestamp: new Date().toISOString()
        }
      });

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch latest bar',
        timestamp: new Date().toISOString()
      });
    }

    // Upsert bar to database
    const upsertSuccess = await supabasePriceService.upsertBar(latestBar);
    
    if (!upsertSuccess) {
      // Broadcast error status
      await supabase.channel('bars:TSLA').send({
        type: 'broadcast',
        event: 'status',
        payload: {
          ok: false,
          msg: 'Failed to upsert bar to database',
          timestamp: new Date().toISOString()
        }
      });

      return NextResponse.json({
        success: false,
        error: 'Failed to upsert bar',
        timestamp: new Date().toISOString()
      });
    }

    // Broadcast new bar via Supabase Realtime
    await supabase.channel('bars:TSLA').send({
      type: 'broadcast',
      event: 'bar',
      payload: {
        symbol: latestBar.symbol,
        interval: latestBar.interval,
        ts: latestBar.ts,
        open: latestBar.open,
        high: latestBar.high,
        low: latestBar.low,
        close: latestBar.close,
        volume: latestBar.volume,
        adjusted: latestBar.adjusted,
        data_version: latestBar.data_version
      }
    });

    console.log(`✅ Successfully ingested ${symbol} ${interval} bar at ${latestBar.ts}`);

    return NextResponse.json({
      success: true,
      symbol,
      interval,
      bar: latestBar,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error in intraday ingestion:', error);
    
    // Try to broadcast error status
    try {
      const supabase = createServiceClient();
      await supabase.channel('bars:TSLA').send({
        type: 'broadcast',
        event: 'status',
        payload: {
          ok: false,
          msg: 'Intraday ingestion job failed',
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
