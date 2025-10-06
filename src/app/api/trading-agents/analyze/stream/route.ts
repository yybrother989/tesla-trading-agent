import { NextRequest } from 'next/server';

const TRADINGAGENTS_API_URL = process.env.TRADINGAGENTS_API_URL || 'http://localhost:8000';

/**
 * Proxy endpoint for TradingAgents SSE streaming analysis API
 * GET /api/trading-agents/analyze/stream?ticker=TSLA&date=2024-10-31
 * 
 * This route proxies Server-Sent Events (SSE) from the TradingAgents backend
 * to the frontend, enabling real-time progressive report updates.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const date = searchParams.get('date');
  const configParam = searchParams.get('config');

  if (!ticker || !date) {
    return new Response(
      JSON.stringify({ error: 'ticker and date query parameters are required' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    // Build backend URL with query parameters
    const backendParams = new URLSearchParams({
      ticker,
      date,
    });

    if (configParam) {
      backendParams.append('config', configParam);
    }

    const backendUrl = `${TRADINGAGENTS_API_URL}/api/v1/analyze/stream?${backendParams.toString()}`;

    // Forward the SSE stream from backend to frontend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to start streaming analysis',
          detail: response.statusText 
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Return the SSE stream with proper headers
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('TradingAgents streaming error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        detail: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
}

