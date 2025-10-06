import React from 'react';
import { Card } from '../../ui/Card';

interface SentimentData {
  score: number;
  trend: 'up' | 'down' | 'neutral';
  source: string;
  change: number;
}

const mockSentimentData: SentimentData[] = [
  { score: 72, trend: 'up', source: 'News Sentiment', change: 5.2 },
  { score: 68, trend: 'up', source: 'Social Media', change: 3.1 },
  { score: 45, trend: 'down', source: 'Analyst Reports', change: -2.8 },
  { score: 78, trend: 'up', source: 'Reddit Discussion', change: 8.4 },
  { score: 65, trend: 'neutral', source: 'Twitter Sentiment', change: 0.3 }
];

export const SentimentTab: React.FC = () => {
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
    <div className="space-y-6">
      {/* Overall Sentiment Score */}
      <Card>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Overall Market Sentiment</h2>
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-24 h-24 rounded-full ${getSentimentBg(67)} flex items-center justify-center`}>
              <span className={`text-3xl font-bold ${getSentimentColor(67)}`}>67</span>
            </div>
            <div className="text-left">
              <p className="text-sm text-text-muted">Sentiment Score</p>
              <p className="text-lg font-semibold text-foreground">Moderately Positive</p>
              <div className="flex items-center space-x-1">
                {getTrendIcon('up')}
                <span className="text-sm text-success">+2.4% from yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Sentiment Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockSentimentData.map((data, index) => (
          <Card key={index}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{data.source}</h3>
              {getTrendIcon(data.trend)}
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
          </Card>
        ))}
      </div>

      {/* Recent News Sentiment */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent News Impact</h3>
        <div className="space-y-3">
          {[
            { headline: 'Tesla Q4 deliveries exceed expectations', sentiment: 'positive', impact: 'high' },
            { headline: 'New Gigafactory expansion announced', sentiment: 'positive', impact: 'medium' },
            { headline: 'Competition concerns in EV market', sentiment: 'negative', impact: 'low' },
            { headline: 'Autopilot software update released', sentiment: 'positive', impact: 'medium' }
          ].map((news, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">{news.headline}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    news.sentiment === 'positive' ? 'bg-success/20 text-success' : 
                    news.sentiment === 'negative' ? 'bg-error/20 text-error' : 
                    'bg-warning/20 text-warning'
                  }`}>
                    {news.sentiment}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    news.impact === 'high' ? 'bg-tesla-red/20 text-tesla-red' :
                    news.impact === 'medium' ? 'bg-warning/20 text-warning' :
                    'bg-text-muted/20 text-text-muted'
                  }`}>
                    {news.impact} impact
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sentiment Timeline */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Sentiment Trend (7 Days)</h3>
        <div className="h-32 bg-card border border-border rounded-lg flex items-center justify-center">
          <p className="text-text-muted">Sentiment chart will be displayed here</p>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-text-muted">Source: Reddit API, last 24h • Last updated: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}</p>
        </div>
      </Card>
    </div>
  );
};
