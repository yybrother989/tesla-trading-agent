/**
 * Supabase Sentiment Service
 * 
 * Server-side service for querying sentiment analysis data from Supabase tables:
 * - sentiment_analysis: News articles with sentiment
 * - twitter_sentiment: Twitter posts with sentiment
 * - reddit_sentiment: Reddit posts with sentiment
 */

import { createServiceClient } from '../../lib/supabase/server';

export interface NewsArticle {
  id: number;
  user_id: number;
  ticker: string;
  url: string;
  title: string;
  text: string;
  source: string;
  published_at: string;
  category: string | null;
  sentiment_score: number | null;
  impact_score: number | null;
  sentiment_confidence: number | null;
  stance: string | null;
  created_at: string;
  updated_at: string;
}

export interface TwitterPost {
  id: number;
  user_id: number;
  ticker: string;
  tweet_id: string;
  tweet_url: string;
  author_handle: string | null;
  author_name: string | null;
  text: string;
  posted_at: string;
  like_count: number | null;
  retweet_count: number | null;
  reply_count: number | null;
  view_count: number | null;
  sentiment_score: number | null;
  sentiment_label: string | null;
  sentiment_confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface RedditPost {
  id: number;
  user_id: number;
  ticker: string;
  post_id: string;
  post_url: string;
  subreddit: string;
  author_username: string | null;
  title: string;
  text: string | null;
  posted_at: string;
  upvote_count: number | null;
  comment_count: number | null;
  sentiment_score: number | null;
  sentiment_label: string | null;
  sentiment_confidence: number | null;
  created_at: string;
  updated_at: string;
}

export interface AggregateSentimentResult {
  overallScore: number;
  overallLabel: 'positive' | 'negative' | 'neutral';
  sources: {
    news: { score: number; magnitude: number; label: string };
    social: { score: number; magnitude: number; label: string };
    analyst: { score: number; magnitude: number; label: string };
  };
  trend: 'improving' | 'declining' | 'stable';
  confidence: number;
  lastUpdated: string;
}

export interface SentimentTrendDataPoint {
  date: string;
  score: number;
  volume: number;
}

export class SupabaseSentimentService {
  private supabase;

  constructor() {
    this.supabase = createServiceClient();
  }

  /**
   * Get news articles from sentiment_analysis table
   */
  async getNewsArticles(
    symbol: string = 'TSLA',
    limit: number = 10,
    filters: {
      days?: number;
      category?: string;
      minImpact?: number;
      stance?: 'bullish' | 'bearish' | 'neutral';
    } = {}
  ): Promise<NewsArticle[]> {
    try {
      const { days = 7, category, minImpact, stance } = filters;
      
      // Calculate date threshold
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      
      let query = this.supabase
        .from('sentiment_analysis')
        .select('*')
        .eq('ticker', symbol)
        .eq('user_id', 1)
        .gte('published_at', dateThreshold.toISOString())
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      if (minImpact !== undefined && minImpact > 0) {
        query = query.gte('impact_score', minImpact);
      }

      if (stance) {
        query = query.eq('stance', stance);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching news articles:', error);
        return [];
      }

      return (data || []) as NewsArticle[];
    } catch (error) {
      console.error('Error in getNewsArticles:', error);
      return [];
    }
  }

  /**
   * Get Twitter posts from twitter_sentiment table
   */
  async getTwitterPosts(
    symbol: string = 'TSLA',
    limit: number = 20,
    sortBy: 'engagement' | 'time' | 'sentiment' = 'engagement'
  ): Promise<TwitterPost[]> {
    try {
      let query = this.supabase
        .from('twitter_sentiment')
        .select('*')
        .eq('ticker', symbol)
        .eq('user_id', 1)
        .limit(limit);

      // Sort by different criteria
      if (sortBy === 'engagement') {
        query = query.order('like_count', { ascending: false })
                     .order('retweet_count', { ascending: false });
      } else if (sortBy === 'time') {
        query = query.order('posted_at', { ascending: false });
      } else if (sortBy === 'sentiment') {
        query = query.order('sentiment_score', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching Twitter posts:', error);
        return [];
      }

      return (data || []) as TwitterPost[];
    } catch (error) {
      console.error('Error in getTwitterPosts:', error);
      return [];
    }
  }

  /**
   * Get Reddit posts from reddit_sentiment table
   */
  async getRedditPosts(
    symbol: string = 'TSLA',
    limit: number = 20,
    sortBy: 'engagement' | 'time' | 'sentiment' = 'engagement'
  ): Promise<RedditPost[]> {
    try {
      let query = this.supabase
        .from('reddit_sentiment')
        .select('*')
        .eq('ticker', symbol)
        .eq('user_id', 1)
        .limit(limit);

      // Sort by different criteria
      if (sortBy === 'engagement') {
        query = query.order('upvote_count', { ascending: false })
                     .order('comment_count', { ascending: false });
      } else if (sortBy === 'time') {
        query = query.order('posted_at', { ascending: false });
      } else if (sortBy === 'sentiment') {
        query = query.order('sentiment_score', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching Reddit posts:', error);
        return [];
      }

      return (data || []) as RedditPost[];
    } catch (error) {
      console.error('Error in getRedditPosts:', error);
      return [];
    }
  }

  /**
   * Get aggregate sentiment across all sources
   */
  async getAggregateSentiment(
    symbol: string = 'TSLA',
    days: number = 7
  ): Promise<AggregateSentimentResult> {
    try {
      // Query all three tables in parallel
      const [newsArticles, twitterPosts, redditPosts] = await Promise.all([
        this.getNewsArticles(symbol, 100, { days }),
        this.getTwitterPosts(symbol, 100),
        this.getRedditPosts(symbol, 100),
      ]);

      // Calculate average sentiment scores (in -1 to +1 range)
      const newsScores = newsArticles
        .filter(a => a.sentiment_score !== null)
        .map(a => a.sentiment_score!);
      const newsAvg = newsScores.length > 0
        ? newsScores.reduce((sum, s) => sum + s, 0) / newsScores.length
        : null;

      const twitterScores = twitterPosts
        .filter(p => p.sentiment_score !== null)
        .map(p => p.sentiment_score!);
      const twitterAvg = twitterScores.length > 0
        ? twitterScores.reduce((sum, s) => sum + s, 0) / twitterScores.length
        : null;

      const redditScores = redditPosts
        .filter(p => p.sentiment_score !== null)
        .map(p => p.sentiment_score!);
      const redditAvg = redditScores.length > 0
        ? redditScores.reduce((sum, s) => sum + s, 0) / redditScores.length
        : null;

      // Combine social media scores (Twitter + Reddit weighted average)
      const socialAvg = twitterAvg !== null && redditAvg !== null
        ? (twitterAvg * 0.6 + redditAvg * 0.4) // Twitter weighted more
        : twitterAvg ?? redditAvg;

      // Analyst score - not available from backend, use null
      const analystAvg = null;

      // Calculate overall sentiment (0-100 scale)
      let overallScore = 50; // Default neutral
      if (newsAvg !== null || socialAvg !== null) {
        const scores: number[] = [];
        const weights: number[] = [];
        
        if (newsAvg !== null) {
          scores.push((newsAvg + 1) * 50); // Convert to 0-100
          weights.push(0.4);
        }
        if (socialAvg !== null) {
          scores.push((socialAvg + 1) * 50);
          weights.push(0.3);
        }
        
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const weightedSum = scores.reduce((sum, score, i) => sum + score * weights[i], 0);
        overallScore = Math.round(weightedSum / totalWeight);
      }

      const overallLabel: 'positive' | 'negative' | 'neutral' = 
        overallScore >= 70 ? 'positive' : overallScore <= 40 ? 'negative' : 'neutral';

      return {
        overallScore,
        overallLabel,
        sources: {
          news: {
            score: newsAvg !== null ? Math.round((newsAvg + 1) * 50) : 50,
            magnitude: newsArticles.length > 0 ? 0.8 : 0,
            label: newsAvg !== null ? (newsAvg >= 0.3 ? 'positive' : newsAvg <= -0.3 ? 'negative' : 'neutral') : 'neutral',
          },
          social: {
            score: socialAvg !== null ? Math.round((socialAvg + 1) * 50) : 50,
            magnitude: (twitterPosts.length + redditPosts.length) > 0 ? 0.7 : 0,
            label: socialAvg !== null ? (socialAvg >= 0.3 ? 'positive' : socialAvg <= -0.3 ? 'negative' : 'neutral') : 'neutral',
          },
          analyst: {
            score: 50,
            magnitude: 0,
            label: 'neutral',
          },
        },
        trend: 'stable', // TODO: Calculate from historical data
        confidence: 0.75,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in getAggregateSentiment:', error);
      // Return default neutral sentiment on error
      return {
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
      };
    }
  }

  /**
   * Get sentiment trend over time for timeline chart
   */
  async getSentimentTrend(
    symbol: string = 'TSLA',
    days: number = 7
  ): Promise<SentimentTrendDataPoint[]> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      // Query all sentiment data for the time period
      const { data: newsData, error: newsError } = await this.supabase
        .from('sentiment_analysis')
        .select('published_at, sentiment_score')
        .eq('ticker', symbol)
        .eq('user_id', 1)
        .gte('published_at', dateThreshold.toISOString())
        .not('sentiment_score', 'is', null);

      const { data: twitterData, error: twitterError } = await this.supabase
        .from('twitter_sentiment')
        .select('posted_at, sentiment_score')
        .eq('ticker', symbol)
        .eq('user_id', 1)
        .gte('posted_at', dateThreshold.toISOString())
        .not('sentiment_score', 'is', null);

      const { data: redditData, error: redditError } = await this.supabase
        .from('reddit_sentiment')
        .select('posted_at, sentiment_score')
        .eq('ticker', symbol)
        .eq('user_id', 1)
        .gte('posted_at', dateThreshold.toISOString())
        .not('sentiment_score', 'is', null);

      if (newsError || twitterError || redditError) {
        console.error('Error fetching sentiment trend data:', { newsError, twitterError, redditError });
        return [];
      }

      // Group by date and calculate daily averages
      const dateMap = new Map<string, { scores: number[]; count: number }>();

      // Process news data
      (newsData || []).forEach((item: any) => {
        const date = new Date(item.published_at).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
          dateMap.set(date, { scores: [], count: 0 });
        }
        const entry = dateMap.get(date)!;
        entry.scores.push(item.sentiment_score);
        entry.count++;
      });

      // Process Twitter data
      (twitterData || []).forEach((item: any) => {
        const date = new Date(item.posted_at).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
          dateMap.set(date, { scores: [], count: 0 });
        }
        const entry = dateMap.get(date)!;
        entry.scores.push(item.sentiment_score);
        entry.count++;
      });

      // Process Reddit data
      (redditData || []).forEach((item: any) => {
        const date = new Date(item.posted_at).toISOString().split('T')[0];
        if (!dateMap.has(date)) {
          dateMap.set(date, { scores: [], count: 0 });
        }
        const entry = dateMap.get(date)!;
        entry.scores.push(item.sentiment_score);
        entry.count++;
      });

      // Convert to array and calculate averages
      const trend: SentimentTrendDataPoint[] = Array.from(dateMap.entries())
        .map(([date, { scores, count }]) => {
          const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
          // Convert -1 to +1 scale to 0-100 scale
          const convertedScore = Math.round(((avgScore + 1) / 2) * 100);
          return {
            date,
            score: convertedScore,
            volume: count,
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));

      return trend;
    } catch (error) {
      console.error('Error in getSentimentTrend:', error);
      return [];
    }
  }

  /**
   * Get all influencer news articles from sentiment_analysis table
   * Influencers are identified by source field format: influencer:{influencer_name_slug}
   */
  async getInfluencerNews(
    symbol: string = 'TSLA',
    days: number = 30,
    limit: number = 50
  ): Promise<NewsArticle[]> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const { data, error } = await this.supabase
        .from('sentiment_analysis')
        .select('*')
        .eq('ticker', symbol)
        .eq('user_id', 1)
        .like('source', 'influencer:%')
        .gte('published_at', dateThreshold.toISOString())
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching influencer news:', error);
        return [];
      }

      return (data || []) as NewsArticle[];
    } catch (error) {
      console.error('Error in getInfluencerNews:', error);
      return [];
    }
  }

  /**
   * Get aggregated influencer statistics
   * Returns list of influencers with their sentiment stats
   */
  async getTopInfluencers(
    symbol: string = 'TSLA',
    days: number = 7,
    limit: number = 10
  ): Promise<{
    influencerName: string;
    influencerSlug: string;
    articleCount: number;
    avgSentiment: number; // -1 to +1 scale
    avgSentimentScore: number; // 0 to 100 scale (for display)
    avgConfidence: number;
    totalImpact: number;
    latestArticleDate: string | null;
    articles: NewsArticle[];
  }[]> {
    try {
      // Get all influencer news from past N days
      const articles = await this.getInfluencerNews(symbol, days, 200);

      // Group articles by influencer
      const influencerMap = new Map<string, {
        articles: NewsArticle[];
        slug: string;
      }>();

      articles.forEach(article => {
        // Extract influencer name from source (format: "influencer:gary_black")
        const match = article.source.match(/^influencer:(.+)$/);
        if (match) {
          const slug = match[1];
          // Convert slug to display name (gary_black -> Gary Black)
          const displayName = slug
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          if (!influencerMap.has(displayName)) {
            influencerMap.set(displayName, {
              articles: [],
              slug,
            });
          }
          influencerMap.get(displayName)!.articles.push(article);
        }
      });

      // Calculate statistics for each influencer
      const influencers = Array.from(influencerMap.entries())
        .map(([displayName, { articles: influencerArticles, slug }]) => {
          // Filter articles with sentiment analysis
          const articlesWithSentiment = influencerArticles.filter(
            a => a.sentiment_score !== null
          );

          // Calculate average sentiment
          const sentimentScores = articlesWithSentiment.map(a => a.sentiment_score!);
          const avgSentiment = sentimentScores.length > 0
            ? sentimentScores.reduce((sum, s) => sum + s, 0) / sentimentScores.length
            : 0;

          // Convert to 0-100 scale
          const avgSentimentScore = Math.round(((avgSentiment + 1) / 2) * 100);

          // Calculate average confidence
          const confidences = articlesWithSentiment
            .filter(a => a.sentiment_confidence !== null)
            .map(a => a.sentiment_confidence!);
          const avgConfidence = confidences.length > 0
            ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
            : 0;

          // Calculate total impact
          const totalImpact = influencerArticles
            .filter(a => a.impact_score !== null)
            .reduce((sum, a) => sum + (a.impact_score || 0), 0);

          // Get latest article date
          const dates = influencerArticles.map(a => new Date(a.published_at));
          const latestDate = dates.length > 0
            ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString()
            : null;

          return {
            influencerName: displayName,
            influencerSlug: slug,
            articleCount: influencerArticles.length,
            avgSentiment,
            avgSentimentScore,
            avgConfidence,
            totalImpact,
            latestArticleDate: latestDate,
            articles: influencerArticles.slice(0, 5), // Keep top 5 articles for detail view
          };
        })
        .sort((a, b) => {
          // Sort by composite score: articleCount * avgSentimentScore * avgConfidence
          const scoreA = a.articleCount * a.avgSentimentScore * a.avgConfidence;
          const scoreB = b.articleCount * b.avgSentimentScore * b.avgConfidence;
          return scoreB - scoreA; // Descending
        })
        .slice(0, limit);

      return influencers;
    } catch (error) {
      console.error('Error in getTopInfluencers:', error);
      return [];
    }
  }

  /**
   * Get news articles from a specific influencer
   */
  async getInfluencerArticles(
    symbol: string = 'TSLA',
    influencerSlug: string,
    days: number = 30,
    limit: number = 20
  ): Promise<NewsArticle[]> {
    try {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);

      const influencerSource = `influencer:${influencerSlug}`;

      const { data, error } = await this.supabase
        .from('sentiment_analysis')
        .select('*')
        .eq('ticker', symbol)
        .eq('user_id', 1)
        .eq('source', influencerSource)
        .gte('published_at', dateThreshold.toISOString())
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching influencer articles:', error);
        return [];
      }

      return (data || []) as NewsArticle[];
    } catch (error) {
      console.error('Error in getInfluencerArticles:', error);
      return [];
    }
  }
}

// Export singleton instance
export const supabaseSentimentService = new SupabaseSentimentService();

