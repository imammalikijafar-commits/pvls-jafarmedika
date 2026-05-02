-- ============================================
-- MIGRATION: v1.2.0 → v2.0.0
-- Kuesioner Final — 9 Sections (A-I)
-- Run this if upgrading from v1.2.0
-- ============================================

-- A5: Income range (new field)
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS income_range VARCHAR(50);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS condition_type_other TEXT;

-- B1.5: Fasilitas ibadah (already exists as SERVQUAL average, no individual col needed)
-- Note: B1.5 score is stored in responses_json, tangibles average already includes it

-- Bagian D: Replace adjuvant_role + D2 with clarity D1-D4
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS d1_clarity_role FLOAT CHECK (d1_clarity_role >= 1 AND d1_clarity_role <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS d2_clarity_explanation FLOAT CHECK (d2_clarity_explanation >= 1 AND d2_clarity_explanation <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS d3_clarity_comfortable FLOAT CHECK (d3_clarity_comfortable >= 1 AND d3_clarity_comfortable <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS d4_clarity_specialist FLOAT CHECK (d4_clarity_specialist >= 1 AND d4_clarity_specialist <= 5);

-- Bagian F: Expand spiritual from 5 → 9 items
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f1_adab_islami FLOAT CHECK (f1_adab_islami >= 1 AND f1_adab_islami <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f2_gender_concordance FLOAT CHECK (f2_gender_concordance >= 1 AND f2_gender_concordance <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f3_prayer_accommodation FLOAT CHECK (f3_prayer_accommodation >= 1 AND f3_prayer_accommodation <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f4_halal_assurance FLOAT CHECK (f4_halal_assurance >= 1 AND f4_halal_assurance <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f5_tibb_nabawi FLOAT CHECK (f5_tibb_nabawi >= 1 AND f5_tibb_nabawi <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f6_spiritual_activation FLOAT CHECK (f6_spiritual_activation >= 1 AND f6_spiritual_activation <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f7_holistic_peace FLOAT CHECK (f7_holistic_peace >= 1 AND f7_holistic_peace <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f8_spiritual_communication FLOAT CHECK (f8_spiritual_communication >= 1 AND f8_spiritual_communication <= 5);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS f9_reverse_coded FLOAT CHECK (f9_reverse_coded >= 1 AND f9_reverse_coded <= 5);

-- Bagian G: Add G4 + G5
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS recommendation_count VARCHAR(50);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_price_increase INT CHECK (wtp_price_increase >= 0 AND wtp_price_increase <= 10);

-- Bagian I: Willingness to Pay (entire new section)
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_cost_today INT DEFAULT 0;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_increase_20 VARCHAR(100);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_package_interest VARCHAR(100);
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS wtp_max_acceptable VARCHAR(100);

-- Occupation other (A4 Lainnya)
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS occupation_other TEXT;
