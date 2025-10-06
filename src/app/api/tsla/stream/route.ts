/**
 * TSLA Streaming API Route (SSE)
 * 
 * GET /api/tsla/stream
 * Server-Sent Events endpoint that bridges Supabase Realtime to HTTP stream
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const supabase = createServiceClient();
      
      // Send initial connection message
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      };

      // Send connection established message
      sendEvent('status', {
        ok: true,
        msg: 'Connected to TSLA price stream',
        timestamp: new Date().toISOString()
      });

      // Subscribe to Supabase Realtime channel
      const channel = supabase.channel('bars:TSLA', {
        config: {
          broadcast: { self: false },
          presence: { key: 'tsla-stream' }
        }
      });

      // Handle new bar events
      channel.on('broadcast', { event: 'bar' }, (payload) => {
        sendEvent('bar', {
          ...payload.payload,
          timestamp: new Date().toISOString()
        });
      });

      // Handle status events
      channel.on('broadcast', { event: 'status' }, (payload) => {
        sendEvent('status', {
          ...payload.payload,
          timestamp: new Date().toISOString()
        });
      });

      // Handle connection errors
      channel.on('system', {}, (status) => {
        if (status === 'CLOSED') {
          sendEvent('status', {
            ok: false,
            msg: 'Connection closed',
            timestamp: new Date().toISOString()
          });
        } else if (status === 'CHANNEL_ERROR') {
          sendEvent('status', {
            ok: false,
            msg: 'Channel error',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Subscribe to the channel
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          sendEvent('status', {
            ok: true,
            msg: 'Subscribed to TSLA price updates',
            timestamp: new Date().toISOString()
          });
        } else if (status === 'CHANNEL_ERROR') {
          sendEvent('status', {
            ok: false,
            msg: 'Failed to subscribe to channel',
            timestamp: new Date().toISOString()
          });
        }
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        channel.unsubscribe();
        controller.close();
      });

      // Send periodic heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        sendEvent('heartbeat', {
          timestamp: new Date().toISOString()
        });
      }, 30000); // Every 30 seconds

      // Cleanup on close
      const cleanup = () => {
        clearInterval(heartbeat);
        channel.unsubscribe();
      };

      // Handle stream close
      const originalClose = controller.close.bind(controller);
      controller.close = () => {
        cleanup();
        originalClose();
      };
    }
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    },
  });
}
