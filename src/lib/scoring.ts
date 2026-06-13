// ============================================================
// PVLS Ja'far Medika — Scoring Functions
// Calculates mean scores and extreme patterns
// ============================================================

import { QUESTIONS } from './questions'

// --- Mean helper ---
export function mean(values: (number | null | undefined)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && v !== undefined)
  if (valid.length === 0) return null
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
}

// --- Answers type: record of code -> value (1-5) ---
export type SurveyAnswers = Record<string, number | null | undefined>

// --- Calculated scores ---
export interface CalculatedScores {
  pv_quality_mean: number | null
  pv_emotional_mean: number | null
  pv_price_mean: number | null
  pv_social_mean: number | null
  pv_total_mean: number | null
  trust_mean: number | null
  satisfaction_mean: number | null
  loyalty_mean: number | null
}

// --- Extreme pattern types ---
export type ExtremePatternFlag = 'pv_high_loyalty_low' | 'pv_medium_loyalty_high' | 'normal' | 'incomplete'

// --- Calculate all scores from answers ---
export function calculateScores(answers: SurveyAnswers): CalculatedScores {
  const getValues = (codes: string[]) => codes.map((c) => answers[c])

  // PV dimensions
  const pvQuality = getValues(['PV1', 'PV2', 'PV3'])
  const pvEmotional = getValues(['PV4', 'PV5', 'PV6'])
  const pvPrice = getValues(['PV7', 'PV8', 'PV9'])
  const pvSocial = getValues(['PV10', 'PV11', 'PV12'])
  const pvAll = getValues(['PV1', 'PV2', 'PV3', 'PV4', 'PV5', 'PV6', 'PV7', 'PV8', 'PV9', 'PV10', 'PV11', 'PV12'])

  // Trust, Satisfaction, Loyalty
  const trustAll = getValues(['TR1', 'TR2', 'TR3', 'TR4'])
  const satAll = getValues(['SAT1', 'SAT2', 'SAT3', 'SAT4'])
  const loyAll = getValues(['LOY1', 'LOY2', 'LOY3', 'LOY4'])

  return {
    pv_quality_mean: mean(pvQuality),
    pv_emotional_mean: mean(pvEmotional),
    pv_price_mean: mean(pvPrice),
    pv_social_mean: mean(pvSocial),
    pv_total_mean: mean(pvAll),
    trust_mean: mean(trustAll),
    satisfaction_mean: mean(satAll),
    loyalty_mean: mean(loyAll),
  }
}

// --- Determine extreme pattern flag ---
export function getExtremePattern(scores: CalculatedScores): ExtremePatternFlag {
  const { pv_total_mean, loyalty_mean } = scores

  // If data incomplete
  if (pv_total_mean === null || loyalty_mean === null) {
    return 'incomplete'
  }

  // PV high, loyalty low
  if (pv_total_mean >= 4 && loyalty_mean <= 3) {
    return 'pv_high_loyalty_low'
  }

  // PV medium, loyalty high
  if (pv_total_mean >= 3 && pv_total_mean < 4 && loyalty_mean >= 4.5) {
    return 'pv_medium_loyalty_high'
  }

  return 'normal'
}

// --- Get all item codes ---
export function getAllItemCodes(): string[] {
  return QUESTIONS.map((q) => q.code)
}

// --- Validate all items are answered ---
export function areAllItemsAnswered(answers: SurveyAnswers): boolean {
  return getAllItemCodes().every((code) => {
    const val = answers[code]
    return val !== null && val !== undefined && val >= 1 && val <= 5
  })
}

// --- Extreme pattern labels for display ---
export const EXTREME_PATTERN_LABELS: Record<ExtremePatternFlag, string> = {
  pv_high_loyalty_low: 'PV Tinggi, Loyalitas Rendah',
  pv_medium_loyalty_high: 'PV Sedang, Loyalitas Tinggi',
  normal: 'Normal',
  incomplete: 'Data Tidak Lengkap',
}

export const EXTREME_PATTERN_DESCRIPTIONS: Record<ExtremePatternFlag, string> = {
  pv_high_loyalty_low: 'Pasien menilai tinggi tetapi loyalitas rendah — perlu investigasi faktor penghambat loyalitas.',
  pv_medium_loyalty_high: 'Pasien menilai sedang tetapi loyalitas tinggi — mungkin ada faktor lain di luar nilai yang mendorong loyalitas.',
  normal: 'Pola nilai dan loyalitas konsisten.',
  incomplete: 'Data survei belum lengkap.',
}
