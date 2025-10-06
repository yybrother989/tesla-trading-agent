import { NextRequest, NextResponse } from 'next/server';
import { supabaseSentimentService } from '../../../../services/supabase/sentimentService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'TSLA';
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Get sentiment trend from service
    const timeline = await supabaseSentimentService.getSentimentTrend(symbol, days);

    return NextResponse.json({
      success: true,
      timeline,
      count: timeline.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/sentiment/trend:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sentiment trend',
        timeline: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

