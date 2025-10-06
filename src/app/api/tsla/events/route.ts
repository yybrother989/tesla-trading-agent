/**
 * TSLA Events API Route
 * 
 * GET /api/tsla/events
 * Query parameters:
 * - symbol: Stock symbol (default: TSLA)
 * - from: Start date (ISO string)
 * - to: End date (ISO string)
 * - event_type: Filter by event type
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseEventService } from '../../../../services/supabase/eventService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const symbol = searchParams.get('symbol') || 'TSLA';
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;
    const event_type = searchParams.get('event_type') || undefined;

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

    // Validate event type if provided
    const validEventTypes = [
      'earnings', 'product_launch', 'delivery_report', 'partnership',
      'regulatory', 'market_event', 'analyst_upgrade', 'analyst_downgrade',
      'split', 'dividend', 'other'
    ];

    if (event_type && !validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type. Must be one of: ${validEventTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Query events from Supabase
    const events = await supabaseEventService.getEvents({
      symbol,
      from,
      to,
      event_type
    });

    // Set cache headers (events change less frequently)
    const cacheHeaders = {
      'Cache-Control': 'public, max-age=1800' // 30 minutes
    };

    // Return response with appropriate headers
    return NextResponse.json({
      success: true,
      symbol,
      events,
      count: events.length,
      from: from || null,
      to: to || null,
      event_type: event_type || null,
      timestamp: new Date().toISOString()
    }, {
      headers: cacheHeaders
    });

  } catch (error) {
    console.error('Error in /api/tsla/events:', error);
    
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
