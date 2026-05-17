-- F2: 3-system auto-diagnosis results (zodiac / animal / six-star)
-- user_id is nullable for the current anonymous MVP flow (same as mbti_results).
-- Auth-based user isolation will be added when Clerk JWT integration is implemented.

CREATE TABLE IF NOT EXISTS diagnoses (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT,
  zodiac_sign      TEXT,
  animal_type      TEXT,
  animal_character TEXT,
  six_star         TEXT,
  calculated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses (user_id);

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow diagnoses inserts" ON diagnoses
  FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can read own diagnoses" ON diagnoses
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can update own diagnoses" ON diagnoses
  FOR UPDATE
  USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));
