/**
 * Supabase Event Service
 * 
 * Handles all event/annotation operations for chart overlays
 */

import { createServiceClient } from '../../lib/supabase/server';

export interface ChartEvent {
  id?: string;
  symbol: string;
  event_time: string; // ISO timestamp
  event_type: 'earnings' | 'product_launch' | 'delivery_report' | 'partnership' | 
              'regulatory' | 'market_event' | 'analyst_upgrade' | 'analyst_downgrade' |
              'split' | 'dividend' | 'other';
  title: string;
  note?: string;
  payload?: Record<string, any>;
}

export interface EventQueryParams {
  symbol: string;
  from?: string;
  to?: string;
  event_type?: string;
}

class SupabaseEventService {
  private supabase = createServiceClient();

  /**
   * Get events within a date range
   */
  async getEvents(params: EventQueryParams): Promise<ChartEvent[]> {
    const { symbol, from, to, event_type } = params;

    try {
      let query = this.supabase
        .from('events')
        .select('*')
        .eq('symbol', symbol)
        .order('event_time', { ascending: true });

      if (from) {
        query = query.gte('event_time', from);
      }
      if (to) {
        query = query.lte('event_time', to);
      }
      if (event_type) {
        query = query.eq('event_type', event_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error querying events:', error);
        return [];
      }

      return (data || []).map(row => ({
        id: row.id,
        symbol: row.symbol,
        event_time: row.event_time,
        event_type: row.event_type,
        title: row.title,
        note: row.note,
        payload: row.payload
      }));

    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  /**
   * Create or update an event
   */
  async upsertEvent(event: ChartEvent): Promise<ChartEvent | null> {
    try {
      const eventData = {
        symbol: event.symbol,
        event_time: event.event_time,
        event_type: event.event_type,
        title: event.title,
        note: event.note,
        payload: event.payload
      };

      let result;
      if (event.id) {
        // Update existing event
        const { data, error } = await this.supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating event:', error);
          return null;
        }
        result = data;
      } else {
        // Create new event
        const { data, error } = await this.supabase
          .from('events')
          .insert(eventData)
          .select()
          .single();

        if (error) {
          console.error('Error creating event:', error);
          return null;
        }
        result = data;
      }

      return {
        id: result.id,
        symbol: result.symbol,
        event_time: result.event_time,
        event_type: result.event_type,
        title: result.title,
        note: result.note,
        payload: result.payload
      };

    } catch (error) {
      console.error('Error upserting event:', error);
      return null;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  /**
   * Get events by type
   */
  async getEventsByType(symbol: string, eventType: string): Promise<ChartEvent[]> {
    return this.getEvents({ symbol, event_type: eventType });
  }

  /**
   * Get recent events (last 30 days)
   */
  async getRecentEvents(symbol: string, days: number = 30): Promise<ChartEvent[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    return this.getEvents({
      symbol,
      from: fromDate.toISOString(),
      to: new Date().toISOString()
    });
  }

  /**
   * Pre-populate TSLA events for testing
   */
  async populateTeslaEvents(): Promise<boolean> {
    const teslaEvents: Omit<ChartEvent, 'id'>[] = [
      {
        symbol: 'TSLA',
        event_time: '2024-01-24T21:00:00Z',
        event_type: 'earnings',
        title: 'Q4 2023 Earnings Beat',
        note: 'Tesla reported Q4 2023 earnings that exceeded expectations with strong delivery numbers.',
        payload: { eps: 0.71, revenue: '25.17B', deliveries: 484507 }
      },
      {
        symbol: 'TSLA',
        event_time: '2023-11-30T15:00:00Z',
        event_type: 'product_launch',
        title: 'Cybertruck Delivery Event',
        note: 'First Cybertruck deliveries began with production ramp-up announcement.',
        payload: { delivered: 10, production_target: '250000' }
      },
      {
        symbol: 'TSLA',
        event_time: '2024-01-01T00:00:00Z',
        event_type: 'delivery_report',
        title: '2023 Annual Delivery Report',
        note: 'Tesla achieved record annual deliveries of 1.8M vehicles in 2023.',
        payload: { annual_deliveries: 1800000, growth_rate: '38%' }
      },
      {
        symbol: 'TSLA',
        event_time: '2023-12-15T14:00:00Z',
        event_type: 'analyst_upgrade',
        title: 'Major Analyst Upgrade',
        note: 'Goldman Sachs upgraded TSLA to Buy with $250 price target.',
        payload: { analyst: 'Goldman Sachs', rating: 'Buy', price_target: 250 }
      },
      {
        symbol: 'TSLA',
        event_time: '2024-02-01T16:00:00Z',
        event_type: 'market_event',
        title: 'Fed Rate Decision Impact',
        note: 'Federal Reserve rate decision affected growth stock valuations.',
        payload: { fed_rate: '5.25%', impact: 'negative' }
      },
      {
        symbol: 'TSLA',
        event_time: '2024-01-15T10:00:00Z',
        event_type: 'product_launch',
        title: 'Model Y Refresh',
        note: 'Tesla announced refreshed Model Y with improved range and features.',
        payload: { range_improvement: '15%', new_features: ['ambient_lighting', 'premium_audio'] }
      },
      {
        symbol: 'TSLA',
        event_time: '2023-12-20T09:00:00Z',
        event_type: 'partnership',
        title: 'Charging Network Partnership',
        note: 'Tesla announced partnership with major charging network providers.',
        payload: { partners: ['EVgo', 'ChargePoint'], stations_added: 5000 }
      }
    ];

    try {
      for (const event of teslaEvents) {
        await this.upsertEvent(event);
      }
      
      console.log(`Populated ${teslaEvents.length} TSLA events`);
      return true;
    } catch (error) {
      console.error('Error populating TSLA events:', error);
      return false;
    }
  }
}

// Export singleton instance
export const supabaseEventService = new SupabaseEventService();
