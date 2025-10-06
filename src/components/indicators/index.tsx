/**
 * Technical Indicator Components
 * 
 * Reusable, accessible, and responsive components for displaying technical indicators
 * following industrial best practices for financial applications.
 */

import React from 'react';
import { TechnicalIndicator } from '../../data';

// ============================================================================
// INDICATOR CARD COMPONENT
// ============================================================================

interface IndicatorCardProps {
  indicator: TechnicalIndicator;
  isLoading?: boolean;
  error?: string | null;
  onAskAI?: (context: string) => void;
  className?: string;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({
  indicator,
  isLoading = false,
  error = null,
  onAskAI,
  className = ''
}) => {
  const getSignalColor = (signal: 'buy' | 'sell' | 'neutral') => {
    switch (signal) {
      case 'buy': return 'text-green-500 bg-green-50 border-green-200';
      case 'sell': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    }
  };

  const getSignalIcon = (signal: 'buy' | 'sell' | 'neutral') => {
    switch (signal) {
      case 'buy': return '📈';
      case 'sell': return '📉';
      default: return '➡️';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'momentum': return '⚡';
      case 'trend': return '📊';
      case 'volatility': return '📈';
      case 'volume': return '📦';
      default: return '📋';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`p-4 bg-card border border-border rounded-lg animate-pulse ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-20"></div>
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-red-500">⚠️</span>
          <h4 className="font-medium text-red-800">{indicator.name}</h4>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-card border border-border rounded-lg hover:bg-card/80 transition-colors group ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryIcon(indicator.category)}</span>
          <h4 className="font-medium text-foreground">{indicator.name}</h4>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(indicator.signal)}`}>
          <span>{getSignalIcon(indicator.signal)}</span>
          <span className="capitalize">{indicator.signal}</span>
        </div>
      </div>

      {/* Value and Confidence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">
            {indicator.value.toFixed(2)}
          </span>
          <div className="text-right">
            <div className={`text-sm font-medium ${getConfidenceColor(indicator.confidence)}`}>
              {indicator.confidence}% confidence
            </div>
            <div className="text-xs text-text-muted">
              {indicator.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-muted leading-relaxed">
          {indicator.description}
        </p>

        {/* Historical Trend */}
        {indicator.historicalData && indicator.historicalData.length > 1 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">Recent Trend</span>
              <span className="text-xs text-text-muted">
                {indicator.historicalData.length} data points
              </span>
            </div>
            <div className="flex items-end space-x-1 h-8">
              {indicator.historicalData.slice(-10).map((value, index) => {
                const max = Math.max(...indicator.historicalData!);
                const min = Math.min(...indicator.historicalData!);
                const height = ((value - min) / (max - min)) * 100;
                return (
                  <div
                    key={index}
                    className="bg-tesla-red/20 rounded-sm flex-1"
                    style={{ height: `${Math.max(height, 10)}%` }}
                    title={`${value.toFixed(2)}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Ask AI Button */}
        {onAskAI && (
          <button
            onClick={() => onAskAI(`Explain the ${indicator.name} indicator: ${indicator.description}`)}
            className="mt-3 w-full px-3 py-2 text-xs bg-tesla-red text-white rounded-lg hover:bg-tesla-red/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            🤖 Ask AI about this indicator
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// INDICATOR GRID COMPONENT
// ============================================================================

interface IndicatorGridProps {
  indicators: TechnicalIndicator[];
  isLoading?: boolean;
  error?: string | null;
  onAskAI?: (context: string) => void;
  className?: string;
}

export const IndicatorGrid: React.FC<IndicatorGridProps> = ({
  indicators,
  isLoading = false,
  error = null,
  onAskAI,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <IndicatorCard
            key={index}
            indicator={{} as TechnicalIndicator}
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <span className="text-red-800">Failed to load technical indicators: {error}</span>
        </div>
      </div>
    );
  }

  // Group indicators by category
  const groupedIndicators = indicators.reduce((acc, indicator) => {
    if (!acc[indicator.category]) {
      acc[indicator.category] = [];
    }
    acc[indicator.category].push(indicator);
    return acc;
  }, {} as Record<string, TechnicalIndicator[]>);

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedIndicators).map(([category, categoryIndicators]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-foreground mb-4 capitalize">
            {category} Indicators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryIndicators.map((indicator, index) => (
              <IndicatorCard
                key={`${indicator.name}-${index}`}
                indicator={indicator}
                onAskAI={onAskAI}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// ANALYSIS SUMMARY COMPONENT
// ============================================================================

import { TechnicalAnalysisSummary } from '../../data';

interface AnalysisSummaryProps {
  summary: TechnicalAnalysisSummary;
  isLoading?: boolean;
  error?: string | null;
  onAskAI?: (context: string) => void;
  className?: string;
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  summary,
  isLoading = false,
  error = null,
  onAskAI,
  className = ''
}) => {
  const getOverallSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong_buy': return 'text-green-600 bg-green-100 border-green-300';
      case 'buy': return 'text-green-500 bg-green-50 border-green-200';
      case 'neutral': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'sell': return 'text-red-500 bg-red-50 border-red-200';
      case 'strong_sell': return 'text-red-600 bg-red-100 border-red-300';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getOverallSignalIcon = (signal: string) => {
    switch (signal) {
      case 'strong_buy': return '🚀';
      case 'buy': return '📈';
      case 'neutral': return '➡️';
      case 'sell': return '📉';
      case 'strong_sell': return '💥';
      default: return '❓';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-card border border-border rounded-lg animate-pulse ${className}`}>
        <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <span className="text-red-800">Failed to load analysis summary: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Technical Analyst Summary</h3>
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getOverallSignalColor(summary.overallSignal)}`}>
          <span className="text-lg">{getOverallSignalIcon(summary.overallSignal)}</span>
          <span className="font-medium capitalize">{summary.overallSignal.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Confidence Score</span>
          <span className={`text-lg font-bold ${getConfidenceColor(summary.confidence)}`}>
            {summary.confidence}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              summary.confidence >= 80 ? 'bg-green-500' : 
              summary.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${summary.confidence}%` }}
          />
        </div>
      </div>

      {/* Signal Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{summary.bullishSignals}</div>
          <div className="text-sm text-green-700">Bullish</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{summary.neutralSignals}</div>
          <div className="text-sm text-yellow-700">Neutral</div>
        </div>
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{summary.bearishSignals}</div>
          <div className="text-sm text-red-700">Bearish</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Recommendations</h4>
        <div className="space-y-2">
          {summary.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-500 mt-0.5">💡</span>
              <span className="text-sm text-blue-800">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ask AI Button */}
      {onAskAI && (
        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={() => onAskAI(`Provide a comprehensive technical analysis summary based on current indicators. Overall signal: ${summary.overallSignal}, Confidence: ${summary.confidence}%`)}
            className="w-full px-4 py-3 bg-tesla-red text-white rounded-lg hover:bg-tesla-red/80 transition-colors font-medium"
          >
            🤖 Ask AI for Detailed Analysis
          </button>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 text-xs text-text-muted text-center">
        Last updated: {summary.lastUpdated.toLocaleString()}
      </div>
    </div>
  );
};
