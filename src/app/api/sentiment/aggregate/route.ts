import { NextRequest, NextResponse } from 'next/server';
import { supabaseSentimentService } from '../../../../services/supabase/sentimentService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'TSLA';
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Get aggregate sentiment from service
    const aggregate = await supabaseSentimentService.getAggregateSentiment(symbol, days);

    return NextResponse.json({
      success: true,
      ...aggregate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/sentiment/aggregate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch aggregate sentiment',
        overallScore: 50,
        overallLabel: 'neutral',
        sources: {
          news: { score: 50, magnitude: 0, label: 'neutral' },
          social: { score: 50, magnitude: 0, label: 'neutral' },
          analyst: { score: 50, magnitude: 0, label: 'neutral' },
        },
        trend: 'stable',
        confidence: 0,
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

