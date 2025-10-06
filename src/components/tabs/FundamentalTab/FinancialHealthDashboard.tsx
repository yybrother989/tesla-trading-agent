/**
 * Financial Health Dashboard Component
 * Visual dashboard displaying key financial health indicators
 * Organized by category: Profitability, Liquidity, Leverage, Efficiency, Valuation
 */

'use client';

import React from 'react';
import { Card } from '../../ui/Card';
import { FinancialHealthMetrics } from '../../../types/fundamentalAnalysis';
import { formatPercentage, formatNumber } from '../../../utils/fundamentalDataTransformer';

interface FinancialHealthDashboardProps {
  metrics: FinancialHealthMetrics;
  onAskAI?: (context: string) => void;
}

interface MetricCardData {
  label: string;
  value: number | null;
  format: 'percentage' | 'number';
  category: string;
  tooltip?: string;
}

export const FinancialHealthDashboard: React.FC<FinancialHealthDashboardProps> = ({
  metrics,
  onAskAI,
}) => {
  const getHealthColor = (value: number | null, type: 'positive' | 'higher_better' | 'lower_better'): string => {
    if (value === null) return 'text-text-muted';
    
    if (type === 'positive') {
      return value > 0 ? 'text-success' : value < 0 ? 'text-error' : 'text-text-muted';
    }
    
    if (type === 'higher_better') {
      // For margins, ratios - higher is better
      if (value >= 70) return 'text-success';
      if (value >= 50) return 'text-tesla-red';
      if (value >= 30) return 'text-text-muted';
      return 'text-error';
    }
    
    if (type === 'lower_better') {
      // For debt ratios - lower is better
      if (value <= 30) return 'text-success';
      if (value <= 50) return 'text-tesla-red';
      if (value <= 70) return 'text-text-muted';
      return 'text-error';
    }
    
    return 'text-foreground';
  };

  const formatValue = (value: number | null, format: 'percentage' | 'number'): string => {
    if (value === null) return 'N/A';
    return format === 'percentage' ? formatPercentage(value) : formatNumber(value, 2);
  };

  const renderMetricCard = (label: string, value: number | null, format: 'percentage' | 'number', colorType: 'positive' | 'higher_better' | 'lower_better', tooltip?: string) => (
    <div
      className={`p-4 bg-card border border-border rounded-lg hover:border-tesla-red/50 transition-colors ${tooltip ? 'cursor-help' : ''}`}
      title={tooltip}
    >
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className={`text-lg font-semibold ${getHealthColor(value, colorType)}`}>
        {formatValue(value, format)}
      </div>
    </div>
  );

  const renderCategory = (title: string, metrics: MetricCardData[]) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {onAskAI && (
          <button
            onClick={() => onAskAI(`Analyze Tesla's ${title.toLowerCase()} metrics: ${metrics.map(m => `${m.label}: ${formatValue(m.value, m.format)}`).join(', ')}`)}
            className="px-3 py-1 text-xs bg-tesla-red/10 text-tesla-red rounded-md hover:bg-tesla-red/20 transition-colors"
          >
            Ask AI
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <React.Fragment key={index}>
            {renderMetricCard(
              metric.label,
              metric.value,
              metric.format,
              metric.label.includes('Debt') || metric.label.includes('Ratio') ? 'lower_better' : 'higher_better',
              metric.tooltip
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );

  // Profitability Metrics
  const profitabilityMetrics: MetricCardData[] = [
    { label: 'Gross Margin', value: metrics.grossMargin, format: 'percentage', category: 'profitability' },
    { label: 'Operating Margin', value: metrics.operatingMargin, format: 'percentage', category: 'profitability' },
    { label: 'Net Margin', value: metrics.netMargin, format: 'percentage', category: 'profitability' },
    { label: 'EBITDA Margin', value: metrics.ebitdaMargin, format: 'percentage', category: 'profitability' },
    { label: 'Return on Equity', value: metrics.returnOnEquity, format: 'percentage', category: 'profitability' },
    { label: 'Return on Assets', value: metrics.returnOnAssets, format: 'percentage', category: 'profitability' },
    { label: 'Return on Invested Capital', value: metrics.returnOnInvestedCapital, format: 'percentage', category: 'profitability' },
  ];

  // Liquidity Metrics
  const liquidityMetrics: MetricCardData[] = [
    { label: 'Current Ratio', value: metrics.currentRatio, format: 'number', category: 'liquidity', tooltip: 'Current Assets / Current Liabilities' },
    { label: 'Quick Ratio', value: metrics.quickRatio, format: 'number', category: 'liquidity', tooltip: '(Current Assets - Inventory) / Current Liabilities' },
    { label: 'Cash Ratio', value: metrics.cashRatio, format: 'number', category: 'liquidity', tooltip: 'Cash / Current Liabilities' },
  ];

  // Leverage Metrics
  const leverageMetrics: MetricCardData[] = [
    { label: 'Debt to Equity', value: metrics.debtToEquity, format: 'number', category: 'leverage' },
    { label: 'Debt to Assets', value: metrics.debtToAssets, format: 'number', category: 'leverage' },
    { label: 'Interest Coverage', value: metrics.interestCoverageRatio, format: 'number', category: 'leverage' },
    { label: 'Equity Ratio', value: metrics.equityRatio, format: 'number', category: 'leverage' },
  ];

  // Efficiency Metrics
  const efficiencyMetrics: MetricCardData[] = [
    { label: 'Asset Turnover', value: metrics.assetTurnover, format: 'number', category: 'efficiency' },
    { label: 'Inventory Turnover', value: metrics.inventoryTurnover, format: 'number', category: 'efficiency' },
    { label: 'Receivables Turnover', value: metrics.receivablesTurnover, format: 'number', category: 'efficiency' },
    { label: 'Days Sales Outstanding', value: metrics.daysSalesOutstanding, format: 'number', category: 'efficiency' },
    { label: 'Days Inventory', value: metrics.daysInventory, format: 'number', category: 'efficiency' },
  ];

  // Valuation Metrics
  const valuationMetrics: MetricCardData[] = [
    { label: 'P/E Ratio', value: metrics.priceToEarnings, format: 'number', category: 'valuation' },
    { label: 'P/S Ratio', value: metrics.priceToSales, format: 'number', category: 'valuation' },
    { label: 'P/B Ratio', value: metrics.priceToBook, format: 'number', category: 'valuation' },
    { label: 'EV/Revenue', value: metrics.enterpriseValueToRevenue, format: 'number', category: 'valuation' },
    { label: 'EV/EBITDA', value: metrics.enterpriseValueToEbitda, format: 'number', category: 'valuation' },
    { label: 'PEG Ratio', value: metrics.pegRatio, format: 'number', category: 'valuation' },
  ];

  // Cash Flow Metrics
  const cashFlowMetrics: MetricCardData[] = [
    { label: 'Operating CF Margin', value: metrics.operatingCashFlowMargin, format: 'percentage', category: 'cashflow' },
    { label: 'Free CF Margin', value: metrics.freeCashFlowMargin, format: 'percentage', category: 'cashflow' },
    { label: 'Free CF Yield', value: metrics.freeCashFlowYield, format: 'percentage', category: 'cashflow' },
  ];

  return (
    <div className="space-y-6">
      {renderCategory('Profitability Metrics', profitabilityMetrics)}
      {renderCategory('Liquidity Metrics', liquidityMetrics)}
      {renderCategory('Leverage Metrics', leverageMetrics)}
      {renderCategory('Efficiency Metrics', efficiencyMetrics)}
      {renderCategory('Valuation Metrics', valuationMetrics)}
      {renderCategory('Cash Flow Metrics', cashFlowMetrics)}
    </div>
  );
};

