import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../ui/Card';
import { getSentimentService, NewsSentiment, SocialMediaSentiment, InfluencerData } from '../../../services/sentimentService';
import { formatRelativeTime } from '../../../utils/sentimentDataTransformer';

interface SentimentData {
  score: number;
  trend: 'up' | 'down' | 'neutral';
  source: string;
  change: number;
}

interface SentimentCardProps {
  data: SentimentData;
  children?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const DropdownSentimentCard: React.FC<SentimentCardProps> = ({ 
  data, 
  children, 
  loading = false,
  error = null,
  onRetry 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    // Trigger data load on first expand if callback provided
    if (newIsOpen && onRetry) {
      // Small delay to allow state update
      setTimeout(() => {
        onRetry();
      }, 100);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  const getSentimentBg = (score: number) => {
    if (score >= 70) return 'bg-success/10';
    if (score >= 40) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  return (
    <Card>
      <div 
        className="cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">{data.source}</h3>
          <div className="flex items-center space-x-2">
            {getTrendIcon(data.trend)}
            <svg 
              className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Score</span>
            <span className={`font-bold ${getSentimentColor(data.score)}`}>{data.score}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getSentimentBg(data.score).replace('/10', '')}`}
              style={{ width: `${data.score}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">24h Change</span>
            <span className={`text-sm font-medium ${data.change >= 0 ? 'text-success' : 'text-error'}`}>
              {data.change >= 0 ? '+' : ''}{data.change}%
            </span>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-border">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tesla-red"></div>
            </div>
          )}
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-center">
              <p className="text-sm text-error mb-2">{error}</p>
              {onRetry && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetry?.();
                  }}
                  className="text-xs px-3 py-1 bg-error text-white rounded hover:bg-error/80"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          {!loading && !error && children}
        </div>
      )}
    </Card>
  );
};

export const SentimentTab: React.FC = () => {
  const sentimentService = getSentimentService();
  const serviceStatus = sentimentService.getStatus();

  // Overall aggregate sentiment state
  const [aggregateSentiment, setAggregateSentiment] = useState<{
    overallScore: number;
    overallLabel: string;
    trend: 'up' | 'down' | 'neutral';
  } | null>(null);
  const [aggregateLoading, setAggregateLoading] = useState(true);
  const [aggregateError, setAggregateError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // News sentiment state
  const [newsArticles, setNewsArticles] = useState<NewsSentiment[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Twitter sentiment state
  const [twitterPosts, setTwitterPosts] = useState<SocialMediaSentiment[]>([]);
  const [twitterLoading, setTwitterLoading] = useState(false);
  const [twitterError, setTwitterError] = useState<string | null>(null);

  // Reddit sentiment state
  const [redditPosts, setRedditPosts] = useState<SocialMediaSentiment[]>([]);
  const [redditLoading, setRedditLoading] = useState(false);
  const [redditError, setRedditError] = useState<string | null>(null);

  // Influencer tracking state
  const [influencers, setInfluencers] = useState<InfluencerData[]>([]);
  const [influencerLoading, setInfluencerLoading] = useState(false);
  const [influencerError, setInfluencerError] = useState<string | null>(null);
  const [expandedInfluencer, setExpandedInfluencer] = useState<string | null>(null);

  // Timeline state
  const [timelineData, setTimelineData] = useState<{ date: string; score: number; volume: number }[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Load aggregate sentiment
  const loadAggregateSentiment = useCallback(async () => {
    try {
      setAggregateLoading(true);
      setAggregateError(null);
      const data = await sentimentService.getAggregateSentiment('TSLA');
      setAggregateSentiment({
        overallScore: data.overallScore,
        overallLabel: data.overallLabel,
        trend: data.trend === 'improving' ? 'up' : data.trend === 'declining' ? 'down' : 'neutral',
      });
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading aggregate sentiment:', error);
      setAggregateError(error instanceof Error ? error.message : 'Failed to load sentiment');
    } finally {
      setAggregateLoading(false);
    }
  }, [sentimentService]);

  // Load news articles
  const loadNewsArticles = useCallback(async () => {
    try {
      setNewsLoading(true);
      setNewsError(null);
      const articles = await sentimentService.analyzeNewsSentiment('TSLA', 10);
      setNewsArticles(articles);
    } catch (error) {
      console.error('Error loading news articles:', error);
      setNewsError(error instanceof Error ? error.message : 'Failed to load news articles');
    } finally {
      setNewsLoading(false);
    }
  }, [sentimentService]);

  // Load Twitter posts
  const loadTwitterPosts = useCallback(async () => {
    try {
      setTwitterLoading(true);
      setTwitterError(null);
      const posts = await sentimentService.analyzeSocialMediaSentiment('TSLA', ['twitter'], 10);
      setTwitterPosts(posts);
    } catch (error) {
      console.error('Error loading Twitter posts:', error);
      setTwitterError(error instanceof Error ? error.message : 'Failed to load Twitter posts');
    } finally {
      setTwitterLoading(false);
    }
  }, [sentimentService]);

  // Load Reddit posts
  const loadRedditPosts = useCallback(async () => {
    try {
      setRedditLoading(true);
      setRedditError(null);
      const posts = await sentimentService.analyzeSocialMediaSentiment('TSLA', ['reddit'], 10);
      setRedditPosts(posts);
    } catch (error) {
      console.error('Error loading Reddit posts:', error);
      setRedditError(error instanceof Error ? error.message : 'Failed to load Reddit posts');
    } finally {
      setRedditLoading(false);
    }
  }, [sentimentService]);

  // Load top influencers
  const loadInfluencers = useCallback(async () => {
    try {
      setInfluencerLoading(true);
      setInfluencerError(null);
      const influencerData = await sentimentService.getTopInfluencers('TSLA', 7, 10);
      setInfluencers(influencerData);
    } catch (error) {
      console.error('Error loading influencers:', error);
      setInfluencerError(error instanceof Error ? error.message : 'Failed to load influencers');
    } finally {
      setInfluencerLoading(false);
    }
  }, [sentimentService]);

  // Load timeline data
  const loadTimeline = useCallback(async () => {
    try {
      setTimelineLoading(true);
      const data = await sentimentService.getSentimentTrend('TSLA', 7);
      setTimelineData(data);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setTimelineLoading(false);
    }
  }, [sentimentService]);

  // Load aggregate sentiment on mount and auto-refresh
  useEffect(() => {
    // Load all sections on mount so users immediately see content
    loadAggregateSentiment();
    loadTimeline();
    loadNewsArticles();
    loadTwitterPosts();
    loadRedditPosts();
    loadInfluencers();

    // Auto-refresh aggregate every 60 seconds
    const interval = setInterval(() => {
      loadAggregateSentiment();
    }, 60000);

    return () => clearInterval(interval);
  }, [
    loadAggregateSentiment,
    loadTimeline,
    loadNewsArticles,
    loadTwitterPosts,
    loadRedditPosts,
    loadInfluencers,
  ]);

  // Helper functions
  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-error';
  };

  const getSentimentBg = (score: number) => {
    if (score >= 70) return 'bg-success/10';
    if (score >= 40) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  // Calculate source sentiment data from aggregate
  const sourceSentimentData: SentimentData[] = aggregateSentiment
    ? [
        {
          score: aggregateSentiment.overallScore * 0.72, // Approximate news score
          trend: aggregateSentiment.trend,
          source: 'News Sentiment',
          change: 0,
        },
        {
          score: 50, // Analyst not available
          trend: 'neutral' as const,
          source: 'Analyst Reports',
          change: 0,
        },
        {
          score: aggregateSentiment.overallScore * 0.78, // Approximate Reddit score
          trend: aggregateSentiment.trend,
          source: 'Reddit Discussion',
          change: 0,
        },
        {
          score: aggregateSentiment.overallScore * 0.65, // Approximate Twitter score
          trend: aggregateSentiment.trend,
          source: 'Twitter Sentiment',
          change: 0,
        },
      ]
    : [
        { score: 50, trend: 'neutral' as const, source: 'News Sentiment', change: 0 },
        { score: 50, trend: 'neutral' as const, source: 'Analyst Reports', change: 0 },
        { score: 50, trend: 'neutral' as const, source: 'Reddit Discussion', change: 0 },
        { score: 50, trend: 'neutral' as const, source: 'Twitter Sentiment', change: 0 },
      ];

  const overallScore = aggregateSentiment?.overallScore ?? 50;
  const overallLabel = aggregateSentiment?.overallLabel ?? 'neutral';
  const overallTrend = aggregateSentiment?.trend ?? 'neutral';

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Service Status Banner */}
      <Card className={`p-4 ${serviceStatus.available ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${serviceStatus.available ? 'bg-success' : 'bg-warning'}`}></div>
          <div>
            <h3 className={`font-medium ${serviceStatus.available ? 'text-success' : 'text-warning'}`}>
              Sentiment Analysis Service
            </h3>
            <p className="text-sm text-text-muted">{serviceStatus.message}</p>
            <p className="text-xs text-text-muted mt-1">
              Status: {serviceStatus.available ? 'Connected' : 'Unavailable'} • 
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Overall Sentiment Score */}
      <Card>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Overall Market Sentiment</h2>
          {aggregateLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tesla-red"></div>
            </div>
          ) : aggregateError ? (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error mb-2">{aggregateError}</p>
              <button
                onClick={loadAggregateSentiment}
                className="text-xs px-3 py-1 bg-error text-white rounded hover:bg-error/80"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-24 h-24 rounded-full ${getSentimentBg(overallScore)} flex items-center justify-center`}>
                <span className={`text-3xl font-bold ${getSentimentColor(overallScore)}`}>{overallScore}</span>
              </div>
              <div className="text-left">
                <p className="text-sm text-text-muted">Sentiment Score</p>
                <p className="text-lg font-semibold text-foreground capitalize">{overallLabel}</p>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(overallTrend)}
                  <span className="text-sm text-text-muted">Trend: {overallTrend}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Sentiment Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Twitter Sentiment */}
        <DropdownSentimentCard 
          data={sourceSentimentData[3]}
          loading={twitterLoading}
          error={twitterError}
          onRetry={() => {
            if (twitterPosts.length === 0) {
              loadTwitterPosts();
            }
          }}
        >
          <div className="space-y-3">
            {twitterPosts.length === 0 && !twitterLoading && !twitterError && (
              <p className="text-sm text-text-muted text-center py-4">No Twitter posts available. Click to load.</p>
            )}
            {twitterPosts.map((tweet, idx) => (
              <div 
                key={tweet.id || idx} 
                className={`p-3 bg-card border border-border rounded-lg ${
                  tweet.url ? 'hover:border-tesla-red/50 hover:shadow-md transition-all cursor-pointer' : ''
                }`}
                onClick={tweet.url ? () => window.open(tweet.url, '_blank', 'noopener,noreferrer') : undefined}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    tweet.sentiment.label === 'positive' ? 'bg-success' : 
                    tweet.sentiment.label === 'negative' ? 'bg-error' : 'bg-warning'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-foreground flex-1">{tweet.content}</p>
                      {tweet.url && (
                        <svg className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center space-x-4">
                        <span>{tweet.author}</span>
                        <span>{formatRelativeTime(tweet.publishedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span>{tweet.engagement.likes} likes</span>
                        <span>{tweet.engagement.shares} RT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DropdownSentimentCard>

        {/* Reddit Discussion */}
        <DropdownSentimentCard 
          data={sourceSentimentData[2]}
          loading={redditLoading}
          error={redditError}
          onRetry={() => {
            if (redditPosts.length === 0) {
              loadRedditPosts();
            }
          }}
        >
          <div className="space-y-3">
            {redditPosts.length === 0 && !redditLoading && !redditError && (
              <p className="text-sm text-text-muted text-center py-4">No Reddit posts available. Click to load.</p>
            )}
            {redditPosts.map((post, idx) => (
              <div 
                key={post.id || idx} 
                className={`p-3 bg-card border border-border rounded-lg ${
                  post.url ? 'hover:border-tesla-red/50 hover:shadow-md transition-all cursor-pointer' : ''
                }`}
                onClick={post.url ? () => window.open(post.url, '_blank', 'noopener,noreferrer') : undefined}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    post.sentiment.label === 'positive' ? 'bg-success' : 
                    post.sentiment.label === 'negative' ? 'bg-error' : 'bg-warning'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm text-foreground font-medium flex-1">{post.title || post.content.substring(0, 100)}</p>
                      {post.url && (
                        <svg className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center space-x-4">
                        {post.subreddit && <span>{post.subreddit}</span>}
                        <span>{post.author}</span>
                        <span>{formatRelativeTime(post.publishedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span>{post.engagement.likes} ↑</span>
                        <span>{post.engagement.comments} 💬</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DropdownSentimentCard>

        {/* News Sentiment */}
        <DropdownSentimentCard 
          data={sourceSentimentData[0]}
          loading={newsLoading}
          error={newsError}
          onRetry={() => {
            if (newsArticles.length === 0) {
              loadNewsArticles();
            }
          }}
        >
          <div className="space-y-3">
            {newsArticles.length === 0 && !newsLoading && !newsError && (
              <p className="text-sm text-text-muted text-center py-4">No news articles available. Click to load.</p>
            )}
            {newsArticles.map((article, idx) => (
              <div 
                key={article.id || idx} 
                className={`p-3 bg-card border border-border rounded-lg ${
                  article.url ? 'hover:border-tesla-red/50 hover:shadow-md transition-all cursor-pointer' : ''
                }`}
                onClick={article.url ? () => window.open(article.url, '_blank', 'noopener,noreferrer') : undefined}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    article.sentiment.label === 'positive' ? 'bg-success' : 
                    article.sentiment.label === 'negative' ? 'bg-error' : 'bg-warning'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm text-foreground font-medium flex-1">{article.headline}</p>
                      {article.url && (
                        <svg className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center space-x-4">
                        <span>{article.source}</span>
                        <span>{formatRelativeTime(article.publishedAt)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        article.impact === 'high' ? 'bg-tesla-red/20 text-tesla-red' :
                        article.impact === 'medium' ? 'bg-warning/20 text-warning' :
                        'bg-text-muted/20 text-text-muted'
                      }`}>
                        {article.impact} impact
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DropdownSentimentCard>

        {/* Analyst Reports */}
        <DropdownSentimentCard data={sourceSentimentData[1]}>
          <div className="p-4 bg-card border border-border rounded-lg text-center">
            <p className="text-sm text-text-muted">
              Analyst data is not available from backend.<br />
              This feature requires external analyst data sources.
            </p>
          </div>
        </DropdownSentimentCard>
      </div>

      {/* Top Influencer Tracker */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Top Influencer Tracker</h3>
          {influencerLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tesla-red"></div>
          )}
        </div>
        
        {influencerError ? (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-center">
            <p className="text-sm text-error mb-2">{influencerError}</p>
            <button
              onClick={loadInfluencers}
              className="text-xs px-3 py-1 bg-error text-white rounded hover:bg-error/80"
            >
              Retry
            </button>
          </div>
        ) : influencers.length === 0 && !influencerLoading ? (
          <div className="p-4 bg-card border border-border rounded-lg text-center">
            <p className="text-sm text-text-muted">
              No influencer data available.<br />
              Backend should collect influencer news with source format: <code className="text-xs bg-card px-1 py-0.5 rounded">influencer:name_slug</code>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {influencers.map((influencer) => {
              const isExpanded = expandedInfluencer === influencer.slug;
              const sentimentColor = influencer.stats.avgSentiment >= 70 ? 'text-success' :
                                    influencer.stats.avgSentiment >= 40 ? 'text-warning' : 'text-error';
              const sentimentBg = influencer.stats.avgSentiment >= 70 ? 'bg-success/10' :
                                 influencer.stats.avgSentiment >= 40 ? 'bg-warning/10' : 'bg-error/10';

              return (
                <div
                  key={influencer.slug}
                  className="border border-border rounded-lg p-4 hover:border-tesla-red/50 transition-all"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedInfluencer(isExpanded ? null : influencer.slug)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${sentimentBg.replace('/10', '')}`}></div>
                        <h4 className="font-semibold text-foreground">{influencer.name}</h4>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-bold ${sentimentColor}`}>
                              {influencer.stats.avgSentiment}
                            </span>
                            <span className="text-xs text-text-muted">sentiment</span>
                          </div>
                          <div className="text-xs text-text-muted">
                            {influencer.stats.articleCount} articles
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-text-muted">Confidence</span>
                        <div className="font-medium">{influencer.stats.avgConfidence}%</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Impact Score</span>
                        <div className="font-medium">{influencer.stats.totalImpact}</div>
                      </div>
                      <div>
                        <span className="text-text-muted">Latest Activity</span>
                        <div className="font-medium text-xs">
                          {influencer.latestArticleDate
                            ? formatRelativeTime(influencer.latestArticleDate)
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Sentiment bar */}
                    <div className="mt-3">
                      <div className="w-full bg-border rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${sentimentBg.replace('/10', '')}`}
                          style={{ width: `${influencer.stats.avgSentiment}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded articles list */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h5 className="text-sm font-semibold mb-3 text-foreground">Recent Articles</h5>
                      {influencer.recentArticles.length === 0 ? (
                        <p className="text-sm text-text-muted text-center py-2">No recent articles available</p>
                      ) : (
                        <div className="space-y-2">
                          {influencer.recentArticles.map((article, idx) => (
                            <div
                              key={article.id || idx}
                              className={`p-3 bg-card border border-border rounded-lg ${
                                article.url ? 'hover:border-tesla-red/50 hover:shadow-md transition-all cursor-pointer' : ''
                              }`}
                              onClick={article.url ? () => window.open(article.url, '_blank', 'noopener,noreferrer') : undefined}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  article.sentiment.label === 'positive' ? 'bg-success' :
                                  article.sentiment.label === 'negative' ? 'bg-error' : 'bg-warning'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm text-foreground font-medium flex-1">{article.headline}</p>
                                    {article.url && (
                                      <svg className="w-4 h-4 text-text-muted ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-text-muted mt-1">
                                    <span>{formatRelativeTime(article.publishedAt)}</span>
                                    <span className={`px-2 py-0.5 rounded ${
                                      article.impact === 'high' ? 'bg-tesla-red/20 text-tesla-red' :
                                      article.impact === 'medium' ? 'bg-warning/20 text-warning' :
                                      'bg-text-muted/20 text-text-muted'
                                    }`}>
                                      {article.impact} impact
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Sentiment Timeline */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Sentiment Trend (7 Days)</h3>
        {timelineLoading ? (
          <div className="h-32 bg-card border border-border rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tesla-red"></div>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="h-32 bg-card border border-border rounded-lg flex items-center justify-center">
            <p className="text-text-muted">No trend data available</p>
          </div>
        ) : (
          <div className="h-32 bg-card border border-border rounded-lg flex items-center justify-center">
            <p className="text-text-muted">Timeline chart visualization coming soon</p>
            {/* TODO: Add chart library integration */}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-text-muted">
            Data from Supabase sentiment tables • Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </Card>
    </div>
  );
};
