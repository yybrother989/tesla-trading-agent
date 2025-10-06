/**
 * Data Pipeline Architecture
 * 
 * This follows industry best practices for data management:
 * 1. Data Layer: Raw API calls and data fetching
 * 2. Transformation Layer: Data processing and normalization
 * 3. State Management: Caching and state handling
 * 4. Hooks Layer: React-specific data access
 * 5. Components: Pure presentation layer
 */

// ============================================================================
// 1. DATA LAYER - Raw API calls and external data sources
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface DataSource {
  fetch<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>>;
  getIntradayData(symbol: string, interval: string): Promise<ApiResponse<any>>;
  getDailyData(symbol: string): Promise<ApiResponse<any>>;
  getQuote(symbol: string): Promise<ApiResponse<any>>;
  getTechnicalIndicator(symbol: string, indicator: string, params: Record<string, any>): Promise<ApiResponse<any>>;
}

/**
 * Alpha Vantage Data Source
 * Handles all communication with Alpha Vantage API
 */
export class AlphaVantageDataSource implements DataSource {
  private baseUrl = '/api/alpha-vantage';

  async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<ApiResponse<T>> {
    try {
      const url = new URL(this.baseUrl, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      throw error;
    }
  }

  // Specific methods for different data types
  async getIntradayData(symbol: string, interval: string) {
    return this.fetch('', { function: 'intraday', symbol, interval });
  }

  async getDailyData(symbol: string) {
    return this.fetch('', { function: 'daily', symbol });
  }

  async getQuote(symbol: string) {
    return this.fetch('', { function: 'quote', symbol });
  }

  async getTechnicalIndicator(symbol: string, indicator: string, params: Record<string, string> = {}) {
    return this.fetch('', { 
      function: indicator, 
      symbol, 
      ...params 
    });
  }

  async getFundamentalData(symbol: string, type: string) {
    return this.fetch('', { function: type, symbol });
  }
}

// ============================================================================
// 2. TRANSFORMATION LAYER - Data processing and normalization
// ============================================================================

export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: Date;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  timestamp: Date;
  description?: string;
  category: 'momentum' | 'trend' | 'volatility' | 'volume';
  confidence: number; // 0-100
  historicalData?: number[];
  metadata?: Record<string, any>;
}

export interface TechnicalAnalysisSummary {
  overallSignal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  confidence: number;
  bullishSignals: number;
  bearishSignals: number;
  neutralSignals: number;
  lastUpdated: Date;
  recommendations: string[];
}

/**
 * Data Transformers
 * Convert raw API responses into normalized data structures
 */
export class DataTransformer {
  static transformTimeSeriesData(rawData: any, timePeriod: string): ChartDataPoint[] {
    if (!rawData) return [];

    // Handle different time series formats
    const timeSeries = rawData['Time Series (5min)'] || 
                      rawData['Time Series (15min)'] || 
                      rawData['Time Series (30min)'] || 
                      rawData['Time Series (60min)'] || 
                      rawData['Time Series (Intraday)'] || 
                      rawData['Time Series (Daily)'];

    if (!timeSeries) return [];

    let data: ChartDataPoint[] = [];
    
    if (timePeriod === '1m' || timePeriod === '15m') {
      // For intraday data, take the most recent data points
      const dataPoints = timePeriod === '1m' ? 100 : 200;
      data = Object.entries(timeSeries)
        .slice(0, dataPoints)
        .map(([time, values]: [string, any]) => ({
          time: new Date(time).getTime() / 1000,
          open: parseFloat(values['1. open'] || '0'),
          high: parseFloat(values['2. high'] || '0'),
          low: parseFloat(values['3. low'] || '0'),
          close: parseFloat(values['4. close'] || '0'),
          volume: parseFloat(values['5. volume'] || '0'),
        }))
        .sort((a, b) => a.time - b.time);
    } else {
      // For daily data, use date filtering
      const now = new Date();
      const getDateRange = (period: string) => {
        switch (period) {
          case '1M': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          case '3M': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          case '1Y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      };

      const startDate = getDateRange(timePeriod);
      
      data = Object.entries(timeSeries)
        .filter(([time]) => {
          const dataDate = new Date(time);
          return dataDate >= startDate && dataDate <= now;
        })
        .map(([time, values]: [string, any]) => ({
          time: new Date(time).getTime() / 1000,
          open: parseFloat(values['1. open'] || '0'),
          high: parseFloat(values['2. high'] || '0'),
          low: parseFloat(values['3. low'] || '0'),
          close: parseFloat(values['4. close'] || '0'),
          volume: parseFloat(values['5. volume'] || '0'),
        }))
        .sort((a, b) => a.time - b.time);
    }

    return data;
  }

  static transformQuoteData(rawData: any): PriceQuote | null {
    if (!rawData || !rawData['Global Quote']) return null;

    const quote = rawData['Global Quote'];
    return {
      symbol: quote['01. symbol'] || '',
      price: parseFloat(quote['05. price'] || '0'),
      change: parseFloat(quote['09. change'] || '0'),
      changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
      lastUpdate: new Date()
    };
  }

  static transformTechnicalIndicator(rawData: any, indicatorName: string): TechnicalIndicator[] {
    if (!rawData) return [];

    const indicatorKey = Object.keys(rawData).find(key => 
      key.includes('Technical Analysis') && key.includes(indicatorName)
    );

    if (!indicatorKey || !rawData[indicatorKey]) return [];

    const indicatorData = rawData[indicatorKey];
    const entries = Object.entries(indicatorData);
    
    if (entries.length === 0) return [];

    const [latestTimestamp, latestValues] = entries[0] as [string, any];
    const value = parseFloat(latestValues[`${indicatorName}`] || '0');
    
    // Enhanced signal logic with confidence scoring
    const { signal, confidence, description, category } = this.analyzeIndicatorSignal(indicatorName, value, latestValues);
    
    // Get historical data for trend analysis
    const historicalData = entries.slice(0, 10).map(([_, values]: [string, any]) => 
      parseFloat(values[`${indicatorName}`] || '0')
    ).reverse();

    return [{
      name: indicatorName,
      value,
      signal,
      timestamp: new Date(latestTimestamp),
      description,
      category,
      confidence,
      historicalData,
      metadata: {
        rawValues: latestValues,
        dataPoints: entries.length
      }
    }];
  }

  private static analyzeIndicatorSignal(indicatorName: string, value: number, values: any): {
    signal: 'buy' | 'sell' | 'neutral';
    confidence: number;
    description: string;
    category: 'momentum' | 'trend' | 'volatility' | 'volume';
  } {
    switch (indicatorName.toUpperCase()) {
      case 'RSI':
        return this.analyzeRSI(value);
      case 'MACD':
        return this.analyzeMACD(value, values);
      case 'SMA':
        return this.analyzeSMA(value);
      case 'EMA':
        return this.analyzeEMA(value);
      case 'BBANDS':
        return this.analyzeBollingerBands(value, values);
      default:
        return {
          signal: 'neutral',
          confidence: 50,
          description: `${indicatorName} indicator`,
          category: 'trend'
        };
    }
  }

  private static analyzeRSI(value: number): {
    signal: 'buy' | 'sell' | 'neutral';
    confidence: number;
    description: string;
    category: 'momentum';
  } {
    if (value > 70) {
      return {
        signal: 'sell',
        confidence: Math.min(95, 50 + (value - 70) * 2),
        description: 'Overbought conditions - potential reversal',
        category: 'momentum'
      };
    } else if (value < 30) {
      return {
        signal: 'buy',
        confidence: Math.min(95, 50 + (30 - value) * 2),
        description: 'Oversold conditions - potential bounce',
        category: 'momentum'
      };
    } else {
      return {
        signal: 'neutral',
        confidence: 60,
        description: 'Neutral momentum - no extreme conditions',
        category: 'momentum'
      };
    }
  }

  private static analyzeMACD(value: number, values: any): {
    signal: 'buy' | 'sell' | 'neutral';
    confidence: number;
    description: string;
    category: 'trend';
  } {
    const macd = parseFloat(values['MACD'] || '0');
    const signal = parseFloat(values['MACD_Signal'] || '0');
    const histogram = parseFloat(values['MACD_Hist'] || '0');
    
    if (macd > signal && histogram > 0) {
      return {
        signal: 'buy',
        confidence: Math.min(90, 60 + Math.abs(histogram) * 10),
        description: 'Bullish crossover with positive momentum',
        category: 'trend'
      };
    } else if (macd < signal && histogram < 0) {
      return {
        signal: 'sell',
        confidence: Math.min(90, 60 + Math.abs(histogram) * 10),
        description: 'Bearish crossover with negative momentum',
        category: 'trend'
      };
    } else {
      return {
        signal: 'neutral',
        confidence: 50,
        description: 'MACD signals mixed - trend unclear',
        category: 'trend'
      };
    }
  }

  private static analyzeSMA(value: number): {
    signal: 'buy' | 'sell' | 'neutral';
    confidence: number;
    description: string;
    category: 'trend';
  } {
    return {
      signal: 'neutral',
      confidence: 70,
      description: `Simple Moving Average: $${value.toFixed(2)}`,
      category: 'trend'
    };
  }

  private static analyzeEMA(value: number): {
    signal: 'buy' | 'sell' | 'neutral';
    confidence: number;
    description: string;
    category: 'trend';
  } {
    return {
      signal: 'neutral',
      confidence: 70,
      description: `Exponential Moving Average: $${value.toFixed(2)}`,
      category: 'trend'
    };
  }

  private static analyzeBollingerBands(value: number, values: any): {
    signal: 'buy' | 'sell' | 'neutral';
    confidence: number;
    description: string;
    category: 'volatility';
  } {
    const upper = parseFloat(values['Real Upper Band'] || '0');
    const lower = parseFloat(values['Real Lower Band'] || '0');
    const middle = parseFloat(values['Real Middle Band'] || '0');
    
    if (value > upper) {
      return {
        signal: 'sell',
        confidence: 80,
        description: 'Price above upper Bollinger Band - overbought',
        category: 'volatility'
      };
    } else if (value < lower) {
      return {
        signal: 'buy',
        confidence: 80,
        description: 'Price below lower Bollinger Band - oversold',
        category: 'volatility'
      };
    } else {
      return {
        signal: 'neutral',
        confidence: 60,
        description: 'Price within Bollinger Bands - normal volatility',
        category: 'volatility'
      };
    }
  }

  static generateTechnicalAnalysisSummary(indicators: TechnicalIndicator[]): TechnicalAnalysisSummary {
    const bullishSignals = indicators.filter(i => i.signal === 'buy').length;
    const bearishSignals = indicators.filter(i => i.signal === 'sell').length;
    const neutralSignals = indicators.filter(i => i.signal === 'neutral').length;
    
    const totalSignals = indicators.length;
    const bullishRatio = bullishSignals / totalSignals;
    const bearishRatio = bearishSignals / totalSignals;
    
    let overallSignal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
    let confidence: number;
    
    if (bullishRatio >= 0.7) {
      overallSignal = bullishRatio >= 0.9 ? 'strong_buy' : 'buy';
      confidence = Math.min(95, 60 + bullishRatio * 30);
    } else if (bearishRatio >= 0.7) {
      overallSignal = bearishRatio >= 0.9 ? 'strong_sell' : 'sell';
      confidence = Math.min(95, 60 + bearishRatio * 30);
    } else {
      overallSignal = 'neutral';
      confidence = 50;
    }
    
    const recommendations = this.generateRecommendations(indicators, overallSignal);
    
    return {
      overallSignal,
      confidence,
      bullishSignals,
      bearishSignals,
      neutralSignals,
      lastUpdated: new Date(),
      recommendations
    };
  }

  private static generateRecommendations(indicators: TechnicalIndicator[], signal: string): string[] {
    const recommendations: string[] = [];
    
    const momentumIndicators = indicators.filter(i => i.category === 'momentum');
    const trendIndicators = indicators.filter(i => i.category === 'trend');
    const volatilityIndicators = indicators.filter(i => i.category === 'volatility');
    
    if (momentumIndicators.length > 0) {
      const avgMomentumConfidence = momentumIndicators.reduce((sum, i) => sum + i.confidence, 0) / momentumIndicators.length;
      if (avgMomentumConfidence > 70) {
        recommendations.push('Strong momentum signals detected');
      }
    }
    
    if (trendIndicators.length > 0) {
      const avgTrendConfidence = trendIndicators.reduce((sum, i) => sum + i.confidence, 0) / trendIndicators.length;
      if (avgTrendConfidence > 70) {
        recommendations.push('Trend indicators align with current direction');
      }
    }
    
    if (volatilityIndicators.length > 0) {
      const avgVolatilityConfidence = volatilityIndicators.reduce((sum, i) => sum + i.confidence, 0) / volatilityIndicators.length;
      if (avgVolatilityConfidence > 70) {
        recommendations.push('Volatility indicators suggest significant price movement');
      }
    }
    
    if (signal.includes('buy')) {
      recommendations.push('Consider entry points on pullbacks');
    } else if (signal.includes('sell')) {
      recommendations.push('Consider taking profits or reducing position');
    } else {
      recommendations.push('Wait for clearer signals before making decisions');
    }
    
    return recommendations;
  }
}

// ============================================================================
// 3. STATE MANAGEMENT - Caching and state handling
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  private isExpired(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }
}

// ============================================================================
// 4. DATA SERVICE LAYER - Business logic and orchestration
// ============================================================================

export class TradingDataService {
  private dataSource: DataSource;
  private cache: DataCache;
  private transformers: DataTransformer;

  constructor(dataSource: DataSource = new AlphaVantageDataSource()) {
    this.dataSource = dataSource;
    this.cache = new DataCache();
    this.transformers = DataTransformer;
  }

  async getChartData(symbol: string, timePeriod: string): Promise<ChartDataPoint[]> {
    const cacheKey = `chart-${symbol}-${timePeriod}`;
    const cached = this.cache.get<ChartDataPoint[]>(cacheKey);
    if (cached) return cached;

    try {
      let response;
      switch (timePeriod) {
        case '1m':
          response = await this.dataSource.getIntradayData(symbol, '1min');
          break;
        case '15m':
          response = await this.dataSource.getIntradayData(symbol, '15min');
          break;
        case '60m':
          response = await this.dataSource.getIntradayData(symbol, '60min');
          break;
        case '1d':
          response = await this.dataSource.getDailyData(symbol);
          break;
        default:
          response = await this.dataSource.getDailyData(symbol);
      }

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch chart data');
      }

      const transformedData = DataTransformer.transformTimeSeriesData(response.data, timePeriod);
      
      // Cache for different durations based on time period
      const cacheTTL = timePeriod === '1m' ? 30000 : timePeriod === '15m' ? 60000 : 300000;
      this.cache.set(cacheKey, transformedData, cacheTTL);

      return transformedData;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }

  async getCurrentPrice(symbol: string): Promise<PriceQuote | null> {
    const cacheKey = `quote-${symbol}`;
    const cached = this.cache.get<PriceQuote>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.dataSource.getQuote(symbol);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch quote');
      }

      const transformedData = DataTransformer.transformQuoteData(response.data);
      
      // Cache quotes for 30 seconds
      this.cache.set(cacheKey, transformedData, 30000);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching current price:', error);
      return null;
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    const cacheKey = `indicators-${symbol}`;
    const cached = this.cache.get<TechnicalIndicator[]>(cacheKey);
    if (cached) return cached;

    try {
      const indicators = [
        { name: 'RSI', params: { time_period: '14' } },
        { name: 'MACD', params: {} },
        { name: 'SMA', params: { time_period: '50' } },
        { name: 'EMA', params: { time_period: '50' } },
        { name: 'BBANDS', params: { time_period: '20' } }
      ];
      
      const promises = indicators.map(indicator => 
        this.dataSource.getTechnicalIndicator(symbol, indicator.name.toLowerCase(), indicator.params)
      );

      const responses = await Promise.all(promises);
      const allIndicators: TechnicalIndicator[] = [];

      responses.forEach((response, index) => {
        if (response.success && response.data) {
          const transformed = DataTransformer.transformTechnicalIndicator(response.data, indicators[index].name);
          allIndicators.push(...transformed);
        }
      });

      // Cache indicators for 5 minutes
      this.cache.set(cacheKey, allIndicators, 300000);
      
      return allIndicators;
    } catch (error) {
      console.error('Error fetching technical indicators:', error);
      return [];
    }
  }

  async getTechnicalAnalysisSummary(symbol: string): Promise<TechnicalAnalysisSummary> {
    const cacheKey = `analysis-summary-${symbol}`;
    const cached = this.cache.get<TechnicalAnalysisSummary>(cacheKey);
    if (cached) return cached;

    try {
      const indicators = await this.getTechnicalIndicators(symbol);
      const summary = DataTransformer.generateTechnicalAnalysisSummary(indicators);
      
      // Cache summary for 5 minutes
      this.cache.set(cacheKey, summary, 300000);
      
      return summary;
    } catch (error) {
      console.error('Error generating technical analysis summary:', error);
      return {
        overallSignal: 'neutral',
        confidence: 0,
        bullishSignals: 0,
        bearishSignals: 0,
        neutralSignals: 0,
        lastUpdated: new Date(),
        recommendations: ['Unable to generate analysis']
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// 5. SINGLETON INSTANCE
// ============================================================================

export const tradingDataService = new TradingDataService();
