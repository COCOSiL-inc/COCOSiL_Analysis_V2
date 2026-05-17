-- F2: 3-system auto-diagnosis results (zodiac / animal / six-star)
-- Each user has exactly one row (upsert by user_id UNIQUE constraint).

CREATE TABLE IF NOT EXISTS diagnoses (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT        NOT NULL,
  zodiac_sign      TEXT,
  animal_type      TEXT,
  animal_character TEXT,
  six_star         TEXT,
  calculated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT diagnoses_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses (user_id);

ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own diagnoses" ON diagnoses
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can insert own diagnoses" ON diagnoses
  FOR INSERT
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users can update own diagnoses" ON diagnoses
  FOR UPDATE
  USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));
