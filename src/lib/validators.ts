// ============================================================
// PVLS Ja'far Medika — Zod Validators
// 24 Item Kuesioner: PV(12), TR(4), SAT(4), LOY(4)
// ============================================================

import { z } from 'zod'

// --- Helpers ---
const likert5 = z.number().min(1).max(5)

// ============================================================
// Demographics Enum Constants
// ============================================================

export const AGE_GROUPS = ['< 20 tahun', '20–30 tahun', '31–45 tahun', '46–60 tahun', '> 60 tahun'] as const
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
export const INCOME_GROUPS = [
  '< Rp 3 juta',
  'Rp 3–5 juta',
  'Rp 5–10 juta',
  'Rp 10–20 juta',
  '> Rp 20 juta',
  'Tidak ingin menjawab',
] as const
export const SERVICE_TYPES = ['Akupunktur', 'Herbal', 'Keduanya'] as const
export const VISIT_COUNTS = ['2–3 kali', '4–6 kali', '7–12 kali', '> 12 kali'] as const
export const REFERRAL_SOURCES = [
  'Datang sendiri (tanpa rujukan)',
  'Dirujuk dokter Interna RS ini',
  'Dirujuk dokter Neurologi RS ini',
  'Dirujuk dokter spesialis lain RS ini',
  'Rekomendasi keluarga/teman',
  'Media sosial/internet',
  'Lainnya',
] as const
export const MAIN_COMPLAINT_CATEGORIES = [
  'Nyeri Sendi (Rematik/OA)',
  'Nyeri Punggung/Saraf Kejepit',
  'Migrain/Sakit Kepala Kronis',
  'Stroke/Pasca Stroke',
  'Gangguan Tidur (Insomnia)',
  'Wellness/Pemeliharaan Kesehatan',
  'Kondisi Neurologis Lainnya',
  'Lainnya',
] as const

// ============================================================
// Screening Schema
// ============================================================

export const screeningSchema = z.object({
  is_acupuncture_herbal_patient: z.literal(true, {
    message: 'Anda harus merupakan pasien layanan akupunktur dan/atau herbal medicine',
  }),
  is_out_of_pocket: z.literal(true, {
    message: 'Anda harus merupakan pasien yang membayar secara mandiri (out-of-pocket)',
  }),
  has_previous_visit: z.literal(true, {
    message: 'Anda harus sudah pernah berkunjung minimal 1 kali sebelumnya',
  }),
})

export type ScreeningFormData = z.infer<typeof screeningSchema>

// ============================================================
// Consent Schema
// ============================================================

export const consentSchema = z.object({
  consent_agreed: z.literal(true, {
    message: 'Anda harus menyetujui informed consent untuk melanjutkan',
  }),
})

export type ConsentFormData = z.infer<typeof consentSchema>

// ============================================================
// Demographics Schema
// ============================================================

export const demographicsSchema = z.object({
  age_group: z.string().min(1, 'Kelompok usia wajib dipilih'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih'),
  education: z.string().min(1, 'Pendidikan wajib dipilih'),
  occupation: z.string().min(1, 'Pekerjaan wajib dipilih'),
  income_group: z.string().min(1, 'Pendapatan wajib dipilih'),
  service_type: z.string().min(1, 'Jenis layanan wajib dipilih'),
  visit_count: z.string().min(1, 'Jumlah kunjungan wajib dipilih'),
  referral_source: z.string().min(1, 'Sumber rujukan wajib dipilih'),
  main_complaint_category: z.string().min(1, 'Kategori keluhan utama wajib dipilih'),
})

export type DemographicsFormData = z.infer<typeof demographicsSchema>

// ============================================================
// Perceived Value Schema (12 items)
// ============================================================

export const pvSchema = z.object({
  pv1: likert5,
  pv2: likert5,
  pv3: likert5,
  pv4: likert5,
  pv5: likert5,
  pv6: likert5,
  pv7: likert5,
  pv8: likert5,
  pv9: likert5,
  pv10: likert5,
  pv11: likert5,
  pv12: likert5,
})

export type PVFormData = z.infer<typeof pvSchema>

// ============================================================
// Trust Schema (4 items)
// ============================================================

export const trustSchema = z.object({
  tr1: likert5,
  tr2: likert5,
  tr3: likert5,
  tr4: likert5,
})

export type TrustFormData = z.infer<typeof trustSchema>

// ============================================================
// Satisfaction Schema (4 items)
// ============================================================

export const satisfactionSchema = z.object({
  sat1: likert5,
  sat2: likert5,
  sat3: likert5,
  sat4: likert5,
})

export type SatisfactionFormData = z.infer<typeof satisfactionSchema>

// ============================================================
// Loyalty Schema (4 items)
// ============================================================

export const loyaltySchema = z.object({
  loy1: likert5,
  loy2: likert5,
  loy3: likert5,
  loy4: likert5,
})

export type LoyaltyFormData = z.infer<typeof loyaltySchema>

// ============================================================
// Full Survey Submission Schema
// ============================================================

export const fullSurveySubmissionSchema = z.object({
  // Consent & Screening
  consent_agreed: z.literal(true),
  eligible: z.literal(true),

  // Demographics
  age_group: z.string().min(1),
  gender: z.string().min(1),
  education: z.string().min(1),
  occupation: z.string().min(1),
  income_group: z.string().min(1),
  service_type: z.string().min(1),
  visit_count: z.string().min(1),
  referral_source: z.string().min(1),
  main_complaint_category: z.string().min(1),

  // PV (12 items)
  pv1: likert5, pv2: likert5, pv3: likert5,
  pv4: likert5, pv5: likert5, pv6: likert5,
  pv7: likert5, pv8: likert5, pv9: likert5,
  pv10: likert5, pv11: likert5, pv12: likert5,

  // Trust (4 items)
  tr1: likert5, tr2: likert5, tr3: likert5, tr4: likert5,

  // Satisfaction (4 items)
  sat1: likert5, sat2: likert5, sat3: likert5, sat4: likert5,

  // Loyalty (4 items)
  loy1: likert5, loy2: likert5, loy3: likert5, loy4: likert5,

  // Metadata
  survey_version: z.string().optional(),
  consent_version: z.string().optional(),
  duration_seconds: z.number().int().min(0).optional(),
})

export type FullSurveySubmission = z.infer<typeof fullSurveySubmissionSchema>

// ============================================================
// Backward compat: computeDimensionAverage (kept for any remaining code)
// ============================================================

export function computeDimensionAverage(scores: (number | null | undefined)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null && s !== undefined && s > 0)
  if (valid.length === 0) return null
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1))
}
