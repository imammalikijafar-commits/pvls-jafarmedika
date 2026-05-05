-- ============================================
-- DPEMS Migration: v2.1 → v2.2
-- SERVQUAL Item-Level Columns + SCI Score
-- ============================================
-- RUN AFTER migration-v2.0-to-v2.1.sql
-- Backup: pg_dump -U postgres dpems > dpems_v2.1_backup.sql
-- ============================================

BEGIN;

-- ============================================
-- SECTION 1: Add 25 SERVQUAL item-level columns
-- ============================================

-- Tangibles (B1) — 5 items
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b1_1_facility_condition FLOAT CHECK (b1_1_facility_condition >= 1 AND b1_1_facility_condition <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b1_2_equipment_modern FLOAT CHECK (b1_2_equipment_modern >= 1 AND b1_2_equipment_modern <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b1_3_staff_appearance FLOAT CHECK (b1_3_staff_appearance >= 1 AND b1_3_staff_appearance <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b1_4_facility_comfort FLOAT CHECK (b1_4_facility_comfort >= 1 AND b1_4_facility_comfort <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b1_5_islamic_facilities FLOAT CHECK (b1_5_islamic_facilities >= 1 AND b1_5_islamic_facilities <= 5);

-- Reliability (B2) — 5 items
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b2_1_service_accuracy FLOAT CHECK (b2_1_service_accuracy >= 1 AND b2_1_service_accuracy <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b2_2_punctuality FLOAT CHECK (b2_2_punctuality >= 1 AND b2_2_punctuality <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b2_3_admin_accuracy FLOAT CHECK (b2_3_admin_accuracy >= 1 AND b2_3_admin_accuracy <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b2_4_consistency FLOAT CHECK (b2_4_consistency >= 1 AND b2_4_consistency <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b2_5_prayer_accommodation FLOAT CHECK (b2_5_prayer_accommodation >= 1 AND b2_5_prayer_accommodation <= 5);

-- Responsiveness (B3) — 5 items
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b3_1_quick_response FLOAT CHECK (b3_1_quick_response >= 1 AND b3_1_quick_response <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b3_2_staff_willingness FLOAT CHECK (b3_2_staff_willingness >= 1 AND b3_2_staff_willingness <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b3_3_complaint_handling FLOAT CHECK (b3_3_complaint_handling >= 1 AND b3_3_complaint_handling <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b3_4_waiting_time FLOAT CHECK (b3_4_waiting_time >= 1 AND b3_4_waiting_time <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b3_5_information_clarity FLOAT CHECK (b3_5_information_clarity >= 1 AND b3_5_information_clarity <= 5);

-- Assurance (B4) — 5 items
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b4_1_staff_competence FLOAT CHECK (b4_1_staff_competence >= 1 AND b4_1_staff_competence <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b4_2_patient_trust FLOAT CHECK (b4_2_patient_trust >= 1 AND b4_2_patient_trust <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b4_3_safety_feeling FLOAT CHECK (b4_3_safety_feeling >= 1 AND b4_3_safety_feeling <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b4_4_staff_courtesy FLOAT CHECK (b4_4_staff_courtesy >= 1 AND b4_4_staff_courtesy <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b4_5_knowledge FLOAT CHECK (b4_5_knowledge >= 1 AND b4_5_knowledge <= 5);

-- Empathy (B5) — 5 items
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b5_1_individual_attention FLOAT CHECK (b5_1_individual_attention >= 1 AND b5_1_individual_attention <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b5_2_understanding_needs FLOAT CHECK (b5_2_understanding_needs >= 1 AND b5_2_understanding_needs <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b5_3_respectful_treatment FLOAT CHECK (b5_3_respectful_treatment >= 1 AND b5_3_respectful_treatment <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b5_4_followup_visits FLOAT CHECK (b5_4_followup_visits >= 1 AND b5_4_followup_visits <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS b5_5_operating_hours FLOAT CHECK (b5_5_operating_hours >= 1 AND b5_5_operating_hours <= 5);

-- Comments for each column
COMMENT ON COLUMN surveys.b1_1_facility_condition IS 'B1.1: Tangibles item 1 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b1_2_equipment_modern IS 'B1.2: Tangibles item 2 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b1_3_staff_appearance IS 'B1.3: Tangibles item 3 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b1_4_facility_comfort IS 'B1.4: Tangibles item 4 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b1_5_islamic_facilities IS 'B1.5: Tangibles item 5 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b2_1_service_accuracy IS 'B2.1: Reliability item 1 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b2_2_punctuality IS 'B2.2: Reliability item 2 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b2_3_admin_accuracy IS 'B2.3: Reliability item 3 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b2_4_consistency IS 'B2.4: Reliability item 4 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b2_5_prayer_accommodation IS 'B2.5: Reliability item 5 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b3_1_quick_response IS 'B3.1: Responsiveness item 1 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b3_2_staff_willingness IS 'B3.2: Responsiveness item 2 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b3_3_complaint_handling IS 'B3.3: Responsiveness item 3 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b3_4_waiting_time IS 'B3.4: Responsiveness item 4 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b3_5_information_clarity IS 'B3.5: Responsiveness item 5 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b4_1_staff_competence IS 'B4.1: Assurance item 1 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b4_2_patient_trust IS 'B4.2: Assurance item 2 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b4_3_safety_feeling IS 'B4.3: Assurance item 3 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b4_4_staff_courtesy IS 'B4.4: Assurance item 4 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b4_5_knowledge IS 'B4.5: Assurance item 5 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b5_1_individual_attention IS 'B5.1: Empathy item 1 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b5_2_understanding_needs IS 'B5.2: Empathy item 2 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b5_3_respectful_treatment IS 'B5.3: Empathy item 3 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b5_4_followup_visits IS 'B5.4: Empathy item 4 — SERVQUAL v2.2';
COMMENT ON COLUMN surveys.b5_5_operating_hours IS 'B5.5: Empathy item 5 — SERVQUAL v2.2';

-- ============================================
-- SECTION 2: Update trigger — compute aggregates from item-level
-- ============================================

-- Drop old trigger
DROP TRIGGER IF EXISTS on_survey_insert ON surveys;

-- Create updated trigger function
CREATE OR REPLACE FUNCTION handle_new_survey()
RETURNS TRIGGER AS $$
DECLARE
    new_overall FLOAT;
    new_promoter INT;
    new_passive INT;
    new_detractor INT;
    new_pain_reduction FLOAT;

    -- Item-level counts (for computing averages only from non-null items)
    b1_count INT DEFAULT 0;
    b2_count INT DEFAULT 0;
    b3_count INT DEFAULT 0;
    b4_count INT DEFAULT 0;
    b5_count INT DEFAULT 0;

    -- Computed aggregates from items
    new_tangibles FLOAT;
    new_reliability FLOAT;
    new_responsiveness FLOAT;
    new_assurance FLOAT;
    new_empathy FLOAT;

    -- SCI score
    f8_reversed FLOAT;
    f_count INT DEFAULT 0;
    new_sci_score FLOAT;
BEGIN
    -- ============================================
    -- Compute SERVQUAL aggregates from item-level columns
    -- If ALL items for a dimension are NULL, keep incoming aggregate value
    -- ============================================

    -- Tangibles (B1)
    b1_count := CASE WHEN NEW.b1_1_facility_condition IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b1_2_equipment_modern IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b1_3_staff_appearance IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b1_4_facility_comfort IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b1_5_islamic_facilities IS NOT NULL THEN 1 ELSE 0 END;

    IF b1_count > 0 THEN
        new_tangibles := (
            COALESCE(NEW.b1_1_facility_condition, 0) + COALESCE(NEW.b1_2_equipment_modern, 0) +
            COALESCE(NEW.b1_3_staff_appearance, 0) + COALESCE(NEW.b1_4_facility_comfort, 0) +
            COALESCE(NEW.b1_5_islamic_facilities, 0)
        ) / b1_count;
    ELSE
        new_tangibles := NEW.tangibles; -- fallback: keep existing aggregate
    END IF;

    -- Reliability (B2)
    b2_count := CASE WHEN NEW.b2_1_service_accuracy IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b2_2_punctuality IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b2_3_admin_accuracy IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b2_4_consistency IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b2_5_prayer_accommodation IS NOT NULL THEN 1 ELSE 0 END;

    IF b2_count > 0 THEN
        new_reliability := (
            COALESCE(NEW.b2_1_service_accuracy, 0) + COALESCE(NEW.b2_2_punctuality, 0) +
            COALESCE(NEW.b2_3_admin_accuracy, 0) + COALESCE(NEW.b2_4_consistency, 0) +
            COALESCE(NEW.b2_5_prayer_accommodation, 0)
        ) / b2_count;
    ELSE
        new_reliability := NEW.reliability;
    END IF;

    -- Responsiveness (B3)
    b3_count := CASE WHEN NEW.b3_1_quick_response IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b3_2_staff_willingness IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b3_3_complaint_handling IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b3_4_waiting_time IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b3_5_information_clarity IS NOT NULL THEN 1 ELSE 0 END;

    IF b3_count > 0 THEN
        new_responsiveness := (
            COALESCE(NEW.b3_1_quick_response, 0) + COALESCE(NEW.b3_2_staff_willingness, 0) +
            COALESCE(NEW.b3_3_complaint_handling, 0) + COALESCE(NEW.b3_4_waiting_time, 0) +
            COALESCE(NEW.b3_5_information_clarity, 0)
        ) / b3_count;
    ELSE
        new_responsiveness := NEW.responsiveness;
    END IF;

    -- Assurance (B4)
    b4_count := CASE WHEN NEW.b4_1_staff_competence IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b4_2_patient_trust IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b4_3_safety_feeling IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b4_4_staff_courtesy IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b4_5_knowledge IS NOT NULL THEN 1 ELSE 0 END;

    IF b4_count > 0 THEN
        new_assurance := (
            COALESCE(NEW.b4_1_staff_competence, 0) + COALESCE(NEW.b4_2_patient_trust, 0) +
            COALESCE(NEW.b4_3_safety_feeling, 0) + COALESCE(NEW.b4_4_staff_courtesy, 0) +
            COALESCE(NEW.b4_5_knowledge, 0)
        ) / b4_count;
    ELSE
        new_assurance := NEW.assurance;
    END IF;

    -- Empathy (B5)
    b5_count := CASE WHEN NEW.b5_1_individual_attention IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b5_2_understanding_needs IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b5_3_respectful_treatment IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b5_4_followup_visits IS NOT NULL THEN 1 ELSE 0 END
              + CASE WHEN NEW.b5_5_operating_hours IS NOT NULL THEN 1 ELSE 0 END;

    IF b5_count > 0 THEN
        new_empathy := (
            COALESCE(NEW.b5_1_individual_attention, 0) + COALESCE(NEW.b5_2_understanding_needs, 0) +
            COALESCE(NEW.b5_3_respectful_treatment, 0) + COALESCE(NEW.b5_4_followup_visits, 0) +
            COALESCE(NEW.b5_5_operating_hours, 0)
        ) / b5_count;
    ELSE
        new_empathy := NEW.empathy;
    END IF;

    -- Store computed aggregates back to the survey row
    NEW.tangibles := new_tangibles;
    NEW.reliability := new_reliability;
    NEW.responsiveness := new_responsiveness;
    NEW.assurance := new_assurance;
    NEW.empathy := new_empathy;

    -- Overall
    new_overall := (COALESCE(new_tangibles, 0) + COALESCE(new_reliability, 0) +
                    COALESCE(new_responsiveness, 0) + COALESCE(new_assurance, 0) +
                    COALESCE(new_empathy, 0)) / 5;

    -- NPS classification
    new_promoter := CASE WHEN NEW.nps_score >= 9 THEN 1 ELSE 0 END;
    new_passive := CASE WHEN NEW.nps_score >= 7 AND NEW.nps_score <= 8 THEN 1 ELSE 0 END;
    new_detractor := CASE WHEN NEW.nps_score IS NOT NULL AND NEW.nps_score <= 6 THEN 1 ELSE 0 END;

    -- Pain reduction
    new_pain_reduction := CASE
        WHEN NEW.pain_level_before IS NOT NULL AND NEW.pain_level_after IS NOT NULL
             AND NEW.pain_level_before > 0
        THEN ROUND(((NEW.pain_level_before - NEW.pain_level_after)::numeric / NEW.pain_level_before) * 100, 1)
        ELSE NULL
    END;

    -- ============================================
    -- SCI Score (F1-F8, F8 reversed: 6 - raw)
    -- ============================================
    f8_reversed := CASE WHEN NEW.f8_reverse_coded IS NOT NULL THEN 6 - NEW.f8_reverse_coded ELSE NULL END;

    f_count := CASE WHEN NEW.f1_halal_assurance IS NOT NULL THEN 1 ELSE 0 END
            + CASE WHEN NEW.f2_tibb_nabawi IS NOT NULL THEN 1 ELSE 0 END
            + CASE WHEN NEW.f3_spiritual_activation IS NOT NULL THEN 1 ELSE 0 END
            + CASE WHEN NEW.f4_holistic_peace IS NOT NULL THEN 1 ELSE 0 END
            + CASE WHEN NEW.f5_spiritual_communication IS NOT NULL THEN 1 ELSE 0 END
            + CASE WHEN NEW.f6_tawakkal IS NOT NULL THEN 1 ELSE 0 END
            + CASE WHEN NEW.f7_ridha IS NOT NULL THEN 1 ELSE 0 END
            + CASE WHEN NEW.f8_reverse_coded IS NOT NULL THEN 1 ELSE 0 END;

    IF f_count >= 4 THEN
        new_sci_score := (
            COALESCE(NEW.f1_halal_assurance, 0) + COALESCE(NEW.f2_tibb_nabawi, 0) +
            COALESCE(NEW.f3_spiritual_activation, 0) + COALESCE(NEW.f4_holistic_peace, 0) +
            COALESCE(NEW.f5_spiritual_communication, 0) + COALESCE(NEW.f6_tawakkal, 0) +
            COALESCE(NEW.f7_ridha, 0) + COALESCE(f8_reversed, 0)
        ) / f_count;
    ELSE
        new_sci_score := NULL;
    END IF;

    -- ============================================
    -- Insert/Update survey_aggregations
    -- ============================================
    INSERT INTO survey_aggregations (
        unit_id, date, total_responses,
        avg_tangibles, avg_reliability, avg_responsiveness, avg_assurance, avg_empathy, avg_overall,
        promoters_count, passives_count, detractors_count, nps_score, avg_pain_reduction_pct,
        avg_sci_score
    )
    VALUES (
        NEW.unit_id, CURRENT_DATE, 1,
        new_tangibles, new_reliability, new_responsiveness, new_assurance, new_empathy, new_overall,
        new_promoter, new_passive, new_detractor,
        CASE WHEN NEW.nps_score IS NOT NULL THEN (new_promoter - new_detractor) * 100 ELSE NULL END,
        new_pain_reduction,
        new_sci_score
    )
    ON CONFLICT (unit_id, date)
    DO UPDATE SET
        total_responses = survey_aggregations.total_responses + 1,
        avg_tangibles = (survey_aggregations.avg_tangibles * survey_aggregations.total_responses + new_tangibles) / (survey_aggregations.total_responses + 1),
        avg_reliability = (survey_aggregations.avg_reliability * survey_aggregations.total_responses + new_reliability) / (survey_aggregations.total_responses + 1),
        avg_responsiveness = (survey_aggregations.avg_responsiveness * survey_aggregations.total_responses + new_responsiveness) / (survey_aggregations.total_responses + 1),
        avg_assurance = (survey_aggregations.avg_assurance * survey_aggregations.total_responses + new_assurance) / (survey_aggregations.total_responses + 1),
        avg_empathy = (survey_aggregations.avg_empathy * survey_aggregations.total_responses + new_empathy) / (survey_aggregations.total_responses + 1),
        avg_overall = (survey_aggregations.avg_overall * survey_aggregations.total_responses + new_overall) / (survey_aggregations.total_responses + 1),
        promoters_count = survey_aggregations.promoters_count + new_promoter,
        passives_count = survey_aggregations.passives_count + new_passive,
        detractors_count = survey_aggregations.detractors_count + new_detractor,
        nps_score = CASE
            WHEN (survey_aggregations.promoters_count + new_promoter +
                  survey_aggregations.detractors_count + new_detractor) > 0
            THEN ((survey_aggregations.promoters_count + new_promoter -
                   survey_aggregations.detractors_count - new_detractor)::numeric /
                   (survey_aggregations.total_responses + 1)) * 100
            ELSE NULL
        END,
        avg_pain_reduction_pct = CASE
            WHEN new_pain_reduction IS NOT NULL
            THEN COALESCE(survey_aggregations.avg_pain_reduction_pct, 0) *
                 survey_aggregations.total_responses / (survey_aggregations.total_responses + 1)
                 + new_pain_reduction / (survey_aggregations.total_responses + 1)
            ELSE survey_aggregations.avg_pain_reduction_pct
        END,
        avg_sci_score = CASE
            WHEN new_sci_score IS NOT NULL
            THEN COALESCE(survey_aggregations.avg_sci_score, 0) *
                 survey_aggregations.total_responses / (survey_aggregations.total_responses + 1)
                 + new_sci_score / (survey_aggregations.total_responses + 1)
            ELSE survey_aggregations.avg_sci_score
        END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-create trigger (BEFORE, not AFTER — we modify NEW.* to store computed aggregates)
CREATE TRIGGER on_survey_insert
    BEFORE INSERT ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_survey();

COMMENT ON FUNCTION handle_new_survey() IS 'Auto-aggregation trigger v2.2: computes SERVQUAL aggregates from 25 item-level columns, calculates SCI score (F1-F8 with F8 reversed), stores to survey_aggregations.';

-- ============================================
-- SECTION 3: Add avg_sci_score to survey_aggregations
-- ============================================

ALTER TABLE survey_aggregations ADD COLUMN IF NOT EXISTS avg_sci_score FLOAT;
COMMENT ON COLUMN survey_aggregations.avg_sci_score IS 'Rata-rata SCI 8 dimensi (F1-F8, dengan F8 sudah di-reverse sebelum masuk)';

-- ============================================
-- SECTION 4: Create SEM export view
-- ============================================

CREATE OR REPLACE VIEW surveys_sem_ready AS
SELECT
  id, submitted_at, unit_id,
  -- Demographics
  age_range, gender, gender_preference, education, occupation,
  income_range, payment_type, condition_type, visit_count,
  -- SERVQUAL 25 items
  b1_1_facility_condition, b1_2_equipment_modern, b1_3_staff_appearance,
  b1_4_facility_comfort, b1_5_islamic_facilities,
  b2_1_service_accuracy, b2_2_punctuality, b2_3_admin_accuracy,
  b2_4_consistency, b2_5_prayer_accommodation,
  b3_1_quick_response, b3_2_staff_willingness, b3_3_complaint_handling,
  b3_4_waiting_time, b3_5_information_clarity,
  b4_1_staff_competence, b4_2_patient_trust, b4_3_safety_feeling,
  b4_4_staff_courtesy, b4_5_knowledge,
  b5_1_individual_attention, b5_2_understanding_needs, b5_3_respectful_treatment,
  b5_4_followup_visits, b5_5_operating_hours,
  -- SERVQUAL aggregates
  tangibles, reliability, responsiveness, assurance, empathy,
  -- SCI 8 items
  f1_halal_assurance, f2_tibb_nabawi, f3_spiritual_activation,
  f4_holistic_peace, f5_spiritual_communication, f6_tawakkal, f7_ridha,
  f8_reverse_coded,
  -- F8 reversed (untuk SEM)
  CASE WHEN f8_reverse_coded IS NOT NULL THEN 6 - f8_reverse_coded ELSE NULL END
    AS f8_reversed_score,
  -- SCI aggregate
  (COALESCE(f1_halal_assurance,0) + COALESCE(f2_tibb_nabawi,0) +
   COALESCE(f3_spiritual_activation,0) + COALESCE(f4_holistic_peace,0) +
   COALESCE(f5_spiritual_communication,0) + COALESCE(f6_tawakkal,0) +
   COALESCE(f7_ridha,0) +
   COALESCE(CASE WHEN f8_reverse_coded IS NOT NULL THEN 6-f8_reverse_coded END, 0)
  ) / NULLIF(
    (CASE WHEN f1_halal_assurance IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN f2_tibb_nabawi IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN f3_spiritual_activation IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN f4_holistic_peace IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN f5_spiritual_communication IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN f6_tawakkal IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN f7_ridha IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN f8_reverse_coded IS NOT NULL THEN 1 ELSE 0 END), 0)
    AS sci_score,
  -- Clarity D1-D4
  d1_clarity_role, d2_clarity_explanation,
  d3_clarity_comfortable, d4_clarity_specialist,
  -- Outcomes
  pain_level_before, pain_level_after,
  -- Loyalty
  nps_score, visit_plan, has_recommended,
  -- WTP
  wtp_cost_today, wtp_increase_20, wtp_max_acceptable
FROM surveys
WHERE condition_type IS NOT NULL;

COMMENT ON VIEW surveys_sem_ready IS 'Export-ready view untuk SmartPLS PLS-SEM analysis. Berisi semua item individual SERVQUAL-25, SCI-8, dan konstruk terkait.';

-- ============================================
-- SECTION 5: Create index for performance
-- ============================================

CREATE INDEX IF NOT EXISTS surveys_b1_items ON surveys (b1_1_facility_condition, b1_2_equipment_modern, b1_3_staff_appearance, b1_4_facility_comfort, b1_5_islamic_facilities) WHERE b1_1_facility_condition IS NOT NULL;

-- ============================================
-- SECTION 6: Harden RLS policies (ethical clearance compliance)
-- Surveys contain patient health data — SELECT must be restricted
-- to service_role only. INSERT remains anon (patient submissions).
-- ============================================

-- Surveys: lock down SELECT to service_role only
DROP POLICY IF EXISTS "surveys_select_public" ON surveys;
CREATE POLICY "surveys_select_service_role" ON surveys
    FOR SELECT USING (auth.role() = 'service_role');

-- Survey aggregations: same restriction
DROP POLICY IF EXISTS "aggregations_select_public" ON survey_aggregations;
CREATE POLICY "aggregations_select_service_role" ON survey_aggregations
    FOR SELECT USING (auth.role() = 'service_role');

-- Alerts: same restriction
DROP POLICY IF EXISTS "alerts_select_public" ON alerts;
CREATE POLICY "alerts_select_service_role" ON alerts
    FOR SELECT USING (auth.role() = 'service_role');

-- Units: stays public (needed for QR code validation on landing page)
-- INSERT on surveys: stays public (patients submit via anon key)

COMMIT;

-- ============================================
-- POST-MIGRATION VERIFICATION
-- (Run manually in Supabase SQL Editor)
-- ============================================
--
-- -- Check 25 SERVQUAL item columns exist
-- SELECT COUNT(*) AS servqual_item_columns
-- FROM information_schema.columns
-- WHERE table_name = 'surveys'
--   AND column_name IN (
--     'b1_1_facility_condition','b1_2_equipment_modern','b1_3_staff_appearance',
--     'b1_4_facility_comfort','b1_5_islamic_facilities',
--     'b2_1_service_accuracy','b2_2_punctuality','b2_3_admin_accuracy',
--     'b2_4_consistency','b2_5_prayer_accommodation',
--     'b3_1_quick_response','b3_2_staff_willingness','b3_3_complaint_handling',
--     'b3_4_waiting_time','b3_5_information_clarity',
--     'b4_1_staff_competence','b4_2_patient_trust','b4_3_safety_feeling',
--     'b4_4_staff_courtesy','b4_5_knowledge',
--     'b5_1_individual_attention','b5_2_understanding_needs','b5_3_respectful_treatment',
--     'b5_4_followup_visits','b5_5_operating_hours'
--   );
-- Expected: 25
--
-- -- Check b2_5_prayer_accommodation exists
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'surveys' AND column_name = 'b2_5_prayer_accommodation';
-- Expected: 1 row, FLOAT
--
-- -- Check avg_sci_score in survey_aggregations
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'survey_aggregations' AND column_name = 'avg_sci_score';
-- Expected: 1 row, FLOAT
--
-- -- Verify view exists and is queryable
-- SELECT COUNT(*) AS total_rows FROM surveys_sem_ready;
-- Expected: number of surveys with condition_type IS NOT NULL
