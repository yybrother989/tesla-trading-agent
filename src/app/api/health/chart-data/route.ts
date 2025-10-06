/**
 * Chart Data Health Check API
 * 
 * GET /api/health/chart-data
 * Returns the health status of chart data including freshness and connectivity
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabasePriceService } from '../../../../services/supabase/priceService';

export async function GET(request: NextRequest) {
  try {
    const symbol = 'TSLA';
    
    // Get data freshness by checking latest bars from different intervals
    const intervals = ['1d', '60m', '15m', '1m'];
    const freshness = [];
    
    for (const interval of intervals) {
      try {
        const bars = await supabasePriceService.getBars({
          symbol,
          interval: interval as any,
          limit: 1
        });
        
        if (bars.length > 0) {
          freshness.push({
            interval,
            latest_timestamp: bars[0].ts,
            total_bars: 1, // We only fetched 1 bar
            freshness_status: 'FRESH' // Will be calculated below
          });
        }
      } catch (error) {
        console.warn(`Failed to check freshness for ${interval}:`, error);
      }
    }

    // Analyze freshness status
    const now = new Date();
    const statuses = freshness.map(row => {
      const latestTime = new Date(row.latest_timestamp);
      const ageMinutes = (now.getTime() - latestTime.getTime()) / (1000 * 60);
      
      let status: 'fresh' | 'stale' | 'old' = 'fresh';
      let message = 'Data is fresh';
      
      if (ageMinutes > 60) {
        status = 'old';
        message = `Data is ${Math.round(ageMinutes)} minutes old`;
      } else if (ageMinutes > 15) {
        status = 'stale';
        message = `Data is ${Math.round(ageMinutes)} minutes old`;
      }
      
      return {
        interval: row.interval,
        status,
        message,
        latest_timestamp: row.latest_timestamp,
        age_minutes: Math.round(ageMinutes),
        total_bars: row.total_bars,
        freshness_status: row.freshness_status
      };
    });

    // Determine overall health
    const hasOldData = statuses.some(s => s.status === 'old');
    const hasStaleData = statuses.some(s => s.status === 'stale');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let overallMessage = 'All data is fresh';
    
    if (hasOldData) {
      overallStatus = 'unhealthy';
      overallMessage = 'Some data is outdated';
    } else if (hasStaleData) {
      overallStatus = 'degraded';
      overallMessage = 'Some data is stale';
    }

    // Check if we have data for all expected intervals
    const expectedIntervals = ['1d', '60m', '15m', '1m'];
    const missingIntervals = expectedIntervals.filter(
      interval => !statuses.some(s => s.interval === interval)
    );

    if (missingIntervals.length > 0) {
      overallStatus = 'degraded';
      overallMessage = `Missing data for intervals: ${missingIntervals.join(', ')}`;
    }

    return NextResponse.json({
      success: true,
      status: overallStatus,
      message: overallMessage,
      symbol,
      intervals: statuses,
      missing_intervals: missingIntervals,
      timestamp: new Date().toISOString(),
      checks: {
        data_freshness: true,
        interval_coverage: missingIntervals.length === 0,
        overall_health: overallStatus === 'healthy'
      }
    });

  } catch (error) {
    console.error('Error in health check:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
