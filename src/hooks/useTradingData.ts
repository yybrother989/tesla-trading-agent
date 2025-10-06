/**
 * Data Hooks Layer
 * 
 * React-specific hooks for data access following industry best practices:
 * - Separation of data fetching from UI components
 * - Built-in loading states and error handling
 * - Automatic caching and revalidation
 * - Type-safe data access
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { tradingDataService, ChartDataPoint, PriceQuote, TechnicalIndicator, TechnicalAnalysisSummary } from '../data';
import { supabase } from '../lib/supabase/client';

// ============================================================================
// BASE HOOK TYPES
// ============================================================================

export interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export interface UseDataOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

// ============================================================================
// CHART DATA HOOK
// ============================================================================

export interface UseChartDataOptions extends UseDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useChartData(
  symbol: string, 
  timePeriod: string, 
  options: UseChartDataOptions = {}
): UseDataState<ChartDataPoint[]> & {
  refetch: () => Promise<void>;
  clearCache: () => void;
} {
  const [state, setState] = useState<UseDataState<ChartDataPoint[]>>({
    data: null,
    loading: true,
    error: null,
    lastUpdate: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { enabled = true, autoRefresh = false, refreshInterval = 30000 } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await tradingDataService.getChartData(symbol, timePeriod);
      setState({
        data,
        loading: false,
        error: null,
        lastUpdate: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chart data'
      }));
    }
  }, [symbol, timePeriod, enabled]);

  const clearCache = useCallback(() => {
    tradingDataService.clearCache();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && enabled) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, enabled, fetchData, refreshInterval]);

  return {
    ...state,
    refetch: fetchData,
    clearCache
  };
}

// ============================================================================
// PRICE QUOTE HOOK
// ============================================================================

export function useCurrentPrice(
  symbol: string,
  options: UseDataOptions = {}
): UseDataState<PriceQuote> & {
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<UseDataState<PriceQuote>>({
    data: null,
    loading: true,
    error: null,
    lastUpdate: null
  });

  const { enabled = true, refetchInterval = 30000 } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await tradingDataService.getCurrentPrice(symbol);
      setState({
        data,
        loading: false,
        error: null,
        lastUpdate: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch current price'
      }));
    }
  }, [symbol, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
}

// ============================================================================
// TECHNICAL INDICATORS HOOK
// ============================================================================

export function useTechnicalIndicators(
  symbol: string,
  options: UseDataOptions = {}
): UseDataState<TechnicalIndicator[]> & {
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<UseDataState<TechnicalIndicator[]>>({
    data: null,
    loading: true,
    error: null,
    lastUpdate: null
  });

  const { enabled = true, refetchInterval = 300000 } = options; // 5 minutes default

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await tradingDataService.getTechnicalIndicators(symbol);
      setState({
        data,
        loading: false,
        error: null,
        lastUpdate: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch technical indicators'
      }));
    }
  }, [symbol, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
}

// ============================================================================
// TECHNICAL ANALYSIS SUMMARY HOOK
// ============================================================================

export function useTechnicalAnalysisSummary(
  symbol: string,
  options: UseDataOptions = {}
): UseDataState<TechnicalAnalysisSummary> & {
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<UseDataState<TechnicalAnalysisSummary>>({
    data: null,
    loading: true,
    error: null,
    lastUpdate: null
  });

  const { enabled = true, refetchInterval = 300000 } = options; // 5 minutes default

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await tradingDataService.getTechnicalAnalysisSummary(symbol);
      setState({
        data,
        loading: false,
        error: null,
        lastUpdate: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch technical analysis summary'
      }));
    }
  }, [symbol, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, fetchData]);

  return {
    ...state,
    refetch: fetchData
  };
}

export interface UseTradingDataOptions {
  chart?: UseChartDataOptions;
  price?: UseDataOptions;
  indicators?: UseDataOptions;
  summary?: UseDataOptions;
}

export function useTradingData(
  symbol: string,
  timePeriod: string,
  options: UseTradingDataOptions = {}
) {
  const chartData = useChartData(symbol, timePeriod, {
    autoRefresh: true,
    refreshInterval: timePeriod === '1D' ? 30000 : timePeriod === '1W' ? 60000 : 300000,
    ...options.chart
  });

  const currentPrice = useCurrentPrice(symbol, {
    refetchInterval: 30000, // 30 seconds
    ...options.price
  });

  const technicalIndicators = useTechnicalIndicators(symbol, {
    refetchInterval: 300000, // 5 minutes
    ...options.indicators
  });

  const technicalAnalysisSummary = useTechnicalAnalysisSummary(symbol, {
    refetchInterval: 300000, // 5 minutes
    ...options.summary
  });

  return {
    chartData,
    currentPrice,
    technicalIndicators,
    technicalAnalysisSummary,
    isLoading: chartData.loading || currentPrice.loading || technicalIndicators.loading || technicalAnalysisSummary.loading,
    hasError: !!(chartData.error || currentPrice.error || technicalIndicators.error || technicalAnalysisSummary.error),
    refetchAll: async () => {
      await Promise.all([
        chartData.refetch(),
        currentPrice.refetch(),
        technicalIndicators.refetch(),
        technicalAnalysisSummary.refetch()
      ]);
    }
  };
}

// ============================================================================
// SUPABASE REALTIME HOOKS
// ============================================================================

export interface RealtimeBar {
  symbol: string;
  interval: string;
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted: boolean;
  data_version: number;
}

export interface RealtimeStatus {
  ok: boolean;
  msg: string;
  timestamp: string;
}

export function useRealtimeBars(symbol: string = 'TSLA') {
  const [latestBar, setLatestBar] = useState<RealtimeBar | null>(null);
  const [status, setStatus] = useState<RealtimeStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Create Supabase Realtime channel
    const channel = supabase.channel(`bars:${symbol}`, {
      config: {
        broadcast: { self: false },
        presence: { key: 'realtime-bars' }
      }
    });

    // Handle new bar events
    channel.on('broadcast', { event: 'bar' }, (payload) => {
      setLatestBar(payload.payload);
      setError(null);
    });

    // Handle status events
    channel.on('broadcast', { event: 'status' }, (payload) => {
      setStatus(payload.payload);
      if (payload.payload.ok) {
        setError(null);
      } else {
        setError(payload.payload.msg);
      }
    });

    // Handle heartbeat events
    channel.on('broadcast', { event: 'heartbeat' }, () => {
      setIsConnected(true);
    });

    // Handle connection status
    channel.on('system', {}, (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setError(null);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false);
        setError('Connection lost');
      }
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
      }
    });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [symbol]);

  return {
    latestBar,
    status,
    isConnected,
    error,
    reconnect: () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        // Channel will be recreated by useEffect
      }
    }
  };
}

export function useHistoricalBars(
  symbol: string,
  interval: '1m' | '15m' | '60m' | '1d',
  from?: string,
  to?: string,
  limit: number = 5000
) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        symbol,
        interval,
        limit: limit.toString()
      });

      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await fetch(`/api/tsla/price?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch historical data');
      }

      // Convert API response to chart data format
      const chartData: ChartDataPoint[] = result.bars.map((bar: any) => ({
        time: new Date(bar.ts).getTime() / 1000,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume
      }));

      setData(chartData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, from, to, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch: fetchData
  };
}

export function useChartEvents(
  symbol: string,
  from?: string,
  to?: string,
  eventType?: string
) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ symbol });
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (eventType) params.append('event_type', eventType);

      const response = await fetch(`/api/tsla/events?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch events');
      }

      setEvents(result.events);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [symbol, from, to, eventType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    lastUpdate,
    refetch: fetchEvents
  };
}

/**
 * Hook for managing auto-sync state
 */
export function useAutoSync(initialState: boolean = true) {
  const [isAutoSync, setIsAutoSync] = useState(initialState);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const toggleAutoSync = useCallback(() => {
    setIsAutoSync(prev => !prev);
  }, []);

  const updateLastSync = useCallback(() => {
    setLastSync(new Date());
  }, []);

  return {
    isAutoSync,
    lastSync,
    toggleAutoSync,
    updateLastSync
  };
}

/**
 * Hook for managing chart time periods
 */
export type TimePeriod = '1d' | '15m' | '60m' | '1m';

export function useTimePeriod(initialPeriod: TimePeriod = '1d') {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(initialPeriod);

  const changePeriod = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period);
  }, []);

  return {
    selectedPeriod,
    changePeriod,
    availablePeriods: ['1d', '60m', '15m', '1m'] as TimePeriod[]
  };
}
