import { NextRequest, NextResponse } from 'next/server';
import { supabaseSentimentService } from '../../../../services/supabase/sentimentService';
import { normalizeTwitterPost, normalizeRedditPost } from '../../../../utils/sentimentDataTransformer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'TSLA';
    const platform = searchParams.get('platform') || 'all'; // twitter, reddit, or all
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = (searchParams.get('sortBy') as 'engagement' | 'time' | 'sentiment') || 'engagement';

    const results: {
      posts: any[];
      aggregateScore: number;
      trend: string;
      change: number;
    } = {
      posts: [],
      aggregateScore: 50,
      trend: 'neutral',
      change: 0,
    };

    if (platform === 'twitter' || platform === 'all') {
      // Fetch Twitter posts
      const twitterPosts = await supabaseSentimentService.getTwitterPosts(symbol, limit, sortBy);
      const normalizedTweets = twitterPosts.map(normalizeTwitterPost);
      results.posts.push(...normalizedTweets);
    }

    if (platform === 'reddit' || platform === 'all') {
      // Fetch Reddit posts
      const redditPosts = await supabaseSentimentService.getRedditPosts(symbol, limit, sortBy);
      const normalizedReddit = redditPosts.map(normalizeRedditPost);
      results.posts.push(...normalizedReddit);
    }

    // Calculate aggregate score
    const scores = results.posts
      .map(p => p.sentiment.score)
      .filter(s => s !== null && s !== undefined);
    results.aggregateScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 50;

    // Determine trend
    results.trend = 'neutral'; // TODO: Compare with previous period

    return NextResponse.json({
      success: true,
      ...results,
      count: results.posts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/sentiment/social:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch social sentiment',
        posts: [],
        aggregateScore: 50,
        trend: 'neutral',
        change: 0,
      },
      { status: 500 }
    );
  }
}

