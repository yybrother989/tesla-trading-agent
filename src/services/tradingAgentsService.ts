/**
 * TradingAgents Analyst API Service
 * Connects to the TradingAgents backend API for analyst reports
 * 
 * API Documentation: See FRONTEND_INTEGRATION.md
 */

export interface ReportSection {
  content: string;
  timestamp?: string;
}

export interface AnalysisReports {
  market_report?: ReportSection;
  sentiment_report?: ReportSection;
  news_report?: ReportSection;
  fundamentals_report?: ReportSection;
}

export interface AnalyzeRequest {
  ticker: string;
  date: string; // YYYY-MM-DD format
  config?: Record<string, any>;
}

export interface AnalyzeResponse {
  ticker: string;
  date: string;
  reports: AnalysisReports;
  execution_time: number;
  timestamp: string;
}

export interface RunAgentsRequest {
  ticker: string;
  date: string;
  agents?: ('market_analyst' | 'news_analyst' | 'social_analyst' | 'fundamentals_analyst')[];
  config?: Record<string, any>;
}

export interface AgentResult {
  report: string;
  success: boolean;
  execution_time: number;
  error?: string;
}

export interface RunAgentsResponse {
  ticker: string;
  date: string;
  agents: string[];
  results: Record<string, AgentResult>;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  detail?: string;
  timestamp: string;
}

// SSE Streaming Event Types
export interface ProgressInfo {
  completed: number;
  total: number;
  percentage: number;
}

export interface StartEventData {
  ticker: string;
  date: string;
  total_agents: number;
  timestamp: string;
}

export interface ReportEventData {
  agent: string;
  report_key: 'market_report' | 'sentiment_report' | 'news_report' | 'fundamentals_report';
  report: ReportSection;
  progress: ProgressInfo;
  timestamp: string;
}

export interface CompleteEventData {
  ticker: string;
  date: string;
  reports: AnalysisReports;
  execution_time: number;
  timestamp: string;
}

export interface ErrorEventData {
  error: string;
  detail?: string;
  timestamp: string;
}

export type StreamEventType = 'start' | 'report' | 'complete' | 'error';

export interface StreamEventCallbacks {
  onStart?: (data: StartEventData) => void;
  onReport?: (data: ReportEventData) => void;
  onComplete?: (data: CompleteEventData) => void;
  onError?: (data: ErrorEventData) => void;
  onStreamError?: (error: Error) => void;
}

class TradingAgentsService {
  private baseUrl: string;
  private useProxy: boolean;

  constructor() {
    // Check if we should use Next.js proxy routes (recommended for production)
    // Or call TradingAgents API directly
    const useProxyEnv = 
      (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_TRADINGAGENTS_PROXY === 'true') ||
      false;
    
    this.useProxy = useProxyEnv;
    
    if (this.useProxy) {
      // Use Next.js API routes as proxy
      this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    } else {
      // Use direct TradingAgents API URL
      this.baseUrl = 
        (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TRADINGAGENTS_API_URL) ||
        'http://localhost:8000';
    }
  }

  /**
   * Get the base URL for API requests
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Health check - verify API server is running
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const endpoint = this.useProxy 
        ? `${this.baseUrl}/api/trading-agents/health`
        : `${this.baseUrl}/api/v1/health`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data: HealthResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Run all analyst agents and get comprehensive reports
   */
  async analyzeStock(ticker: string, date: string, config?: Record<string, any>): Promise<AnalyzeResponse> {
    try {
      const requestBody: AnalyzeRequest = {
        ticker,
        date,
        ...(config && { config }),
      };

      const endpoint = this.useProxy
        ? `${this.baseUrl}/api/trading-agents/analyze`
        : `${this.baseUrl}/api/v1/analyze`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Unknown error',
          detail: response.statusText,
          timestamp: new Date().toISOString(),
        }));
        throw new Error(errorData.detail || errorData.error || `Analysis failed: ${response.statusText}`);
      }

      const data: AnalyzeResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Analyze stock error:', error);
      throw error;
    }
  }

  /**
   * Run specific analyst agents
   */
  async runAgents(
    ticker: string,
    date: string,
    agents?: ('market_analyst' | 'news_analyst' | 'social_analyst' | 'fundamentals_analyst')[],
    config?: Record<string, any>
  ): Promise<RunAgentsResponse> {
    try {
      const requestBody: RunAgentsRequest = {
        ticker,
        date,
        ...(agents && { agents }),
        ...(config && { config }),
      };

      const endpoint = this.useProxy
        ? `${this.baseUrl}/api/trading-agents/agents/run`
        : `${this.baseUrl}/api/v1/agents/run`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Unknown error',
          detail: response.statusText,
          timestamp: new Date().toISOString(),
        }));
        throw new Error(errorData.detail || errorData.error || `Agent execution failed: ${response.statusText}`);
      }

      const data: RunAgentsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Run agents error:', error);
      throw error;
    }
  }

  /**
   * Get cached analysis if available
   */
  async getCachedAnalysis(ticker: string, date: string): Promise<AnalyzeResponse | null> {
    try {
      const endpoint = this.useProxy
        ? `${this.baseUrl}/api/trading-agents/analyses/${ticker}/${date}`
        : `${this.baseUrl}/api/v1/analyses/${ticker}/${date}`;

      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.status === 404) {
        return null; // No cached result
      }

      if (!response.ok) {
        throw new Error(`Failed to get cached analysis: ${response.statusText}`);
      }

      const data: AnalyzeResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Get cached analysis error:', error);
      return null; // Return null on error, allowing caller to decide
    }
  }

  /**
   * Get analysis with cache-first strategy
   * Checks cache first, then runs fresh analysis if no cache exists
   */
  async getAnalysisWithCache(ticker: string, date: string, forceRefresh: boolean = false): Promise<AnalyzeResponse> {
    if (!forceRefresh) {
      // Try cached first
      const cached = await this.getCachedAnalysis(ticker, date);
      if (cached) {
        return cached;
      }
    }

    // If no cache or force refresh, run fresh analysis
    return await this.analyzeStock(ticker, date);
  }

  /**
   * Stream analysis with Server-Sent Events (SSE)
   * Provides real-time progressive updates as reports complete
   * 
   * @param ticker Stock ticker symbol
   * @param date Trading date in YYYY-MM-DD format
   * @param callbacks Event callbacks for handling SSE events
   * @param config Optional configuration override
   * @returns Function to close the stream
   */
  streamAnalysis(
    ticker: string,
    date: string,
    callbacks: StreamEventCallbacks,
    config?: Record<string, any>
  ): () => void {
    const params = new URLSearchParams({
      ticker,
      date,
    });

    if (config) {
      params.append('config', JSON.stringify(config));
    }

    const endpoint = this.useProxy
      ? `${this.baseUrl}/api/trading-agents/analyze/stream?${params.toString()}`
      : `${this.baseUrl}/api/v1/analyze/stream?${params.toString()}`;

    const eventSource = new EventSource(endpoint);

    eventSource.addEventListener('start', (e: MessageEvent) => {
      try {
        const data: StartEventData = JSON.parse(e.data);
        callbacks.onStart?.(data);
      } catch (error) {
        console.error('Error parsing start event:', error);
        callbacks.onStreamError?.(error instanceof Error ? error : new Error('Failed to parse start event'));
      }
    });

    eventSource.addEventListener('report', (e: MessageEvent) => {
      try {
        const data: ReportEventData = JSON.parse(e.data);
        callbacks.onReport?.(data);
      } catch (error) {
        console.error('Error parsing report event:', error);
        callbacks.onStreamError?.(error instanceof Error ? error : new Error('Failed to parse report event'));
      }
    });

    eventSource.addEventListener('complete', (e: MessageEvent) => {
      try {
        const data: CompleteEventData = JSON.parse(e.data);
        callbacks.onComplete?.(data);
        eventSource.close();
      } catch (error) {
        console.error('Error parsing complete event:', error);
        callbacks.onStreamError?.(error instanceof Error ? error : new Error('Failed to parse complete event'));
        eventSource.close();
      }
    });

    eventSource.addEventListener('error', (e: MessageEvent) => {
      try {
        const data: ErrorEventData = JSON.parse(e.data);
        callbacks.onError?.(data);
        eventSource.close();
      } catch (error) {
        // If parsing fails, it might be a connection error
        callbacks.onStreamError?.(error instanceof Error ? error : new Error('SSE connection error'));
        eventSource.close();
      }
    });

    eventSource.onerror = () => {
      callbacks.onStreamError?.(new Error('EventSource connection failed'));
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  /**
   * Get a specific report section
   * Maps frontend section names to API report keys
   */
  getReportSection(reports: AnalysisReports | null | undefined, section: 'market' | 'sentiment' | 'news' | 'fundamental'): ReportSection | null {
    if (!reports) {
      return null;
    }
    
    switch (section) {
      case 'market':
        return reports.market_report || null;
      case 'sentiment':
        return reports.sentiment_report || null;
      case 'news':
        return reports.news_report || null;
      case 'fundamental':
        return reports.fundamentals_report || null;
      default:
        return null;
    }
  }
}

// Singleton instance
let tradingAgentsServiceInstance: TradingAgentsService | null = null;

/**
 * Get the TradingAgents service instance
 */
export function getTradingAgentsService(): TradingAgentsService {
  if (!tradingAgentsServiceInstance) {
    tradingAgentsServiceInstance = new TradingAgentsService();
  }
  return tradingAgentsServiceInstance;
}

/**
 * Get service status
 */
export function getServiceStatus() {
  const service = getTradingAgentsService();
  return {
    available: true,
    baseUrl: service.getBaseUrl(),
    message: `Connected to TradingAgents API at ${service.getBaseUrl()}`,
  };
}

