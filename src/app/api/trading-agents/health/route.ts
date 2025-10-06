import { NextRequest, NextResponse } from 'next/server';

const TRADINGAGENTS_API_URL = process.env.TRADINGAGENTS_API_URL || 'http://localhost:8000';

/**
 * Proxy endpoint for TradingAgents health check API
 * GET /api/trading-agents/health
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${TRADINGAGENTS_API_URL}/api/v1/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Health check failed',
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('TradingAgents health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

