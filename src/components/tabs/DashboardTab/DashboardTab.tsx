'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface PerformanceData {
  period: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  sparkline?: number[];
}

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
}

// Mock data
const mockPerformance: PerformanceData[] = [
  { period: '1-Day', value: '+$1,247', change: '+$1,247', changePercent: '+2.45%', isPositive: true, sparkline: [100, 102, 101, 103, 102, 104, 105] },
  { period: '1-Week', value: '+$3,892', change: '+$3,892', changePercent: '+8.12%', isPositive: true, sparkline: [100, 98, 102, 105, 107, 108, 109] },
  { period: '1-Month', value: '-$2,156', change: '-$2,156', changePercent: '-4.23%', isPositive: false, sparkline: [100, 102, 98, 95, 97, 94, 96] }
];

const mockHoldings: Holding[] = [
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    shares: 100,
    avgPrice: 245.50,
    currentPrice: 252.45,
    value: 25245,
    gainLoss: 695,
    gainLossPercent: 2.83
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 50,
    avgPrice: 175.20,
    currentPrice: 182.30,
    value: 9115,
    gainLoss: 355,
    gainLossPercent: 4.05
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    shares: 25,
    avgPrice: 485.60,
    currentPrice: 478.20,
    value: 11955,
    gainLoss: -185,
    gainLossPercent: -1.52
  }
];

// Interactive Chip Component
const InteractiveChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}> = ({ label, active, onClick, ariaLabel }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200
      ${active 
        ? 'bg-tesla-red text-white' 
        : 'bg-card border border-border text-foreground hover:bg-card/80'
      }
    `}
    aria-label={ariaLabel}
    role="button"
  >
    {label}
  </button>
);

// Sparkline Component
const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data || data.length < 2) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className="text-tesla-blue"
      />
    </svg>
  );
};

export const DashboardTab: React.FC = () => {
  const [totalValue, setTotalValue] = useState(46315);
  const [todayChange, setTodayChange] = useState(1247);
  const [todayChangePercent, setTodayChangePercent] = useState(2.45);
  const [isValueVisible, setIsValueVisible] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeChips, setActiveChips] = useState({
    compareSPY: false,
    weeklyTrend: false
  });
  const [tableDensity, setTableDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  // Update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleChip = (chipName: keyof typeof activeChips) => {
    setActiveChips(prev => ({
      ...prev,
      [chipName]: !prev[chipName]
    }));
  };

  const filteredHoldings = mockHoldings.filter(holding => {
    if (filter === 'gainers') return holding.gainLoss >= 0;
    if (filter === 'losers') return holding.gainLoss < 0;
    return true;
  });

  const densityClasses = tableDensity === 'compact' 
    ? 'py-2' 
    : 'py-3';

  return (
    <div className="space-y-6">
      {/* Hero Card - Portfolio Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Portfolio Overview</h2>
          <button
            onClick={() => setIsValueVisible(!isValueVisible)}
            className="p-2 text-text-muted hover:text-foreground transition-colors"
            aria-label={isValueVisible ? 'Hide portfolio value' : 'Show portfolio value'}
          >
            {isValueVisible ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-text-muted mb-1">Total Value</p>
            <p className="text-4xl font-bold text-foreground" aria-label={`Total portfolio value, ${isValueVisible ? `$${totalValue.toLocaleString()}` : 'hidden'}`}>
              {isValueVisible ? `$${totalValue.toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">Today's Change</p>
            <div className="flex items-baseline space-x-2">
              <p className={`text-3xl font-bold ${todayChange >= 0 ? 'text-success' : 'text-error'}`} aria-label={`Today's change, ${todayChange >= 0 ? 'plus' : 'minus'} ${Math.abs(todayChangePercent)} percent`}>
                {todayChange >= 0 ? '+' : ''}${Math.abs(todayChange).toLocaleString()}
              </p>
              <p className={`text-xl font-semibold ${todayChange >= 0 ? 'text-success' : 'text-error'}`}>
                ({todayChange >= 0 ? '+' : ''}{Math.abs(todayChangePercent)}%)
              </p>
            </div>
          </div>
          <div className="flex items-end justify-end">
            <p className="text-sm text-text-muted">
              Last updated {lastUpdated.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Interactive Chips */}
      <div className="flex flex-wrap gap-2">
        <InteractiveChip
          label="Compare vs SPY"
          active={activeChips.compareSPY}
          onClick={() => toggleChip('compareSPY')}
          ariaLabel="Toggle benchmark comparison with SPY"
        />
        <InteractiveChip
          label="Show Weekly Trend"
          active={activeChips.weeklyTrend}
          onClick={() => toggleChip('weeklyTrend')}
          ariaLabel="Toggle weekly trend sparklines"
        />
      </div>

      {/* Performance Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockPerformance.map((perf, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-muted">{perf.period}</p>
              <span className="text-xs text-text-muted">Performance includes price return only</span>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{perf.value}</p>
              <p className={`text-lg font-semibold ${perf.isPositive ? 'text-success' : 'text-error'}`}>
                {perf.changePercent}
              </p>
              {activeChips.weeklyTrend && perf.sparkline && (
                <div className="mt-2">
                  <Sparkline data={perf.sparkline} />
                </div>
              )}
              {activeChips.compareSPY && (
                <p className="text-xs text-text-muted mt-1">Benchmark: SPY (price return)</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Market Snapshot */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Market Snapshot</h3>
            <div className="flex items-center space-x-4 mt-2">
              <div>
                <p className="text-sm text-text-muted">SPY</p>
                <p className="text-lg font-semibold text-foreground">$485.23</p>
                <p className="text-sm text-success">+0.87%</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">QQQ</p>
                <p className="text-lg font-semibold text-foreground">$412.45</p>
                <p className="text-sm text-success">+1.23%</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">Latest News</p>
            <p className="text-sm text-foreground max-w-xs">Tesla Q4 deliveries exceed expectations, stock rises 3%</p>
            <button className="text-xs text-tesla-blue hover:underline mt-1">View all</button>
          </div>
        </div>
      </Card>

      {/* Holdings Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Holdings</h3>
          <div className="flex items-center space-x-4">
            {/* Quick Filters */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'gainers', label: 'Gainers' },
                { key: 'losers', label: 'Losers' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as typeof filter)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-tesla-red text-white'
                      : 'bg-card border border-border text-foreground hover:bg-card/80'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            
            {/* Density Control */}
            <div className="flex border border-border rounded">
              <button
                onClick={() => setTableDensity('compact')}
                className={`px-2 py-1 text-xs ${tableDensity === 'compact' ? 'bg-tesla-red text-white' : 'text-text-muted hover:text-foreground'}`}
              >
                Compact
              </button>
              <button
                onClick={() => setTableDensity('comfortable')}
                className={`px-2 py-1 text-xs ${tableDensity === 'comfortable' ? 'bg-tesla-red text-white' : 'text-text-muted hover:text-foreground'}`}
              >
                Comfortable
              </button>
            </div>
            
            <Button variant="outline" size="sm">
              Add Position
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Symbol</th>
                <th className="text-left py-3 px-4 font-medium text-text-muted">Name</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">Shares</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">Avg Price</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">Current Price</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">Value</th>
                <th className="text-right py-3 px-4 font-medium text-text-muted">Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.map((holding, index) => (
                <tr key={index} className="border-b border-border hover:bg-card/50">
                  <td className={`py-3 px-4 ${densityClasses}`}>
                    <span className="font-bold text-foreground">{holding.symbol}</span>
                  </td>
                  <td className={`py-3 px-4 text-foreground ${densityClasses}`}>{holding.name}</td>
                  <td className={`py-3 px-4 text-right text-foreground ${densityClasses}`}>{holding.shares}</td>
                  <td className={`py-3 px-4 text-right text-foreground ${densityClasses}`}>${holding.avgPrice.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right text-foreground ${densityClasses}`}>${holding.currentPrice.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right text-foreground ${densityClasses}`}>
                    {isValueVisible ? `$${holding.value.toLocaleString()}` : '••••••'}
                  </td>
                  <td className={`py-3 px-4 text-right ${densityClasses}`}>
                    <div className="text-right">
                      <p className={`font-medium ${holding.gainLoss >= 0 ? 'text-success' : 'text-error'}`}>
                        {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)}
                      </p>
                      <p className={`text-sm ${holding.gainLoss >= 0 ? 'text-success' : 'text-error'}`}>
                        {holding.gainLoss >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-text-muted">Change vs previous close</p>
        </div>
      </Card>
    </div>
  );
};
