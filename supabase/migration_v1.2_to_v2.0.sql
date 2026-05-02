-- ============================================
-- MIGRATION: v1.2.0 → v2.0.0 FINAL (Clean)
-- Kuesioner Final — 9 Sections (A-I)
-- HAPUS legacy spiritual, gunakan F1-F9 murni
-- Run this ONLY on EXISTING Supabase databases
-- that already have v1.2.0 schema installed.
--
-- Changes:
--   + A5: Income range
--   + A7: Condition type "other" fix
--   + A4: Occupation "other"
--   + Bagian D: D1-D4 clarity (replaces adjuvant_role)
--   + Bagian F: DROP legacy spiritual, ADD F1-F9 pure
--   + Bagian G: G4 + G5 loyalty
--   + Bagian I: WTP (I1-I4)
--   - DROP: spiritual_salam_doa, spiritual_islam_respect, spiritual_facility,
--           spiritual_healing, spiritual_support
--   + F9 reverse-coded scoring note
--
-- Author: Imam Maliki
-- ============================================

BEGIN;

-- ============================================
-- BAGIAN A: Demographics Fixes & Additions
-- ============================================

ALTER TABLE surveys ADD COLUMN IF NOT EXISTS income_range VARCHAR(50);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS condition_type_other TEXT;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS occupation_other TEXT;

-- ============================================
-- BAGIAN D: Replace adjuvant_role + D2 with Clarity D1-D4
-- ============================================

ALTER TABLE surveys ADD COLUMN IF NOT EXISTS d1_clarity_role FLOAT CHECK (d1_clarity_role >= 1 AND d1_clarity_role <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS d2_clarity_explanation FLOAT CHECK (d2_clarity_explanation >= 1 AND d2_clarity_explanation <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS d3_clarity_comfortable FLOAT CHECK (d3_clarity_comfortable >= 1 AND d3_clarity_comfortable <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS d4_clarity_specialist FLOAT CHECK (d4_clarity_specialist >= 1 AND d4_clarity_specialist <= 5);

-- ============================================
-- BAGIAN F: HAPUS legacy spiritual, tambah F1-F9
-- ============================================

-- Hapus kolom spiritual lama (kalau ada)
ALTER TABLE surveys DROP COLUMN IF EXISTS spiritual_salam_doa;
ALTER TABLE surveys DROP COLUMN IF EXISTS spiritual_islam_respect;
ALTER TABLE surveys DROP COLUMN IF EXISTS spiritual_facility;
ALTER TABLE surveys DROP COLUMN IF EXISTS spiritual_healing;
ALTER TABLE surveys DROP COLUMN IF EXISTS spiritual_support;

-- Tambah F1-F9 (exploratory scale)
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f1_adab_islami FLOAT CHECK (f1_adab_islami >= 1 AND f1_adab_islami <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f2_gender_concordance FLOAT CHECK (f2_gender_concordance >= 1 AND f2_gender_concordance <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f3_prayer_accommodation FLOAT CHECK (f3_prayer_accommodation >= 1 AND f3_prayer_accommodation <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f4_halal_assurance FLOAT CHECK (f4_halal_assurance >= 1 AND f4_halal_assurance <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f5_tibb_nabawi FLOAT CHECK (f5_tibb_nabawi >= 1 AND f5_tibb_nabawi <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f6_spiritual_activation FLOAT CHECK (f6_spiritual_activation >= 1 AND f6_spiritual_activation <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f7_holistic_peace FLOAT CHECK (f7_holistic_peace >= 1 AND f7_holistic_peace <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f8_spiritual_communication FLOAT CHECK (f8_spiritual_communication >= 1 AND f8_spiritual_communication <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f9_reverse_coded FLOAT CHECK (f9_reverse_coded >= 1 AND f9_reverse_coded <= 5);

-- ============================================
-- BAGIAN G: Add G4 + G5
-- ============================================

ALTER TABLE surveys ADD COLUMN IF NOT EXISTS recommendation_count VARCHAR(50);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_price_increase INT CHECK (wtp_price_increase >= 0 AND wtp_price_increase <= 10);

-- ============================================
-- BAGIAN I: Willingness to Pay (NEW section)
-- ============================================

ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_cost_today INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_increase_20 VARCHAR(100);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_package_interest VARCHAR(100);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_max_acceptable VARCHAR(100);

-- ============================================
-- TRIGGER: Re-create untuk safety (idempotent)
-- ============================================

DROP TRIGGER IF EXISTS on_survey_insert ON surveys;

CREATE OR REPLACE FUNCTION handle_new_survey()
RETURNS TRIGGER AS $$
DECLARE
    new_overall FLOAT;
    new_promoter INT;
    new_passive INT;
    new_detractor INT;
    new_pain_reduction FLOAT;
BEGIN
    new_overall := (COALESCE(NEW.tangibles, 0) + COALESCE(NEW.reliability, 0) +
                    COALESCE(NEW.responsiveness, 0) + COALESCE(NEW.assurance, 0) +
                    COALESCE(NEW.empathy, 0)) / 5;

    new_promoter := CASE WHEN NEW.nps_score >= 9 THEN 1 ELSE 0 END;
    new_passive := CASE WHEN NEW.nps_score >= 7 AND NEW.nps_score <= 8 THEN 1 ELSE 0 END;
    new_detractor := CASE WHEN NEW.nps_score IS NOT NULL AND NEW.nps_score <= 6 THEN 1 ELSE 0 END;

    new_pain_reduction := CASE
        WHEN NEW.pain_level_before IS NOT NULL AND NEW.pain_level_after IS NOT NULL
             AND NEW.pain_level_before > 0
        THEN ROUND(((NEW.pain_level_before - NEW.pain_level_after)::float / NEW.pain_level_before) * 100, 1)
        ELSE NULL
    END;

    INSERT INTO survey_aggregations (
        unit_id, date, total_responses,
        avg_tangibles, avg_reliability, avg_responsiveness, avg_assurance, avg_empathy, avg_overall,
        promoters_count, passives_count, detractors_count, nps_score, avg_pain_reduction_pct
    )
    VALUES (
        NEW.unit_id, CURRENT_DATE, 1,
        NEW.tangibles, NEW.reliability, NEW.responsiveness, NEW.assurance, NEW.empathy, new_overall,
        new_promoter, new_passive, new_detractor,
        CASE WHEN NEW.nps_score IS NOT NULL THEN (new_promoter - new_detractor) * 100 ELSE NULL END,
        new_pain_reduction
    )
    ON CONFLICT (unit_id, date)
    DO UPDATE SET
        total_responses = survey_aggregations.total_responses + 1,
        avg_tangibles = (survey_aggregations.avg_tangibles * survey_aggregations.total_responses + NEW.tangibles) / (survey_aggregations.total_responses + 1),
        avg_reliability = (survey_aggregations.avg_reliability * survey_aggregations.total_responses + NEW.reliability) / (survey_aggregations.total_responses + 1),
        avg_responsiveness = (survey_aggregations.avg_responsiveness * survey_aggregations.total_responses + NEW.responsiveness) / (survey_aggregations.total_responses + 1),
        avg_assurance = (survey_aggregations.avg_assurance * survey_aggregations.total_responses + NEW.assurance) / (survey_aggregations.total_responses + 1),
        avg_empathy = (survey_aggregations.avg_empathy * survey_aggregations.total_responses + NEW.empathy) / (survey_aggregations.total_responses + 1),
        avg_overall = (survey_aggregations.avg_overall * survey_aggregations.total_responses + new_overall) / (survey_aggregations.total_responses + 1),
        promoters_count = survey_aggregations.promoters_count + new_promoter,
        passives_count = survey_aggregations.passives_count + new_passive,
        detractors_count = survey_aggregations.detractors_count + new_detractor,
        nps_score = CASE
            WHEN (survey_aggregations.promoters_count + new_promoter +
                  survey_aggregations.detractors_count + new_detractor) > 0
            THEN ((survey_aggregations.promoters_count + new_promoter -
                   survey_aggregations.detractors_count - new_detractor)::float /
                   (survey_aggregations.total_responses + 1)) * 100
            ELSE NULL
        END,
        avg_pain_reduction_pct = CASE
            WHEN new_pain_reduction IS NOT NULL
            THEN COALESCE(survey_aggregations.avg_pain_reduction_pct, 0) *
                 survey_aggregations.total_responses / (survey_aggregations.total_responses + 1)
                 + new_pain_reduction / (survey_aggregations.total_responses + 1)
            ELSE survey_aggregations.avg_pain_reduction_pct
        END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_survey_insert
    AFTER INSERT ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_survey();

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Migration v1.2.0 → v2.0.0 FINAL (Clean) complete!' AS status;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'surveys'
  AND column_name IN (
    'income_range', 'condition_type_other', 'occupation_other',
    'd1_clarity_role', 'd2_clarity_explanation', 'd3_clarity_comfortable', 'd4_clarity_specialist',
    'f1_adab_islami', 'f2_gender_concordance', 'f3_prayer_accommodation', 'f4_halal_assurance',
    'f5_tibb_nabawi', 'f6_spiritual_activation', 'f7_holistic_peace', 'f8_spiritual_communication', 'f9_reverse_coded',
    'recommendation_count', 'wtp_price_increase',
    'wtp_cost_today', 'wtp_increase_20', 'wtp_package_interest', 'wtp_max_acceptable'
  )
ORDER BY ordinal_position;

-- Cek apakah kolom legacy sudah benar-benar hilang
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'surveys'
  AND column_name IN ('spiritual_salam_doa', 'spiritual_islam_respect', 'spiritual_facility', 'spiritual_healing', 'spiritual_support');

COMMIT;
