/**
 * Enhanced Tesla Fundamental Analysis Tab
 * Comprehensive fundamental analysis with Tesla-specific metrics,
 * quarterly/annual views, financial health dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { getClientAlphaVantageService } from '../../../services/clientAlphaVantageService';
import {
  RawCompanyOverview,
  RawIncomeStatement,
  RawBalanceSheet,
  RawCashFlow,
  TeslaFundamentalData,
} from '../../../types/fundamentalAnalysis';
import {
  buildTeslaFundamentalData,
  buildTrendChartData,
  formatCurrency,
  formatPercentage,
} from '../../../utils/fundamentalDataTransformer';
import { QuarterlyFinancials } from './QuarterlyFinancials';
import { FinancialHealthDashboard } from './FinancialHealthDashboard';
import { TeslaMetrics } from './TeslaMetrics';
import { RevenueSegmentBreakdown } from './RevenueSegmentBreakdown';
import { FinancialTrendCharts } from './FinancialTrendCharts';

interface FundamentalTabProps {
  onAskAI?: (context: string) => void;
}

type ViewPeriod = 'quarterly' | 'annual';

export const FundamentalTab: React.FC<FundamentalTabProps> = ({ onAskAI }) => {
  const [fundamentalData, setFundamentalData] = useState<TeslaFundamentalData | null>(null);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('quarterly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadFundamentalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const alphaVantage = getClientAlphaVantageService();

      // Load all fundamental data
      const [overview, income, balance, cashFlow] = await Promise.all([
        alphaVantage.getCompanyOverview('TSLA').catch(() => null),
        alphaVantage.getIncomeStatement('TSLA').catch(() => null),
        alphaVantage.getBalanceSheet('TSLA').catch(() => null),
        alphaVantage.getCashFlow('TSLA').catch(() => null),
      ]);

      if (!overview) {
        throw new Error('Failed to load company overview');
      }

      // Extract quarterly and annual reports from responses
      const quarterlyIncome = (income as any)?.quarterlyReports || [];
      const quarterlyBalance = (balance as any)?.quarterlyReports || [];
      const quarterlyCashFlow = (cashFlow as any)?.quarterlyReports || [];
      const annualIncome = (income as any)?.annualReports || [];
      const annualBalance = (balance as any)?.annualReports || [];
      const annualCashFlow = (cashFlow as any)?.annualReports || [];

      // Transform and build comprehensive data structure
      const transformedData = buildTeslaFundamentalData(
        overview as RawCompanyOverview,
        quarterlyIncome,
        quarterlyBalance,
        quarterlyCashFlow,
        annualIncome,
        annualBalance,
        annualCashFlow
      );

      setFundamentalData(transformedData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading fundamental data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load fundamental data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFundamentalData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tesla-red mx-auto mb-4"></div>
              <p className="text-text-muted">Loading Tesla fundamental data...</p>
              <p className="text-xs text-text-muted mt-2">This may take a few moments</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">
            <p className="text-error mb-4">Error loading fundamental data</p>
            <p className="text-sm text-text-muted mb-4">{error}</p>
            <Button onClick={loadFundamentalData} variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!fundamentalData) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-text-muted text-center">No data available</p>
        </Card>
      </div>
    );
  }

  const { companyOverview, quarterlyReports, annualReports, financialHealth, teslaMetrics, growthRates } = fundamentalData;
  const trendData = buildTrendChartData(quarterlyReports, annualReports);

  return (
    <div className="space-y-6">
      {/* Header Section with Company Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{companyOverview.Name}</h1>
            <p className="text-sm text-text-muted mt-1">
              {companyOverview.Sector} • {companyOverview.Industry}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadFundamentalData}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
            {onAskAI && (
              <Button
                onClick={() => onAskAI('Provide a comprehensive analysis of Tesla\'s fundamental financial position and investment outlook.')}
                size="sm"
                className="bg-tesla-red hover:bg-tesla-red/80"
              >
                🤖 Ask AI
              </Button>
            )}
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="p-3 bg-card/50 border border-border rounded-lg">
            <div className="text-xs text-text-muted mb-1">Market Cap</div>
            <div className="text-sm font-semibold text-foreground">
              {formatCurrency(parseFloat(companyOverview.MarketCapitalization || '0'))}
            </div>
          </div>
          <div className="p-3 bg-card/50 border border-border rounded-lg">
            <div className="text-xs text-text-muted mb-1">P/E Ratio</div>
            <div className="text-sm font-semibold text-foreground">{companyOverview.PERatio}</div>
          </div>
          <div className="p-3 bg-card/50 border border-border rounded-lg">
            <div className="text-xs text-text-muted mb-1">Revenue TTM</div>
            <div className="text-sm font-semibold text-foreground">
              {formatCurrency(parseFloat(companyOverview.RevenueTTM || '0'))}
            </div>
          </div>
          <div className="p-3 bg-card/50 border border-border rounded-lg">
            <div className="text-xs text-text-muted mb-1">Profit Margin</div>
            <div className="text-sm font-semibold text-foreground">
              {formatPercentage(parseFloat(companyOverview.ProfitMargin || '0'))}
            </div>
          </div>
          <div className="p-3 bg-card/50 border border-border rounded-lg">
            <div className="text-xs text-text-muted mb-1">ROE</div>
            <div className="text-sm font-semibold text-foreground">
              {formatPercentage(parseFloat(companyOverview.ReturnOnEquityTTM || '0'))}
            </div>
          </div>
          <div className="p-3 bg-card/50 border border-border rounded-lg">
            <div className="text-xs text-text-muted mb-1">Beta</div>
            <div className="text-sm font-semibold text-foreground">{companyOverview.Beta}</div>
          </div>
        </div>

        {/* Company Description */}
        {companyOverview.Description && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-2">Company Description</h3>
            <p className="text-sm text-text-muted leading-relaxed">{companyOverview.Description}</p>
          </div>
        )}
      </Card>

      {/* Period Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">View Period</h3>
            <p className="text-xs text-text-muted">Switch between quarterly and annual views</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewPeriod('quarterly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewPeriod === 'quarterly'
                  ? 'bg-tesla-red text-white'
                  : 'bg-card border border-border text-foreground hover:bg-card/80'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setViewPeriod('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewPeriod === 'annual'
                  ? 'bg-tesla-red text-white'
                  : 'bg-card border border-border text-foreground hover:bg-card/80'
              }`}
            >
              Annual
            </button>
          </div>
        </div>
      </Card>

      {/* AI Fundamental Analysis section removed per request */}

      {/* Financial Health Dashboard */}
      <FinancialHealthDashboard metrics={financialHealth} onAskAI={onAskAI} />

      {/* Quarterly Financials (shown based on view period) */}
      {viewPeriod === 'quarterly' && quarterlyReports.length > 0 && (
        <QuarterlyFinancials
          quarterlyReports={quarterlyReports}
          growthRates={growthRates.quarterly}
          onAskAI={onAskAI}
        />
      )}

      {viewPeriod === 'annual' && annualReports.length > 0 && (
        <QuarterlyFinancials
          quarterlyReports={annualReports.map(ar => ({
            ...ar,
            fiscalDateEnding: ar.fiscalDateEnding,
            fiscalQuarter: 'Annual',
            fiscalYear: ar.fiscalYear,
            type: 'annual' as const,
            incomeStatement: ar.incomeStatement,
            balanceSheet: ar.balanceSheet,
            cashFlow: ar.cashFlow,
          }))}
          growthRates={growthRates.annual}
          onAskAI={onAskAI}
        />
      )}

      {/* Tesla-Specific Metrics */}
      <TeslaMetrics metrics={teslaMetrics} onAskAI={onAskAI} />

      {/* Revenue Segment Breakdown */}
      <RevenueSegmentBreakdown
        quarterlyReports={quarterlyReports}
        annualReports={annualReports}
        onAskAI={onAskAI}
      />

      {/* Financial Trend Charts */}
      <FinancialTrendCharts trendData={trendData} onAskAI={onAskAI} />

      {/* Data Source Footer */}
      <Card className="bg-card/50">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Data source: Alpha Vantage API • Last updated: {lastRefresh.toLocaleString()}
          </p>
          <Button onClick={loadFundamentalData} variant="outline" size="sm" disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
