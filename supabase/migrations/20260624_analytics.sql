-- Create analytics_events table for privacy-focused tracking
-- No PII collected — only anonymous event data

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event VARCHAR(100) NOT NULL,
  properties JSONB DEFAULT '{}',
  session_id VARCHAR(32),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

-- Example queries for dashboard:

-- Daily active sessions (last 30 days)
-- SELECT DATE(timestamp), COUNT(DISTINCT session_id) 
-- FROM analytics_events 
-- WHERE timestamp > NOW() - INTERVAL '30 days'
-- GROUP BY DATE(timestamp);

-- Conversion funnel: page_view → pricing_click → signup
-- WITH funnel AS (
--   SELECT session_id,
--     COUNT(*) FILTER (WHERE event = 'page_view') as views,
--     COUNT(*) FILTER (WHERE event = 'pricing_click') as clicks,
--     COUNT(*) FILTER (WHERE event = 'signup') as signups
--   FROM analytics_events
--   WHERE timestamp > NOW() - INTERVAL '7 days'
--   GROUP BY session_id
-- )
-- SELECT 
--   COUNT(*) FILTER (WHERE views > 0) as total_sessions,
--   COUNT(*) FILTER (WHERE clicks > 0) as clicked_pricing,
--   COUNT(*) FILTER (WHERE signups > 0) as signed_up
-- FROM funnel;
