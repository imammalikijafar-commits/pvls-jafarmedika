-- ============================================
-- DPEMS Database Schema
-- Version: 2.1 (Kuesioner Revisi Komprehensif)
-- Kuesioner Final: 9 Sections (A-I)
-- Exploratory Spiritual Scale: F1-F8 (8 dimensi)
-- Compatible with: Next.js 16 + Supabase + TypeScript
-- Author: Imam Maliki
-- Changelog:
--   v2.1 - Spiritual restructure: 9D → 8D (F2 gender → A2b, F3 prayer → B2.5,
--           F1 adab removed, F6 tawakkal + F7 ridha added).
--           Add A2b gender_preference, rename patient_type → payment_type,
--           add payment_type_other. SERVQUAL B2: 4→5 items. Remove wtp_price_increase.
--   v2.0.0 FINAL - Clean: Remove all legacy spiritual & adjuvant columns.
--                 Use F1-F9 pure, D1-D4 pure. Add WTP (I1-I4), G4/G5 loyalty,
--                 A5 income, condition_type_other, occupation_other.
--   v1.2.0 - Added Barthel Index, ISI, Wellness, H1/H2 arrays
--   v1.1.0 - Added education, occupation, referral_source, herbal, etc.
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    unit_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_units_hospital_id ON units(hospital_id);
CREATE INDEX IF NOT EXISTS idx_units_qr_code ON units(qr_code);

CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,

    -- ============================================
    -- BAGIAN A: Demographics (12 items)
    -- ============================================
    age_range VARCHAR(20),
    gender VARCHAR(10),
    gender_preference VARCHAR(30),          -- A2b: Ya / Tidak / Tidak ada preferensi
    education VARCHAR(50),
    occupation VARCHAR(50),
    occupation_other TEXT,                  -- A4 Lainnya
    income_range VARCHAR(50),               -- A5
    payment_type VARCHAR(50),               -- A6: Jenis pembayaran
    payment_type_other TEXT,                -- A6 Lainnya
    condition_type VARCHAR(100),            -- A7
    condition_type_other TEXT,              -- A7 Lainnya
    visit_count VARCHAR(50),                -- A8
    referral_source VARCHAR(100),           -- A9

    -- ============================================
    -- BAGIAN B: SERVQUAL Dimensions (22 items -> 5 averages)
    -- B1: 5 items, B2: 5 items, B3-B5: 4 items each
    -- ============================================
    tangibles FLOAT CHECK (tangibles >= 1 AND tangibles <= 5),
    reliability FLOAT CHECK (reliability >= 1 AND reliability <= 5),
    responsiveness FLOAT CHECK (responsiveness >= 1 AND responsiveness <= 5),
    assurance FLOAT CHECK (assurance >= 1 AND assurance <= 5),
    empathy FLOAT CHECK (empathy >= 1 AND empathy <= 5),

    -- ============================================
    -- BAGIAN C: Herbal Service (6 Likert items, conditional)
    -- ============================================
    herbal_prescribed BOOLEAN DEFAULT false,
    herb_explanation FLOAT CHECK (herb_explanation >= 1 AND herb_explanation <= 5),
    herb_usage_guide FLOAT CHECK (herb_usage_guide >= 1 AND herb_usage_guide <= 5),
    herb_safety_trust FLOAT CHECK (herb_safety_trust >= 1 AND herb_safety_trust <= 5),
    herb_availability FLOAT CHECK (herb_availability >= 1 AND herb_availability <= 5),
    herb_affordability FLOAT CHECK (herb_affordability >= 1 AND herb_affordability <= 5),
    herb_pharmacist FLOAT CHECK (herb_pharmacist >= 1 AND herb_pharmacist <= 5),

    -- ============================================
    -- BAGIAN D: Clarity of Therapeutic Role (4 items)
    -- ============================================
    d1_clarity_role FLOAT CHECK (d1_clarity_role >= 1 AND d1_clarity_role <= 5),
    d2_clarity_explanation FLOAT CHECK (d2_clarity_explanation >= 1 AND d2_clarity_explanation <= 5),
    d3_clarity_comfortable FLOAT CHECK (d3_clarity_comfortable >= 1 AND d3_clarity_comfortable <= 5),
    d4_clarity_specialist FLOAT CHECK (d4_clarity_specialist >= 1 AND d4_clarity_specialist <= 5),

    -- ============================================
    -- BAGIAN E: Clinical Outcomes (Conditional)
    -- ============================================
    -- E1: Pain Level
    pain_level_before INT CHECK (pain_level_before >= 0 AND pain_level_before <= 10),
    pain_level_after INT CHECK (pain_level_after >= 0 AND pain_level_after <= 10),
    condition_change VARCHAR(50),

    -- E2: Barthel Index (Stroke) — 10 activities x 2 timepoints
    barthel_eat_first INT DEFAULT 0, barthel_eat_current INT DEFAULT 0,
    barthel_bath_first INT DEFAULT 0, barthel_bath_current INT DEFAULT 0,
    barthel_groom_first INT DEFAULT 0, barthel_groom_current INT DEFAULT 0,
    barthel_dress_first INT DEFAULT 0, barthel_dress_current INT DEFAULT 0,
    barthel_toilet_first INT DEFAULT 0, barthel_toilet_current INT DEFAULT 0,
    barthel_bowel_first INT DEFAULT 0, barthel_bowel_current INT DEFAULT 0,
    barthel_bladder_first INT DEFAULT 0, barthel_bladder_current INT DEFAULT 0,
    barthel_transfer_first INT DEFAULT 0, barthel_transfer_current INT DEFAULT 0,
    barthel_mobility_first INT DEFAULT 0, barthel_mobility_current INT DEFAULT 0,
    barthel_stairs_first INT DEFAULT 0, barthel_stairs_current INT DEFAULT 0,

    -- E3: Insomnia Severity Index (ISI) — 7 items, 0-4 scale
    isi_1 INT CHECK (isi_1 >= 0 AND isi_1 <= 4),
    isi_2 INT CHECK (isi_2 >= 0 AND isi_2 <= 4),
    isi_3 INT CHECK (isi_3 >= 0 AND isi_3 <= 4),
    isi_4 INT CHECK (isi_4 >= 0 AND isi_4 <= 4),
    isi_5 INT CHECK (isi_5 >= 0 AND isi_5 <= 4),
    isi_6 INT CHECK (isi_6 >= 0 AND isi_6 <= 4),
    isi_7 INT CHECK (isi_7 >= 0 AND isi_7 <= 4),

    -- E4: Wellness (3-item Self-Rated Health) — 1-5 scale
    wellness_1 FLOAT CHECK (wellness_1 >= 1 AND wellness_1 <= 5),
    wellness_2 FLOAT CHECK (wellness_2 >= 1 AND wellness_2 <= 5),
    wellness_3 FLOAT CHECK (wellness_3 >= 1 AND wellness_3 <= 5),

    -- ============================================
    -- BAGIAN F: Spiritual & Holistik (8 items) v2.1
    -- Exploratory Scale — 7 dimensi + 1 reverse-coded
    -- F8 reverse-coded: 1->5, 2->4, 3->3, 4->2, 5->1
    -- F1-F5 renumbered from v2.0 F4-F8; F6-F7 new (tawakkal, ridha)
    -- ============================================
    f1_halal_assurance FLOAT CHECK (f1_halal_assurance >= 1 AND f1_halal_assurance <= 5),
    f2_tibb_nabawi FLOAT CHECK (f2_tibb_nabawi >= 1 AND f2_tibb_nabawi <= 5),
    f3_spiritual_activation FLOAT CHECK (f3_spiritual_activation >= 1 AND f3_spiritual_activation <= 5),
    f4_holistic_peace FLOAT CHECK (f4_holistic_peace >= 1 AND f4_holistic_peace <= 5),
    f5_spiritual_communication FLOAT CHECK (f5_spiritual_communication >= 1 AND f5_spiritual_communication <= 5),
    f6_tawakkal FLOAT CHECK (f6_tawakkal >= 1 AND f6_tawakkal <= 5),
    f7_ridha FLOAT CHECK (f7_ridha >= 1 AND f7_ridha <= 5),
    f8_reverse_coded FLOAT CHECK (f8_reverse_coded >= 1 AND f8_reverse_coded <= 5),

    -- ============================================
    -- BAGIAN G: NPS & Loyalty (4 items)
    -- ============================================
    nps_score INT CHECK (nps_score >= 0 AND nps_score <= 10),
    visit_plan VARCHAR(100),
    has_recommended VARCHAR(50),
    recommendation_count VARCHAR(50),        -- G4

    -- ============================================
    -- BAGIAN H: Feedback / Masukan
    -- ============================================
    best_experience TEXT,
    improvement_suggestion TEXT,
    testimonial TEXT,
    h1_liked TEXT[],
    h1_liked_other TEXT,
    h2_suggested TEXT[],
    h2_suggested_other TEXT,

    -- ============================================
    -- BAGIAN I: Willingness to Pay (4 items)
    -- ============================================
    wtp_cost_today INT DEFAULT 0,
    wtp_increase_20 VARCHAR(100),
    wtp_package_interest VARCHAR(100),
    wtp_max_acceptable VARCHAR(100),

    -- ============================================
    -- FULL RESPONSES & METADATA
    -- ============================================
    responses_json JSONB,
    session_duration_seconds INT,
    device_type VARCHAR(20),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS surveys_unit_id ON surveys(unit_id);
CREATE INDEX IF NOT EXISTS surveys_submitted_at ON surveys(submitted_at);
CREATE INDEX IF NOT EXISTS surveys_herbal_prescribed ON surveys(herbal_prescribed);
CREATE INDEX IF NOT EXISTS surveys_condition_type ON surveys(condition_type);

CREATE TABLE IF NOT EXISTS survey_aggregations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    avg_tangibles FLOAT,
    avg_reliability FLOAT,
    avg_responsiveness FLOAT,
    avg_assurance FLOAT,
    avg_empathy FLOAT,
    avg_overall FLOAT,
    total_responses INT DEFAULT 0,
    promoters_count INT DEFAULT 0,
    passives_count INT DEFAULT 0,
    detractors_count INT DEFAULT 0,
    nps_score INT,
    avg_pain_reduction_pct FLOAT,
    UNIQUE(unit_id, date)
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    survey_id UUID REFERENCES surveys(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    message TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGER: Auto-Aggregation on New Survey
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
        THEN ROUND(((NEW.pain_level_before - NEW.pain_level_after)::numeric / NEW.pain_level_before) * 100, 1)
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
        END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_survey_insert ON surveys;
CREATE TRIGGER on_survey_insert
    AFTER INSERT ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_survey();

-- ============================================
-- SEED DATA (Development/Testing Only)
-- ============================================

INSERT INTO hospitals (name, type, code, address, phone, email)
VALUES ('RS Studi Kasus (Tipe D)', 'Tipe D', 'RS-JMK-001', 'Mojogedang, Karanganyar, Jawa Tengah', '085762784375', 'jafarmedika@yahoo.co.id')
ON CONFLICT (code) DO NOTHING;

INSERT INTO units (hospital_id, name, description, qr_code, unit_type, sort_order)
SELECT id, 'Poli Akupuntur & Herbal', 'Layanan unggulan integrative medicine untuk stroke rehabilitasi dan manajemen nyeri', 'akupuntur-herbal', 'integrative', 1
FROM hospitals WHERE code = 'RS-JMK-001'
ON CONFLICT (qr_code) DO NOTHING;

INSERT INTO units (hospital_id, name, description, qr_code, unit_type, sort_order)
SELECT id, 'Poliklinik Umum', 'Pelayanan medis umum dan penyakit dalam', 'poli-umum', 'umum', 2
FROM hospitals WHERE code = 'RS-JMK-001'
ON CONFLICT (qr_code) DO NOTHING;

INSERT INTO units (hospital_id, name, description, qr_code, unit_type, sort_order)
SELECT id, 'Apotek & Herbal Medicine', 'Pengobatan herbal dan farmasi konvensional', 'apotek-herbal', 'farmasi', 3
FROM hospitals WHERE code = 'RS-JMK-001'
ON CONFLICT (qr_code) DO NOTHING;

INSERT INTO units (hospital_id, name, description, qr_code, unit_type, sort_order)
SELECT id, 'Poli Fisioterapi', 'Rehabilitasi fisik dan terapi gerak pasca-stroke', 'fisioterapi', 'rehabilitasi', 4
FROM hospitals WHERE code = 'RS-JMK-001'
ON CONFLICT (qr_code) DO NOTHING;

INSERT INTO units (hospital_id, name, description, qr_code, unit_type, sort_order)
SELECT id, 'IGD & Medical Check-up', 'Instalasi Gawat Darurat dan pemeriksaan kesehatan', 'igd', 'darurat', 5
FROM hospitals WHERE code = 'RS-JMK-001'
ON CONFLICT (qr_code) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Units: public SELECT (needed for QR code validation on landing page)
CREATE POLICY "units_select_public" ON units FOR SELECT USING (true);
-- Surveys: public INSERT (patients submit via anon key), SELECT restricted to service_role
CREATE POLICY "surveys_insert_public" ON surveys FOR INSERT WITH CHECK (true);
CREATE POLICY "surveys_select_service_role" ON surveys FOR SELECT USING (auth.role() = 'service_role');
-- Aggregations & alerts: restricted to service_role (patient health data)
CREATE POLICY "aggregations_select_service_role" ON survey_aggregations FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "alerts_select_service_role" ON alerts FOR SELECT USING (auth.role() = 'service_role');
