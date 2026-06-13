-- ============================================================
-- PVLS Ja'far Medika — Migration: Create survey_responses table
-- Perceived Value, Trust, Satisfaction, Loyalty Survey
-- ============================================================

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  survey_version TEXT,
  consent_version TEXT,
  consent_agreed BOOLEAN,
  eligible BOOLEAN,

  -- Demographics (no direct identifiers)
  age_group TEXT,
  gender TEXT,
  education TEXT,
  occupation TEXT,
  income_group TEXT,
  service_type TEXT,
  visit_count TEXT,
  referral_source TEXT,
  main_complaint_category TEXT,

  -- Perceived Value items (1-5)
  pv1 INTEGER CHECK (pv1 BETWEEN 1 AND 5),
  pv2 INTEGER CHECK (pv2 BETWEEN 1 AND 5),
  pv3 INTEGER CHECK (pv3 BETWEEN 1 AND 5),
  pv4 INTEGER CHECK (pv4 BETWEEN 1 AND 5),
  pv5 INTEGER CHECK (pv5 BETWEEN 1 AND 5),
  pv6 INTEGER CHECK (pv6 BETWEEN 1 AND 5),
  pv7 INTEGER CHECK (pv7 BETWEEN 1 AND 5),
  pv8 INTEGER CHECK (pv8 BETWEEN 1 AND 5),
  pv9 INTEGER CHECK (pv9 BETWEEN 1 AND 5),
  pv10 INTEGER CHECK (pv10 BETWEEN 1 AND 5),
  pv11 INTEGER CHECK (pv11 BETWEEN 1 AND 5),
  pv12 INTEGER CHECK (pv12 BETWEEN 1 AND 5),

  -- Trust items (1-5)
  tr1 INTEGER CHECK (tr1 BETWEEN 1 AND 5),
  tr2 INTEGER CHECK (tr2 BETWEEN 1 AND 5),
  tr3 INTEGER CHECK (tr3 BETWEEN 1 AND 5),
  tr4 INTEGER CHECK (tr4 BETWEEN 1 AND 5),

  -- Satisfaction items (1-5)
  sat1 INTEGER CHECK (sat1 BETWEEN 1 AND 5),
  sat2 INTEGER CHECK (sat2 BETWEEN 1 AND 5),
  sat3 INTEGER CHECK (sat3 BETWEEN 1 AND 5),
  sat4 INTEGER CHECK (sat4 BETWEEN 1 AND 5),

  -- Loyalty items (1-5)
  loy1 INTEGER CHECK (loy1 BETWEEN 1 AND 5),
  loy2 INTEGER CHECK (loy2 BETWEEN 1 AND 5),
  loy3 INTEGER CHECK (loy3 BETWEEN 1 AND 5),
  loy4 INTEGER CHECK (loy4 BETWEEN 1 AND 5),

  -- Computed mean scores
  pv_quality_mean NUMERIC,
  pv_emotional_mean NUMERIC,
  pv_price_mean NUMERIC,
  pv_social_mean NUMERIC,
  pv_total_mean NUMERIC,
  trust_mean NUMERIC,
  satisfaction_mean NUMERIC,
  loyalty_mean NUMERIC,

  -- Extreme pattern flag
  extreme_pattern_flag TEXT,

  -- Metadata
  duration_seconds INTEGER,
  is_complete BOOLEAN DEFAULT false
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_survey_responses_is_complete ON survey_responses(is_complete);
CREATE INDEX IF NOT EXISTS idx_survey_responses_extreme_pattern ON survey_responses(extreme_pattern_flag);
CREATE INDEX IF NOT EXISTS idx_survey_responses_service_type ON survey_responses(service_type);

-- ============================================================
-- RLS Policies
-- ============================================================

-- Enable RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT (survey submission from patients)
CREATE POLICY "Allow anonymous survey submission"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow service_role full access (admin/dashboard)
CREATE POLICY "Service role full access"
  ON survey_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Comments for documentation
-- ============================================================

COMMENT ON TABLE survey_responses IS 'PVLS Ja''far Medika - Survey responses for thesis research on Perceived Value, Trust, Satisfaction, and Loyalty';
COMMENT ON COLUMN survey_responses.extreme_pattern_flag IS 'Flags: pv_high_loyalty_low, pv_medium_loyalty_high, normal, incomplete';
COMMENT ON COLUMN survey_responses.service_type IS 'Akupunktur, Herbal, atau Keduanya';
