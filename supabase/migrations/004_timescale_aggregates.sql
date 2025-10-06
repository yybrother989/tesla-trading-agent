-- Migration 004: Create materialized views for 15m/60m/1d aggregates
-- Following Option 1: hybrid approach with materialized views + pg_cron refresh

-- Helper function to create time buckets (15-minute intervals)
CREATE OR REPLACE FUNCTION time_bucket_15m(ts TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN date_trunc('minute', ts) - make_interval(mins => extract(minute from ts)::int % 15);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to create time buckets (60-minute intervals)
CREATE OR REPLACE FUNCTION time_bucket_60m(ts TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN date_trunc('hour', ts);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to create time buckets (daily intervals)
CREATE OR REPLACE FUNCTION time_bucket_1d(ts TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN date_trunc('day', ts);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 15-minute materialized view (aggregated from 1m bars)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_prices_15m AS
SELECT
  time_bucket_15m(ts) AS bucket,
  symbol,
  (array_agg(open ORDER BY ts))[1] AS open,
  max(high) AS high,
  min(low) AS low,
  (array_agg(close ORDER BY ts DESC))[1] AS close,
  sum(volume) AS volume,
  max(data_version) AS data_version,
  max(ingested_at) AS ingested_at
FROM prices_1m
GROUP BY 1, 2
WITH NO DATA;

-- 60-minute materialized view (aggregated from 1m bars)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_prices_60m AS
SELECT
  time_bucket_60m(ts) AS bucket,
  symbol,
  (array_agg(open ORDER BY ts))[1] AS open,
  max(high) AS high,
  min(low) AS low,
  (array_agg(close ORDER BY ts DESC))[1] AS close,
  sum(volume) AS volume,
  max(data_version) AS data_version,
  max(ingested_at) AS ingested_at
FROM prices_1m
GROUP BY 1, 2
WITH NO DATA;

-- Daily materialized view (fallback from intraday data)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_prices_1d AS
SELECT
  time_bucket_1d(ts) AS bucket,
  symbol,
  (array_agg(open ORDER BY ts))[1] AS open,
  max(high) AS high,
  min(low) AS low,
  (array_agg(close ORDER BY ts DESC))[1] AS close,
  sum(volume) AS volume,
  max(data_version) AS data_version,
  max(ingested_at) AS ingested_at
FROM prices_1m
GROUP BY 1, 2
WITH NO DATA;

-- Create indexes on materialized views for efficient querying
CREATE INDEX IF NOT EXISTS idx_mv_15m_symbol_bucket ON mv_prices_15m(symbol, bucket DESC);
CREATE INDEX IF NOT EXISTS idx_mv_60m_symbol_bucket ON mv_prices_60m(symbol, bucket DESC);
CREATE INDEX IF NOT EXISTS idx_mv_1d_symbol_bucket ON mv_prices_1d(symbol, bucket DESC);

-- Add comments for documentation
COMMENT ON MATERIALIZED VIEW mv_prices_15m IS '15-minute OHLCV aggregates from 1-minute data';
COMMENT ON MATERIALIZED VIEW mv_prices_60m IS '60-minute OHLCV aggregates from 1-minute data';
COMMENT ON MATERIALIZED VIEW mv_prices_1d IS 'Daily OHLCV aggregates from intraday data (fallback)';
COMMENT ON FUNCTION time_bucket_15m(TIMESTAMPTZ) IS 'Create 15-minute time buckets';
COMMENT ON FUNCTION time_bucket_60m(TIMESTAMPTZ) IS 'Create 60-minute time buckets';
COMMENT ON FUNCTION time_bucket_1d(TIMESTAMPTZ) IS 'Create daily time buckets';