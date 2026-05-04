-- Phase A: 行動テレメトリ基盤
-- Autogenesis Phase A の観察基盤。Supabase Dashboard SQL Editor から手動実行すること。
-- (supabase db push は AGENTS.md §7 Layer1 制約でブロックされる)

CREATE TABLE events_telemetry (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,  -- Clerk user_id（未認証セッションは 'anonymous'）
  session_id  TEXT,                  -- チャットセッション識別子
  event_name  TEXT        NOT NULL,  -- 'chat_phase_transition' 等
  payload     JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_telemetry_user_id    ON events_telemetry (user_id);
CREATE INDEX idx_events_telemetry_event_name ON events_telemetry (event_name);
CREATE INDEX idx_events_telemetry_created_at ON events_telemetry (created_at DESC);

ALTER TABLE events_telemetry ENABLE ROW LEVEL SECURITY;

-- サービスロールのみ書き込み可（APIルートは service_role key で操作する）
CREATE POLICY "service role full access" ON events_telemetry
  FOR ALL USING (auth.role() = 'service_role');
