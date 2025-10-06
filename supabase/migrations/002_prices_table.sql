-- Migration 002: Create base prices table and daily prices table
-- This migration creates the base 1-minute bars table and a separate daily prices table
-- Following Option 1: hybrid approach with materialized views for aggregates

-- Base table for 1-minute intraday bars (rolling 30 trading days)
CREATE TABLE IF NOT EXISTS prices_1m (
  symbol TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,        -- UTC timestamp
  open NUMERIC NOT NULL,
  high NUMERIC NOT NULL,
  low NUMERIC NOT NULL,
  close NUMERIC NOT NULL,
  volume BIGINT NOT NULL,
  adjusted BOOLEAN DEFAULT TRUE,
  data_version INTEGER DEFAULT 1,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Primary key constraint
  PRIMARY KEY (symbol, ts),
  
  -- Check constraints for data integrity
  CONSTRAINT check_ohlc_positive CHECK (open > 0 AND high > 0 AND low > 0 AND close > 0),
  CONSTRAINT check_high_low CHECK (high >= low),
  CONSTRAINT check_ohlc_range CHECK (
    open BETWEEN low AND high AND 
    close BETWEEN low AND high
  ),
  CONSTRAINT check_volume_non_negative CHECK (volume >= 0)
);

-- Daily prices table (5 years of adjusted data)
CREATE TABLE IF NOT EXISTS prices_daily (
  symbol TEXT NOT NULL,
  ts DATE NOT NULL,               -- Date only (no time)
  open NUMERIC NOT NULL,
  high NUMERIC NOT NULL,
  low NUMERIC NOT NULL,
  close NUMERIC NOT NULL,
  volume BIGINT NOT NULL,
  adjusted BOOLEAN DEFAULT TRUE,
  data_version INTEGER DEFAULT 1,
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Primary key constraint
  PRIMARY KEY (symbol, ts),
  
  -- Check constraints for data integrity
  CONSTRAINT check_daily_ohlc_positive CHECK (open > 0 AND high > 0 AND low > 0 AND close > 0),
  CONSTRAINT check_daily_high_low CHECK (high >= low),
  CONSTRAINT check_daily_ohlc_range CHECK (
    open BETWEEN low AND high AND 
    close BETWEEN low AND high
  ),
  CONSTRAINT check_daily_volume_non_negative CHECK (volume >= 0)
);

-- Create indexes for efficient querying
-- 1-minute table indexes (optimized for time-series patterns)
CREATE INDEX IF NOT EXISTS idx_prices_1m_symbol_ts 
ON prices_1m(symbol, ts DESC);

CREATE INDEX IF NOT EXISTS idx_prices_1m_ts 
ON prices_1m(ts DESC);

-- Daily table indexes
CREATE INDEX IF NOT EXISTS idx_prices_daily_symbol_ts 
ON prices_daily(symbol, ts DESC);

CREATE INDEX IF NOT EXISTS idx_prices_daily_ts 
ON prices_daily(ts DESC);

-- Partial indexes for TSLA (most common queries)
CREATE INDEX IF NOT EXISTS idx_prices_1m_tsla 
ON prices_1m(ts DESC) 
WHERE symbol = 'TSLA';

CREATE INDEX IF NOT EXISTS idx_prices_daily_tsla 
ON prices_daily(ts DESC) 
WHERE symbol = 'TSLA';

-- Add comments for documentation
COMMENT ON TABLE prices_1m IS '1-minute intraday bars (rolling 30 trading days)';
COMMENT ON TABLE prices_daily IS 'Daily adjusted bars (5 years of data)';
COMMENT ON COLUMN prices_1m.ts IS 'Bar timestamp in UTC';
COMMENT ON COLUMN prices_daily.ts IS 'Trading date';
COMMENT ON COLUMN prices_1m.adjusted IS 'Whether prices are adjusted for splits/dividends';
COMMENT ON COLUMN prices_daily.adjusted IS 'Whether prices are adjusted for splits/dividends';