/**
 * TSLA Price API Route
 * 
 * GET /api/tsla/price
 * Query parameters:
 * - symbol: Stock symbol (default: TSLA)
 * - interval: 1m, 15m, 60m, 1d (default: 1d)
 * - from: Start date (ISO string)
 * - to: End date (ISO string)
 * - limit: Max number of bars (default: 5000)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabasePriceService } from '../../../../services/supabase/priceService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const symbol = searchParams.get('symbol') || 'TSLA';
    const interval = (searchParams.get('interval') as '1m' | '15m' | '60m' | '1d') || '1d';
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;
    const limit = parseInt(searchParams.get('limit') || '5000');

    // Validate parameters
    if (!['1m', '15m', '60m', '1d'].includes(interval)) {
      return NextResponse.json(
        { error: 'Invalid interval. Must be one of: 1m, 15m, 60m, 1d' },
        { status: 400 }
      );
    }

    if (limit > 10000) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 10000' },
        { status: 400 }
      );
    }

    // Validate date format if provided
    if (from && isNaN(Date.parse(from))) {
      return NextResponse.json(
        { error: 'Invalid from date format. Use ISO string.' },
        { status: 400 }
      );
    }

    if (to && isNaN(Date.parse(to))) {
      return NextResponse.json(
        { error: 'Invalid to date format. Use ISO string.' },
        { status: 400 }
      );
    }

    // Query bars from Supabase
    const bars = await supabasePriceService.getBars({
      symbol,
      interval,
      from,
      to,
      limit
    });

    // Set cache headers based on interval
    const cacheHeaders = {
      'Cache-Control': interval === '1d' 
        ? 'public, max-age=3600' // 1 hour for daily data
        : interval === '60m'
        ? 'public, max-age=300'  // 5 minutes for hourly data
        : interval === '15m'
        ? 'public, max-age=60'  // 1 minute for 15-minute data
        : 'public, max-age=30'  // 30 seconds for 1-minute data
    };

    // Return response with appropriate headers
    return NextResponse.json({
      success: true,
      symbol,
      interval,
      bars,
      count: bars.length,
      from: from || null,
      to: to || null,
      limit,
      timestamp: new Date().toISOString()
    }, {
      headers: cacheHeaders
    });

  } catch (error) {
    console.error('Error in /api/tsla/price:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
