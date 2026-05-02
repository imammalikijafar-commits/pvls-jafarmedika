-- ============================================
-- DPEMS Seed Data v1.2.0 — 30 Surveys
-- RSU Ja'far Medika Karanganyar
-- Sesuai Kuesioner I-PEQ Terbaru (8 Bagian: A-H)
-- Dengan conditional branching: Stroke→Barthel, Nyeri→VAS, Insomnia→ISI, Wellness→WHOQOL
-- Jalankan SETELAH schema.sql di Supabase SQL Editor
-- ============================================

-- Hapus data lama jika ada (untuk clean seed)
DELETE FROM survey_aggregations;
DELETE FROM alerts;
DELETE FROM surveys;

-- Helper functions
CREATE OR REPLACE FUNCTION random_int(min_val INT, max_val INT) RETURNS INT AS $$
  SELECT floor(random() * (max_val - min_val + 1)) + min_val;
$$ LANGUAGE SQL VOLATILE;

CREATE OR REPLACE FUNCTION random_float(min_val FLOAT, max_val FLOAT) RETURNS FLOAT AS $$
  SELECT (random() * (max_val - min_val) + min_val)::numeric(3,1)::float;
$$ LANGUAGE SQL VOLATILE;

CREATE OR REPLACE FUNCTION random_choice(choices TEXT[]) RETURNS TEXT AS $$
  SELECT choices[floor(random() * array_length(choices, 1)) + 1];
$$ LANGUAGE SQL VOLATILE;

-- ============================================
-- ENUM VALUES (matching validators.ts)
-- ============================================

-- Age ranges
-- '<20', '20-30', '31-45', '46-60', '>60'

-- Gender
-- 'L', 'P'

-- Education
-- 'SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1-D3', 'S1/D4', 'S2', 'S3'

-- Occupation (v1.2)
-- 'PNS/TNI/Polri', 'Karyawan Swasta/BUMN', 'Wiraswasta/Pedagang',
-- 'Petani/Pekebun', 'Buruh Pabrik', 'Buruh Harian/Serabutan',
-- 'Ibu Rumah Tangga', 'Pelajar/Mahasiswa', 'Pensiunan', 'Lainnya'

-- Patient type
-- 'Umum (Biaya Sendiri)', 'Asuransi Swasta'

-- Condition type
-- 'Stroke / Pasca Stroke', 'Nyeri Sendi (Rematik / OA)',
-- 'Nyeri Punggung / Saraf Kejepit', 'Migrain / Sakit Kepala Kronis',
-- 'Gangguan Tidur (Insomnia)', 'Kondisi Neurologis Lainnya',
-- 'Wellness / Pemeliharaan Kesehatan', 'Lainnya'

-- Visit count (v1.2)
-- 'Pertama kali (ke-1)', '2 – 3 kali', '4 – 6 kali', '7 – 12 kali', 'Lebih dari 12 kali'

-- Referral source
-- 'Datang sendiri (tanpa rujukan)', 'Dirujuk dokter Interna RS ini',
-- 'Dirujuk dokter Neurologi RS ini', 'Dirujuk dokter spesialis lain RS ini',
-- 'Rekomendasi keluarga/teman', 'Media sosial/internet'

-- Visit plan (v1.2)
-- 'Akan lanjutkan terapi sampai kondisi sembuh/optimal',
-- 'Akan datang secara berkala untuk pemeliharaan kesehatan',
-- 'Akan berhenti setelah kondisi membaik', 'Belum memutuskan',
-- 'Akan mencari alternatif lain'

-- Recommendation status
-- 'Ya, sudah pernah', 'Belum, tapi berencana', 'Belum dan tidak berencana'

-- ============================================
-- 30 SURVEI — Poli Akupuntur & Herbal
-- Distribusi: ~8 stroke, ~12 nyeri, ~5 insomnia, ~5 wellness
-- ============================================

INSERT INTO surveys (
  unit_id,

  -- Bagian A: Demografi
  age_range, gender, education, occupation,
  patient_type, condition_type, visit_count, referral_source,

  -- Bagian B: SERVQUAL (dimensi rata-rata)
  tangibles, reliability, responsiveness, assurance, empathy,

  -- Bagian C: Layanan Herbal
  herbal_prescribed,
  herb_explanation, herb_usage_guide, herb_safety_trust,
  herb_availability, herb_affordability, herb_pharmacist,

  -- Bagian D: Terapi Adjuvan
  adjuvant_role,
  info_acupuncture_support, info_understanding,
  info_sufficient, info_comfortable_asking,

  -- Bagian E: Clinical Outcomes (conditional — all nullable)
  pain_level_before, pain_level_after, condition_change,
  -- Barthel Index (stroke only)
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
  -- ISI (insomnia only)
  isi_1, isi_2, isi_3, isi_4, isi_5, isi_6, isi_7,
  -- Wellness
  wellness_1, wellness_2, wellness_3,

  -- Bagian F: Spiritual & Holistik
  spiritual_salam_doa, spiritual_islam_respect,
  spiritual_facility, spiritual_healing, spiritual_support,

  -- Bagian G: NPS & Loyaltas
  nps_score, visit_plan, has_recommended,

  -- Bagian H: Masukan & Saran
  best_experience, improvement_suggestion, testimonial,
  h1_liked, h1_liked_other,
  h2_suggested, h2_suggested_other,

  -- Full responses JSONB
  responses_json,

  -- Metadata
  device_type
)
SELECT
  u.id,

  -- A: Demografi (realistic mix for integrative medicine patients)
  (ARRAY['<20','20-30','31-45','46-60','>60'])[floor(random()*5)+1],
  (ARRAY['L','P'])[floor(random()*2)+1],
  (ARRAY['SD/Sederajat','SMP/Sederajat','SMA/Sederajat','D1-D3','S1/D4','S2','S3'])[floor(random()*7)+1],
  (ARRAY['PNS/TNI/Polri','Karyawan Swasta/BUMN','Wiraswasta/Pedagang','Petani/Pekebun','Buruh Pabrik','Buruh Harian/Serabutan','Ibu Rumah Tangga','Pelajar/Mahasiswa','Pensiunan','Lainnya'])[floor(random()*10)+1],
  (ARRAY['Umum (Biaya Sendiri)','Asuransi Swasta'])[floor(random()*2)+1],

  -- Condition type — distribute across categories (v1.2 values)
  CASE (floor(random()*100) + 1)
    WHEN 1 THEN 'Stroke / Pasca Stroke'
    WHEN 2 THEN 'Stroke / Pasca Stroke'
    WHEN 3 THEN 'Stroke / Pasca Stroke'
    WHEN 4 THEN 'Stroke / Pasca Stroke'
    WHEN 5 THEN 'Stroke / Pasca Stroke'
    WHEN 6 THEN 'Stroke / Pasca Stroke'
    WHEN 7 THEN 'Stroke / Pasca Stroke'
    WHEN 8 THEN 'Stroke / Pasca Stroke'
    WHEN 9 THEN 'Nyeri Sendi (Rematik / OA)'
    WHEN 10 THEN 'Nyeri Sendi (Rematik / OA)'
    WHEN 11 THEN 'Nyeri Sendi (Rematik / OA)'
    WHEN 12 THEN 'Nyeri Sendi (Rematik / OA)'
    WHEN 13 THEN 'Nyeri Punggung / Saraf Kejepit'
    WHEN 14 THEN 'Nyeri Punggung / Saraf Kejepit'
    WHEN 15 THEN 'Nyeri Punggung / Saraf Kejepit'
    WHEN 16 THEN 'Nyeri Punggung / Saraf Kejepit'
    WHEN 17 THEN 'Migrain / Sakit Kepala Kronis'
    WHEN 18 THEN 'Migrain / Sakit Kepala Kronis'
    WHEN 19 THEN 'Migrain / Sakit Kepala Kronis'
    WHEN 20 THEN 'Migrain / Sakit Kepala Kronis'
    WHEN 21 THEN 'Gangguan Tidur (Insomnia)'
    WHEN 22 THEN 'Gangguan Tidur (Insomnia)'
    WHEN 23 THEN 'Gangguan Tidur (Insomnia)'
    WHEN 24 THEN 'Gangguan Tidur (Insomnia)'
    WHEN 25 THEN 'Gangguan Tidur (Insomnia)'
    WHEN 26 THEN 'Wellness / Pemeliharaan Kesehatan'
    WHEN 27 THEN 'Wellness / Pemeliharaan Kesehatan'
    WHEN 28 THEN 'Wellness / Pemeliharaan Kesehatan'
    WHEN 29 THEN 'Wellness / Pemeliharaan Kesehatan'
    WHEN 30 THEN 'Wellness / Pemeliharaan Kesehatan'
    ELSE 'Lainnya'
  END,

  -- Visit count (v1.2 values)
  (ARRAY['Pertama kali (ke-1)', '2 – 3 kali', '4 – 6 kali', '7 – 12 kali', 'Lebih dari 12 kali'])[floor(random()*5)+1],

  -- Referral source (v1.2 values)
  (ARRAY['Datang sendiri (tanpa rujukan)', 'Dirujuk dokter Interna RS ini', 'Dirujuk dokter Neurologi RS ini', 'Dirujuk dokter spesialis lain RS ini', 'Rekomendasi keluarga/teman', 'Media sosial/internet'])[floor(random()*6)+1],

  -- B: SERVQUAL (3.5-5.0 range — generally positive)
  random_float(3.5, 5.0),  -- tangibles
  random_float(3.5, 5.0),  -- reliability
  random_float(3.0, 5.0),  -- responsiveness (slightly wider)
  random_float(3.5, 5.0),  -- assurance
  random_float(3.5, 5.0),  -- empathy

  -- C: Herbal (80% prescribed, rest null)
  CASE WHEN random() < 0.8 THEN true ELSE false END,
  CASE WHEN random() < 0.8 THEN random_float(3.0, 5.0) ELSE NULL END,
  CASE WHEN random() < 0.8 THEN random_float(3.0, 5.0) ELSE NULL END,
  CASE WHEN random() < 0.8 THEN random_float(3.5, 5.0) ELSE NULL END,
  CASE WHEN random() < 0.8 THEN random_float(3.0, 5.0) ELSE NULL END,
  CASE WHEN random() < 0.8 THEN random_float(3.0, 5.0) ELSE NULL END,
  CASE WHEN random() < 0.8 THEN random_float(3.5, 5.0) ELSE NULL END,

  -- D: Adjuvant
  (ARRAY['Pengganti obat dokter spesialis', 'Pendukung/pelengkap', 'Pilihan terakhir', 'Belum tahu/tidak yakin'])[floor(random()*4)+1],
  random_float(3.0, 5.0),
  random_float(3.0, 5.0),
  random_float(3.0, 5.0),
  random_float(3.0, 5.0),

  -- E: Clinical Outcomes (conditional — only relevant columns filled)

  -- VAS (pain conditions: Nyeri Sendi, Nyeri Punggung, Migrain, Neurologis)
  CASE WHEN random() < 0.55 THEN random_int(3, 10) ELSE NULL END,
  CASE WHEN random() < 0.45 THEN random_int(0, 5) ELSE NULL END,
  CASE WHEN random() < 0.55 THEN
    (ARRAY['Sangat Memburuk', 'Agak Memburuk', 'Tidak Berubah', 'Agak Membaik', 'Sangat Membaik'])[floor(random()*5)+1]
  ELSE NULL END,

  -- Barthel Index (stroke only — lower scores first visit, higher current)
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- eat_first
  CASE WHEN random() < 0.27 THEN random_int(3, 10) ELSE 0 END,  -- eat_current
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- bath_first
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- bath_current
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- groom_first
  CASE WHEN random() < 0.27 THEN random_int(3, 10) ELSE 0 END,  -- groom_current
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- dress_first
  CASE WHEN random() < 0.27 THEN random_int(3, 10) ELSE 0 END,  -- dress_current
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- toilet_first
  CASE WHEN random() < 0.27 THEN random_int(3, 10) ELSE 0 END,  -- toilet_current
  CASE WHEN random() < 0.27 THEN random_int(5, 10) ELSE 0 END,  -- bowel_first
  CASE WHEN random() < 0.27 THEN random_int(5, 10) ELSE 0 END,  -- bowel_current
  CASE WHEN random() < 0.27 THEN random_int(5, 10) ELSE 0 END,  -- bladder_first
  CASE WHEN random() < 0.27 THEN random_int(5, 10) ELSE 0 END,  -- bladder_current
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- transfer_first
  CASE WHEN random() < 0.27 THEN random_int(3, 10) ELSE 0 END,  -- transfer_current
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- mobility_first
  CASE WHEN random() < 0.27 THEN random_int(3, 10) ELSE 0 END,  -- mobility_current
  CASE WHEN random() < 0.27 THEN random_int(0, 3) ELSE 0 END,   -- stairs_first
  CASE WHEN random() < 0.27 THEN random_int(0, 5) ELSE 0 END,   -- stairs_current

  -- ISI (insomnia only — 0-4 scale)
  CASE WHEN random() < 0.17 THEN random_int(1, 3) ELSE NULL END,  -- isi_1
  CASE WHEN random() < 0.17 THEN random_int(1, 3) ELSE NULL END,  -- isi_2
  CASE WHEN random() < 0.17 THEN random_int(1, 3) ELSE NULL END,  -- isi_3
  CASE WHEN random() < 0.17 THEN random_int(1, 3) ELSE NULL END,  -- isi_4
  CASE WHEN random() < 0.17 THEN random_int(1, 3) ELSE NULL END,  -- isi_5
  CASE WHEN random() < 0.17 THEN random_int(1, 3) ELSE NULL END,  -- isi_6
  CASE WHEN random() < 0.17 THEN random_int(1, 3) ELSE NULL END,  -- isi_7

  -- Wellness (wellness condition only — 1-5 scale)
  CASE WHEN random() < 0.17 THEN random_float(3.0, 5.0) ELSE NULL END,
  CASE WHEN random() < 0.17 THEN random_float(3.0, 5.0) ELSE NULL END,
  CASE WHEN random() < 0.17 THEN random_float(3.0, 5.0) ELSE NULL END,

  -- F: Spiritual (high scores for Islamic hospital)
  random_float(4.0, 5.0),
  random_float(4.0, 5.0),
  random_float(3.5, 5.0),
  random_float(4.0, 5.0),
  random_float(4.0, 5.0),

  -- G: NPS (skewed positive — 50% promoters)
  CASE
    WHEN random() < 0.50 THEN random_int(9, 10)   -- Promoter
    WHEN random() < 0.50 THEN random_int(7, 8)     -- Passive
    ELSE random_int(3, 6)                          -- Detractor
  END,
  -- Visit plan (v1.2 values)
  (ARRAY[
    'Akan lanjutkan terapi sampai kondisi sembuh/optimal',
    'Akan datang secara berkala untuk pemeliharaan kesehatan',
    'Akan berhenti setelah kondisi membaik',
    'Belum memutuskan',
    'Akan mencari alternatif lain'
  ])[floor(random()*5)+1],
  -- Recommendation status (v1.2 values)
  (ARRAY['Ya, sudah pernah', 'Belum, tapi berencana', 'Belum dan tidak berencana'])[floor(random()*3)+1],

  -- H: Qualitative — checkbox arrays joined as text
  CASE
    WHEN random() < 0.50 THEN
      ARRAY[
        (ARRAY['Dokter ramah dan sabar menjelaskan', 'Dokter kompeten dan terpercaya', 'Terapi terasa nyaman', 'Dokter memperhatikan kondisi secara personal'])[floor(random()*4)+1],
        (ARRAY['Kondisi/gejala terasa membaik', 'Herbal cocok dan efektif', 'Perbaikan lebih cepat', 'Merasa lebih tenang dan rileks'])[floor(random()*4)+1]
      ]::TEXT[]
    ELSE NULL
  END,
  CASE
    WHEN random() < 0.35 THEN
      ARRAY[
        (ARRAY['Waktu konsultasi lebih lama', 'Penjelasan terapi lebih detail', 'Jam praktik diperluas', 'Ruang tunggu lebih nyaman'])[floor(random()*4)+1],
        (ARRAY['Waktu tunggu lebih singkat', 'Harga herbal lebih terjangkau', 'Stok herbal selalu tersedia', 'Informasi jadwal lebih jelas'])[floor(random()*4)+1]
      ]::TEXT[]
    ELSE NULL
  END,
  -- Testimonial (free text)
  CASE
    WHEN random() < 0.30 THEN (ARRAY[
      'Terapi akupuntur di RS Ja''far Medika sangat membantu penyembuhan saya.',
      'Saya sudah merekomendasikan ke tetangga yang juga punya keluhan saraf.',
      'Terima kasih RSU Ja''far Medika, pelayanan integratifnya luar biasa.',
      'Saya puas, semoga layanan ini terus berkembang.',
      'Alhamdulillah setelah 3x akupuntur, nyeri pinggang saya berkurang drastis.',
      'Subhanallah, setelah 5 sesi migrain saya jarang kambuh.',
    ])[floor(random()*6)+1]
    ELSE NULL
  END,

  -- H1: raw checkbox array (hal yang disukai)
  CASE WHEN random() < 0.50 THEN
    (ARRAY[
      ARRAY['Dokter ramah dan sabar menjelaskan', 'Dokter kompeten dan terpercaya', 'Terapi terasa nyaman, tidak menyakitkan', 'Dokter memperhatikan kondisi secara personal',
            'Kondisi/gejala terasa membaik setelah terapi', 'Herbal yang diberikan terasa cocok dan efektif', 'Perbaikan lebih cepat dibanding pengobatan sebelumnya', 'Merasa lebih tenang dan rileks setelah sesi terapi',
            'Ruangan bersih dan nyaman', 'Suasana tenang dan menenangkan', 'Lokasi RS mudah dijangkau', 'Fasilitas ibadah tersedia dan bersih',
            'Pendaftaran mudah dan cepat', 'Waktu tunggu tidak terlalu lama', 'Biaya terjangkau dan transparan', 'Informasi layanan disampaikan dengan jelas'
      ][floor(random()*16)+1],
      (ARRAY[
        'Dokter ramah dan sabar menjelaskan', 'Dokter kompeten dan terpercaya', 'Terapi terasa nyaman, tidak menyakitkan',
        'Kondisi/gejala terasa membaik setelah terapi', 'Ruangan bersih dan nyaman', 'Biaya terjangkau dan transparan'
      ][floor(random()*6)+1]
    ])[1:floor(random()*2)+1]::TEXT[]
    ELSE NULL
  END,
  -- H1 liked other
  CASE WHEN random() < 0.05 THEN 'Staf kebersihan ramah' ELSE NULL END,

  -- H2: raw checkbox array (saran perbaikan)
  CASE WHEN random() < 0.35 THEN
    (ARRAY[
      ARRAY['Waktu konsultasi lebih lama', 'Penjelasan tentang terapi lebih detail', 'Jam praktik dokter diperluas', 'Tersedia dokter akupuntur pengganti saat berhalangan',
            'Ruang tunggu lebih nyaman', 'Toilet/kamar mandi lebih bersih', 'Mushola/fasilitas ibadah diperbaiki', 'Area parkir diperluas',
            'Waktu tunggu lebih singkat', 'Sistem antrian lebih tertib dan jelas', 'Proses administrasi/pendaftaran lebih cepat', 'Ada sistem booking/janji temu online',
            'Harga herbal lebih terjangkau', 'Stok herbal selalu tersedia', 'Penjelasan penggunaan herbal lebih lengkap', 'Tersedia brosur/leaflet tentang produk herbal',
            'Tersedia brosur/leaflet tentang akupuntur-herbal', 'Informasi jadwal dokter lebih jelas', 'Ada nomor WhatsApp untuk konsultasi/tanya jadwal', 'Tersedia edukasi tentang manfaat terapi integratif'
      ][floor(random()*20)+1],
      (ARRAY[
        'Waktu tunggu lebih singkat', 'Harga herbal lebih terjangkau', 'Informasi jadwal dokter lebih jelas'
      ][floor(random()*3)+1]
    ])[1:floor(random()*2)+1]::TEXT[]
    ELSE NULL
  END,
  -- H2 suggested other
  CASE WHEN random() < 0.05 THEN 'Perlu tempat parkir khusus disabilitas' ELSE NULL END,

  -- responses_json (minimal for seed)
  jsonb_build_object(
    'version', '1.2.0',
    'seed', true
  ),

  -- Device (70% mobile)
  CASE WHEN random() < 0.7 THEN 'mobile' ELSE 'desktop' END

FROM units u
WHERE u.qr_code = 'akupuntur-herbal'
CROSS JOIN generate_series(1, 30);

-- ============================================
-- VERIFIKASI
-- ============================================

SELECT '=== DPEMS Seed v1.2.0 Verification ===' AS info;

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
WHERE condition_type = 'Stroke / Pasca Stroke';

SELECT
  'Nyeri: Avg Pain Before/After' AS metric,
  ROUND(AVG(pain_level_before)::numeric, 1) AS avg_pain_before,
  ROUND(AVG(pain_level_after)::numeric, 1) AS avg_pain_after,
  ROUND(
    CASE WHEN AVG(pain_level_before) > 0
      THEN ((AVG(pain_level_before) - AVG(pain_level_after)) / AVG(pain_level_before)) * 100
      ELSE 0
    END, 1
  ) AS pain_reduction_pct
FROM surveys
WHERE pain_level_before IS NOT NULL AND pain_level_after IS NOT NULL;

SELECT
  'Insomnia: Avg ISI Total' AS metric,
  ROUND(AVG(COALESCE(isi_1,0) + COALESCE(isi_2,0) + COALESCE(isi_3,0) +
    COALESCE(isi_4,0) + COALESCE(isi_5,0) + COALESCE(isi_6,0) +
    COALESCE(isi_7,0))::numeric, 1) AS avg_isi_total
FROM surveys
WHERE isi_1 IS NOT NULL;

SELECT
  'Wellness: Avg Score' AS metric,
  ROUND(AVG(wellness_1)::numeric, 2) AS avg_wellness_1,
  ROUND(AVG(wellness_2)::numeric, 2) AS avg_wellness_2,
  ROUND(AVG(wellness_3)::numeric, 2) AS avg_wellness_3
FROM surveys
WHERE wellness_1 IS NOT NULL;

SELECT
  'NPS Score' AS metric,
  (ROUND(((COUNT(*) FILTER (WHERE nps_score >= 9) - COUNT(*) FILTER (WHERE nps_score <= 6))::float / NULLIF(COUNT(*) FILTER (WHERE nps_score IS NOT NULL), 0)) * 100))::text AS value
FROM surveys;

SELECT
  'Overall Satisfaction (/5)' AS metric,
  ROUND((AVG(tangibles) + AVG(reliability) + AVG(responsiveness) + AVG(assurance) + AVG(empathy)) / 5, 2)::text AS value
FROM surveys;

SELECT
  'H1: Checkbox Data' AS metric,
  COUNT(*) FILTER (WHERE h1_liked IS NOT NULL AND array_length(h1_liked, 1) > 0) AS has_liked,
  COUNT(*) FILTER (WHERE h2_suggested IS NOT NULL AND array_length(h2_suggested, 1) > 0) AS has_suggested
FROM surveys;

SELECT
  'Avg Pain Reduction (%)' AS metric,
  ROUND(
    CASE WHEN AVG(pain_level_before) > 0
      THEN ((AVG(pain_level_before) - AVG(pain_level_after)) / AVG(pain_level_before)) * 100
      ELSE 0
    END, 1
  )::text AS value
FROM surveys
WHERE pain_level_before IS NOT NULL AND pain_level_after IS NOT NULL;

-- Cleanup helper functions
DROP FUNCTION IF EXISTS random_int(INT, INT);
DROP FUNCTION IF EXISTS random_float(FLOAT, FLOAT);
DROP FUNCTION IF EXISTS random_choice(TEXT[]);
