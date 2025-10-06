import { NextRequest, NextResponse } from 'next/server';
import { supabaseSentimentService } from '../../../../services/supabase/sentimentService';
import { normalizeNewsArticle } from '../../../../utils/sentimentDataTransformer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'TSLA';
    const days = parseInt(searchParams.get('days') || '7', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const influencerSlug = searchParams.get('influencer'); // Optional: get specific influencer

    // If specific influencer requested, return their articles
    if (influencerSlug) {
      const rawArticles = await supabaseSentimentService.getInfluencerArticles(
        symbol,
        influencerSlug,
        days,
        limit
      );

      const articles = rawArticles.map(normalizeNewsArticle);

      return NextResponse.json({
        success: true,
        influencer: influencerSlug,
        articles,
        count: articles.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Otherwise, return top influencers with aggregated stats
    const topInfluencers = await supabaseSentimentService.getTopInfluencers(
      symbol,
      days,
      limit
    );

    // Transform influencer data for frontend (include sample articles)
    const influencers = topInfluencers.map(inf => ({
      name: inf.influencerName,
      slug: inf.influencerSlug,
      stats: {
        articleCount: inf.articleCount,
        avgSentiment: inf.avgSentimentScore, // 0-100 scale
        avgConfidence: Math.round(inf.avgConfidence * 100), // 0-100 scale
        totalImpact: inf.totalImpact,
        sentimentLabel: inf.avgSentimentScore >= 70 ? 'positive' : 
                        inf.avgSentimentScore <= 40 ? 'negative' : 'neutral',
      },
      latestArticleDate: inf.latestArticleDate,
      recentArticles: inf.articles.map(normalizeNewsArticle).slice(0, 3), // Show top 3
    }));

    return NextResponse.json({
      success: true,
      influencers,
      count: influencers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/sentiment/influencers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch influencer data',
        influencers: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}




