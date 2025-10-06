import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface TechnicalIndicator {
  name: string;
  value: string;
  signal: 'buy' | 'sell' | 'neutral';
  description: string;
}

const mockIndicators: TechnicalIndicator[] = [
  { name: 'RSI (14)', value: '45.2', signal: 'neutral', description: 'Not overbought or oversold' },
  { name: 'MACD', value: '2.34', signal: 'buy', description: 'Bullish crossover detected' },
  { name: 'Moving Average (50)', value: '$248.50', signal: 'buy', description: 'Price above 50-day MA' },
  { name: 'Moving Average (200)', value: '$235.20', signal: 'buy', description: 'Price above 200-day MA' },
  { name: 'Bollinger Bands', value: '$245-265', signal: 'neutral', description: 'Price within bands' },
  { name: 'Volume', value: '12.5M', signal: 'buy', description: 'Above average volume' }
];

export const TechnicalAnalysisTab: React.FC = () => {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy':
        return 'text-success bg-success/10';
      case 'sell':
        return 'text-error bg-error/10';
      default:
        return 'text-warning bg-warning/10';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'sell':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Chart */}
      <Card className="h-96">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tesla (TSLA)</h2>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-success">$252.45</span>
              <span className="text-success font-medium">+$3.20 (+1.28%)</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
              <Button
                key={period}
                variant={period === '1M' ? 'primary' : 'outline'}
                size="sm"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
        <div className="h-64 bg-card border border-border rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-muted mb-2">Interactive Price Chart</p>
            <p className="text-sm text-text-muted">Candlestick chart with technical indicators will be displayed here</p>
          </div>
        </div>
      </Card>

      {/* Technical Indicators */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockIndicators.map((indicator, index) => (
            <div key={index} className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">{indicator.name}</h4>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getSignalColor(indicator.signal)}`}>
                  {getSignalIcon(indicator.signal)}
                  <span className="capitalize">{indicator.signal}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{indicator.value}</p>
              <p className="text-sm text-text-muted">{indicator.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Trading Signals */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Trading Signals</h3>
        <div className="space-y-3">
          {[
            { signal: 'BUY', strength: 'Strong', description: 'MACD bullish crossover with increasing volume', confidence: 85 },
            { signal: 'BUY', strength: 'Moderate', description: 'Price breaking above resistance at $250', confidence: 72 },
            { signal: 'HOLD', strength: 'Weak', description: 'RSI approaching overbought territory', confidence: 45 }
          ].map((signal, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  signal.signal === 'BUY' ? 'bg-success' : 
                  signal.signal === 'SELL' ? 'bg-error' : 
                  'bg-warning'
                }`}>
                  {signal.signal}
                </div>
                <div>
                  <p className="font-medium text-foreground">{signal.description}</p>
                  <p className="text-sm text-text-muted">Strength: {signal.strength}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{signal.confidence}% confidence</p>
                <div className="w-20 bg-border rounded-full h-2 mt-1">
                  <div
                    className="h-2 rounded-full bg-tesla-red"
                    style={{ width: `${signal.confidence}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Support & Resistance Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Support Levels</h3>
          <div className="space-y-2">
            {[
              { level: '$245.00', strength: 'Strong', distance: '-$7.45' },
              { level: '$240.00', strength: 'Moderate', distance: '-$12.45' },
              { level: '$235.00', strength: 'Strong', distance: '-$17.45' }
            ].map((support, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-card border border-border rounded">
                <div>
                  <p className="font-medium text-foreground">{support.level}</p>
                  <p className="text-sm text-text-muted">{support.strength}</p>
                </div>
                <span className="text-sm text-text-muted">{support.distance}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Resistance Levels</h3>
          <div className="space-y-2">
            {[
              { level: '$260.00', strength: 'Moderate', distance: '+$7.55' },
              { level: '$265.00', strength: 'Strong', distance: '+$12.55' },
              { level: '$275.00', strength: 'Strong', distance: '+$22.55' }
            ].map((resistance, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-card border border-border rounded">
                <div>
                  <p className="font-medium text-foreground">{resistance.level}</p>
                  <p className="text-sm text-text-muted">{resistance.strength}</p>
                </div>
                <span className="text-sm text-text-muted">{resistance.distance}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Data Source Footer */}
      <Card className="bg-card/50">
        <p className="text-xs text-text-muted">
          Prices: Provider X • Indicators computed locally • Last updated: {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
        </p>
      </Card>
    </div>
  );
};
