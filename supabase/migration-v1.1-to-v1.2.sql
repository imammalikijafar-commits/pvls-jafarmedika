-- ============================================
-- DPEMS MIGRATION: v1.1.0 → v1.2.0
-- Run ONLY this section on EXISTING Supabase databases
-- that already have v1.1.0 schema installed.
--
-- Changes:
--   + 30 new columns (Barthel, ISI, Wellness, H1/H2 arrays)
--   + Updated trigger with NPS + pain reduction tracking
--   + New index on condition_type
--
-- Author: Imam Maliki
-- ============================================

BEGIN;

-- ============================================
-- 1. BARTHEL INDEX (Stroke) — 10 activities × 2 timepoints
-- ============================================
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_eat_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_eat_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_bath_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_bath_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_groom_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_groom_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_dress_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_dress_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_toilet_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_toilet_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_bowel_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_bowel_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_bladder_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_bladder_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_transfer_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_transfer_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_mobility_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_mobility_current INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_stairs_first INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS barthel_stairs_current INT DEFAULT 0;

-- ============================================
-- 2. INSOMNIA SEVERITY INDEX (ISI) — 7 items
-- ============================================
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS isi_1 INT CHECK (isi_1 >= 0 AND isi_1 <= 4);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS isi_2 INT CHECK (isi_2 >= 0 AND isi_2 <= 4);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS isi_3 INT CHECK (isi_3 >= 0 AND isi_3 <= 4);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS isi_4 INT CHECK (isi_4 >= 0 AND isi_4 <= 4);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS isi_5 INT CHECK (isi_5 >= 0 AND isi_5 <= 4);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS isi_6 INT CHECK (isi_6 >= 0 AND isi_6 <= 4);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS isi_7 INT CHECK (isi_7 >= 0 AND isi_7 <= 4);

-- ============================================
-- 3. WELLNESS / WHOQOL-BREF — 3 items
-- ============================================
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wellness_1 FLOAT;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wellness_2 FLOAT;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wellness_3 FLOAT;

-- ============================================
-- 4. H1/H2 CHECKBOX ARRAYS (multi-select feedback)
-- ============================================
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS h1_liked TEXT[];
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS h1_liked_other TEXT;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS h2_suggested TEXT[];
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS h2_suggested_other TEXT;

-- ============================================
-- 5. INDEX for condition_type queries
-- ============================================
CREATE INDEX IF NOT EXISTS surveys_condition_type ON surveys(condition_type);

-- ============================================
-- 6. UPDATE TRIGGER: Add NPS + Pain Reduction tracking
-- ============================================

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

-- Re-create trigger (idempotent)
DROP TRIGGER IF EXISTS on_survey_insert ON surveys;
CREATE TRIGGER on_survey_insert
    AFTER INSERT ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_survey();

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Migration v1.1.0 → v1.2.0 complete!' AS status;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'surveys'
  AND column_name IN (
    'barthel_eat_first', 'barthel_eat_current', 'barthel_stairs_first', 'barthel_stairs_current',
    'isi_1', 'isi_7', 'wellness_1', 'wellness_2', 'wellness_3',
    'h1_liked', 'h1_liked_other', 'h2_suggested', 'h2_suggested_other'
  )
ORDER BY ordinal_position;

COMMIT;
