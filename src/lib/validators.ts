import { z } from 'zod'

// ============================================================
// DPEMS Zod Validators
// Matching Supabase Schema v2.0.0 FINAL (Clean — No Legacy)
// 9 Sections (A-I)
// RSU Ja'far Medika Karanganyar
// ============================================================

// --- Helpers ---
const likert5 = z.number().min(1).max(5)
const likert5Nullable = z.number().min(1).max(5).nullable().optional()
const painScale = z.number().min(0).max(10)
const npsScore = z.number().min(0).max(10)

// ============================================================
// Enum Constants (matching Kuesioner options)
// ============================================================

// Bagian A: Demographics
export const AGE_RANGES = ['< 20 tahun', '20–30 tahun', '31–45 tahun', '46–60 tahun', '> 60 tahun'] as const
export const GENDERS = ['Laki-laki', 'Perempuan'] as const
export const EDUCATIONS = ['SD/sederajat', 'SMP/sederajat', 'SMA/sederajat', 'D1–D3', 'S1/D4', 'S2', 'S3'] as const
export const OCCUPATIONS = [
  'PNS/TNI/Polri',
  'Karyawan Swasta/BUMN',
  'Wiraswasta/Pedagang',
  'Petani/Pekebun',
  'Buruh Pabrik',
  'Buruh Harian/Serabutan',
  'Ibu Rumah Tangga',
  'Pelajar/Mahasiswa',
  'Pensiunan',
  'Lainnya',
] as const
export const PATIENT_TYPES = ['Umum/Biaya Sendiri', 'Asuransi Swasta', 'Lainnya'] as const
export const CONDITION_TYPES = [
  'Stroke/Pasca Stroke',
  'Nyeri Sendi (Rematik/OA)',
  'Nyeri Punggung/Saraf Kejepit',
  'Migrain/Sakit Kepala Kronis',
  'Gangguan Tidur (Insomnia)',
  'Kondisi Neurologis Lainnya',
  'Wellness/Pemeliharaan Kesehatan',
  'Lainnya',
] as const

// A5: Income ranges (World Bank LMIC classification)
export const INCOME_RANGES = [
  '< Rp 3 juta',
  'Rp 3–5 juta',
  'Rp 5–10 juta',
  'Rp 10–20 juta',
  '> Rp 20 juta',
  'Tidak ingin menjawab',
] as const

// A6: Payment type
// PATIENT_TYPES defined above

// A7: Condition type (8 options with branching)
// CONDITION_TYPES defined above

// Condition types that map to each clinical instrument
export const PAIN_CONDITIONS = [
  'Nyeri Sendi (Rematik/OA)',
  'Nyeri Punggung/Saraf Kejepit',
  'Migrain/Sakit Kepala Kronis',
] as const
export const STROKE_CONDITION = 'Stroke/Pasca Stroke'
export const INSOMNIA_CONDITION = 'Gangguan Tidur (Insomnia)'
export const WELLNESS_CONDITION = 'Wellness/Pemeliharaan Kesehatan'
export const REFERRAL_SOURCES = [
  'Datang sendiri (tanpa rujukan)',
  'Dirujuk dokter Interna RS ini',
  'Dirujuk dokter Neurologi RS ini',
  'Dirujuk dokter spesialis lain RS ini',
  'Rekomendasi keluarga/teman',
  'Media sosial/internet',
  'Lainnya',
] as const
export const VISIT_COUNTS = ['Pertama kali (ke-1)', '2–3 kali', '4–6 kali', '7–12 kali', '> 12 kali'] as const

// Bagian E: Condition Change
export const CONDITION_CHANGES = [
  'Sangat Memburuk',
  'Agak Memburuk',
  'Tidak Berubah',
  'Agak Membaik',
  'Sangat Membaik',
] as const

// Bagian G: Loyalty
export const VISIT_PLANS = [
  'Akan lanjutkan sampai sembuh/optimal',
  'Akan datang berkala untuk pemeliharaan',
  'Akan berhenti setelah membaik',
  'Belum memutuskan',
  'Akan mencari alternatif lain',
] as const
export const RECOMMENDATION_STATUS = [
  'Ya, sudah pernah',
  'Belum, tapi berencana',
  'Belum dan tidak berencana',
] as const
// G4: Recommendation count
export const RECOMMENDATION_COUNTS = [
  '0',
  '1–2 orang',
  '3–5 orang',
  '> 5 orang',
] as const

// Bagian H: Liked Items (checkbox categories)
export const H1_LIKED_CATEGORIES = [
  {
    title: 'Dokter & Pelayanan',
    items: [
      'Dokter ramah dan sabar menjelaskan',
      'Dokter kompeten dan terpercaya',
      'Terapi terasa nyaman, tidak menyakitkan',
      'Dokter memperhatikan kondisi secara personal',
    ],
  },
  {
    title: 'Hasil Terapi',
    items: [
      'Kondisi/gejala terasa membaik setelah terapi',
      'Herbal yang diberikan terasa cocok dan efektif',
      'Perbaikan lebih cepat dibanding pengobatan sebelumnya',
      'Merasa lebih tenang dan rileks setelah sesi terapi',
    ],
  },
  {
    title: 'Fasilitas & Kenyamanan',
    items: [
      'Ruangan bersih dan nyaman',
      'Suasana tenang dan menenangkan',
      'Lokasi RS mudah dijangkau',
      'Fasilitas ibadah tersedia dan bersih',
    ],
  },
  {
    title: 'Proses & Administrasi',
    items: [
      'Pendaftaran mudah dan cepat',
      'Waktu tunggu tidak terlalu lama',
      'Biaya terjangkau dan transparan',
      'Informasi layanan disampaikan dengan jelas',
    ],
  },
] as const

export const H2_SUGGESTED_CATEGORIES = [
  {
    title: 'Pelayanan Dokter',
    items: [
      'Waktu konsultasi lebih lama',
      'Penjelasan tentang terapi lebih detail',
      'Jam praktik dokter diperluas',
      'Tersedia dokter akupuntur pengganti saat berhalangan',
    ],
  },
  {
    title: 'Fasilitas',
    items: [
      'Ruang tunggu lebih nyaman',
      'Toilet/kamar mandi lebih bersih',
      'Mushola/fasilitas ibadah diperbaiki',
      'Area parkir diperluas',
    ],
  },
  {
    title: 'Proses & Antrian',
    items: [
      'Waktu tunggu lebih singkat',
      'Sistem antrian lebih tertib dan jelas',
      'Proses administrasi/pendaftaran lebih cepat',
      'Ada sistem booking/janji temu online',
    ],
  },
  {
    title: 'Herbal & Apotek',
    items: [
      'Harga herbal lebih terjangkau',
      'Stok herbal selalu tersedia',
      'Penjelasan penggunaan herbal lebih lengkap',
      'Tersedia brosur/leaflet tentang produk herbal',
    ],
  },
  {
    title: 'Informasi & Komunikasi',
    items: [
      'Tersedia brosur/leaflet tentang akupuntur-herbal',
      'Informasi jadwal dokter lebih jelas',
      'Ada nomor WhatsApp untuk konsultasi/tanya jadwal',
      'Tersedia edukasi tentang manfaat terapi integratif',
    ],
  },
] as const

// ============================================================
// Step Schemas (per kuesioner section)
// ============================================================

// --- Step 0: Bagian A - Data Responden (9 items) ---
export const demographicsSchema = z.object({
  age_range: z.string().min(1, 'Usia wajib dipilih'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih'),
  education: z.string().min(1, 'Pendidikan wajib dipilih'),
  occupation: z.string().min(1, 'Pekerjaan wajib dipilih'),
  income_range: z.string().min(1, 'Pendapatan wajib dipilih'),
  patient_type: z.string().min(1, 'Jenis pembayaran wajib dipilih'),
  condition_type: z.string().min(1, 'Keluhan utama wajib dipilih'),
  visit_count: z.string().min(1, 'Kunjungan wajib dipilih'),
  referral_source: z.string().min(1, 'Sumber rujukan wajib dipilih'),
})

export type DemographicsData = z.infer<typeof demographicsSchema>

// --- Step 1: Bagian B - SERVQUAL (5 dimensions × 4-5 questions) ---
export const servqualSchema = z.object({
  // B1 Tangibles (5 questions)
  b1_t1_kebersihan: likert5,
  b1_t2_steril: likert5,
  b1_t3_berbaring: likert5,
  b1_t4_suasana: likert5,
  b1_t5_ibadah: likert5,
  // B2 Reliability (4 questions)
  b2_r1_tepat_waktu: likert5,
  b2_r2_hadir: likert5,
  b2_r3_terstandar: likert5,
  b2_r4_rekam_medis: likert5,
  // B3 Responsiveness (4 questions)
  b3_c1_tunggu: likert5,
  b3_c2_respons: likert5,
  b3_c3_jelas: likert5,
  b3_c4_efek_samping: likert5,
  // B4 Assurance (4 questions)
  b4_a1_kompetensi: likert5,
  b4_a2_diagnosis: likert5,
  b4_a3_aman: likert5,
  b4_a4_sertifikasi: likert5,
  // B5 Empathy (4 questions)
  b5_e1_personal: likert5,
  b5_e2_kekhawatiran: likert5,
  b5_e3_hormat: likert5,
  b5_e4_perkembangan: likert5,
})

export type ServqualData = z.infer<typeof servqualSchema>

// --- Step 2: Bagian C - Layanan Herbal ---
export const herbalSchema = z.object({
  herbal_prescribed: z.enum(['Ya', 'Tidak']),
  // C2 only if herbal_prescribed = Ya
  c2_herb_explanation: likert5Nullable,
  c2_herb_usage_guide: likert5Nullable,
  c2_herb_safety_trust: likert5Nullable,
  c2_herb_availability: likert5Nullable,
  c2_herb_affordability: likert5Nullable,
  c2_herb_pharmacist: likert5Nullable,
})

export type HerbalData = z.infer<typeof herbalSchema>

// --- Step 3: Bagian D - Clarity of Therapeutic Role (D1-D4) ---
export const claritySchema = z.object({
  d1_clarity_role: likert5,
  d2_clarity_explanation: likert5,
  d3_clarity_comfortable: likert5,
  d4_clarity_specialist: likert5,
})

export type ClarityData = z.infer<typeof claritySchema>

// --- Step 4: Bagian E - Clinical Outcomes (Branching) ---
// E1: VAS for pain conditions (0-10)
export const vasSchema = z.object({
  pain_level_before: painScale,
  pain_level_after: painScale,
  condition_change: z.enum(CONDITION_CHANGES),
})
export type VasData = z.infer<typeof vasSchema>

// E2: Barthel Index for stroke (10 activities × 2 timepoints)
const barthelScore = z.number().int().min(0)
export const barthelSchema = z.object({
  barthel_eat_first: barthelScore, barthel_eat_current: barthelScore,
  barthel_bath_first: barthelScore, barthel_bath_current: barthelScore,
  barthel_groom_first: barthelScore, barthel_groom_current: barthelScore,
  barthel_dress_first: barthelScore, barthel_dress_current: barthelScore,
  barthel_toilet_first: barthelScore, barthel_toilet_current: barthelScore,
  barthel_bowel_first: barthelScore, barthel_bowel_current: barthelScore,
  barthel_bladder_first: barthelScore, barthel_bladder_current: barthelScore,
  barthel_transfer_first: barthelScore, barthel_transfer_current: barthelScore,
  barthel_mobility_first: barthelScore, barthel_mobility_current: barthelScore,
  barthel_stairs_first: barthelScore, barthel_stairs_current: barthelScore,
})
export type BarthelData = z.infer<typeof barthelSchema>

// E3: ISI for insomnia (7 items, 0-4 scale)
const isiScore = z.number().int().min(0).max(4)
export const isiSchema = z.object({
  isi_1: isiScore, isi_2: isiScore, isi_3: isiScore, isi_4: isiScore,
  isi_5: isiScore, isi_6: isiScore, isi_7: isiScore,
})
export type IsiData = z.infer<typeof isiSchema>

// E4: Wellness WHOQOL-BREF (3 items, 1-5 scale)
export const wellnessSchema = z.object({
  wellness_1: likert5, wellness_2: likert5, wellness_3: likert5,
})
export type WellnessData = z.infer<typeof wellnessSchema>

// Union schema for clinical outcomes
export const clinicalOutcomesSchema = z.object({
  // VAS (pain conditions)
  pain_level_before: painScale.optional(),
  pain_level_after: painScale.optional(),
  condition_change: z.enum(CONDITION_CHANGES).optional(),
  // Barthel (stroke)
  barthel_eat_first: z.number().int().min(0).optional(), barthel_eat_current: z.number().int().min(0).optional(),
  barthel_bath_first: z.number().int().min(0).optional(), barthel_bath_current: z.number().int().min(0).optional(),
  barthel_groom_first: z.number().int().min(0).optional(), barthel_groom_current: z.number().int().min(0).optional(),
  barthel_dress_first: z.number().int().min(0).optional(), barthel_dress_current: z.number().int().min(0).optional(),
  barthel_toilet_first: z.number().int().min(0).optional(), barthel_toilet_current: z.number().int().min(0).optional(),
  barthel_bowel_first: z.number().int().min(0).optional(), barthel_bowel_current: z.number().int().min(0).optional(),
  barthel_bladder_first: z.number().int().min(0).optional(), barthel_bladder_current: z.number().int().min(0).optional(),
  barthel_transfer_first: z.number().int().min(0).optional(), barthel_transfer_current: z.number().int().min(0).optional(),
  barthel_mobility_first: z.number().int().min(0).optional(), barthel_mobility_current: z.number().int().min(0).optional(),
  barthel_stairs_first: z.number().int().min(0).optional(), barthel_stairs_current: z.number().int().min(0).optional(),
  // ISI (insomnia)
  isi_1: z.number().int().min(0).max(4).optional(), isi_2: z.number().int().min(0).max(4).optional(),
  isi_3: z.number().int().min(0).max(4).optional(), isi_4: z.number().int().min(0).max(4).optional(),
  isi_5: z.number().int().min(0).max(4).optional(), isi_6: z.number().int().min(0).max(4).optional(),
  isi_7: z.number().int().min(0).max(4).optional(),
  // Wellness
  wellness_1: likert5Nullable, wellness_2: likert5Nullable, wellness_3: likert5Nullable,
})

export type ClinicalOutcomesData = z.infer<typeof clinicalOutcomesSchema>

// --- Step 5: Bagian F - Spiritual & Holistik (9 items, F1-F9) ---
export const spiritual9Schema = z.object({
  f1_adab_islami: likert5,
  f2_gender_concordance: likert5,
  f3_prayer_accommodation: likert5,
  f4_halal_assurance: likert5,
  f5_tibb_nabawi: likert5,
  f6_spiritual_activation: likert5,
  f7_holistic_peace: likert5,
  f8_spiritual_communication: likert5,
  f9_reverse_coded: likert5,
})

export type Spiritual9Data = z.infer<typeof spiritual9Schema>

// --- Step 6: Bagian G - NPS & Loyaltas ---
export const npsLoyaltySchema = z.object({
  nps_score: npsScore,
  visit_plan: z.string().min(1),
  has_recommended: z.string().min(1),
  recommendation_count: z.string().min(1),
  wtp_price_increase: npsScore,
})

export type NpsLoyaltyData = z.infer<typeof npsLoyaltySchema>

// --- Step 7: Bagian H - Masukan & Saran (v3: checkbox + text) ---
export const feedbackSchema = z.object({
  h1_liked: z.array(z.string()).default([]),
  h1_liked_other: z.string().max(500).nullable().optional(),
  h2_suggested: z.array(z.string()).default([]),
  h2_suggested_other: z.string().max(500).nullable().optional(),
  best_experience: z.string().max(2000).nullable().optional(),
  improvement_suggestion: z.string().max(2000).nullable().optional(),
  testimonial: z.string().max(2000).nullable().optional(),
})

export type FeedbackData = z.infer<typeof feedbackSchema>

// --- Step 8: Bagian I - Willingness to Pay ---
export const WTP_INCREASE_OPTIONS = [
  'Ya, tetap datang',
  'Mungkin, tergantung hasil terapi',
  'Tidak, akan mencari alternatif lain',
] as const
export const WTP_PACKAGE_OPTIONS = [
  'Ya, sangat tertarik',
  'Tertarik, perlu pikir-pikir dulu',
  'Tidak tertarik',
] as const
export const WTP_PAYMENT_OPTIONS = [
  'Rp 150.000', 'Rp 200.000', 'Rp 250.000', 'Rp 300.000',
  'Rp 350.000', 'Rp 400.000', 'Rp 450.000', 'Rp 500.000',
  '> Rp 500.000', 'Tidak tahu/Tidak bersedia membayar',
] as const

export const wtpSchema = z.object({
  wtp_cost_today: z.number().int().min(0),
  wtp_increase_20: z.string().min(1),
  wtp_package_interest: z.string().min(1),
  wtp_max_acceptable: z.string().min(1),
})

export type WtpData = z.infer<typeof wtpSchema>

// ============================================================
// FULL SURVEY Schema (API submission)
// ============================================================

export const fullSurveySchema = z.object({
  unit_id: z.string().min(1, 'Unit ID wajib diisi'),

  // Bagian A - Demographics
  age_range: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  occupation_other: z.string().nullable().optional(),
  income_range: z.string().nullable().optional(),
  patient_type: z.string().nullable().optional(),
  condition_type: z.string().nullable().optional(),
  condition_type_other: z.string().nullable().optional(),
  visit_count: z.string().nullable().optional(),
  referral_source: z.string().nullable().optional(),

  // Bagian B - SERVQUAL averages (computed client-side)
  tangibles: z.number().min(1).max(5).nullable().optional(),
  reliability: z.number().min(1).max(5).nullable().optional(),
  responsiveness: z.number().min(1).max(5).nullable().optional(),
  assurance: z.number().min(1).max(5).nullable().optional(),
  empathy: z.number().min(1).max(5).nullable().optional(),

  // Bagian C - Herbal
  herbal_prescribed: z.boolean().nullable().optional(),
  herb_explanation: z.number().min(1).max(5).nullable().optional(),
  herb_usage_guide: z.number().min(1).max(5).nullable().optional(),
  herb_safety_trust: z.number().min(1).max(5).nullable().optional(),
  herb_availability: z.number().min(1).max(5).nullable().optional(),
  herb_affordability: z.number().min(1).max(5).nullable().optional(),
  herb_pharmacist: z.number().min(1).max(5).nullable().optional(),

  // Bagian D - Clarity of Therapeutic Role (D1-D4)
  d1_clarity_role: z.number().min(1).max(5).nullable().optional(),
  d2_clarity_explanation: z.number().min(1).max(5).nullable().optional(),
  d3_clarity_comfortable: z.number().min(1).max(5).nullable().optional(),
  d4_clarity_specialist: z.number().min(1).max(5).nullable().optional(),

  // Bagian E - Clinical (branching based on condition_type)
  pain_level_before: z.number().min(0).max(10).nullable().optional(),
  pain_level_after: z.number().min(0).max(10).nullable().optional(),
  condition_change: z.string().nullable().optional(),
  // Barthel Index (stroke)
  barthel_eat_first: z.number().int().min(0).nullable().optional(), barthel_eat_current: z.number().int().min(0).nullable().optional(),
  barthel_bath_first: z.number().int().min(0).nullable().optional(), barthel_bath_current: z.number().int().min(0).nullable().optional(),
  barthel_groom_first: z.number().int().min(0).nullable().optional(), barthel_groom_current: z.number().int().min(0).nullable().optional(),
  barthel_dress_first: z.number().int().min(0).nullable().optional(), barthel_dress_current: z.number().int().min(0).nullable().optional(),
  barthel_toilet_first: z.number().int().min(0).nullable().optional(), barthel_toilet_current: z.number().int().min(0).nullable().optional(),
  barthel_bowel_first: z.number().int().min(0).nullable().optional(), barthel_bowel_current: z.number().int().min(0).nullable().optional(),
  barthel_bladder_first: z.number().int().min(0).nullable().optional(), barthel_bladder_current: z.number().int().min(0).nullable().optional(),
  barthel_transfer_first: z.number().int().min(0).nullable().optional(), barthel_transfer_current: z.number().int().min(0).nullable().optional(),
  barthel_mobility_first: z.number().int().min(0).nullable().optional(), barthel_mobility_current: z.number().int().min(0).nullable().optional(),
  barthel_stairs_first: z.number().int().min(0).nullable().optional(), barthel_stairs_current: z.number().int().min(0).nullable().optional(),
  // ISI (insomnia)
  isi_1: z.number().int().min(0).max(4).nullable().optional(), isi_2: z.number().int().min(0).max(4).nullable().optional(),
  isi_3: z.number().int().min(0).max(4).nullable().optional(), isi_4: z.number().int().min(0).max(4).nullable().optional(),
  isi_5: z.number().int().min(0).max(4).nullable().optional(), isi_6: z.number().int().min(0).max(4).nullable().optional(),
  isi_7: z.number().int().min(0).max(4).nullable().optional(),
  // Wellness
  wellness_1: likert5Nullable, wellness_2: likert5Nullable, wellness_3: likert5Nullable,

  // Bagian F - Spiritual 9 Dimensions (F1-F9)
  f1_adab_islami: z.number().min(1).max(5).nullable().optional(),
  f2_gender_concordance: z.number().min(1).max(5).nullable().optional(),
  f3_prayer_accommodation: z.number().min(1).max(5).nullable().optional(),
  f4_halal_assurance: z.number().min(1).max(5).nullable().optional(),
  f5_tibb_nabawi: z.number().min(1).max(5).nullable().optional(),
  f6_spiritual_activation: z.number().min(1).max(5).nullable().optional(),
  f7_holistic_peace: z.number().min(1).max(5).nullable().optional(),
  f8_spiritual_communication: z.number().min(1).max(5).nullable().optional(),
  f9_reverse_coded: z.number().min(1).max(5).nullable().optional(),

  // Bagian G - NPS & Loyalty
  nps_score: z.number().min(0).max(10).nullable().optional(),
  visit_plan: z.string().nullable().optional(),
  has_recommended: z.string().nullable().optional(),
  recommendation_count: z.string().nullable().optional(),
  wtp_price_increase: z.number().min(0).max(10).nullable().optional(),

  // Bagian H - Feedback (v3: checkbox + text)
  best_experience: z.string().nullable().optional(),
  improvement_suggestion: z.string().nullable().optional(),
  testimonial: z.string().nullable().optional(),
  h1_liked: z.array(z.string()).nullable().optional(),
  h1_liked_other: z.string().nullable().optional(),
  h2_suggested: z.array(z.string()).nullable().optional(),
  h2_suggested_other: z.string().nullable().optional(),

  // Bagian I - WTP
  wtp_cost_today: z.number().int().min(0).nullable().optional(),
  wtp_increase_20: z.string().nullable().optional(),
  wtp_package_interest: z.string().nullable().optional(),
  wtp_max_acceptable: z.string().nullable().optional(),

  // Full individual responses (JSONB)
  responses_json: z.record(z.string(), z.unknown()).nullable().optional(),

  // Metadata
  session_duration_seconds: z.number().int().nullable().optional(),
  device_type: z.string().nullable().optional(),
})

export type FullSurveyData = z.infer<typeof fullSurveySchema>

// ============================================================
// Helper: Compute SERVQUAL dimension average from individual questions
// Used in survey form before submission
// ============================================================

export function computeDimensionAverage(scores: (number | null | undefined)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null && s !== undefined && s > 0)
  if (valid.length === 0) return null
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1))
}