-- MBTI diagnosis result storage
-- Mirrors the schema currently generated in lib/types/database.ts.

CREATE TABLE IF NOT EXISTS mbti_results (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT,                  -- Clerk user_id. Null is allowed for the current anonymous MVP flow.
  mbti_type  TEXT        NOT NULL,
  scores     JSONB       NOT NULL,
  pci        JSONB       NOT NULL,
  answers    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT mbti_results_mbti_type_check CHECK (
    mbti_type IN (
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_mbti_results_user_id    ON mbti_results (user_id);
CREATE INDEX IF NOT EXISTS idx_mbti_results_mbti_type  ON mbti_results (mbti_type);
CREATE INDEX IF NOT EXISTS idx_mbti_results_created_at ON mbti_results (created_at DESC);

ALTER TABLE mbti_results ENABLE ROW LEVEL SECURITY;

-- Current MBTI API writes through the anon Supabase client and does not read rows back
-- except for the inserted id. Keep writes possible while RLS denies broad reads/updates/deletes.
CREATE POLICY "allow mbti result inserts" ON mbti_results
  FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can read own mbti results" ON mbti_results
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can update own mbti results" ON mbti_results
  FOR UPDATE
  USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can delete own mbti results" ON mbti_results
  FOR DELETE
  USING (user_id = (auth.jwt() ->> 'sub'));
