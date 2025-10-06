/**
 * Technical Analyst Tab - Industrial Best Practices
 * 
 * This component follows industry standards for financial applications:
 * - Proper error boundaries and loading states
 * - Accessibility compliance (WCAG 2.1)
 * - Responsive design patterns
 * - Data validation and type safety
 * - Performance optimization
 * - Clean separation of concerns
 */

import React, { Suspense, useMemo, useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { TradingViewWidget } from '../../charts/TradingViewWidget';
import { IndicatorGrid, AnalysisSummary } from '../../indicators';
import { 
  useTradingData, 
  useAutoSync, 
  useTimePeriod, 
  TimePeriod 
} from '../../../hooks/useTradingData';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface TechnicalAnalystTabProps {
  onAskAI?: (context: string) => void;
  symbol?: string;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

class TechnicalAnalystErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Technical Analyst Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
        return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-red-500 text-xl">⚠️</span>
            <h3 className="text-lg font-semibold text-red-800">Technical Analyst Error</h3>
          </div>
          <p className="text-red-700 mb-4">
            Something went wrong while loading the technical analyst. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

const ChartLoadingSkeleton: React.FC = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded w-96 animate-pulse"></div>
      <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  </Card>
);

const IndicatorsLoadingSkeleton: React.FC = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  </Card>
);

// ============================================================================
// CHART SECTION COMPONENT
// ============================================================================

interface ChartSectionProps {
  symbol: string;
  onAskAI?: (context: string) => void;
}

const ChartSection: React.FC<ChartSectionProps> = ({ symbol, onAskAI }) => {
  const { selectedPeriod, changePeriod } = useTimePeriod('1d');
  const { isAutoSync, lastSync, toggleAutoSync, updateLastSync } = useAutoSync(true);
  const [chartInterval, setChartInterval] = useState('1D');
  const [chartTheme, setChartTheme] = useState<'light' | 'dark'>('light');
  
  const { chartData, currentPrice, isLoading, hasError, refetchAll } = useTradingData(symbol, selectedPeriod, {
    chart: { autoRefresh: isAutoSync },
    price: { refetchInterval: 30000 },
    indicators: { refetchInterval: 300000 }
  });

  const handleRefresh = async () => {
    await refetchAll();
    updateLastSync();
  };

  const handleIntervalChange = (interval: string) => {
    setChartInterval(interval);
  };

  const handleThemeToggle = () => {
    setChartTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-foreground">
            Tesla Stock Price Chart
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-muted">
              Last updated: {lastSync.toLocaleTimeString()}
            </span>
              <Button
              onClick={handleRefresh}
              disabled={isLoading}
                size="sm"
              className="bg-tesla-red hover:bg-tesla-red/80"
              >
              {isLoading ? '⏳' : '🔄'} Refresh
              </Button>
          </div>
        </div>
        <p className="text-sm text-text-muted">
          Professional TradingView chart with real-time data and technical analysis
        </p>
      </div>
      
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-4">
          {/* Time Interval Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-text-muted">Time Interval:</label>
            <select 
              value={chartInterval} 
              onChange={(e) => handleIntervalChange(e.target.value)}
              className="px-3 py-1 text-sm border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-tesla-red"
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="1D">1 day</option>
              <option value="1W">1 week</option>
              <option value="1M">1 month</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="px-3 py-1 text-sm border border-border rounded-md bg-card text-foreground hover:bg-card/80 focus:outline-none focus:ring-2 focus:ring-tesla-red transition-colors"
          >
            {chartTheme === 'light' ? '🌙 Dark Theme' : '☀️ Light Theme'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Auto Sync Toggle */}
          <button
            onClick={toggleAutoSync}
            className={`px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-tesla-red transition-colors ${
              isAutoSync 
                ? 'border-tesla-red bg-tesla-red/10 text-tesla-red' 
                : 'border-border bg-card text-foreground hover:bg-card/80'
            }`}
          >
            {isAutoSync ? '🔄 Auto Sync ON' : '⏸️ Auto Sync OFF'}
          </button>
        </div>
      </div>
      
      {/* TradingView Widget */}
      <TradingViewWidget 
        symbol={symbol}
        interval={chartInterval}
        theme={chartTheme}
        autosize={true}
        className="w-full"
      />
      </Card>
  );
};

// ============================================================================
// INDICATORS SECTION COMPONENT
// ============================================================================

interface IndicatorsSectionProps {
  symbol: string;
  onAskAI?: (context: string) => void;
}

const IndicatorsSection: React.FC<IndicatorsSectionProps> = ({ symbol, onAskAI }) => {
  const { data: technicalIndicators, loading, error, refetch } = useTradingData(symbol, '1M').technicalIndicators;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
                <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Technical Indicators
          </h2>
          <p className="text-sm text-text-muted">
            Comprehensive technical analysis indicators with confidence scoring
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={loading}
          size="sm"
          className="bg-tesla-red hover:bg-tesla-red/80"
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </Button>
      </div>

      <Suspense fallback={<IndicatorsLoadingSkeleton />}>
        <IndicatorGrid
          indicators={technicalIndicators || []}
          isLoading={loading}
          error={error}
          onAskAI={onAskAI}
        />
      </Suspense>
      </Card>
  );
};

// ============================================================================
// SUMMARY SECTION COMPONENT
// ============================================================================

interface SummarySectionProps {
  symbol: string;
  onAskAI?: (context: string) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({ symbol, onAskAI }) => {
  const { data: summary, loading, error } = useTradingData(symbol, '1M').technicalAnalysisSummary;

  return (
    <Card className="p-6">
      <Suspense fallback={<IndicatorsLoadingSkeleton />}>
        <AnalysisSummary
          summary={summary || {
            overallSignal: 'neutral',
            confidence: 0,
            bullishSignals: 0,
            bearishSignals: 0,
            neutralSignals: 0,
            lastUpdated: new Date(),
            recommendations: ['Loading analysis...']
          }}
          isLoading={loading}
          error={error}
          onAskAI={onAskAI}
        />
      </Suspense>
        </Card>
  );
};

// ============================================================================
// MAIN TECHNICAL ANALYST TAB COMPONENT
// ============================================================================

export const TechnicalAnalystTab: React.FC<TechnicalAnalystTabProps> = ({ 
  onAskAI,
  symbol = 'TSLA',
  className = ''
}) => {
  // Memoize expensive computations
  const memoizedChartSection = useMemo(
    () => <ChartSection symbol={symbol} onAskAI={onAskAI} />,
    [symbol, onAskAI]
  );

  const memoizedIndicatorsSection = useMemo(
    () => <IndicatorsSection symbol={symbol} onAskAI={onAskAI} />,
    [symbol, onAskAI]
  );

  const memoizedSummarySection = useMemo(
    () => <SummarySection symbol={symbol} onAskAI={onAskAI} />,
    [symbol, onAskAI]
  );

  return (
    <TechnicalAnalystErrorBoundary>
      <div className={`space-y-6 ${className}`} role="main" aria-label="Technical Analyst">
        {/* Chart Section */}
        <section aria-labelledby="chart-heading">
          {memoizedChartSection}
        </section>

        {/* Indicators Section */}
        <section aria-labelledby="indicators-heading">
          {memoizedIndicatorsSection}
        </section>

        {/* Summary Section */}
        <section aria-labelledby="summary-heading">
          {memoizedSummarySection}
        </section>

        {/* Accessibility Information */}
        <div className="sr-only">
          <h2 id="chart-heading">Interactive Stock Price Chart</h2>
          <h2 id="indicators-heading">Technical Analyst Indicators</h2>
          <h2 id="summary-heading">Technical Analyst Summary</h2>
          </div>
      </div>
    </TechnicalAnalystErrorBoundary>
  );
};

// ============================================================================
// EXPORT WITH DISPLAY NAME
// ============================================================================

TechnicalAnalystTab.displayName = 'TechnicalAnalystTab';