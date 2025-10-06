'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { FormattedReport } from '../../reports/FormattedReport';
import { 
  getTradingAgentsService, 
  getServiceStatus,
  type AnalyzeResponse,
  type ReportSection as ReportSectionData,
  type ProgressInfo,
  type StartEventData,
  type ReportEventData,
  type CompleteEventData
} from '../../../services/tradingAgentsService';

type ReportSection = 'market' | 'sentiment' | 'news' | 'fundamental';

interface ReportTabProps {
  onAskAI?: (context: string) => void;
  ticker?: string;
}

/**
 * Report Tab - Connected to TradingAgents Analyst API with SSE Streaming
 * 
 * Displays comprehensive reports from the TradingAgents backend:
 * - Market Report (from market_analyst)
 * - Sentiment Report (from social_analyst)
 * - News Report (from news_analyst)
 * - Fundamental Report (from fundamentals_analyst)
 * 
 * Features:
 * - Real-time progressive updates via Server-Sent Events (SSE)
 * - Progress tracking with percentage completion
 * - Cache-first strategy (instant results if cached)
 * - Parallel agent execution (~4x faster)
 */
export const ReportTab: React.FC<ReportTabProps> = ({ onAskAI, ticker = 'TSLA' }) => {
  const [activeSection, setActiveSection] = useState<ReportSection>('market');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const streamCleanupRef = useRef<(() => void) | null>(null);
  
  const tradingAgentsService = getTradingAgentsService();
  const serviceStatus = getServiceStatus();

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
      }
    };
  }, []);

  // Stream analysis with SSE for real-time updates
  const streamAnalysis = useCallback((forceRefresh: boolean = false) => {
    // Cleanup any existing stream
    if (streamCleanupRef.current) {
      streamCleanupRef.current();
      streamCleanupRef.current = null;
    }

    setLoading(true);
    setStreaming(true);
    setError(null);
    setProgress(null);

    const date = getTodayDate();

    // First, try to get cached analysis (instant return if available)
    if (!forceRefresh) {
      tradingAgentsService.getCachedAnalysis(ticker, date)
        .then((cached) => {
          if (cached && cached.reports && Object.keys(cached.reports).length > 0) {
            // We have a valid cached result with reports
            setAnalysis(cached);
            setLastRefresh(new Date());
            setLoading(false);
            setStreaming(false);
            return; // Use cached result, skip streaming
          }
          // No cache or empty reports, proceed with streaming to generate new reports
          console.log('No cached reports found, starting new analysis...');
          startStreaming();
        })
        .catch((err) => {
          // If cache check fails, proceed with streaming
          console.log('Cache check failed, starting new analysis...', err);
          startStreaming();
        });
    } else {
      // Force refresh, skip cache and stream directly
      console.log('Force refresh requested, starting new analysis...');
      startStreaming();
    }

    function startStreaming() {
      // Start SSE streaming
      const cleanup = tradingAgentsService.streamAnalysis(
        ticker,
        date,
        {
          onStart: (data: StartEventData) => {
            console.log('Analysis started:', data);
            setProgress({
              completed: 0,
              total: data.total_agents,
              percentage: 0,
            });
          },
          onReport: (data: ReportEventData) => {
            console.log('Report received:', data.report_key);
            // Update analysis with new report as it arrives
            setAnalysis((prev) => {
              const updated: Partial<AnalyzeResponse> = prev ? { ...prev } : {
                ticker,
                date,
                reports: {},
                execution_time: 0,
                timestamp: new Date().toISOString(),
              };

              // Update the specific report
              if (!updated.reports) {
                updated.reports = {};
              }
              updated.reports[data.report_key] = data.report;
              
              // Ensure execution_time exists
              if (updated.execution_time === undefined) {
                updated.execution_time = 0;
              }
              
              return updated as AnalyzeResponse;
            });
            
            // Update progress
            setProgress(data.progress);
            setLastRefresh(new Date());
          },
          onComplete: (data: CompleteEventData) => {
            console.log('Analysis complete:', data);
            // Final update with complete data
            setAnalysis({
              ticker: data.ticker,
              date: data.date,
              reports: data.reports || {},
              execution_time: data.execution_time || 0,
              timestamp: data.timestamp || new Date().toISOString(),
            });
            setProgress({
              completed: data.reports ? Object.keys(data.reports).length : 0,
              total: 4, // 4 analysts
              percentage: 100,
            });
            setLastRefresh(new Date());
            setLoading(false);
            setStreaming(false);
          },
          onError: (errorData) => {
            console.error('Streaming error:', errorData);
            setError(errorData.error || errorData.detail || 'Streaming error occurred');
            setLoading(false);
            setStreaming(false);
          },
          onStreamError: (err) => {
            console.error('Connection error:', err);
            setError(err.message || 'Connection error during streaming');
            setLoading(false);
            setStreaming(false);
          },
        }
      );

      streamCleanupRef.current = cleanup;
    }
  }, [ticker, getTodayDate, tradingAgentsService]);

  // Legacy fetch method (fallback)
  const fetchAnalysis = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const date = getTodayDate();
      const data = await tradingAgentsService.getAnalysisWithCache(ticker, date, forceRefresh);
      setAnalysis(data);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis reports';
      setError(errorMessage);
      console.error('Failed to fetch analysis:', err);
    } finally {
      setLoading(false);
    }
  }, [ticker, getTodayDate, tradingAgentsService]);

  // Load analysis on mount - automatically fetch or generate reports
  useEffect(() => {
    // Automatically fetch cached reports or generate new ones on mount
    streamAnalysis(false); // Try cache first, automatically stream if no cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Also auto-refresh when ticker changes
  useEffect(() => {
    if (ticker) {
      streamAnalysis(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  // Get the current section report
  const getCurrentReport = (): ReportSectionData | null => {
    if (!analysis || !analysis.reports) return null;
    return tradingAgentsService.getReportSection(analysis.reports, activeSection);
  };

  const sections = [
    {
      id: 'market' as ReportSection,
      name: 'Market Report',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Technical indicators & charts'
    },
    {
      id: 'sentiment' as ReportSection,
      name: 'Sentiment Report',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      description: 'Social & market sentiment'
    },
    {
      id: 'news' as ReportSection,
      name: 'News Report',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      description: 'Latest news & impact'
    },
    {
      id: 'fundamental' as ReportSection,
      name: 'Fundamental Report',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Financial health & metrics'
    }
  ];

  // Render report content
  const renderReportContent = (report: ReportSectionData | null, sectionName: string, description: string) => {
    // If no report and not loading/streaming, show message with auto-generate option
    if (!report || !report.content) {
      const hasNoAnalysis = !analysis || !analysis.reports || Object.keys(analysis.reports).length === 0;
      const canAutoGenerate = !loading && !streaming;
      
      return (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-card border-2 border-tesla-red/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-tesla-red/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{sectionName}</h3>
              <p className="text-sm text-text-muted mb-4">{description}</p>
            </div>
            <div className="pt-4 border-t border-border space-y-4">
              <p className="text-sm text-text-muted">
                {hasNoAnalysis 
                  ? 'No reports available. Generating new analysis automatically...'
                  : 'No report available for this section yet.'}
              </p>
              {canAutoGenerate && (
                <Button
                  onClick={() => streamAnalysis(true)}
                  className="bg-tesla-red hover:bg-tesla-red/80"
                >
                  {hasNoAnalysis ? '🔍 Generate Reports Now' : '🔄 Generate This Report'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-6">
        {/* Report Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{sectionName}</h2>
            <p className="text-sm text-text-muted mt-1">{description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => streamAnalysis(true)}
              disabled={loading || streaming}
              size="sm"
              className="bg-tesla-red hover:bg-tesla-red/80"
            >
              {(loading || streaming) ? 'Loading...' : '🔄 Refresh'}
            </Button>
            {onAskAI && (
              <Button
                onClick={() => onAskAI(`Explain this ${sectionName.toLowerCase()} report in detail.`)}
                size="sm"
                variant="outline"
              >
                🤖 Ask AI
              </Button>
            )}
          </div>
        </div>

        {/* Report Metadata */}
        {report.timestamp && (
          <div className="mb-4 pb-4 border-b border-border">
            <div className="flex items-center space-x-4 text-xs text-text-muted">
              <span>📅 Generated: {new Date(report.timestamp).toLocaleString()}</span>
              {lastRefresh && (
                <span>🔄 Last refreshed: {lastRefresh.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}

        {/* Report Content - Formatted */}
        <div className="report-content">
          <FormattedReport 
            content={report.content} 
            reportType={activeSection}
          />
        </div>
      </Card>
    );
  };

  const renderSectionContent = () => {
    // Show loading/streaming state
    if ((loading || streaming) && !analysis) {
      return (
        <Card className="p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center w-full max-w-md">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tesla-red mx-auto mb-4"></div>
              <p className="text-sm font-medium text-foreground mb-2">
                {streaming ? 'Generating reports...' : 'Loading analysis reports...'}
              </p>
              {progress && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                    <span>Progress</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-tesla-red h-2 transition-all duration-300 ease-out"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-text-muted mt-2">
                    {progress.completed} of {progress.total} reports completed
                  </p>
                </div>
              )}
              <p className="text-xs text-text-muted mt-4">
                {streaming 
                  ? 'Reports will appear as they complete (parallel execution)' 
                  : 'This may take a few moments'}
              </p>
            </div>
          </div>
        </Card>
      );
    }

    // Show streaming progress if we have partial results
    if (streaming && analysis && progress) {
      const currentReport = getCurrentReport();
      return (
        <>
          {/* Progress Banner */}
          <Card className="p-4 mb-4 bg-info/10 border-info/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tesla-red"></div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Generating reports... {progress.completed}/{progress.total} complete
                  </p>
                  <div className="w-64 mt-2 bg-border rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-tesla-red h-1.5 transition-all duration-300 ease-out"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-text-muted">
                {progress.percentage}%
              </div>
            </div>
          </Card>

          {/* Current Section Content */}
          {renderReportContent(
            currentReport,
            sections.find(s => s.id === activeSection)?.name || 'Report',
            sections.find(s => s.id === activeSection)?.description || ''
          )}
        </>
      );
    }

    if (error) {
      return (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-error/10 border-2 border-error/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Error Loading Reports</h3>
              <p className="text-sm text-error mb-4">{error}</p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                onClick={() => streamAnalysis(true)}
                size="sm"
                className="bg-tesla-red hover:bg-tesla-red/80"
              >
                Retry
              </Button>
              <Button
                onClick={() => setError(null)}
                size="sm"
                variant="outline"
              >
                Dismiss
              </Button>
            </div>
            <div className="pt-4 border-t border-border text-xs text-text-muted">
              <p>API Base URL: {serviceStatus.baseUrl}</p>
              <p>Make sure the TradingAgents API server is running</p>
            </div>
          </div>
        </Card>
      );
    }

    const currentReport = getCurrentReport();
    
    switch (activeSection) {
      case 'market':
        return renderReportContent(
          currentReport,
          'Market Report',
          'Technical indicators, chart patterns, and market trend analysis'
        );
      
      case 'sentiment':
        return renderReportContent(
          currentReport,
          'Sentiment Report',
          'Aggregated sentiment from social media, news, and analyst reports'
        );
      
      case 'news':
        return renderReportContent(
          currentReport,
          'News Report',
          'Latest news articles with impact assessment and market implications'
        );
      
      case 'fundamental':
        return renderReportContent(
          currentReport,
          'Fundamental Report',
          'Financial health, company metrics, and valuation analysis'
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Status Banner */}
      <Card className={`p-4 ${serviceStatus.available ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${serviceStatus.available ? 'bg-success' : 'bg-warning'}`}></div>
            <div>
              <h3 className={`font-medium ${serviceStatus.available ? 'text-success' : 'text-warning'}`}>
                TradingAgents API
              </h3>
              <p className="text-xs text-text-muted">{serviceStatus.message}</p>
            </div>
          </div>
          {analysis && (
            <div className="text-xs text-text-muted">
              {analysis.execution_time != null && (
                <div>Execution: {typeof analysis.execution_time === 'number' 
                  ? analysis.execution_time.toFixed(2) 
                  : analysis.execution_time}s</div>
              )}
              {lastRefresh && <div>Updated: {lastRefresh.toLocaleTimeString()}</div>}
            </div>
          )}
        </div>
      </Card>

      {/* Section Navigation */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${activeSection === section.id
                  ? 'bg-tesla-red text-white shadow-sm'
                  : 'bg-card border border-border text-foreground hover:bg-card/80 hover:border-tesla-red/50'
                }
              `}
            >
              {section.icon}
              <span>{section.name}</span>
              {analysis?.reports && tradingAgentsService.getReportSection(analysis.reports, section.id) && (
                <span className="ml-1 text-xs opacity-75">✓</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Active Section Content */}
      <div className="min-h-[400px]">
        {renderSectionContent()}
      </div>
    </div>
  );
};

