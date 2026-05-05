-- ============================================
-- DPEMS Migration: v2.0.0 FINAL → v2.1
-- Kuesioner Revisi Komprehensif | 4 Mei 2026
-- ============================================
-- RUN THIS ON EXISTING v2.0.0 DATABASE
-- Back up data first: pg_dump -U postgres dpems > dpems_v2.0.0_backup.sql
-- ============================================

BEGIN;

-- ============================================
-- BAGIAN A: Demographics changes
-- ============================================

-- A2b: Add gender_preference (moved from F2 gender_concordance)
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(30);
COMMENT ON COLUMN surveys.gender_preference IS 'A2b: Ya / Tidak / Tidak ada preferensi';

-- A6: Rename patient_type → payment_type
ALTER TABLE surveys RENAME COLUMN patient_type TO payment_type;
COMMENT ON COLUMN surveys.payment_type IS 'A6: Jenis pembayaran (Umum/Biaya Sendiri, Asuransi Swasta, Lainnya)';

-- A6: Add payment_type_other for "Lainnya" text
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS payment_type_other TEXT;
COMMENT ON COLUMN surveys.payment_type_other IS 'A6 Lainnya: free text for payment type other';

-- ============================================
-- BAGIAN F: Spiritual restructure (9D → 8D)
-- ============================================

-- Step 1: Rename existing columns to temporary names to avoid conflicts
ALTER TABLE surveys RENAME COLUMN f4_halal_assurance TO _tmp_f4_halal_assurance;
ALTER TABLE surveys RENAME COLUMN f5_tibb_nabawi TO _tmp_f5_tibb_nabawi;
ALTER TABLE surveys RENAME COLUMN f6_spiritual_activation TO _tmp_f6_spiritual_activation;
ALTER TABLE surveys RENAME COLUMN f7_holistic_peace TO _tmp_f7_holistic_peace;
ALTER TABLE surveys RENAME COLUMN f8_spiritual_communication TO _tmp_f8_spiritual_communication;
ALTER TABLE surveys RENAME COLUMN f9_reverse_coded TO _tmp_f9_reverse_coded;

-- Step 2: Drop old F1-F3 (removed/moved)
ALTER TABLE surveys DROP COLUMN IF EXISTS f1_adab_islami;     -- removed entirely
ALTER TABLE surveys DROP COLUMN IF EXISTS f2_gender_concordance; -- moved to A2b
ALTER TABLE surveys DROP COLUMN IF EXISTS f3_prayer_accommodation; -- moved to B2.5

-- Step 3: Add new columns with correct v2.1 names
ALTER TABLE surveys ADD COLUMN f1_halal_assurance FLOAT CHECK (f1_halal_assurance >= 1 AND f1_halal_assurance <= 5);
ALTER TABLE surveys ADD COLUMN f2_tibb_nabawi FLOAT CHECK (f2_tibb_nabawi >= 1 AND f2_tibb_nabawi <= 5);
ALTER TABLE surveys ADD COLUMN f3_spiritual_activation FLOAT CHECK (f3_spiritual_activation >= 1 AND f3_spiritual_activation <= 5);
ALTER TABLE surveys ADD COLUMN f4_holistic_peace FLOAT CHECK (f4_holistic_peace >= 1 AND f4_holistic_peace <= 5);
ALTER TABLE surveys ADD COLUMN f5_spiritual_communication FLOAT CHECK (f5_spiritual_communication >= 1 AND f5_spiritual_communication <= 5);
ALTER TABLE surveys ADD COLUMN f6_tawakkal FLOAT CHECK (f6_tawakkal >= 1 AND f6_tawakkal <= 5);
ALTER TABLE surveys ADD COLUMN f7_ridha FLOAT CHECK (f7_ridha >= 1 AND f7_ridha <= 5);
ALTER TABLE surveys ADD COLUMN f8_reverse_coded FLOAT CHECK (f8_reverse_coded >= 1 AND f8_reverse_coded <= 5);

-- Step 4: Migrate data from temp columns to new columns
UPDATE surveys SET f1_halal_assurance = _tmp_f4_halal_assurance WHERE _tmp_f4_halal_assurance IS NOT NULL;
UPDATE surveys SET f2_tibb_nabawi = _tmp_f5_tibb_nabawi WHERE _tmp_f5_tibb_nabawi IS NOT NULL;
UPDATE surveys SET f3_spiritual_activation = _tmp_f6_spiritual_activation WHERE _tmp_f6_spiritual_activation IS NOT NULL;
UPDATE surveys SET f4_holistic_peace = _tmp_f7_holistic_peace WHERE _tmp_f7_holistic_peace IS NOT NULL;
UPDATE surveys SET f5_spiritual_communication = _tmp_f8_spiritual_communication WHERE _tmp_f8_spiritual_communication IS NOT NULL;
UPDATE surveys SET f8_reverse_coded = _tmp_f9_reverse_coded WHERE _tmp_f9_reverse_coded IS NOT NULL;

-- Step 5: Drop temporary columns
ALTER TABLE surveys DROP COLUMN _tmp_f4_halal_assurance;
ALTER TABLE surveys DROP COLUMN _tmp_f5_tibb_nabawi;
ALTER TABLE surveys DROP COLUMN _tmp_f6_spiritual_activation;
ALTER TABLE surveys DROP COLUMN _tmp_f7_holistic_peace;
ALTER TABLE surveys DROP COLUMN _tmp_f8_spiritual_communication;
ALTER TABLE surveys DROP COLUMN _tmp_f9_reverse_coded;

-- Note: f6_tawakkal and f7_ridha are new — no data to migrate.
-- Existing surveys will have NULL for these fields.

-- ============================================
-- BAGIAN G: Remove wtp_price_increase
-- ============================================
ALTER TABLE surveys DROP COLUMN IF EXISTS wtp_price_increase;

-- ============================================
-- Update survey_aggregations trigger comment
-- ============================================
COMMENT ON FUNCTION handle_new_survey() IS 'Auto-aggregation trigger. Updated for v2.1 schema.';

COMMIT;

-- ============================================
-- Post-migration verification
-- ============================================
-- Run these manually to verify:
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'surveys' AND column_name LIKE 'f%' ORDER BY ordinal_position;
-- Expected: f1_halal_assurance through f8_reverse_coded (8 columns)
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'surveys' AND column_name IN ('patient_type', 'wtp_price_increase');
-- Expected: 0 rows (both removed)
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'surveys' AND column_name IN ('gender_preference', 'payment_type', 'payment_type_other');
-- Expected: 3 rows
