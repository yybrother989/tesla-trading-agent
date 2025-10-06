/**
 * Revenue Segment Breakdown Component
 * Note: Alpha Vantage does not provide segment revenue breakdown
 * This component acknowledges the limitation and provides alternative insights
 */

'use client';

import React from 'react';
import { Card } from '../../ui/Card';
import { QuarterlyReport, AnnualReport } from '../../../types/fundamentalAnalysis';
import { formatCurrency } from '../../../utils/fundamentalDataTransformer';

interface RevenueSegmentBreakdownProps {
  quarterlyReports: QuarterlyReport[];
  annualReports: AnnualReport[];
  onAskAI?: (context: string) => void;
}

export const RevenueSegmentBreakdown: React.FC<RevenueSegmentBreakdownProps> = ({
  quarterlyReports,
  annualReports,
  onAskAI,
}) => {
  if (quarterlyReports.length === 0 && annualReports.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-text-muted text-center">No revenue data available</p>
      </Card>
    );
  }

  // Calculate revenue trends from available data
  const recentRevenue = quarterlyReports.slice(0, 4).map(r => ({
    period: `${r.fiscalQuarter} ${r.fiscalYear}`,
    revenue: r.incomeStatement.revenue,
    date: r.fiscalDateEnding,
  }));

  const annualRevenueTrend = annualReports.slice(0, 5).map(r => ({
    year: r.fiscalYear,
    revenue: r.incomeStatement.revenue,
    date: r.fiscalDateEnding,
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Revenue Analysis</h2>
          <p className="text-sm text-text-muted mt-1">
            Revenue trends and growth analysis
          </p>
        </div>
        {onAskAI && (
          <button
            onClick={() => onAskAI('Analyze Tesla revenue trends including quarterly and annual revenue growth patterns.')}
            className="px-4 py-2 bg-tesla-red text-white rounded-md hover:bg-tesla-red/80 transition-colors text-sm"
          >
            Ask AI about Revenue
          </button>
        )}
      </div>

      {/* Limitation Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Segment Data Not Available</p>
            <p>
              Alpha Vantage API does not provide revenue breakdown by business segment 
              (Automotive, Energy, Services). To get detailed segment revenue data, you would 
              need to integrate with Tesla&apos;s investor relations API or SEC filings (10-Q, 10-K). 
              Below we show overall revenue trends which can be derived from the financial statements.
            </p>
          </div>
        </div>
      </div>

      {/* Quarterly Revenue Trend */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-foreground mb-4">Quarterly Revenue Trend</h3>
        <div className="space-y-3">
          {recentRevenue.map((item, index) => {
            const prevItem = recentRevenue[index + 1];
            const growth = prevItem ? ((item.revenue - prevItem.revenue) / prevItem.revenue) * 100 : null;
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-card/50 border border-border rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{item.period}</div>
                  <div className="text-xs text-text-muted">{item.date}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">
                      {formatCurrency(item.revenue)}
                    </div>
                    {growth !== null && (
                      <div className={`text-xs ${growth >= 0 ? 'text-success' : 'text-error'}`}>
                        {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}% QoQ
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Annual Revenue Trend */}
      <div>
        <h3 className="text-md font-semibold text-foreground mb-4">Annual Revenue Trend</h3>
        <div className="space-y-3">
          {annualRevenueTrend.map((item, index) => {
            const prevItem = annualRevenueTrend[index + 1];
            const growth = prevItem ? ((item.revenue - prevItem.revenue) / prevItem.revenue) * 100 : null;
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-card/50 border border-border rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{item.year}</div>
                  <div className="text-xs text-text-muted">{item.date}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">
                      {formatCurrency(item.revenue)}
                    </div>
                    {growth !== null && (
                      <div className={`text-xs ${growth >= 0 ? 'text-success' : 'text-error'}`}>
                        {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}% YoY
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future Enhancement Notice */}
      <div className="mt-6 p-4 bg-card/50 border border-border rounded-lg">
        <p className="text-xs text-text-muted">
          <strong>Future Enhancement:</strong> Integration with Tesla&apos;s SEC filings or investor relations 
          API could provide detailed segment breakdown (Automotive sales, Energy generation & storage, 
          Services & other revenue) for more granular analysis.
        </p>
      </div>
    </Card>
  );
};

