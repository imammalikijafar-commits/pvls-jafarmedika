// ============================================================
// PVLS Ja'far Medika — Export Utilities
// CSV / Excel export for SmartPLS analysis
// ============================================================

import type { SurveyResponse } from './types'

// --- Column definitions for SmartPLS export ---
export const SMARTPLS_ITEM_COLUMNS = [
  'pv1', 'pv2', 'pv3', 'pv4', 'pv5', 'pv6',
  'pv7', 'pv8', 'pv9', 'pv10', 'pv11', 'pv12',
  'tr1', 'tr2', 'tr3', 'tr4',
  'sat1', 'sat2', 'sat3', 'sat4',
  'loy1', 'loy2', 'loy3', 'loy4',
] as const

export const SMARTPLS_DEMO_COLUMNS = [
  'age_group', 'gender', 'education', 'occupation',
  'income_group', 'service_type', 'visit_count',
  'referral_source', 'main_complaint_category',
] as const

export const SMARTPLS_MEAN_COLUMNS = [
  'pv_quality_mean', 'pv_emotional_mean', 'pv_price_mean',
  'pv_social_mean', 'pv_total_mean', 'trust_mean',
  'satisfaction_mean', 'loyalty_mean', 'extreme_pattern_flag',
] as const

// --- All export columns ---
export const ALL_EXPORT_COLUMNS = [
  'id', 'created_at',
  ...SMARTPLS_DEMO_COLUMNS,
  ...SMARTPLS_ITEM_COLUMNS,
  ...SMARTPLS_MEAN_COLUMNS,
] as const

// --- Friendly header labels ---
export const EXPORT_HEADERS: Record<string, string> = {
  id: 'ID',
  created_at: 'Tanggal',
  age_group: 'Kelompok Usia',
  gender: 'Jenis Kelamin',
  education: 'Pendidikan',
  occupation: 'Pekerjaan',
  income_group: 'Kelompok Pendapatan',
  service_type: 'Jenis Layanan',
  visit_count: 'Jumlah Kunjungan',
  referral_source: 'Sumber Rujukan',
  main_complaint_category: 'Kategori Keluhan Utama',
  pv1: 'PV1', pv2: 'PV2', pv3: 'PV3',
  pv4: 'PV4', pv5: 'PV5', pv6: 'PV6',
  pv7: 'PV7', pv8: 'PV8', pv9: 'PV9',
  pv10: 'PV10', pv11: 'PV11', pv12: 'PV12',
  tr1: 'TR1', tr2: 'TR2', tr3: 'TR3', tr4: 'TR4',
  sat1: 'SAT1', sat2: 'SAT2', sat3: 'SAT3', sat4: 'SAT4',
  loy1: 'LOY1', loy2: 'LOY2', loy3: 'LOY3', loy4: 'LOY4',
  pv_quality_mean: 'PV_Quality_Mean',
  pv_emotional_mean: 'PV_Emotional_Mean',
  pv_price_mean: 'PV_Price_Mean',
  pv_social_mean: 'PV_Social_Mean',
  pv_total_mean: 'PV_Total_Mean',
  trust_mean: 'Trust_Mean',
  satisfaction_mean: 'Satisfaction_Mean',
  loyalty_mean: 'Loyalty_Mean',
  extreme_pattern_flag: 'Extreme_Pattern',
}

// --- Convert responses to CSV string ---
export function responsesToCSV(responses: SurveyResponse[]): string {
  const columns = ALL_EXPORT_COLUMNS as unknown as string[]
  const header = columns.map((col) => EXPORT_HEADERS[col] || col).join(',')

  const rows = responses.map((r) =>
    columns.map((col) => {
      const val = (r as Record<string, unknown>)[col]
      if (val === null || val === undefined) return ''
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`
      return String(val)
    }).join(',')
  )

  return [header, ...rows].join('\n')
}

// --- Convert responses to worksheet data (for xlsx) ---
export function responsesToSheetData(responses: SurveyResponse[]): Record<string, unknown>[] {
  const columns = ALL_EXPORT_COLUMNS as unknown as string[]
  return responses.map((r) => {
    const row: Record<string, unknown> = {}
    columns.forEach((col) => {
      const key = EXPORT_HEADERS[col] || col
      row[key] = (r as Record<string, unknown>)[col] ?? ''
    })
    return row
  })
}
