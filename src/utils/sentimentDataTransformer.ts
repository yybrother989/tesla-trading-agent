/**
 * Sentiment Data Transformer Utilities
 * Transforms and normalizes backend Supabase data into frontend component formats
 */

/**
 * Convert sentiment score from -1.0 to +1.0 scale to 0-100 scale for display
 */
export function convertSentimentScore(score: number | null | undefined): number {
  if (score === null || score === undefined) return 50; // Neutral if no data
  // Convert from -1.0 to +1.0 range to 0-100 range
  return Math.round(((score + 1) / 2) * 100);
}

/**
 * Convert sentiment score to label: positive, negative, or neutral
 */
export function determineSentimentLabel(
  score: number | null | undefined
): 'positive' | 'negative' | 'neutral' {
  if (score === null || score === undefined) return 'neutral';
  
  if (score >= 0.3) return 'positive';
  if (score <= -0.3) return 'negative';
  return 'neutral';
}

/**
 * Calculate trend direction based on current and previous scores
 */
export function determineTrend(
  currentScore: number,
  previousScore: number | null | undefined
): 'up' | 'down' | 'neutral' {
  if (previousScore === null || previousScore === undefined) return 'neutral';
  
  const diff = currentScore - previousScore;
  if (diff > 0.05) return 'up';
  if (diff < -0.05) return 'down';
  return 'neutral';
}

/**
 * Format relative time (e.g., "2h ago", "1d ago")
 */
export function formatRelativeTime(timestamp: string | Date | null | undefined): string {
  if (!timestamp) return 'Unknown';
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

/**
 * Convert impact score (1-5) to impact level string
 */
export function convertImpactScore(score: number | null | undefined): 'high' | 'medium' | 'low' {
  if (score === null || score === undefined) return 'low';
  if (score >= 4) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * Calculate weighted average sentiment score
 */
export function calculateAggregateScore(
  scores: number[],
  weights: number[] = []
): number {
  if (scores.length === 0) return 0;
  
  // If no weights provided, use equal weights
  const normalizedWeights = weights.length === scores.length
    ? weights.map(w => w / weights.reduce((sum, w) => sum + w, 0))
    : scores.map(() => 1 / scores.length);
  
  const weightedSum = scores.reduce((sum, score, index) => {
    const weight = normalizedWeights[index] || (1 / scores.length);
    return sum + (score * weight);
  }, 0);
  
  return weightedSum;
}

/**
 * Transform raw sentiment_analysis table row to NewsSentiment interface
 */
export function normalizeNewsArticle(raw: any): {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: {
    score: number;
    magnitude: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  impact: 'high' | 'medium' | 'low';
  url?: string;
} {
  const sentimentScore = raw.sentiment_score ?? null;
  const convertedScore = convertSentimentScore(sentimentScore);
  
  return {
    id: raw.id?.toString() || '',
    headline: raw.title || 'No title',
    source: raw.source || 'Unknown',
    publishedAt: raw.published_at || raw.created_at || new Date().toISOString(),
    sentiment: {
      score: convertedScore,
      magnitude: raw.sentiment_confidence ?? 0.5,
      label: raw.stance || determineSentimentLabel(sentimentScore),
    },
    impact: convertImpactScore(raw.impact_score),
    url: raw.url,
  };
}

/**
 * Transform raw twitter_sentiment table row to SocialMediaSentiment format
 */
export function normalizeTwitterPost(raw: any): {
  id: string;
  platform: 'twitter';
  content: string;
  author: string;
  publishedAt: string;
  url?: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  sentiment: {
    score: number;
    magnitude: number;
    label: 'positive' | 'negative' | 'neutral';
  };
} {
  const sentimentScore = raw.sentiment_score ?? null;
  const convertedScore = convertSentimentScore(sentimentScore);
  
  return {
    id: raw.id?.toString() || raw.tweet_id || '',
    platform: 'twitter',
    content: raw.text || '',
    author: raw.author_handle ? `@${raw.author_handle}` : raw.author_name || 'Unknown',
    publishedAt: raw.posted_at || raw.collected_at || new Date().toISOString(),
    url: raw.tweet_url || undefined,
    engagement: {
      likes: raw.like_count ?? 0,
      shares: raw.retweet_count ?? 0,
      comments: raw.reply_count ?? 0,
    },
    sentiment: {
      score: convertedScore,
      magnitude: raw.sentiment_confidence ?? 0.5,
      label: raw.sentiment_label || determineSentimentLabel(sentimentScore),
    },
  };
}

/**
 * Transform raw reddit_sentiment table row to SocialMediaSentiment format
 */
export function normalizeRedditPost(raw: any): {
  id: string;
  platform: 'reddit';
  content: string;
  title: string;
  subreddit: string;
  author: string;
  publishedAt: string;
  url?: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  sentiment: {
    score: number;
    magnitude: number;
    label: 'positive' | 'negative' | 'neutral';
  };
} {
  const sentimentScore = raw.sentiment_score ?? null;
  const convertedScore = convertSentimentScore(sentimentScore);
  
  // Combine title and text for content
  const content = raw.title 
    ? (raw.text ? `${raw.title}\n\n${raw.text}` : raw.title)
    : raw.text || 'No content';
  
  return {
    id: raw.id?.toString() || raw.post_id || '',
    platform: 'reddit',
    content,
    title: raw.title || 'No title',
    subreddit: raw.subreddit || 'unknown',
    author: raw.author_username ? `u/${raw.author_username}` : 'Unknown',
    publishedAt: raw.posted_at || raw.collected_at || new Date().toISOString(),
    url: raw.post_url || undefined,
    engagement: {
      likes: raw.upvote_count ?? 0,
      shares: 0, // Reddit doesn't have shares
      comments: raw.comment_count ?? 0,
    },
    sentiment: {
      score: convertedScore,
      magnitude: raw.sentiment_confidence ?? 0.5,
      label: raw.sentiment_label || determineSentimentLabel(sentimentScore),
    },
  };
}

/**
 * Calculate aggregate sentiment from multiple sources with weights
 */
export function calculateAggregateSentiment(
  newsScore: number | null,
  socialScore: number | null,
  analystScore: number | null,
  weights: { news: number; social: number; analyst: number } = { news: 0.4, social: 0.3, analyst: 0.3 }
): {
  overallScore: number;
  overallLabel: 'positive' | 'negative' | 'neutral';
  sources: {
    news: { score: number; magnitude: number; label: string };
    social: { score: number; magnitude: number; label: string };
    analyst: { score: number; magnitude: number; label: string };
  };
} {
  // Convert -1 to +1 scores to 0-100 scale for aggregation
  const newsConverted = newsScore !== null ? convertSentimentScore(newsScore) : 50;
  const socialConverted = socialScore !== null ? convertSentimentScore(socialScore) : 50;
  const analystConverted = analystScore !== null ? convertSentimentScore(analystScore) : 50;
  
  // Calculate weighted average
  const totalWeight = (newsScore !== null ? weights.news : 0) +
                     (socialScore !== null ? weights.social : 0) +
                     (analystScore !== null ? weights.analyst : 0);
  
  if (totalWeight === 0) {
    return {
      overallScore: 50,
      overallLabel: 'neutral',
      sources: {
        news: { score: 50, magnitude: 0, label: 'neutral' },
        social: { score: 50, magnitude: 0, label: 'neutral' },
        analyst: { score: 50, magnitude: 0, label: 'neutral' },
      },
    };
  }
  
  const weightedScore = (
    (newsConverted * (newsScore !== null ? weights.news : 0)) +
    (socialConverted * (socialScore !== null ? weights.social : 0)) +
    (analystConverted * (analystScore !== null ? weights.analyst : 0))
  ) / totalWeight;
  
  return {
    overallScore: Math.round(weightedScore),
    overallLabel: determineSentimentLabel((weightedScore / 100) * 2 - 1),
    sources: {
      news: {
        score: newsConverted,
        magnitude: 0.5,
        label: determineSentimentLabel(newsScore),
      },
      social: {
        score: socialConverted,
        magnitude: 0.5,
        label: determineSentimentLabel(socialScore),
      },
      analyst: {
        score: analystConverted,
        magnitude: 0.5,
        label: determineSentimentLabel(analystScore),
      },
    },
  };
}

