/**
 * Supabase Price Service - Option 1 Implementation
 * 
 * Hybrid approach using:
 * - prices_1m: rolling 30 trading days of 1-minute bars
 * - prices_daily: 5 years of daily adjusted bars
 * - mv_prices_15m/60m/1d: materialized views for aggregates
 */

import { createServiceClient } from '../../lib/supabase/server';
import { getAlphaVantageService } from '../alphaVantageService';

export interface PriceBar {
  symbol: string;
  ts: string; // ISO timestamp
  interval: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted: boolean;
  data_version: number;
  ingested_at?: string;
}

export interface PriceQueryParams {
  symbol: string;
  interval: '1m' | '15m' | '60m' | '1d';
  from?: string;
  to?: string;
  limit?: number;
}

export class SupabasePriceService {
  private supabase;
  private alphaVantage;

  constructor() {
    this.supabase = createServiceClient();
    this.alphaVantage = getAlphaVantageService();
  }

  /**
   * Backfills 5 years of daily adjusted data from Alpha Vantage into prices_daily table.
   */
  async backfillDaily5Year(symbol: string): Promise<void> {
    console.log(`Starting 5-year daily backfill for ${symbol}...`);
    try {
      const response = await this.alphaVantage.getDailyData(symbol);

      if (!response || !response['Time Series (Daily)']) {
        console.error('Failed to fetch 5-year daily data from Alpha Vantage: No time series data');
        return;
      }

      const timeSeries = response['Time Series (Daily)'];
      if (!timeSeries) {
        console.error('No daily time series data found for backfill.');
        return;
      }

      const bars: any[] = Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
        symbol,
        ts: new Date(timestamp).toISOString().split('T')[0], // Date only
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['6. volume']),
        adjusted: true,
        data_version: 1,
      }));

      // Insert in batches to avoid hitting Supabase limits
      const batchSize = 1000;
      for (let i = 0; i < bars.length; i += batchSize) {
        const batch = bars.slice(i, i + batchSize);
        const { error } = await this.supabase.from('prices_daily').upsert(batch, { onConflict: 'symbol, d' });
        if (error) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        } else {
          console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} records) for ${symbol}.`);
        }
      }
      console.log(`Successfully backfilled ${bars.length} daily records for ${symbol}.`);
    } catch (error) {
      console.error(`Error during 5-year daily backfill for ${symbol}:`, error);
    }
  }

  /**
   * Fetches the latest bar for a given symbol and interval from Alpha Vantage.
   */
  async fetchLatestBar(symbol: string, interval: '1m' | '15m' | '60m' | '1d'): Promise<PriceBar | null> {
    try {
      let response;

      if (interval === '1d') {
        response = await this.alphaVantage.getDailyData(symbol);
      } else {
        const alphaVantageInterval = interval === '1m' ? '1min' :
                                    interval === '15m' ? '15min' :
                                    interval === '60m' ? '60min' : '1min';
        response = await this.alphaVantage.getIntradayData(symbol, alphaVantageInterval as any);
      }

      if (!response) {
        throw new Error('Failed to fetch latest bar from Alpha Vantage');
      }

      const timeSeriesKey = Object.keys(response).find(key => key.startsWith('Time Series'));
      if (!timeSeriesKey) {
        throw new Error('No time series data found in Alpha Vantage response');
      }

      const timeSeries = (response as any)[timeSeriesKey];
      const latestEntry = Object.entries(timeSeries)[0];
      if (!latestEntry) {
        throw new Error('No data entries found');
      }

      const [timestamp, values] = latestEntry;
      const valuesData = values as any;

      return {
        symbol,
        ts: new Date(timestamp).toISOString(),
        interval,
        open: parseFloat(valuesData['1. open']),
        high: parseFloat(valuesData['2. high']),
        low: parseFloat(valuesData['3. low']),
        close: parseFloat(valuesData['4. close']),
        volume: parseInt(valuesData['5. volume']),
        adjusted: true,
        data_version: 1
      };

    } catch (error) {
      console.error(`Error fetching latest bar for ${symbol} ${interval}:`, error);
      return null;
    }
  }

  /**
   * Upsert a price bar to the appropriate table
   */
  async upsertBar(bar: PriceBar): Promise<boolean> {
    try {
      let tableName: string;
      let conflictColumns: string;

      if (bar.interval === '1d') {
        tableName = 'prices_daily';
        conflictColumns = 'symbol,ts';
        // Convert ts to date for daily table
        const dailyBar = {
          ...bar,
          ts: new Date(bar.ts).toISOString().split('T')[0]
        };
        delete (dailyBar as any).interval;
        
        const { error } = await this.supabase
          .from(tableName)
          .upsert(dailyBar, { onConflict: conflictColumns });
        
        if (error) {
          console.error('Error upserting daily bar:', error);
          return false;
        }
      } else {
        tableName = 'prices_1m';
        conflictColumns = 'symbol,ts';
        
        const { error } = await this.supabase
          .from(tableName)
          .upsert(bar, { onConflict: conflictColumns });
        
        if (error) {
          console.error('Error upserting 1m bar:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error upserting bar:', error);
      return false;
    }
  }

  /**
   * Get bars with smart routing between tables and materialized views
   * Following Option 1 strategy:
   * - 1m → prices_1m
   * - 15m → mv_prices_15m
   * - 60m → mv_prices_60m
   * - 1d → prices_daily (preferred) or mv_prices_1d (fallback)
   */
  async getBars(params: PriceQueryParams): Promise<PriceBar[]> {
    const { symbol, interval, from, to, limit = 5000 } = params;

    try {
      let query;
      const selectColumns = 'symbol, ts, open, high, low, close, volume, data_version';

      // Smart routing based on interval
      if (interval === '1m') {
        query = this.supabase.from('prices_1m').select(selectColumns);
        query = query.eq('symbol', symbol).order('ts', { ascending: false });
        if (from) query = query.gte('ts', from);
        if (to) query = query.lte('ts', to);
        query = query.limit(limit);
      } else if (interval === '15m') {
        query = this.supabase.from('mv_prices_15m').select('bucket as ts, symbol, open, high, low, close, volume, data_version');
        query = query.eq('symbol', symbol).order('bucket', { ascending: false });
        if (from) query = query.gte('bucket', from);
        if (to) query = query.lte('bucket', to);
        query = query.limit(limit);
      } else if (interval === '60m') {
        query = this.supabase.from('mv_prices_60m').select('bucket as ts, symbol, open, high, low, close, volume, data_version');
        query = query.eq('symbol', symbol).order('bucket', { ascending: false });
        if (from) query = query.gte('bucket', from);
        if (to) query = query.lte('bucket', to);
        query = query.limit(limit);
      } else if (interval === '1d') {
        // Prefer prices_daily, fallback to mv_prices_1d if needed
        query = this.supabase.from('prices_daily').select('ts, symbol, open, high, low, close, volume, data_version');
        query = query.eq('symbol', symbol).order('ts', { ascending: false });
        if (from) query = query.gte('ts', from);
        if (to) query = query.lte('ts', to);
        query = query.limit(limit);
      } else {
        throw new Error(`Unsupported interval: ${interval}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error querying bars:', error);
        return [];
      }

      // Transform the data to ensure consistent format
      return (data || []).map((row: any) => ({
        symbol: row.symbol,
        ts: row.ts,
        interval,
        open: parseFloat(row.open),
        high: parseFloat(row.high),
        low: parseFloat(row.low),
        close: parseFloat(row.close),
        volume: parseInt(row.volume),
        adjusted: true,
        data_version: row.data_version
      }));

    } catch (error) {
      console.error('Error getting bars:', error);
      return [];
    }
  }

  /**
   * Refresh materialized views manually (for testing or emergency refresh)
   */
  async refreshAggregates(): Promise<void> {
    try {
      await this.supabase.rpc('refresh_price_aggregates');
      console.log('Successfully refreshed all price aggregates');
    } catch (error) {
      console.error('Error refreshing aggregates:', error);
    }
  }
}

export const supabasePriceService = new SupabasePriceService();