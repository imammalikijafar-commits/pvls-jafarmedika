-- ============================================
-- DPEMS Seed Data v2.0.0 FINAL — 15 Surveys
-- RSU Ja'far Medika Karanganyar
-- Sesuai Kuesioner Final: 9 Bagian (A-I)
-- Schema: v2.0.0 FINAL (Clean — No Legacy)
-- Dengan conditional branching: Stroke→Barthel, Nyeri→VAS, Insomnia→ISI, Wellness→WHOQOL
-- Jalankan SETELAH schema.sql di Supabase SQL Editor
-- SET search_path = public;
-- ============================================

-- Hapus data lama jika ada (untuk clean seed)
DELETE FROM survey_aggregations;
DELETE FROM alerts;
DELETE FROM surveys;

-- ============================================
-- ENUM VALUES REFERENCE (matching validators.ts)
-- ============================================
-- Age ranges: '< 20 tahun', '20–30 tahun', '31–45 tahun', '46–60 tahun', '> 60 tahun'
-- Gender: 'Laki-laki', 'Perempuan'
-- Education: 'SD/sederajat', 'SMP/sederajat', 'SMA/sederajat', 'D1–D3', 'S1/D4', 'S2', 'S3'
-- Occupation: 'PNS/TNI/Polri', 'Karyawan Swasta/BUMN', 'Wiraswasta/Pedagang',
--             'Petani/Pekebun', 'Buruh Pabrik', 'Buruh Harian/Serabutan',
--             'Ibu Rumah Tangga', 'Pelajar/Mahasiswa', 'Pensiunan', 'Lainnya'
-- Income: '< Rp 3 juta', 'Rp 3–5 juta', 'Rp 5–10 juta', 'Rp 10–20 juta', '> Rp 20 juta'
-- Patient type: 'Umum/Biaya Sendiri', 'Asuransi Swasta', 'Lainnya'
-- Condition type (8): 'Stroke/Pasca Stroke', 'Nyeri Sendi (Rematik/OA)',
--   'Nyeri Punggung/Saraf Kejepit', 'Migrain/Sakit Kepala Kronis',
--   'Gangguan Tidur (Insomnia)', 'Kondisi Neurologis Lainnya',
--   'Wellness/Pemeliharaan Kesehatan', 'Lainnya'
-- Visit count: 'Pertama kali (ke-1)', '2–3 kali', '4–6 kali', '7–12 kali', '> 12 kali'
-- Referral source: 'Datang sendiri (tanpa rujukan)', 'Dirujuk dokter Interna RS ini',
--   'Dirujuk dokter Neurologi RS ini', 'Dirujuk dokter spesialis lain RS ini',
--   'Rekomendasi keluarga/teman', 'Media sosial/internet', 'Lainnya'
-- Visit plan: 'Akan lanjutkan sampai sembuh/optimal',
--   'Akan datang berkala untuk pemeliharaan', 'Akan berhenti setelah membaik',
--   'Belum memutuskan', 'Akan mencari alternatif lain'
-- Recommendation status: 'Ya, sudah pernah', 'Belum, tapi berencana', 'Belum dan tidak berencana'
-- Recommendation count (G4): '0', '1–2 orang', '3–5 orang', '> 5 orang'
-- WTP increase (I2): 'Ya, tetap datang', 'Mungkin, tergantung hasil terapi', 'Tidak, akan mencari alternatif lain'
-- WTP package (I3): 'Ya, sangat tertarik', 'Tertarik, perlu pikir-pikir dulu', 'Tidak tertarik'
-- WTP max (I4): 'Rp 150.000' s.d. '> Rp 500.000', 'Tidak tahu/Tidak bersedia membayar'

-- ============================================
-- 15 SURVEI — Poli Akupuntur & Herbal
-- Distribusi: Stroke(3), Nyeri Sendi(3), Migrain(2), Insomnia(2),
--             Nyeri Punggung(2), Wellness(2), Neurologis(1)
-- NPS: 7 Promoters, 3 Passives, 2 Detractors, 3 Mixed
-- Clinical: 3 Barthel, 7 VAS, 2 ISI, 3 Wellness, 2 Pain(no instrument specific)
-- ============================================

-- ──────────────────────────────────────────────
-- RECORD 1: Stroke — Barthel improvement, Promoter (NPS 10)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id,
  -- A: Demographics
  age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  -- B: SERVQUAL averages
  tangibles, reliability, responsiveness, assurance, empathy,
  -- C: Herbal
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  -- D: Clarity
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  -- E: Clinical (Stroke → Barthel + VAS)
  pain_level_before, pain_level_after, condition_change,
  barthel_eat_first, barthel_eat_current,
  barthel_bath_first, barthel_bath_current,
  barthel_groom_first, barthel_groom_current,
  barthel_dress_first, barthel_dress_current,
  barthel_toilet_first, barthel_toilet_current,
  barthel_bowel_first, barthel_bowel_current,
  barthel_bladder_first, barthel_bladder_current,
  barthel_transfer_first, barthel_transfer_current,
  barthel_mobility_first, barthel_mobility_current,
  barthel_stairs_first, barthel_stairs_current,
  -- F: Spiritual
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  -- G: NPS & Loyalty
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  -- H: Feedback
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  -- I: WTP
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  -- Metadata
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '46–60 tahun', 'Laki-laki', 'SMA/sederajat', 'PNS/TNI/Polri', 'Rp 5–10 juta', 'Asuransi Swasta',
  'Stroke/Pasca Stroke', '4–6 kali', 'Dirujuk dokter Neurologi RS ini',
  4.4, 4.2, 4.6, 4.8, 4.5,
  true, 4, 4, 5, 4, 3, 5,
  5, 4, 4, 5,
  3, 2, 'Agak Membaik',
  5, 8, 3, 7, 5, 4, 5, 3, 8, 2,
  3, 7, 4, 6, 5, 8, 4, 7, 6, 4,
  4.5, 4.0, 4.2, 5.0, 4.8, 4.0, 4.6, 4.3, 2,
  10, 'Akan lanjutkan sampai sembuh/optimal', 'Ya, sudah pernah', '3–5 orang', 8,
  'Dokter sangat sabar dan menjelaskan setiap tahapan terapi dengan detail.',
  'Waktu tunggu kadang cukup lama saat jadwal ramai.',
  'Alhamdulillah, setelah beberapa sesi akupuntur, tangan kanan saya sudah mulai bisa digerakkan kembali. Dokter dan herbalis di poli ini sangat profesional.',
  ARRAY['Dokter kompeten dan terpercaya', 'Kondisi/gejala terasa membaik setelah terapi', 'Merasa lebih tenang dan rileks setelah sesi terapi']::TEXT[],
  NULL,
  ARRAY['Waktu tunggu lebih singkat', 'Jam praktik dokter diperluas']::TEXT[],
  NULL,
  150000, 'Ya, tetap datang', 'Ya, sangat tertarik', 'Rp 300.000',
  420, 'mobile', NOW() - INTERVAL '28 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 2: Nyeri Sendi (Rematik) — Pain VAS, Promoter (NPS 9)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '> 60 tahun', 'Perempuan', 'SD/sederajat', 'Ibu Rumah Tangga', '< Rp 3 juta', 'Umum/Biaya Sendiri',
  'Nyeri Sendi (Rematik/OA)', '7–12 kali', 'Rekomendasi keluarga/teman',
  4.8, 4.6, 4.2, 4.4, 4.9,
  true, 5, 5, 5, 4, 4, 5,
  4, 5, 5, 4,
  8, 3, 'Sangat Membaik',
  5, 4, 4, 5, 5, 4, 4, 5, 2,
  9, 'Akan lanjutkan sampai sembuh/optimal', 'Ya, sudah pernah', '1–2 orang', 9,
  'Herbal yang diberikan sangat cocok dan membantu mengurangi rasa sakit di lutut saya.',
  'Tidak ada, semuanya sudah baik.',
  'Sudah 7 kali berobat di poli ini. Nyeri lutut saya berkurang drastis. Dokter ramah dan herbalnya manjur.',
  ARRAY['Herbal yang diberikan terasa cocok dan efektif', 'Dokter ramah dan sabar menjelaskan', 'Dokter memperhatikan kondisi secara personal']::TEXT[],
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  100000, 'Ya, tetap datang', 'Tertarik, perlu pikir-pikir dulu', 'Rp 250.000',
  540, 'mobile', NOW() - INTERVAL '25 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 3: Migrain — Pain VAS, Passive (NPS 7)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '31–45 tahun', 'Perempuan', 'S1/D4', 'Karyawan Swasta/BUMN', 'Rp 10–20 juta', 'Asuransi Swasta',
  'Migrain/Sakit Kepala Kronis', 'Pertama kali (ke-1)', 'Media sosial/internet',
  4.0, 3.8, 3.5, 4.2, 4.0,
  false,
  4, 3, 3, 4,
  7, 4, 'Agak Membaik',
  4, 3, 5, 4, 3, 4, 4, 3, 3,
  7, 'Akan datang berkala untuk pemeliharaan', 'Belum, tapi berencana', '0', 7,
  'Suasana ruangan yang tenang dan menenangkan sangat membantu saat migrain saya kambuh.',
  'Bisa ditambahkan musik terapi atau aromaterapi di ruang tunggu.',
  NULL,
  ARRAY['Suasana tenang dan menenangkan', 'Ruangan bersih dan nyaman']::TEXT[],
  NULL,
  ARRAY['Ada sistem booking/janji temu online']::TEXT[],
  NULL,
  200000, 'Mungkin, tergantung hasil terapi', 'Tidak tertarik', 'Rp 350.000',
  380, 'desktop', NOW() - INTERVAL '22 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 4: Insomnia — ISI clinical, Promoter (NPS 9)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  isi_1, isi_2, isi_3, isi_4, isi_5, isi_6, isi_7,
  wellness_1, wellness_2, wellness_3,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '20–30 tahun', 'Laki-laki', 'S2', 'Wiraswasta/Pedagang', 'Rp 10–20 juta', 'Umum/Biaya Sendiri',
  'Gangguan Tidur (Insomnia)', '2–3 kali', 'Datang sendiri (tanpa rujukan)',
  4.6, 4.4, 4.0, 4.5, 4.2,
  true, 4, 3, 4, 3, 3, 4,
  5, 5, 4, 5,
  2, 3, 2, 1, 3, 2, 2,
  4, 3, 4,
  5, 4, 5, 5, 4, 5, 4, 4, 2,
  9, 'Akan lanjutkan sampai sembuh/optimal', 'Ya, sudah pernah', '1–2 orang', 9,
  'Setelah terapi akupuntur dan minum herbal, tidur saya jauh lebih nyenyak. Sudah tidak begadang lagi.',
  'Tidak ada.',
  'Insomnia saya sudah berkurang signifikan setelah 2 kali terapi. Terapi kombinasi akupuntur dan herbal sangat efektif.',
  ARRAY['Kondisi/gejala terasa membaik setelah terapi', 'Herbal yang diberikan terasa cocok dan efektif', 'Dokter kompeten dan terpercaya']::TEXT[],
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  175000, 'Ya, tetap datang', 'Ya, sangat tertarik', 'Rp 300.000',
  460, 'mobile', NOW() - INTERVAL '20 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 5: Nyeri Punggung — Pain VAS, Detractor (NPS 5)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '31–45 tahun', 'Laki-laki', 'D1–D3', 'Petani/Pekebun', '< Rp 3 juta', 'Umum/Biaya Sendiri',
  'Nyeri Punggung/Saraf Kejepit', '4–6 kali', 'Dirujuk dokter spesialis lain RS ini',
  3.2, 3.0, 2.8, 3.5, 3.0,
  false,
  3, 3, 3, 3,
  7, 5, 'Tidak Berubah',
  3, 2, 3, 3, 2, 3, 3, 2, 3,
  5, 'Belum memutuskan', 'Belum dan tidak berencana', '0', 4,
  NULL,
  'Biaya masih terasa mahal untuk pengobatan jangka panjang.',
  'Nyeri punggung saya belum juga berkurang meskipun sudah beberapa kali berobat.',
  ARRAY[]::TEXT[],
  NULL,
  ARRAY['Harga herbal lebih terjangkau', 'Waktu tunggu lebih singkat', 'Biaya terjangkau dan transparan']::TEXT[],
  NULL,
  150000, 'Tidak, akan mencari alternatif lain', 'Tidak tertarik', 'Rp 200.000',
  320, 'mobile', NOW() - INTERVAL '18 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 6: Wellness — WHOQOL, Promoter (NPS 10)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  wellness_1, wellness_2, wellness_3,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '20–30 tahun', 'Perempuan', 'S1/D4', 'Pelajar/Mahasiswa', 'Rp 3–5 juta', 'Umum/Biaya Sendiri',
  'Wellness/Pemeliharaan Kesehatan', 'Pertama kali (ke-1)', 'Media sosial/internet',
  4.5, 4.2, 4.0, 4.6, 4.8,
  true, 5, 4, 5, 4, 4, 5,
  4, 4, 4, 4,
  4, 5, 4,
  5, 5, 5, 5, 4, 5, 5, 5, 1,
  10, 'Akan datang berkala untuk pemeliharaan', 'Ya, sudah pernah', '3–5 orang', 9,
  'Suasana poli yang islami membuat saya nyaman. Fasilitas ibadah bersih dan nyaman.',
  NULL,
  'Tempatnya sangat nyaman dan islami. Akupuntur maintenance untuk menjaga kesehatan tubuh agar tetap fit.',
  ARRAY['Fasilitas ibadah tersedia dan bersih', 'Suasana tenang dan menenangkan', 'Dokter kompeten dan terpercaya', 'Dokter memperhatikan kondisi secara personal']::TEXT[],
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  200000, 'Ya, tetap datang', 'Ya, sangat tertarik', 'Rp 400.000',
  500, 'mobile', NOW() - INTERVAL '15 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 7: Stroke — Barthel + Herbal, Passive (NPS 8)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  barthel_eat_first, barthel_eat_current,
  barthel_bath_first, barthel_bath_current,
  barthel_groom_first, barthel_groom_current,
  barthel_dress_first, barthel_dress_current,
  barthel_toilet_first, barthel_toilet_current,
  barthel_bowel_first, barthel_bowel_current,
  barthel_bladder_first, barthel_bladder_current,
  barthel_transfer_first, barthel_transfer_current,
  barthel_mobility_first, barthel_mobility_current,
  barthel_stairs_first, barthel_stairs_current,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '> 60 tahun', 'Laki-laki', 'SMP/sederajat', 'Pensiunan', 'Rp 5–10 juta', 'Asuransi Swasta',
  'Stroke/Pasca Stroke', '> 12 kali', 'Rekomendasi keluarga/teman',
  4.2, 4.0, 3.8, 4.3, 4.6,
  true, 4, 3, 4, 3, 2, 4,
  4, 4, 4, 4,
  4, 3, 'Tidak Berubah',
  2, 3, 1, 2, 3, 2, 1, 1, 0, 1,
  2, 3, 1, 2, 3, 2, 1, 1, 0, 1,
  4, 3, 4, 4, 3, 4, 4, 3, 2,
  8, 'Akan datang berkala untuk pemeliharaan', 'Ya, sudah pernah', '3–5 orang', 7,
  'Dokter sangat perhatian dan herbal yang diberikan membantu memulihkan kondisi saya.',
  'Pengobatan butuh waktu yang lama, kadang hasilnya belum terasa signifikan.',
  NULL,
  ARRAY['Dokter memperhatikan kondisi secara personal', 'Dokter ramah dan sabar menjelaskan']::TEXT[],
  'Tersedia brosur tentang produk herbal',
  ARRAY['Stok herbal selalu tersedia', 'Penjelasan penggunaan herbal lebih lengkap', 'Tersedia brosur/leaflet tentang produk herbal']::TEXT[],
  NULL,
  125000, 'Ya, tetap datang', 'Tertarik, perlu pikir-pikir dulu', 'Rp 250.000',
  620, 'desktop', NOW() - INTERVAL '14 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 8: Nyeri Sendi — Herbal NOT prescribed, Passive (NPS 8)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '46–60 tahun', 'Perempuan', 'SD/sederajat', 'Ibu Rumah Tangga', '< Rp 3 juta', 'Umum/Biaya Sendiri',
  'Nyeri Sendi (Rematik/OA)', '2–3 kali', 'Rekomendasi keluarga/teman',
  4.0, 3.5, 3.2, 3.8, 4.0,
  false,
  4, 3, 3, 4,
  6, 3, 'Agak Membaik',
  4, 3, 4, 4, 3, 4, 4, 3, 2,
  8, 'Akan lanjutkan sampai sembuh/optimal', 'Belum, tapi berencana', '0', 8,
  'Akupuntur membantu mengurangi rasa sakit di lutut saya secara bertahap.',
  'Antrian terkadang cukup panjang.',
  'Lutut saya sudah terasa lebih ringan. Insya Allah akan terus berobat sampai sembuh.',
  ARRAY['Dokter ramah dan sabar menjelaskan', 'Kondisi/gejala terasa membaik setelah terapi']::TEXT[],
  NULL,
  ARRAY['Waktu tunggu lebih singkat', 'Sistem antrian lebih tertib dan jelas']::TEXT[],
  NULL,
  100000, 'Ya, tetap datang', 'Tidak tertarik', 'Rp 200.000',
  350, 'mobile', NOW() - INTERVAL '12 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 9: Kondisi Neurologis Lainnya — Pain, Promoter (NPS 10)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '31–45 tahun', 'Laki-laki', 'SMA/sederajat', 'Buruh Harian/Serabutan', '< Rp 3 juta', 'Umum/Biaya Sendiri',
  'Kondisi Neurologis Lainnya', '7–12 kali', 'Dirujuk dokter Interna RS ini',
  4.4, 4.2, 4.0, 4.5, 4.3,
  true, 4, 4, 4, 4, 3, 5,
  5, 4, 5, 5,
  6, 3, 'Agak Membaik',
  5, 5, 5, 5, 5, 4, 5, 4, 1,
  10, 'Akan lanjutkan sampai sembuh/optimal', 'Ya, sudah pernah', '> 5 orang', 10,
  'Semua aspek pelayanan sangat memuaskan. Dokter, herbal, fasilitas semuanya top.',
  'Tidak ada.',
  'Saya sudah berobat di sini selama 3 bulan. Kondisi neurologis saya membaik pesat. Sangat bersyukur menemukan poli ini.',
  ARRAY['Dokter kompeten dan terpercaya', 'Dokter ramah dan sabar menjelaskan', 'Terapi terasa nyaman, tidak menyakitkan', 'Kondisi/gejala terasa membaik setelah terapi', 'Herbal yang diberikan terasa cocok dan efektif', 'Merasa lebih tenang dan rileks setelah sesi terapi', 'Fasilitas ibadah tersedia dan bersih']::TEXT[],
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  200000, 'Ya, tetap datang', 'Ya, sangat tertarik', 'Rp 350.000',
  480, 'mobile', NOW() - INTERVAL '10 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 10: Insomnia — ISI + Herbal, Passive (NPS 7)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  isi_1, isi_2, isi_3, isi_4, isi_5, isi_6, isi_7,
  wellness_1, wellness_2, wellness_3,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '20–30 tahun', 'Perempuan', 'D1–D3', 'Karyawan Swasta/BUMN', 'Rp 5–10 juta', 'Asuransi Swasta',
  'Gangguan Tidur (Insomnia)', '2–3 kali', 'Datang sendiri (tanpa rujukan)',
  4.2, 4.0, 3.8, 4.0, 4.4,
  true, 4, 4, 4, 3, 3, 4,
  4, 4, 4, 4,
  3, 2, 3, 2, 2, 1, 2,
  3, 3, 3,
  4, 4, 4, 4, 3, 4, 4, 4, 2,
  7, 'Belum memutuskan', 'Ya, sudah pernah', '1–2 orang', 6,
  'Herbal untuk tidur yang diberikan dokter cukup membantu.',
  'Jadwal praktik sebaiknya ditambah di malam hari untuk pasien insomnia.',
  'Insomnia saya mulai berkurang setelah minum herbal dan terapi akupuntur. Semoga terus membaik.',
  ARRAY['Herbal yang diberikan terasa cocok dan efektif', 'Merasa lebih tenang dan rileks setelah sesi terapi']::TEXT[],
  NULL,
  ARRAY['Jam praktik dokter diperluas']::TEXT[],
  NULL,
  150000, 'Mungkin, tergantung hasil terapi', 'Tidak tertarik', 'Rp 250.000',
  400, 'mobile', NOW() - INTERVAL '8 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 11: Migrain — Pain, Herbal, Young patient, Promoter (NPS 10)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '< 20 tahun', 'Perempuan', 'SMA/sederajat', 'Pelajar/Mahasiswa', 'Rp 3–5 juta', 'Umum/Biaya Sendiri',
  'Migrain/Sakit Kepala Kronis', 'Pertama kali (ke-1)', 'Rekomendasi keluarga/teman',
  4.6, 4.4, 4.2, 4.5, 4.8,
  true, 5, 5, 5, 4, 4, 5,
  5, 5, 5, 5,
  8, 4, 'Sangat Membaik',
  5, 5, 5, 5, 5, 5, 5, 5, 1,
  10, 'Akan lanjutkan sampai sembuh/optimal', 'Ya, sudah pernah', '1–2 orang', 10,
  'Pertama kali akupuntur dan langsung merasakan manfaatnya. Migrain saya berkurang.',
  NULL,
  'Awalnya takut sama jarum akupuntur, tapi ternyata tidak sakit dan migrain langsung berkurang. Terima kasih dokter!',
  ARRAY['Dokter kompeten dan terpercaya', 'Terapi terasa nyaman, tidak menyakitkan', 'Kondisi/gejala terasa membaik setelah terapi', 'Perbaikan lebih cepat dibanding pengobatan sebelumnya']::TEXT[],
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  150000, 'Ya, tetap datang', 'Ya, sangat tertarik', 'Rp 300.000',
  340, 'mobile', NOW() - INTERVAL '6 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 12: Nyeri Sendi — Elderly, Detractor (NPS 4)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '> 60 tahun', 'Laki-laki', 'SD/sederajat', 'Petani/Pekebun', '< Rp 3 juta', 'Umum/Biaya Sendiri',
  'Nyeri Sendi (Rematik/OA)', '4–6 kali', 'Rekomendasi keluarga/teman',
  3.5, 3.2, 3.0, 3.4, 3.6,
  true, 3, 3, 3, 3, 2, 3,
  3, 3, 3, 3,
  7, 6, 'Tidak Berubah',
  3, 3, 3, 3, 2, 3, 3, 3, 4,
  4, 'Akan berhenti setelah membaik', 'Belum dan tidak berencana', '0', 3,
  NULL,
  'Hasilnya belum terasa untuk kondisi saya.',
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  ARRAY['Waktu tunggu lebih singkat', 'Harga herbal lebih terjangkau', 'Pendaftaran mudah dan cepat']::TEXT[],
  NULL,
  100000, 'Tidak, akan mencari alternatif lain', 'Tidak tertarik', 'Rp 150.000',
  290, 'mobile', NOW() - INTERVAL '5 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 13: Stroke — Barthel improvement + Wellness, Promoter (NPS 10)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  barthel_eat_first, barthel_eat_current,
  barthel_bath_first, barthel_bath_current,
  barthel_groom_first, barthel_groom_current,
  barthel_dress_first, barthel_dress_current,
  barthel_toilet_first, barthel_toilet_current,
  barthel_bowel_first, barthel_bowel_current,
  barthel_bladder_first, barthel_bladder_current,
  barthel_transfer_first, barthel_transfer_current,
  barthel_mobility_first, barthel_mobility_current,
  barthel_stairs_first, barthel_stairs_current,
  wellness_1, wellness_2, wellness_3,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '46–60 tahun', 'Perempuan', 'SMA/sederajat', 'Ibu Rumah Tangga', 'Rp 3–5 juta', 'Umum/Biaya Sendiri',
  'Stroke/Pasca Stroke', '7–12 kali', 'Dirujuk dokter Neurologi RS ini',
  4.4, 4.2, 4.0, 4.6, 4.5,
  true, 4, 4, 5, 4, 3, 4,
  5, 5, 5, 4,
  5, 3, 'Sangat Membaik',
  3, 6, 2, 4, 3, 5, 2, 4, 1, 3,
  3, 6, 2, 4, 3, 5, 2, 4, 1, 3,
  3, 5, 3,
  5, 5, 5, 5, 5, 5, 5, 5, 1,
  10, 'Akan lanjutkan sampai sembuh/optimal', 'Ya, sudah pernah', '3–5 orang', 10,
  'Dokter sangat profesional. Tangan saya yang dulu lumpuh sekarang sudah bisa bergerak lagi.',
  'Tidak ada, semuanya sudah sangat baik.',
  'Alhamdulillah, berkat akupuntur dan herbal di poli ini, kondisi saya pasca stroke membaik signifikan. Tangan kiri yang lumpuh sekarang sudah bisa memegang sendok. Dokter dan perawat sangat sabar.',
  ARRAY['Dokter kompeten dan terpercaya', 'Dokter memperhatikan kondisi secara personal', 'Perbaikan lebih cepat dibanding pengobatan sebelumnya', 'Merasa lebih tenang dan rileks setelah sesi terapi', 'Kondisi/gejala terasa membaik setelah terapi']::TEXT[],
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  150000, 'Ya, tetap datang', 'Ya, sangat tertarik', 'Rp 300.000',
  560, 'desktop', NOW() - INTERVAL '4 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 14: Wellness — Regular maintenance, male, Passive (NPS 9)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  wellness_1, wellness_2, wellness_3,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '31–45 tahun', 'Laki-laki', 'S1/D4', 'PNS/TNI/Polri', 'Rp 5–10 juta', 'Asuransi Swasta',
  'Wellness/Pemeliharaan Kesehatan', '4–6 kali', 'Dirujuk dokter Interna RS ini',
  4.8, 4.6, 4.4, 4.8, 4.7,
  true, 5, 5, 5, 5, 4, 5,
  5, 5, 5, 5,
  5, 5, 5,
  5, 4, 5, 5, 4, 5, 4, 5, 2,
  9, 'Akan datang berkala untuk pemeliharaan', 'Ya, sudah pernah', '1–2 orang', 8,
  'Pelayanan sangat lengkap dan profesional. Akupuntur maintenance menjaga daya tahan tubuh saya.',
  'Tidak ada, semuanya sudah baik.',
  'Saya rutin datang untuk maintenance setiap 2 minggu. Badan terasa lebih bugar dan daya tahan tubuh meningkat.',
  ARRAY['Dokter kompeten dan terpercaya', 'Terapi terasa nyaman, tidak menyakitkan', 'Fasilitas ibadah tersedia dan bersih', 'Suasana tenang dan menenangkan', 'Dokter memperhatikan kondisi secara personal']::TEXT[],
  NULL,
  ARRAY[]::TEXT[],
  NULL,
  250000, 'Ya, tetap datang', 'Ya, sangat tertarik', 'Rp 400.000',
  320, 'desktop', NOW() - INTERVAL '2 days'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ──────────────────────────────────────────────
-- RECORD 15: Nyeri Punggung — Moderate, with feedback, Passive (NPS 8)
-- ──────────────────────────────────────────────
INSERT INTO surveys (
  unit_id, age_range, gender, education, occupation, income_range, patient_type,
  condition_type, visit_count, referral_source,
  tangibles, reliability, responsiveness, assurance, empathy,
  herbal_prescribed, herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,
  d1_clarity_role, d2_clarity_explanation, d3_clarity_comfortable, d4_clarity_specialist,
  pain_level_before, pain_level_after, condition_change,
  f1_adab_islami, f2_gender_concordance, f3_prayer_accommodation,
  f4_halal_assurance, f5_tibb_nabawi, f6_spiritual_activation,
  f7_holistic_peace, f8_spiritual_communication, f9_reverse_coded,
  nps_score, visit_plan, has_recommended, recommendation_count, wtp_price_increase,
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other, h2_suggested, h2_suggested_other,
  wtp_cost_today, wtp_increase_20, wtp_package_interest, wtp_max_acceptable,
  session_duration_seconds, device_type, submitted_at
)
SELECT
  u.id,
  '31–45 tahun', 'Laki-laki', 'SMA/sederajat', 'Wiraswasta/Pedagang', 'Rp 3–5 juta', 'Umum/Biaya Sendiri',
  'Nyeri Punggung/Saraf Kejepit', '2–3 kali', 'Rekomendasi keluarga/teman',
  4.0, 3.8, 3.5, 4.0, 4.2,
  true, 4, 3, 4, 3, 3, 4,
  4, 4, 4, 4,
  7, 4, 'Agak Membaik',
  4, 4, 4, 5, 4, 4, 4, 4, 2,
  8, 'Akan lanjutkan sampai sembuh/optimal', 'Ya, sudah pernah', '1–2 orang', 8,
  'Dokter menjelaskan penyebab nyeri punggung saya dengan sangat jelas.',
  'Herbal kadang tidak tersedia.',
  'Nyeri punggung saya mulai berkurang. Penjelasan dokter tentang penyebab saraf kejepit sangat membantu saya memahami kondisi.',
  ARRAY['Dokter kompeten dan terpercaya', 'Dokter ramah dan sabar menjelaskan', 'Penjelasan tentang terapi lebih detail', 'Kondisi/gejala terasa membaik setelah terapi']::TEXT[],
  'Saya ingin ada terapis pijat refleksi',
  ARRAY['Stok herbal selalu tersedia', 'Tersedia brosur/leaflet tentang akupuntur-herbal']::TEXT[],
  NULL,
  175000, 'Ya, tetap datang', 'Tertarik, perlu pikir-pikir dulu', 'Rp 300.000',
  410, 'mobile', NOW() - INTERVAL '1 day'
FROM units u WHERE u.qr_code = 'akupuntur-herbal';

-- ============================================
-- VERIFIKASI
-- ============================================

SELECT '=== DPEMS Seed v2.0.0 FINAL Verification ===' AS info;

SELECT
  'Total Surveys' AS metric,
  COUNT(*)::text AS value
FROM surveys;

SELECT
  'By Condition Type' AS metric,
  condition_type,
  COUNT(*) AS count,
  ROUND(AVG(tangibles)::numeric, 2) AS avg_tangibles,
  ROUND(AVG(nps_score)::numeric, 1) AS avg_nps
FROM surveys
GROUP BY condition_type
ORDER BY count DESC;

-- NPS Distribution
SELECT
  'NPS Distribution' AS metric,
  COUNT(*) FILTER (WHERE nps_score >= 9) AS promoters,
  COUNT(*) FILTER (WHERE nps_score >= 7 AND nps_score <= 8) AS passives,
  COUNT(*) FILTER (WHERE nps_score <= 6) AS detractors,
  ROUND(
    ((COUNT(*) FILTER (WHERE nps_score >= 9)::numeric - COUNT(*) FILTER (WHERE nps_score <= 6)::numeric)
    / NULLIF(COUNT(*) FILTER (WHERE nps_score IS NOT NULL), 0)) * 100, 1
  ) AS nps_score
FROM surveys;

-- SERVQUAL Overall
SELECT
  'Overall Satisfaction (/5)' AS metric,
  ROUND(((AVG(tangibles) + AVG(reliability) + AVG(responsiveness) + AVG(assurance) + AVG(empathy)) / 5)::numeric, 2)::text AS value
FROM surveys;

-- Clarity D1-D4 Average
SELECT
  'Clarity Average (D1-D4)' AS metric,
  ROUND(AVG(d1_clarity_role)::numeric, 2) AS d1_role,
  ROUND(AVG(d2_clarity_explanation)::numeric, 2) AS d2_explanation,
  ROUND(AVG(d3_clarity_comfortable)::numeric, 2) AS d3_comfortable,
  ROUND(AVG(d4_clarity_specialist)::numeric, 2) AS d4_specialist,
  ROUND(AVG((d1_clarity_role + d2_clarity_explanation + d3_clarity_comfortable + d4_clarity_specialist) / 4)::numeric, 2) AS overall
FROM surveys
WHERE d1_clarity_role IS NOT NULL;

-- Spiritual F1-F9 Average (with F9 reversed)
SELECT
  'Spiritual Average (F1-F9, F9 reversed)' AS metric,
  ROUND(AVG(f1_adab_islami)::numeric, 2) AS f1,
  ROUND(AVG(f2_gender_concordance)::numeric, 2) AS f2,
  ROUND(AVG(f3_prayer_accommodation)::numeric, 2) AS f3,
  ROUND(AVG(f4_halal_assurance)::numeric, 2) AS f4,
  ROUND(AVG(f5_tibb_nabawi)::numeric, 2) AS f5,
  ROUND(AVG(f6_spiritual_activation)::numeric, 2) AS f6,
  ROUND(AVG(f7_holistic_peace)::numeric, 2) AS f7,
  ROUND(AVG(f8_spiritual_communication)::numeric, 2) AS f8,
  ROUND(AVG(6 - f9_reverse_coded)::numeric, 2) AS f9_reversed,
  ROUND(AVG((f1_adab_islami + f2_gender_concordance + f3_prayer_accommodation + f4_halal_assurance +
    f5_tibb_nabawi + f6_spiritual_activation + f7_holistic_peace + f8_spiritual_communication + (6 - f9_reverse_coded)) / 9)::numeric, 2) AS overall
FROM surveys
WHERE f1_adab_islami IS NOT NULL;

-- Stroke: Barthel Index
SELECT
  'Stroke: Avg Barthel' AS metric,
  ROUND(AVG((barthel_eat_first + barthel_bath_first + barthel_groom_first +
    barthel_dress_first + barthel_toilet_first + barthel_bowel_first +
    barthel_bladder_first + barthel_transfer_first + barthel_mobility_first +
    barthel_stairs_first))::numeric, 1) AS avg_barthel_first,
  ROUND(AVG((barthel_eat_current + barthel_bath_current + barthel_groom_current +
    barthel_dress_current + barthel_toilet_current + barthel_bowel_current +
    barthel_bladder_current + barthel_transfer_current + barthel_mobility_current +
    barthel_stairs_current))::numeric, 1) AS avg_barthel_current
FROM surveys
WHERE condition_type = 'Stroke/Pasca Stroke' AND barthel_eat_first IS NOT NULL;

-- Pain: VAS reduction
SELECT
  'Pain: Avg VAS Before/After' AS metric,
  ROUND(AVG(pain_level_before)::numeric, 1) AS avg_pain_before,
  ROUND(AVG(pain_level_after)::numeric, 1) AS avg_pain_after,
  ROUND(
    (CASE WHEN AVG(pain_level_before) > 0
      THEN ((AVG(pain_level_before) - AVG(pain_level_after)) / AVG(pain_level_before)) * 100
      ELSE 0
    END)::numeric, 1
  ) AS pain_reduction_pct
FROM surveys
WHERE pain_level_before IS NOT NULL AND pain_level_after IS NOT NULL;

-- Insomnia: ISI Total
SELECT
  'Insomnia: Avg ISI Total' AS metric,
  ROUND(AVG(COALESCE(isi_1,0) + COALESCE(isi_2,0) + COALESCE(isi_3,0) +
    COALESCE(isi_4,0) + COALESCE(isi_5,0) + COALESCE(isi_6,0) +
    COALESCE(isi_7,0))::numeric, 1) AS avg_isi_total
FROM surveys
WHERE isi_1 IS NOT NULL;

-- Wellness: WHOQOL
SELECT
  'Wellness: Avg Score' AS metric,
  ROUND(AVG(wellness_1)::numeric, 2) AS avg_wellness_1,
  ROUND(AVG(wellness_2)::numeric, 2) AS avg_wellness_2,
  ROUND(AVG(wellness_3)::numeric, 2) AS avg_wellness_3
FROM surveys
WHERE wellness_1 IS NOT NULL;

-- Herbal coverage
SELECT
  'Herbal Coverage' AS metric,
  COUNT(*) FILTER (WHERE herbal_prescribed = true) AS prescribed,
  COUNT(*) FILTER (WHERE herbal_prescribed = false) AS not_prescribed,
  COUNT(*) FILTER (WHERE herbal_prescribed IS NULL) AS null_count
FROM surveys;

-- WTP summary
SELECT
  'WTP Summary' AS metric,
  ROUND(AVG(wtp_cost_today)::numeric, 0) AS avg_cost_today,
  wtp_increase_20, COUNT(*) AS count
FROM surveys
WHERE wtp_cost_today IS NOT NULL
GROUP BY wtp_increase_20
ORDER BY count DESC;

-- H1/H2 Checkbox coverage
SELECT
  'Feedback Checkbox Coverage' AS metric,
  COUNT(*) FILTER (WHERE h1_liked IS NOT NULL AND array_length(h1_liked, 1) > 0) AS has_liked,
  COUNT(*) FILTER (WHERE h2_suggested IS NOT NULL AND array_length(h2_suggested, 1) > 0) AS has_suggested
FROM surveys;