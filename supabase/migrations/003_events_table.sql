-- Migration 003: Create events table for chart annotations
-- This migration creates the events table for storing chart annotations and events

-- Create the events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Check constraints
  CONSTRAINT check_event_type CHECK (event_type IN (
    'earnings', 'product_launch', 'delivery_report', 'partnership', 
    'regulatory', 'market_event', 'analyst_upgrade', 'analyst_downgrade',
    'split', 'dividend', 'other'
  )),
  CONSTRAINT check_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_events_symbol_event_time 
ON events(symbol, event_time);

CREATE INDEX IF NOT EXISTS idx_events_event_type 
ON events(event_type);

CREATE INDEX IF NOT EXISTS idx_events_event_time 
ON events(event_time);

-- Create index for JSONB payload queries
CREATE INDEX IF NOT EXISTS idx_events_payload_gin 
ON events USING GIN (payload);

-- Add comments for documentation
COMMENT ON TABLE events IS 'Chart events and annotations for price charts';
COMMENT ON COLUMN events.symbol IS 'Stock symbol this event relates to';
COMMENT ON COLUMN events.event_time IS 'When the event occurred (UTC)';
COMMENT ON COLUMN events.event_type IS 'Category of event for filtering and styling';
COMMENT ON COLUMN events.title IS 'Short title for the event';
COMMENT ON COLUMN events.note IS 'Detailed description of the event';
COMMENT ON COLUMN events.payload IS 'Additional structured data (JSON)';

-- Insert some sample TSLA events for testing
INSERT INTO events (symbol, event_time, event_type, title, note, payload) VALUES
  ('TSLA', '2024-01-24 21:00:00+00', 'earnings', 'Q4 2023 Earnings Beat', 
   'Tesla reported Q4 2023 earnings that exceeded expectations with strong delivery numbers.', 
   '{"eps": 0.71, "revenue": "25.17B", "deliveries": 484507}'),
   
  ('TSLA', '2023-11-30 15:00:00+00', 'product_launch', 'Cybertruck Delivery Event', 
   'First Cybertruck deliveries began with production ramp-up announcement.', 
   '{"delivered": 10, "production_target": "250000"}'),
   
  ('TSLA', '2024-01-01 00:00:00+00', 'delivery_report', '2023 Annual Delivery Report', 
   'Tesla achieved record annual deliveries of 1.8M vehicles in 2023.', 
   '{"annual_deliveries": 1800000, "growth_rate": "38%"}'),
   
  ('TSLA', '2023-12-15 14:00:00+00', 'analyst_upgrade', 'Major Analyst Upgrade', 
   'Goldman Sachs upgraded TSLA to Buy with $250 price target.', 
   '{"analyst": "Goldman Sachs", "rating": "Buy", "price_target": 250}'),
   
  ('TSLA', '2024-02-01 16:00:00+00', 'market_event', 'Fed Rate Decision Impact', 
   'Federal Reserve rate decision affected growth stock valuations.', 
   '{"fed_rate": "5.25%", "impact": "negative"}')
ON CONFLICT DO NOTHING;
