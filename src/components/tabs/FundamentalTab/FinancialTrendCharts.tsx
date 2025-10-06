/**
 * Financial Trend Charts Component
 * Visualizes financial trends over time using simple bar/line chart visualizations
 * Uses CSS-based visualization (no external chart library required)
 */

'use client';

import React from 'react';
import { Card } from '../../ui/Card';
import { FinancialTrendData } from '../../../types/fundamentalAnalysis';
import { formatCurrency, formatPercentage } from '../../../utils/fundamentalDataTransformer';

interface FinancialTrendChartsProps {
  trendData: FinancialTrendData;
  onAskAI?: (context: string) => void;
}

export const FinancialTrendCharts: React.FC<FinancialTrendChartsProps> = ({
  trendData,
  onAskAI,
}) => {
  // Helper function to get max value from data array
  const getMaxValue = (data: typeof trendData.revenue): number => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => Math.abs(d.value))) * 1.1; // Add 10% padding
  };

  // Helper function to format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Render a simple bar chart
  const renderBarChart = (
    title: string,
    data: typeof trendData.revenue,
    format: 'currency' | 'percentage',
    color: string = 'bg-tesla-red'
  ) => {
    if (data.length === 0) return null;

    const maxValue = getMaxValue(data);
    const isPositive = data[0]?.value >= 0;

    return (
      <div className="p-4 bg-card border border-border rounded-lg">
        <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
        <div className="flex items-end space-x-2 h-48">
          {data.slice(0, 8).reverse().map((point, index) => {
            const height = maxValue > 0 ? (Math.abs(point.value) / maxValue) * 100 : 0;
            const valueColor = isPositive ? color : 'bg-error';
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-40 mb-2">
                  <div
                    className={`w-full ${valueColor} rounded-t transition-all hover:opacity-80 relative group`}
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {format === 'currency' 
                          ? formatCurrency(point.value)
                          : formatPercentage(point.value)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-text-muted text-center transform -rotate-45 origin-bottom-left whitespace-nowrap">
                  {formatDate(point.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const charts = [
    {
      title: 'Revenue Trend',
      data: trendData.revenue,
      format: 'currency' as const,
      color: 'bg-tesla-red',
    },
    {
      title: 'Net Income Trend',
      data: trendData.netIncome,
      format: 'currency' as const,
      color: trendData.netIncome[0]?.value >= 0 ? 'bg-success' : 'bg-error',
    },
    {
      title: 'Operating Income Trend',
      data: trendData.operatingIncome,
      format: 'currency' as const,
      color: trendData.operatingIncome[0]?.value >= 0 ? 'bg-tesla-blue' : 'bg-error',
    },
    {
      title: 'Free Cash Flow Trend',
      data: trendData.freeCashFlow,
      format: 'currency' as const,
      color: trendData.freeCashFlow[0]?.value >= 0 ? 'bg-success' : 'bg-error',
    },
    {
      title: 'Gross Margin Trend',
      data: trendData.grossMargin,
      format: 'percentage' as const,
      color: 'bg-tesla-red',
    },
    {
      title: 'Operating Margin Trend',
      data: trendData.operatingMargin,
      format: 'percentage' as const,
      color: 'bg-tesla-blue',
    },
    {
      title: 'Net Margin Trend',
      data: trendData.netMargin,
      format: 'percentage' as const,
      color: trendData.netMargin[0]?.value >= 0 ? 'bg-success' : 'bg-error',
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Financial Trends</h2>
          <p className="text-sm text-text-muted mt-1">
            Visual trend analysis of key financial metrics over time
          </p>
        </div>
        {onAskAI && (
          <button
            onClick={() => onAskAI('Analyze Tesla financial trends including revenue, profitability, and cash flow trends.')}
            className="px-4 py-2 bg-tesla-red text-white rounded-md hover:bg-tesla-red/80 transition-colors text-sm"
          >
            Ask AI about Trends
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, index) => (
          <React.Fragment key={index}>
            {chart.data.length > 0 && renderBarChart(
              chart.title,
              chart.data,
              chart.format,
              chart.color
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

