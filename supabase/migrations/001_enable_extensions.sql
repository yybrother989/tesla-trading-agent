-- Migration 001: Enable PostgreSQL extensions
-- This migration enables pg_cron for scheduled jobs and uuid-ossp for unique IDs
-- Note: Using standard PostgreSQL approach (no TimescaleDB) for PG17 compatibility

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify extensions are enabled
SELECT extname, extversion 
FROM pg_extension 
WHERE extname IN ('pg_cron', 'uuid-ossp');
