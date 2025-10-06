/**
 * Sentiment Analysis Service - Client-Side Wrapper
 * Connects to backend API routes for sentiment analysis data
 */

export interface SentimentScore {
  score: number; // 0 to 100 (for display) or -1 to 1 (raw)
  magnitude: number; // 0 to 1 (strength of sentiment)
  label: 'positive' | 'negative' | 'neutral';
}

export interface NewsSentiment {
  id?: string;
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: SentimentScore;
  impact: 'high' | 'medium' | 'low';
  url?: string;
}

export interface SocialMediaSentiment {
  id?: string;
  platform: 'twitter' | 'reddit' | 'youtube' | 'facebook';
  content: string;
  title?: string; // For Reddit posts
  subreddit?: string; // For Reddit posts
  author: string;
  publishedAt: string;
  url?: string; // URL to the original post/tweet
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  sentiment: SentimentScore;
}

export interface AnalystSentiment {
  analyst: string;
  firm: string;
  rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  priceTarget: number;
  publishedAt: string;
  summary: string;
  sentiment: SentimentScore;
}

export interface InfluencerStats {
  articleCount: number;
  avgSentiment: number; // 0-100 scale
  avgConfidence: number; // 0-100 scale
  totalImpact: number;
  sentimentLabel: 'positive' | 'negative' | 'neutral';
}

export interface InfluencerData {
  name: string;
  slug: string;
  stats: InfluencerStats;
  latestArticleDate: string | null;
  recentArticles: NewsSentiment[];
}

export interface AggregateSentiment {
  overallScore: number; // 0-100 scale
  overallLabel: 'positive' | 'negative' | 'neutral';
  sources: {
    news: SentimentScore;
    social: SentimentScore;
    analyst: SentimentScore;
  };
  trend: 'improving' | 'declining' | 'stable';
  confidence: number; // 0 to 1
  lastUpdated: string;
}

class SentimentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Fetch news sentiment articles from API
   */
  async analyzeNewsSentiment(symbol: string = 'TSLA', limit: number = 10): Promise<NewsSentiment[]> {
    try {
      const params = new URLSearchParams({
        symbol,
        limit: limit.toString(),
      });
      const response = await fetch(`${this.baseUrl}/api/sentiment/news?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news sentiment: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch news sentiment');
      }

      return data.articles || [];
    } catch (error) {
      console.error('Error fetching news sentiment:', error);
      return [];
    }
  }

  /**
   * Fetch social media sentiment from API
   */
  async analyzeSocialMediaSentiment(
    symbol: string = 'TSLA',
    platforms: ('twitter' | 'reddit')[] = ['twitter', 'reddit'],
    limit: number = 20
  ): Promise<SocialMediaSentiment[]> {
    try {
      const platform = platforms.length === 1 ? platforms[0] : 'all';
      const params = new URLSearchParams({
        symbol,
        platform,
        limit: limit.toString(),
      });
      const response = await fetch(`${this.baseUrl}/api/sentiment/social?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch social sentiment: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch social sentiment');
      }

      return data.posts || [];
    } catch (error) {
      console.error('Error fetching social media sentiment:', error);
      return [];
    }
  }

  /**
   * Analyst sentiment - not available from backend, return empty array
   */
  async analyzeAnalystSentiment(symbol: string = 'TSLA', limit: number = 10): Promise<AnalystSentiment[]> {
    // Analyst data is not in backend tables
    console.warn('Analyst sentiment data is not available from backend');
    return [];
  }

  /**
   * Fetch aggregate sentiment from API
   */
  async getAggregateSentiment(symbol: string = 'TSLA'): Promise<AggregateSentiment> {
    try {
      const params = new URLSearchParams({ symbol });
      const response = await fetch(`${this.baseUrl}/api/sentiment/aggregate?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch aggregate sentiment: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch aggregate sentiment');
      }

      return {
        overallScore: data.overallScore,
        overallLabel: data.overallLabel,
        sources: data.sources,
        trend: data.trend,
        confidence: data.confidence,
        lastUpdated: data.lastUpdated,
      };
    } catch (error) {
      console.error('Error fetching aggregate sentiment:', error);
      // Return neutral default on error
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
   * Fetch sentiment trend data from API
   */
  async getSentimentTrend(symbol: string = 'TSLA', days: number = 7): Promise<{
    date: string;
    score: number;
    volume: number;
  }[]> {
    try {
      const params = new URLSearchParams({
        symbol,
        days: days.toString(),
      });
      const response = await fetch(`${this.baseUrl}/api/sentiment/trend?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sentiment trend: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch sentiment trend');
      }

      return data.timeline || [];
    } catch (error) {
      console.error('Error fetching sentiment trend:', error);
      return [];
    }
  }

  /**
   * Fetch top influencers from API
   */
  async getTopInfluencers(
    symbol: string = 'TSLA',
    days: number = 7,
    limit: number = 10
  ): Promise<InfluencerData[]> {
    try {
      const params = new URLSearchParams({
        symbol,
        days: days.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`${this.baseUrl}/api/sentiment/influencers?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch influencers: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch influencers');
      }

      return data.influencers || [];
    } catch (error) {
      console.error('Error fetching top influencers:', error);
      return [];
    }
  }

  /**
   * Fetch articles from a specific influencer
   */
  async getInfluencerArticles(
    symbol: string = 'TSLA',
    influencerSlug: string,
    days: number = 30,
    limit: number = 20
  ): Promise<NewsSentiment[]> {
    try {
      const params = new URLSearchParams({
        symbol,
        influencer: influencerSlug,
        days: days.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`${this.baseUrl}/api/sentiment/influencers?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch influencer articles: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch influencer articles');
      }

      return data.articles || [];
    } catch (error) {
      console.error('Error fetching influencer articles:', error);
      return [];
    }
  }

  /**
   * Sentiment alerts - not yet implemented
   */
  async setupSentimentAlerts(symbol: string, threshold: number = 0.3): Promise<void> {
    console.log(`Sentiment alerts not yet implemented for ${symbol} with threshold ${threshold}`);
  }

  /**
   * Get service status
   */
  getStatus(): { available: boolean; message: string } {
    return {
      available: true,
      message: 'Sentiment analysis service connected to Supabase backend. Data updates automatically.'
    };
  }

  /**
   * Update configuration (kept for compatibility, no-op)
   */
  updateConfig(config: { apiKey?: string; baseUrl?: string }): void {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
    console.log('Sentiment service configuration updated');
  }
}

// Export singleton instance
let sentimentService: SentimentService | null = null;

export const getSentimentService = (): SentimentService => {
  if (!sentimentService) {
    sentimentService = new SentimentService();
  }
  return sentimentService;
};

export { SentimentService };
