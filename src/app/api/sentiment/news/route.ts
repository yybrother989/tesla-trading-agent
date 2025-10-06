import { NextRequest, NextResponse } from 'next/server';
import { supabaseSentimentService } from '../../../../services/supabase/sentimentService';
import { normalizeNewsArticle } from '../../../../utils/sentimentDataTransformer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'TSLA';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const days = parseInt(searchParams.get('days') || '7', 10);
    
    const category = searchParams.get('category') || undefined;
    const minImpact = searchParams.get('minImpact') ? parseInt(searchParams.get('minImpact')!, 10) : undefined;
    const stance = (searchParams.get('stance') as 'bullish' | 'bearish' | 'neutral') || undefined;

    // Fetch news articles from Supabase
    const rawArticles = await supabaseSentimentService.getNewsArticles(symbol, limit, {
      days,
      category,
      minImpact,
      stance,
    });

    // Transform to frontend format
    const articles = rawArticles.map(normalizeNewsArticle);

    // Calculate aggregate score from articles
    const scores = articles
      .map(a => a.sentiment.score)
      .filter(s => s !== null && s !== undefined);
    const aggregateScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 50;

    // Determine trend (simple comparison with previous batch would require additional query)
    const trend = 'neutral'; // TODO: Compare with previous time period

    return NextResponse.json({
      success: true,
      articles,
      aggregateScore,
      trend,
      change: 0, // TODO: Calculate change from previous period
      count: articles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/sentiment/news:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch news sentiment',
        articles: [],
        aggregateScore: 50,
        trend: 'neutral',
        change: 0,
      },
      { status: 500 }
    );
  }
}

