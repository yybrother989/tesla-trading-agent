# TSLA Chart Service — Strategy & Pseudocode (Supabase‑Centric)

This document specifies an **architecture, data policy, and operational strategy** for embedding a low‑latency TSLA price chart with 5‑year history, live updates, and event annotations using **Supabase**. It omits concrete code and focuses on pseudocode and design decisions.

---

## 1) Architectural Overview
**Stack Decision:** Use **Supabase** as the single control plane: Postgres (with TimescaleDB if available), Row‑Level Security (RLS), Realtime, Edge Functions (Deno), and `pg_cron` for scheduling. Keep the design **Redis‑optional** by relying on database‑native aggregation and Supabase Realtime for fan‑out.

**Pattern:** Hybrid storage + streaming, with two deployment profiles:
- **Profile A — Redis‑Free (recommended first):**
  - **System of Record:** Supabase Postgres stores 5y daily adjusted OHLCV and a rolling intraday window.
  - **Hot Path:** **TimescaleDB continuous aggregates** (or materialized views) for 15m/60m/day; client reads via a thin API or PostgREST. Edge cache is done by your hosting layer (Vercel/Cloudflare) with short TTLs.
  - **Streaming:** Supabase **Realtime** (logical replication) or **Broadcast channels** for pushing “new bar” events to clients.

- **Profile B — Add a Cloud Cache:**
  - Use a managed serverless cache (e.g., **Upstash Redis**, **Vercel KV**) to shave p95 latency and to buffer live bars before they are committed.

**Why this design:** Lower ops overhead (no self‑managed Redis), strong consistency for history, simple push for live bars. Upgrade to a cache only if measured p95/throughput misses targets.

---

## 2) Data Policy & Modeling
**Tables (Supabase Postgres):**
- `prices(symbol, ts, interval, open, high, low, close, volume, adjusted, data_version, ingested_at)`; PK `(symbol, ts, interval)`; **Timescale hypertable** on `(symbol, ts)` if extension is enabled.
- `events(id, symbol, event_time, event_type, title, note, payload)` with index `(symbol, event_time)`.
- Optional `actions` for splits/dividends.

**Retention:** Daily → full 5y; Intraday → rolling ~30 trading days.

**Aggregates:**
- If **TimescaleDB** is available: define **continuous aggregates** for 15m/60m/day across intraday raw bars.
- Else: standard **materialized views** refreshed on schedule.

**Realtime:**
- Enable replication on `prices` for `INSERT` to push fresh bars (or use Realtime Broadcast channels from Edge Functions).

---

## 3) Interfaces (Contracts)
Prefer a thin HTTP layer (**Edge Function**) over exposing PostgREST directly for slicing & governance.

**GET /api/price** → `{ symbol, interval, adjusted, version, bars: [{ ts, o,h,l,c,v }] }`
- Params: `symbol=TSLA`, `interval ∈ {1d,60m,15m,1m}`, `from`, `to`, `limit`.
- Implementation: selects from hypertable or continuous aggregate; applies RLS.

**GET /api/events** → `[{ id, event_time, event_type, title, note, payload }]`

**GET /api/stream** → delivered via **Supabase Realtime** subscription or **SSE** fed by a Supabase **Edge Function** that relays broadcast messages.

---

## 4) Pseudocode — Data Acquisition & ETL (Supabase)
### 4.1 Baseline Backfill (Edge Function or external worker)
```
function backfill_daily_5y(symbol='TSLA'):
  t_from = now_utc() - 5_years
  bars = vendor.fetch_daily_adjusted(symbol, from=t_from, to=now_utc())
  for b in bars:
    supabase.insert('prices', {
      symbol, ts:b.ts, interval:'1d', open:b.o, high:b.h, low:b.l, close:b.c,
      volume:b.v, adjusted:true, data_version:1
    }) on conflict (symbol, ts, interval) do update
  refresh_or_invalidate_aggregates('1d')
```

### 4.2 Intraday Ingest (scheduled Edge Function + optional Broadcast)
```
function intraday_loop(symbol='TSLA', interval='1m'):
  while market_is_open('NASDAQ'):
    bar = vendor.latest_bar(symbol, interval)
    supabase.insert('prices', encode_bar(bar)) on conflict do update
    supabase.realtime.broadcast(channel='bars:TSLA', event='bar', payload=bar)
    sleep(POLL_SECONDS)
```

### 4.3 Daily Close Job (pg_cron or Function schedule)
```
function daily_close_upsert(symbol='TSLA'):
  close_bar = vendor.fetch_final_daily_adjusted(symbol, date=today())
  upsert('prices', encode_bar(close_bar, interval='1d', adjusted=true))
  refresh_or_invalidate_aggregates('1d')
```

### 4.4 Revision Handling (last 30 days)
```
function reconcile_revisions(symbol='TSLA'):
  revised = vendor.check_revisions(symbol, '1d', window=days(30))
  for r in revised:
    upsert('prices', encode_bar(r)) with data_version = data_version + 1
  refresh_or_invalidate_aggregates('1d')
  supabase.realtime.broadcast(channel='status', event='info', payload={msg:'history revised'})
```

### 4.5 Aggregates
```
if timescale_available():
  create_continuous_aggregate('prices_15m', source='prices', bucket='15 minutes')
  create_continuous_aggregate('prices_60m', source='prices', bucket='60 minutes')
else:
  create_materialized_view('mv_prices_15m', query=aggregate_1m_to('15m'))
  schedule_refresh('mv_prices_15m', interval=minutes(2))
```

---

## 5) Pseudocode — Query Path & Caching (Redis‑Optional)
### 5.1 Historical Query (Edge Function)
```
function get_price(symbol='TSLA', interval='1d', from=null, to=null, limit=5000):
  if interval in {'15m','60m'} and aggregate_exists(interval):
    rows = select_from_continuous_aggregate(symbol, interval, from, to, limit)
  else:
    rows = select_from_prices(symbol, interval, from, to, limit)
  payload = { symbol, interval, adjusted:true, version=max(rows.data_version), bars:rows }
  set_edge_cache(payload, ttl = ttl_by_interval(interval))
  return payload
```

### 5.2 Event Overlay Query
```
function get_events(symbol='TSLA', from=null, to=null):
  return db.select('events').where(symbol, between(from,to)).order_by('event_time','asc')
```

### 5.3 Live Stream
```
// Client subscribes to Supabase Realtime channel 'bars:TSLA'
realtime.on('broadcast', {event:'bar'}, (bar) => chart.update(toCandle(bar)))
realtime.on('broadcast', {event:'info'}, (s) => ui.badge('info', s.msg))
```

### 5.4 Optional Cloud Cache (Profile B)
```
if need_extra_latency_reduction():
  cache.set(`bars:${symbol}:${interval}:snapshot`, payload, TTL_short)
  on_new_bar -> cache.append_and_publish()
```

---

## 6) Frontend Consumption (Framework‑neutral)
```
on_mount():
  data = http.get('/api/price?symbol=TSLA&interval=1d&limit=2000')
  chart.setCandles(map(data.bars, toChartCandle))

  events = http.get('/api/events?symbol=TSLA&from=...&to=...')
  chart.setMarkers(map(events, toMarker))

  sub = supabase.realtime.channel('bars:TSLA')
  sub.on('broadcast', {event:'bar'}, (bar) => chart.updateCandle(toChartCandle(bar)))
  sub.subscribe()

on_unmount():
  sub.unsubscribe()
```

**Notes:** Prefer server‑side downsampling via aggregates; keep client lightweight.

---

## 7) Operational Guidelines (Supabase‑aware)
**Latency Targets:** p95 < 200 ms via aggregates and edge caching; live push lag < 1 s.

**Resilience:** If vendor fails → continue serving from aggregates; display *Delayed* badge via Realtime `status` event.

**Observability:** Use Supabase logs + custom Edge Function logging; add heartbeat table to track ingest freshness.

**Security:**
- Enforce **RLS** for read‑only anon role; use service key only in server functions.
- Never expose vendor key to the client.
- Rate‑limit Edge Functions; configure CORS to your domain.

**Data Quality:** Validate timestamps; track `data_version` and `ingested_at`. Reconcile last 30 days nightly.

---

## 8) Product Notes & Opinions (TSLA‑specific)
- Persist 5y of **daily adjusted** data for deterministic overlays (earnings, deliveries, product milestones).
- Keep intraday raw bars for a rolling window; publish aggregates for interactive zooming.
- Start with **Profile A (Redis‑Free)**; introduce a serverless cache only if measured p95 > target under load.

---

## 9) Minimal Checklists (for Execution)
- **Data:** daily backfill (Edge Function or external worker) → pg_cron nightly close → intraday scheduled loop with Realtime broadcast.
- **API:** Edge Functions for `/api/price`, `/api/events`; expose Realtime channel for bars.
- **Client:** initial daily load, markers, Realtime subscription, delayed badge.
- **Ops:** dashboards for ingest health and aggregate staleness; alerts on missing close bar.

---

## 10) Cloud Cache Alternatives to Redis
If you later require an external cache/queue, these are **managed, serverless** options that pair well with Supabase:
- **Upstash Redis:** pay‑per‑request/serverless Redis; global POPs; integrates well with Edge Functions.
- **Vercel KV (Redis‑backed):** simple API, good if you host frontend on Vercel.
- **Redis Cloud (Redis Ltd.):** fully managed Redis with clustering and persistence.
- **Cloudflare KV / Durable Objects / D1:** if you are on Cloudflare Workers; KV for eventually consistent objects, Durable Objects for ordered streams/state, D1 for SQLite.
- **AWS ElastiCache / GCP Memorystore / Azure Cache for Redis:** if you move to a VPC‑centric deployment.

**When to add a cache:**
- You need **sub‑150 ms** p95 worldwide and your CDN/Edge cache can’t help because data is highly dynamic.
- You want to **debounce vendor polls**, buffer bursts, or provide **pub/sub** without coupling to Realtime channels.

**When not to:**
- Your aggregates already meet latency; ops complexity outweighs gains.


---

## 11) TimescaleDB Setup & Aggregation (SQL + Pseudocode)
Below is a **Timescale‑first** path that keeps ops light in Supabase while delivering low‑latency aggregates.

### 11.1 Enable Extensions (once)
```sql
-- In Supabase SQL editor (project-level)
create extension if not exists timescaledb;
create extension if not exists pg_cron;  -- for scheduled jobs
```

### 11.2 Hypertable & Base Schema (UTC)
```sql
-- 1) Create the base table (if not created yet)
create table if not exists prices (
  symbol text not null,
  ts timestamptz not null,        -- UTC
  interval text not null,          -- '1m' | '15m' | '60m' | '1d'
  open numeric not null,
  high numeric not null,
  low  numeric not null,
  close numeric not null,
  volume bigint,
  adjusted boolean default true,
  data_version int default 1,
  ingested_at timestamptz default now(),
  primary key (symbol, ts, interval)
);

-- 2) Create hypertable on (ts), optionally partition by symbol
select create_hypertable('prices', by_range('ts'))
  where not exists (select 1 from timescaledb_information.hypertables where hypertable_name='prices');

create index if not exists idx_prices_symbol_ts on prices(symbol, ts);
```

> **Note**: If you prefer strict separation, you can keep **raw intraday (1m)** in `prices_1m` and **daily** in `prices_1d` as two hypertables. The single‑table design above is simpler and works well for one ticker (TSLA).

### 11.3 Compression & Retention
```sql
-- Compression (space savings; doesn’t affect recent slices)
alter table prices set (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'symbol,interval'
);
-- Compress data older than 7 days (intraday focus); adjust as needed
select add_compression_policy('prices', now() - interval '7 days');

-- Lightweight retention for raw 1m bars via pg_cron (30 trading days suggested)
select cron.schedule('purge_1m_old', '15 3 * * *', $$
  delete from prices
   where interval = '1m' and ts < now() - interval '30 days';
$$);
```

### 11.4 Continuous Aggregates (1m → 15m / 60m)
Aggregate **from 1m** to coarser bars; enable real‑time aggregation so queries include not‑yet‑materialized data.
```sql
-- 15-minute candles
create materialized view if not exists cagg_prices_15m
with (timescaledb.continuous) as
select
  time_bucket('15 minutes', ts) as bucket,
  symbol,
  first(open, ts)  as open,
  max(high)        as high,
  min(low)         as low,
  last(close, ts)  as close,
  sum(volume)      as volume,
  max(data_version) as data_version
from prices
where interval = '1m'
group by 1,2
with no data;

alter materialized view cagg_prices_15m set (timescaledb.materialized_only = false);

-- 60-minute candles
create materialized view if not exists cagg_prices_60m
with (timescaledb.continuous) as
select
  time_bucket('60 minutes', ts) as bucket,
  symbol,
  first(open, ts)  as open,
  max(high)        as high,
  min(low)         as low,
  last(close, ts)  as close,
  sum(volume)      as volume,
  max(data_version) as data_version
from prices
where interval = '1m'
group by 1,2
with no data;

alter materialized view cagg_prices_60m set (timescaledb.materialized_only = false);
```

### 11.5 Continuous Aggregate Policies (auto‑refresh)
```sql
-- Keep the last 7 days up-to-date every 2 minutes (15m)
select add_continuous_aggregate_policy(
  'cagg_prices_15m',
  start_offset => interval '7 days',
  end_offset   => interval '0 minutes',
  schedule_interval => interval '2 minutes'
);

-- Keep the last 30 days up-to-date every 5 minutes (60m)
select add_continuous_aggregate_policy(
  'cagg_prices_60m',
  start_offset => interval '30 days',
  end_offset   => interval '0 minutes',
  schedule_interval => interval '5 minutes'
);
```

### 11.6 Daily Bars Strategy
- **Source of truth:** Use vendor‑provided **adjusted 1d** close bars.
- Optional **fallback** daily aggregate (from 1m) if the vendor daily is delayed:
```sql
create materialized view if not exists cagg_prices_1d
with (timescaledb.continuous) as
select
  time_bucket('1 day', ts) as bucket,
  symbol,
  first(open, ts)  as open,
  max(high)        as high,
  min(low)         as low,
  last(close, ts)  as close,
  sum(volume)      as volume,
  max(data_version) as data_version
from prices
where interval in ('1m','15m','60m')
group by 1,2
with no data;

alter materialized view cagg_prices_1d set (timescaledb.materialized_only = false);
```

### 11.7 Query Routing (pseudocode)
```
function select_bars(symbol, interval, from, to, limit):
  if interval == '1m':
    return sql("select ts as bucket, open, high, low, close, volume, data_version from prices where symbol=$1 and interval='1m' and ts between $2 and $3 order by ts asc limit $4")
  if interval == '15m':
    return sql("select bucket as ts, open, high, low, close, volume, data_version from cagg_prices_15m where symbol=$1 and bucket between $2 and $3 order by bucket asc limit $4")
  if interval == '60m':
    return sql("select bucket as ts, open, high, low, close, volume, data_version from cagg_prices_60m where symbol=$1 and bucket between $2 and $3 order by bucket asc limit $4")
  if interval == '1d':
    return prefer_vendor_daily_or_fallback_cagg(symbol, from, to, limit)
```

### 11.8 Operational Notes (Timescale)
- **Real‑time reads:** with `materialized_only=false`, queries include the latest not‑yet‑materialized slices (fast path).
- **Compression:** start compressing data past the active trading window (e.g., 7 days) to keep storage low.
- **Purging 1m:** keep simple `pg_cron` deletes; continuous aggregates preserve historical zoom at 15m/60m.
- **Clock discipline:** store **UTC**; client localizes.
- **Testing:** snapshot known windows around earnings to ensure aggregates reproduce expected candles.

