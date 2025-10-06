/**
 * Tesla-Specific Metrics Component
 * Displays automotive industry-specific metrics derived from financial data
 * Note: Vehicle delivery and production data not available from Alpha Vantage
 */

'use client';

import React from 'react';
import { Card } from '../../ui/Card';
import { TeslaSpecificMetrics } from '../../../types/fundamentalAnalysis';
import { formatCurrency, formatPercentage, formatNumber } from '../../../utils/fundamentalDataTransformer';

interface TeslaMetricsProps {
  metrics: TeslaSpecificMetrics;
  onAskAI?: (context: string) => void;
}

export const TeslaMetrics: React.FC<TeslaMetricsProps> = ({
  metrics,
  onAskAI,
}) => {
  const formatValue = (value: number | null, format: 'currency' | 'percentage' | 'number'): string => {
    if (value === null) return 'N/A';
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return formatNumber(value, 2);
    }
  };

  const getTrendIndicator = (trend: 'increasing' | 'decreasing' | 'stable' | null) => {
    if (!trend) return { icon: '—', color: 'text-text-muted', label: 'N/A' };
    
    switch (trend) {
      case 'increasing':
        return { icon: '📈', color: 'text-success', label: 'Increasing' };
      case 'decreasing':
        return { icon: '📉', color: 'text-error', label: 'Decreasing' };
      case 'stable':
        return { icon: '➡️', color: 'text-text-muted', label: 'Stable' };
      default:
        return { icon: '—', color: 'text-text-muted', label: 'N/A' };
    }
  };

  const renderMetricCard = (
    label: string,
    value: number | null,
    format: 'currency' | 'percentage' | 'number',
    subtitle?: string,
    trend?: 'increasing' | 'decreasing' | 'stable' | null
  ) => {
    const trendInfo = trend ? getTrendIndicator(trend) : null;
    
    return (
      <div className="p-4 bg-card border border-border rounded-lg hover:border-tesla-red/50 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="text-xs text-text-muted mb-1">{label}</div>
            {subtitle && (
              <div className="text-xs text-text-muted mb-2">{subtitle}</div>
            )}
            <div className="text-lg font-semibold text-foreground">
              {formatValue(value, format)}
            </div>
          </div>
          {trendInfo && (
            <div className={`flex items-center space-x-1 ${trendInfo.color}`}>
              <span>{trendInfo.icon}</span>
              <span className="text-xs">{trendInfo.label}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const metricsData = [
    {
      title: 'Per Share Metrics',
      metrics: [
        {
          label: 'Revenue Per Share',
          value: metrics.revenuePerShare,
          format: 'currency' as const,
          subtitle: 'Total Revenue / Shares Outstanding',
        },
        {
          label: 'Free Cash Flow Per Share',
          value: metrics.freeCashFlowPerShare,
          format: 'currency' as const,
          subtitle: 'Free Cash Flow / Shares Outstanding',
        },
      ],
    },
    {
      title: 'Investment & Growth',
      metrics: [
        {
          label: 'Capital Expenditures as % of Revenue',
          value: metrics.capexAsPercentOfRevenue,
          format: 'percentage' as const,
          subtitle: 'CapEx / Revenue',
        },
        {
          label: 'R&D as % of Revenue',
          value: metrics.rdAsPercentOfRevenue,
          format: 'percentage' as const,
          subtitle: 'Research & Development / Revenue',
        },
        {
          label: 'Revenue Growth Trend',
          value: null,
          format: 'number' as const,
          subtitle: 'Based on annual revenue comparison',
          trend: metrics.revenueGrowthTrend,
        },
        {
          label: 'Margin Expansion',
          value: metrics.marginExpansion,
          format: 'percentage' as const,
          subtitle: 'Net margin change YoY',
        },
      ],
    },
    {
      title: 'Capital Efficiency',
      metrics: [
        {
          label: 'Asset Turnover Ratio',
          value: metrics.assetTurnoverRatio,
          format: 'number' as const,
          subtitle: 'Revenue / Total Assets',
        },
        {
          label: 'Capital Efficiency',
          value: metrics.capitalEfficiency,
          format: 'number' as const,
          subtitle: 'Revenue growth / Asset growth',
        },
        {
          label: 'Operating Leverage',
          value: metrics.operatingLeverage,
          format: 'number' as const,
          subtitle: 'Margin expansion indicator',
        },
      ],
    },
    {
      title: 'Working Capital',
      metrics: [
        {
          label: 'Working Capital',
          value: metrics.workingCapital,
          format: 'currency' as const,
          subtitle: 'Current Assets - Current Liabilities',
        },
        {
          label: 'Working Capital Ratio',
          value: metrics.workingCapitalRatio,
          format: 'number' as const,
          subtitle: 'Current Assets / Current Liabilities',
        },
        {
          label: 'Days Inventory',
          value: metrics.inventoryDays,
          format: 'number' as const,
          subtitle: 'Days to sell inventory',
        },
        {
          label: 'Days Receivables',
          value: metrics.receivablesDays,
          format: 'number' as const,
          subtitle: 'Days to collect receivables',
        },
      ],
    },
    {
      title: 'Cash Position',
      metrics: [
        {
          label: 'Cash to Market Cap',
          value: metrics.cashToMarketCap,
          format: 'percentage' as const,
          subtitle: 'Cash / Market Cap',
        },
        {
          label: 'Cash to Debt',
          value: metrics.cashToDebt,
          format: 'number' as const,
          subtitle: 'Cash / Total Debt',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Tesla-Specific Metrics</h2>
            <p className="text-sm text-text-muted mt-1">
              Automotive industry-focused metrics derived from financial statements
            </p>
          </div>
          {onAskAI && (
            <button
              onClick={() => onAskAI('Analyze Tesla-specific operational and financial metrics including revenue per share, capital efficiency, working capital, and cash position.')}
              className="px-4 py-2 bg-tesla-red text-white rounded-md hover:bg-tesla-red/80 transition-colors text-sm"
            >
              Ask AI about Tesla Metrics
            </button>
          )}
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 dark:text-yellow-400 text-lg">ℹ️</span>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Note: Vehicle-Specific Data Not Available</p>
              <p>
                Alpha Vantage API does not provide operational metrics like vehicle deliveries, 
                production capacity, or segment revenue breakdowns. These metrics would require 
                integration with Tesla&apos;s investor relations data or SEC filings. The metrics shown 
                here are calculated from available financial statement data.
              </p>
            </div>
          </div>
        </div>

        {metricsData.map((category, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-md font-semibold text-foreground mb-4">{category.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.metrics.map((metric, metricIndex) => (
                <React.Fragment key={metricIndex}>
                  {renderMetricCard(
                    metric.label,
                    metric.value,
                    metric.format,
                    metric.subtitle,
                    'trend' in metric ? metric.trend : undefined
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

