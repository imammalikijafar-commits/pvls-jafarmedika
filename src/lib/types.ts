// ============================================================
// PVLS Ja'far Medika — Type Definitions
// Perceived Value, Trust, Satisfaction, Loyalty Survey
// ============================================================

// --- Survey Response (matching Supabase table survey_responses) ---
export interface SurveyResponse {
  id: string
  created_at: string
  survey_version: string | null
  consent_version: string | null
  consent_agreed: boolean | null
  eligible: boolean | null

  // Demographics
  age_group: string | null
  gender: string | null
  education: string | null
  occupation: string | null
  income_group: string | null
  service_type: string | null
  visit_count: string | null
  referral_source: string | null
  main_complaint_category: string | null

  // PV items (1-5)
  pv1: number | null
  pv2: number | null
  pv3: number | null
  pv4: number | null
  pv5: number | null
  pv6: number | null
  pv7: number | null
  pv8: number | null
  pv9: number | null
  pv10: number | null
  pv11: number | null
  pv12: number | null

  // Trust items (1-5)
  tr1: number | null
  tr2: number | null
  tr3: number | null
  tr4: number | null

  // Satisfaction items (1-5)
  sat1: number | null
  sat2: number | null
  sat3: number | null
  sat4: number | null

  // Loyalty items (1-5)
  loy1: number | null
  loy2: number | null
  loy3: number | null
  loy4: number | null

  // Computed mean scores
  pv_quality_mean: number | null
  pv_emotional_mean: number | null
  pv_price_mean: number | null
  pv_social_mean: number | null
  pv_total_mean: number | null
  trust_mean: number | null
  satisfaction_mean: number | null
  loyalty_mean: number | null

  // Extreme pattern
  extreme_pattern_flag: string | null

  // Metadata
  duration_seconds: number | null
  is_complete: boolean
}

// --- Demographics form data ---
export interface DemographicsData {
  age_group: string
  gender: string
  education: string
  occupation: string
  income_group: string
  service_type: string
  visit_count: string
  referral_source: string
  main_complaint_category: string
}

// --- Screening data ---
export interface ScreeningData {
  is_acupuncture_herbal_patient: boolean
  is_out_of_pocket: boolean
  has_previous_visit: boolean
}

// --- Consent data ---
export interface ConsentData {
  consent_agreed: boolean
}

// --- Full survey submission payload ---
export interface SurveySubmission {
  // Consent & Screening
  consent_agreed: boolean
  eligible: boolean

  // Demographics
  age_group: string
  gender: string
  education: string
  occupation: string
  income_group: string
  service_type: string
  visit_count: string
  referral_source: string
  main_complaint_category: string

  // PV items
  pv1: number
  pv2: number
  pv3: number
  pv4: number
  pv5: number
  pv6: number
  pv7: number
  pv8: number
  pv9: number
  pv10: number
  pv11: number
  pv12: number

  // Trust items
  tr1: number
  tr2: number
  tr3: number
  tr4: number

  // Satisfaction items
  sat1: number
  sat2: number
  sat3: number
  sat4: number

  // Loyalty items
  loy1: number
  loy2: number
  loy3: number
  loy4: number

  // Metadata
  survey_version?: string
  consent_version?: string
  duration_seconds?: number
}

// --- Dashboard summary ---
export interface DashboardSummary {
  totalRespondents: number
  validRespondents: number
  targetProgress: number // percentage toward 250
  avgPV: number | null
  avgTrust: number | null
  avgSatisfaction: number | null
  avgLoyalty: number | null
}

// --- Export row for SmartPLS ---
export interface SmartPLSExportRow {
  id: string
  created_at: string
  service_type: string | null
  age_group: string | null
  gender: string | null
  education: string | null
  occupation: string | null
  income_group: string | null
  visit_count: string | null
  referral_source: string | null
  main_complaint_category: string | null
  pv1: number | null
  pv2: number | null
  pv3: number | null
  pv4: number | null
  pv5: number | null
  pv6: number | null
  pv7: number | null
  pv8: number | null
  pv9: number | null
  pv10: number | null
  pv11: number | null
  pv12: number | null
  tr1: number | null
  tr2: number | null
  tr3: number | null
  tr4: number | null
  sat1: number | null
  sat2: number | null
  sat3: number | null
  sat4: number | null
  loy1: number | null
  loy2: number | null
  loy3: number | null
  loy4: number | null
  pv_total_mean: number | null
  trust_mean: number | null
  satisfaction_mean: number | null
  loyalty_mean: number | null
  extreme_pattern_flag: string | null
}

// --- Legacy types kept for backward compatibility (archived) ---
// Hospital, Unit, Survey, SurveyAggregation, Alert types
// are retained in case old code still references them.

export interface Hospital {
  id: string
  name: string
  type: string | null
  code: string
  address: string | null
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  hospital_id: string
  name: string
  description: string | null
  qr_code: string
  unit_type: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  hospitals?: Hospital
}
