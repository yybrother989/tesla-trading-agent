-- Migration 005: pg_cron refresh schedules and data management
-- Following Option 1: market hours focused refresh + retention policies

-- Create a function to check if market is open (simplified)
CREATE OR REPLACE FUNCTION is_market_open()
RETURNS BOOLEAN AS $$
BEGIN
  -- Simple check: Monday-Friday, 9:30 AM - 4:00 PM EST (14:30-21:00 UTC)
  -- This is a simplified version; in production, consider holidays
  RETURN EXTRACT(DOW FROM NOW()) BETWEEN 1 AND 5  -- Monday = 1, Friday = 5
    AND EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') BETWEEN 14 AND 20
    AND NOT (EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC') = 20 AND EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'UTC') > 0);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get trading days ago
CREATE OR REPLACE FUNCTION trading_days_ago(days INTEGER)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  result_date TIMESTAMPTZ;
  days_count INTEGER := 0;
BEGIN
  result_date := NOW() AT TIME ZONE 'UTC';
  
  WHILE days_count < days LOOP
    result_date := result_date - INTERVAL '1 day';
    
    -- Skip weekends (Saturday = 6, Sunday = 0)
    IF EXTRACT(DOW FROM result_date) NOT IN (0, 6) THEN
      days_count := days_count + 1;
    END IF;
  END LOOP;
  
  RETURN result_date;
END;
$$ LANGUAGE plpgsql;

-- Create a function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_price_aggregates()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prices_15m;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prices_60m;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prices_1d;
END;
$$ LANGUAGE plpgsql;

-- pg_cron refresh schedules (market hours focus)
-- Refresh 15m aggregates every 2 minutes during market hours (13:30-20:00 UTC)
SELECT cron.schedule(
  'refresh_mv_15m',
  '*/2 13-20 * * 1-5',  -- Every 2 minutes, 13:30-20:00 UTC, Monday-Friday
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prices_15m;
  $$
);

-- Refresh 60m aggregates every 5 minutes during market hours
SELECT cron.schedule(
  'refresh_mv_60m',
  '*/5 13-20 * * 1-5',  -- Every 5 minutes, 13:30-20:00 UTC, Monday-Friday
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prices_60m;
  $$
);

-- Refresh daily aggregates after market close
SELECT cron.schedule(
  'refresh_mv_1d',
  '15 21 * * 1-5',  -- 21:15 UTC (after market close), Monday-Friday
  $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_prices_1d;
  $$
);

-- Housekeeping: purge old 1m bars beyond 30 trading days (≈45 calendar days)
SELECT cron.schedule(
  'purge_old_1m',
  '30 03 * * *',  -- 03:30 UTC daily
  $$
  DELETE FROM prices_1m 
  WHERE ts < trading_days_ago(30);
  $$
);

-- Create a view for monitoring data freshness
CREATE OR REPLACE VIEW data_freshness AS
SELECT 
  'prices_1m' as table_name,
  symbol,
  '1m' as interval_type,
  MAX(ts) as latest_timestamp,
  MAX(ingested_at) as latest_ingestion,
  NOW() - MAX(ts) as data_age,
  COUNT(*) as total_bars,
  CASE 
    WHEN NOW() - MAX(ts) < INTERVAL '5 minutes' THEN 'FRESH'
    WHEN NOW() - MAX(ts) < INTERVAL '1 hour' THEN 'STALE'
    ELSE 'OLD'
  END as freshness_status
FROM prices_1m 
GROUP BY symbol

UNION ALL

SELECT 
  'prices_daily' as table_name,
  symbol,
  '1d' as interval_type,
  MAX(ts) as latest_timestamp,
  MAX(ingested_at) as latest_ingestion,
  NOW() - MAX(ts) as data_age,
  COUNT(*) as total_bars,
  CASE 
    WHEN NOW() - MAX(ts) < INTERVAL '1 day' THEN 'FRESH'
    WHEN NOW() - MAX(ts) < INTERVAL '7 days' THEN 'STALE'
    ELSE 'OLD'
  END as freshness_status
FROM prices_daily 
GROUP BY symbol

ORDER BY table_name, symbol;

-- Add comments for documentation
COMMENT ON FUNCTION is_market_open() IS 'Check if US stock market is currently open (simplified)';
COMMENT ON FUNCTION trading_days_ago(INTEGER) IS 'Calculate timestamp N trading days ago';
COMMENT ON FUNCTION refresh_price_aggregates() IS 'Refresh all price aggregate materialized views';
COMMENT ON VIEW data_freshness IS 'Monitor data freshness and staleness across all tables';