import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

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

export const PortfolioTab: React.FC = () => {
  const totalValue = mockHoldings.reduce((sum, holding) => sum + holding.value, 0);
  const totalGainLoss = mockHoldings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Portfolio Overview */}
      <Card className="p-4 md:p-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Portfolio Overview</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div>
              <p className="text-xs md:text-sm text-text-muted">Total Value</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-text-muted">Today&apos;s Change</p>
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <span className={`text-xl md:text-2xl font-bold ${totalGainLoss >= 0 ? 'text-success' : 'text-error'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
                </span>
                <span className={`text-sm md:text-lg font-medium ${totalGainLoss >= 0 ? 'text-success' : 'text-error'}`}>
                  ({totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-text-muted mb-1">1 Day Performance</p>
            <p className="text-2xl font-bold text-success">+$1,247</p>
            <p className="text-sm text-success">+2.45%</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-text-muted mb-1">1 Week Performance</p>
            <p className="text-2xl font-bold text-success">+$3,892</p>
            <p className="text-sm text-success">+8.12%</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-text-muted mb-1">1 Month Performance</p>
            <p className="text-2xl font-bold text-error">-$2,156</p>
            <p className="text-sm text-error">-4.23%</p>
          </div>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Holdings</h3>
          <Button variant="outline" size="sm">
            Add Position
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
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
              {mockHoldings.map((holding, index) => (
                <tr key={index} className="border-b border-border hover:bg-card/50">
                  <td className="py-3 px-4">
                    <span className="font-bold text-foreground">{holding.symbol}</span>
                  </td>
                  <td className="py-3 px-4 text-foreground">{holding.name}</td>
                  <td className="py-3 px-4 text-right text-foreground">{holding.shares}</td>
                  <td className="py-3 px-4 text-right text-foreground">${holding.avgPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-foreground">${holding.currentPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-foreground">${holding.value.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
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
      </Card>

      {/* Asset Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
          <div className="space-y-3">
            {[
              { name: 'Tesla Inc.', percentage: 54.5, value: '$25,245', color: 'bg-tesla-red' },
              { name: 'Apple Inc.', percentage: 19.7, value: '$9,115', color: 'bg-tesla-blue' },
              { name: 'NVIDIA Corp.', percentage: 25.8, value: '$11,955', color: 'bg-success' }
            ].map((asset, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${asset.color}`}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{asset.name}</p>
                    <p className="text-xs text-text-muted">{asset.value}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{asset.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
          <div className="h-48 bg-card border border-border rounded-lg flex items-center justify-center">
            <p className="text-text-muted">Portfolio performance chart will be displayed here</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Buy', symbol: 'TSLA', shares: 50, price: '$248.50', time: '2 hours ago' },
            { action: 'Sell', symbol: 'AAPL', shares: 25, price: '$180.20', time: '1 day ago' },
            { action: 'Buy', symbol: 'NVDA', shares: 10, price: '$475.80', time: '3 days ago' },
            { action: 'Dividend', symbol: 'AAPL', shares: 0, price: '$0.25', time: '1 week ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  activity.action === 'Buy' ? 'bg-success' :
                  activity.action === 'Sell' ? 'bg-error' :
                  'bg-tesla-blue'
                }`}>
                  {activity.action.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {activity.action} {activity.shares > 0 ? `${activity.shares} shares` : ''} {activity.symbol}
                  </p>
                  <p className="text-sm text-text-muted">{activity.time}</p>
                </div>
              </div>
              <span className="text-foreground font-medium">{activity.price}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
