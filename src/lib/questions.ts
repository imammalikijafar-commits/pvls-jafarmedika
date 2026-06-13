// ============================================================
// PVLS Ja'far Medika — Survey Questions (24 Item)
// Perceived Value (12), Trust (4), Satisfaction (4), Loyalty (4)
// Likert Scale 1-5
// ============================================================

export type QuestionGroup = 'PV' | 'TRUST' | 'SATISFACTION' | 'LOYALTY'
export type PVDimension = 'quality' | 'emotional' | 'price' | 'social'

export interface Question {
  code: string
  group: QuestionGroup
  dimension?: PVDimension
  text: string
}

export const QUESTIONS: Question[] = [
  // --- Perceived Value: Quality (PV1-PV3) ---
  {
    code: 'PV1',
    group: 'PV',
    dimension: 'quality',
    text: "Layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika memiliki kualitas pelayanan yang baik.",
  },
  {
    code: 'PV2',
    group: 'PV',
    dimension: 'quality',
    text: 'Tenaga kesehatan atau praktisi memberikan pelayanan dengan kompeten dan profesional.',
  },
  {
    code: 'PV3',
    group: 'PV',
    dimension: 'quality',
    text: 'Layanan yang saya terima memberikan manfaat bagi kondisi kesehatan saya.',
  },

  // --- Perceived Value: Emotional (PV4-PV6) ---
  {
    code: 'PV4',
    group: 'PV',
    dimension: 'emotional',
    text: "Saya merasa nyaman selama menjalani layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika.",
  },
  {
    code: 'PV5',
    group: 'PV',
    dimension: 'emotional',
    text: 'Layanan ini membuat saya merasa lebih tenang dalam menjalani proses perawatan.',
  },
  {
    code: 'PV6',
    group: 'PV',
    dimension: 'emotional',
    text: 'Layanan ini memberi saya harapan yang lebih baik terhadap kondisi kesehatan saya.',
  },

  // --- Perceived Value: Price (PV7-PV9) ---
  {
    code: 'PV7',
    group: 'PV',
    dimension: 'price',
    text: 'Biaya layanan yang saya keluarkan sebanding dengan manfaat yang saya rasakan.',
  },
  {
    code: 'PV8',
    group: 'PV',
    dimension: 'price',
    text: 'Menurut saya, biaya layanan ini wajar dibandingkan dengan kualitas pelayanan yang diberikan.',
  },
  {
    code: 'PV9',
    group: 'PV',
    dimension: 'price',
    text: 'Saya merasa layanan ini layak untuk dibayar secara mandiri.',
  },

  // --- Perceived Value: Social (PV10-PV12) ---
  {
    code: 'PV10',
    group: 'PV',
    dimension: 'social',
    text: 'Saya merasa pilihan menggunakan layanan ini sesuai dengan nilai dan keyakinan saya.',
  },
  {
    code: 'PV11',
    group: 'PV',
    dimension: 'social',
    text: 'Menggunakan layanan di rumah sakit ini membuat saya merasa lebih yakin dengan keputusan perawatan saya.',
  },
  {
    code: 'PV12',
    group: 'PV',
    dimension: 'social',
    text: 'Saya merasa layanan ini memiliki citra yang baik di lingkungan saya.',
  },

  // --- Trust (TR1-TR4) ---
  {
    code: 'TR1',
    group: 'TRUST',
    text: "Saya percaya tenaga kesehatan atau praktisi di RSU Ja'far Medika memiliki kemampuan yang baik dalam memberikan layanan akupunktur dan/atau herbal medicine.",
  },
  {
    code: 'TR2',
    group: 'TRUST',
    text: "Saya percaya layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika dilakukan dengan aman dan dapat diandalkan.",
  },
  {
    code: 'TR3',
    group: 'TRUST',
    text: 'Saya percaya informasi yang diberikan oleh tenaga kesehatan atau praktisi mengenai layanan ini disampaikan secara jujur dan jelas.',
  },
  {
    code: 'TR4',
    group: 'TRUST',
    text: "Saya percaya tenaga kesehatan atau praktisi di RSU Ja'far Medika mengutamakan kepentingan dan kondisi kesehatan pasien.",
  },

  // --- Satisfaction (SAT1-SAT4) ---
  {
    code: 'SAT1',
    group: 'SATISFACTION',
    text: "Secara keseluruhan, saya puas dengan layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika.",
  },
  {
    code: 'SAT2',
    group: 'SATISFACTION',
    text: 'Layanan yang saya terima sesuai dengan harapan saya.',
  },
  {
    code: 'SAT3',
    group: 'SATISFACTION',
    text: "Saya memiliki pengalaman yang baik selama menjalani layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika.",
  },
  {
    code: 'SAT4',
    group: 'SATISFACTION',
    text: "Saya merasa keputusan saya menggunakan layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika adalah keputusan yang tepat.",
  },

  // --- Loyalty (LOY1-LOY4) ---
  {
    code: 'LOY1',
    group: 'LOYALTY',
    text: "Saya berniat kembali menggunakan layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika jika membutuhkan layanan serupa.",
  },
  {
    code: 'LOY2',
    group: 'LOYALTY',
    text: "Saya bersedia merekomendasikan layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika kepada keluarga, teman, atau orang lain.",
  },
  {
    code: 'LOY3',
    group: 'LOYALTY',
    text: "Jika membutuhkan layanan akupunktur dan/atau herbal medicine, RSU Ja'far Medika akan menjadi pilihan utama saya.",
  },
  {
    code: 'LOY4',
    group: 'LOYALTY',
    text: "Saya tidak mudah beralih ke tempat lain selama layanan akupunktur dan/atau herbal medicine di RSU Ja'far Medika masih sesuai dengan kebutuhan saya.",
  },
]

// Helper: get questions by group
export function getQuestionsByGroup(group: QuestionGroup): Question[] {
  return QUESTIONS.filter((q) => q.group === group)
}

// Helper: get questions by PV dimension
export function getQuestionsByDimension(dimension: PVDimension): Question[] {
  return QUESTIONS.filter((q) => q.dimension === dimension)
}

// Patient-facing group titles
export const GROUP_TITLES: Record<QuestionGroup, string> = {
  PV: 'Penilaian Layanan',
  TRUST: 'Kepercayaan Pasien',
  SATISFACTION: 'Kepuasan Pasien',
  LOYALTY: 'Loyalitas Pasien',
}

// Patient-facing group descriptions
export const GROUP_DESCRIPTIONS: Record<QuestionGroup, string> = {
  PV: 'Silakan berikan penilaian Anda terhadap layanan yang Anda terima.',
  TRUST: 'Silakan berikan penilaian Anda tentang kepercayaan terhadap layanan dan tenaga kesehatan.',
  SATISFACTION: 'Silakan berikan penilaian Anda tentang kepuasan terhadap layanan secara keseluruhan.',
  LOYALTY: 'Silakan berikan penilaian Anda tentang loyalitas Anda terhadap layanan.',
}

// Likert scale labels
export const LIKERT_LABELS = [
  { value: 1, label: 'Sangat Tidak Setuju', emoji: '😞' },
  { value: 2, label: 'Tidak Setuju', emoji: '😕' },
  { value: 3, label: 'Netral', emoji: '😐' },
  { value: 4, label: 'Setuju', emoji: '😊' },
  { value: 5, label: 'Sangat Setuju', emoji: '😄' },
] as const

// Survey step definitions for the multi-step survey flow
export const SURVEY_STEPS = [
  { key: 'intro', path: '/survey', label: 'Pengantar' },
  { key: 'consent', path: '/survey/consent', label: 'Persetujuan' },
  { key: 'screening', path: '/survey/screening', label: 'Kriteria' },
  { key: 'demographic', path: '/survey/demographic', label: 'Data Umum' },
  { key: 'pv', path: '/survey/pv', label: 'Penilaian Layanan' },
  { key: 'trust', path: '/survey/trust', label: 'Kepercayaan' },
  { key: 'satisfaction', path: '/survey/satisfaction', label: 'Kepuasan' },
  { key: 'loyalty', path: '/survey/loyalty', label: 'Loyalitas' },
  { key: 'submit', path: '/survey/submit', label: 'Kirim' },
] as const

export type SurveyStepKey = (typeof SURVEY_STEPS)[number]['key']
