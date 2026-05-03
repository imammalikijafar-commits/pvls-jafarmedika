// ============================================================
// DPEMS Type Definitions
// Matching Supabase Schema v1.2.0 (Kuesioner Integrative Medicine + Conditional Branching)
// RSU Ja'far Medika Karanganyar
// ===========================================================

// --- Database Tables ---

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
  // Joined
  hospitals?: Hospital
}

export interface Survey {
  id: string
  unit_id: string

  // Demographics (Bagian A)
  age_range: string | null
  gender: string | null
  education: string | null
  occupation: string | null
  patient_type: string | null
  condition_type: string | null
  visit_count: string | null
  referral_source: string | null

  // SERVQUAL Dimensions (aggregated averages, Bagian B)
  tangibles: number | null
  reliability: number | null
  responsiveness: number | null
  assurance: number | null
  empathy: number | null

  // Herbal Service (Bagian C)
  herbal_prescribed: boolean | null
  herb_explanation: number | null
  herb_usage_guide: number | null
  herb_safety_trust: number | null
  herb_availability: number | null
  herb_affordability: number | null
  herb_pharmacist: number | null

  // Adjuvant Therapy (Bagian D)
  adjuvant_role: string | null
  info_acupuncture_support: number | null
  info_understanding: number | null
  info_sufficient: number | null
  info_comfortable_asking: number | null

  // Clinical Outcomes (Bagian E) — Conditional based on condition_type
  // E1: VAS for pain conditions
  pain_level_before: number | null
  pain_level_after: number | null
  condition_change: string | null
  // E2: Barthel Index (stroke)
  barthel_eat_first: number | null
  barthel_eat_current: number | null
  barthel_bath_first: number | null
  barthel_bath_current: number | null
  barthel_groom_first: number | null
  barthel_groom_current: number | null
  barthel_dress_first: number | null
  barthel_dress_current: number | null
  barthel_toilet_first: number | null
  barthel_toilet_current: number | null
  barthel_bowel_first: number | null
  barthel_bowel_current: number | null
  barthel_bladder_first: number | null
  barthel_bladder_current: number | null
  barthel_transfer_first: number | null
  barthel_transfer_current: number | null
  barthel_mobility_first: number | null
  barthel_mobility_current: number | null
  barthel_stairs_first: number | null
  barthel_stairs_current: number | null
  // E3: Insomnia Severity Index (ISI)
  isi_1: number | null
  isi_2: number | null
  isi_3: number | null
  isi_4: number | null
  isi_5: number | null
  isi_6: number | null
  isi_7: number | null
  // E4: Wellness WHOQOL-BREF
  wellness_1: number | null
  wellness_2: number | null
  wellness_3: number | null

  // Spiritual & Holistic (Bagian F) — original 5
  spiritual_salam_doa: number | null
  spiritual_islam_respect: number | null
  spiritual_facility: number | null
  spiritual_healing: number | null
  spiritual_support: number | null

  // Spiritual 9 Dimensions (F1-F9 extended)
  f1_adab_islami: number | null
  f2_gender_concordance: number | null
  f3_prayer_accommodation: number | null
  f4_halal_assurance: number | null
  f5_tibb_nabawi: number | null
  f6_spiritual_activation: number | null
  f7_holistic_peace: number | null
  f8_spiritual_communication: number | null
  f9_reverse_coded: number | null

  // NPS & Loyalty (Bagian G)
  nps_score: number | null
  visit_plan: string | null
  has_recommended: string | null
  recommendation_count: number | null

  // WTP (Willingness to Pay)
  wtp_cost_today: number | null
  wtp_increase_20: string | null
  wtp_package_interest: string | null
  wtp_max_acceptable: string | null

  // Feedback / Masukan (Bagian H)
  best_experience: string | null         // H1: joined from h1_liked checkbox array
  improvement_suggestion: string | null  // H2: joined from h2_suggested checkbox array
  testimonial: string | null             // H3: free-text testimonial
  h1_liked: string[] | null             // H1: raw checkbox array
  h1_liked_other: string | null         // H1: other free text
  h2_suggested: string[] | null          // H2: raw checkbox array
  h2_suggested_other: string | null      // H2: other free text

  // Full responses (for research)
  responses_json: Record<string, unknown> | null

  // Metadata
  session_duration_seconds: number | null
  device_type: string | null
  submitted_at: string

  // Joined
  units?: Unit
}

export interface SurveyAggregation {
  id: string
  unit_id: string
  date: string
  avg_tangibles: number | null
  avg_reliability: number | null
  avg_responsiveness: number | null
  avg_assurance: number | null
  avg_empathy: number | null
  avg_overall: number | null
  total_responses: number
  promoters_count: number
  passives_count: number
  detractors_count: number
  nps_score: number | null
  avg_pain_reduction_pct: number | null
}

export interface Alert {
  id: string
  survey_id: string | null
  alert_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string | null
  is_resolved: boolean
  resolved_at: string | null
  resolved_by: string | null
  created_at: string
  // Joined
  surveys?: Survey
}

// --- API Response Types ---

export interface DiagnosisPainData {
  condition_type: string
  avgPainBefore: number
  avgPainAfter: number
  painReductionPct: number
  patientCount: number
}

export interface DiagnosisSatisfactionData {
  condition_type: string
  avgSatisfaction: number
  patientCount: number
}

export interface TopDiagnosis {
  name: string
  patientCount: number
  percentage: number
  avgSatisfaction: number
}

export interface DashboardData {
  totalSurveys: number
  avgPainReduction: number
  nps: {
    promoters: number
    passives: number
    detractors: number
    score: number
    total: number
  }
  servqual: {
    tangibles: number
    reliability: number
    responsiveness: number
    assurance: number
    empathy: number
    overall: number
  }
  unitPerformance: {
    unitName: string
    unitType: string | null
    surveyCount: number
    avgSatisfaction: number
    avgPainReduction: number
  }[]
  spiritualAvg: {
    spiritualComfort: number
    culturalRespect: number
    facility: number
    healing: number
    support: number
  }
  recentFeedback: {
    testimonial: string | null
    bestExperience: string | null
    complaints: string | null
    suggestions: string | null
    improvementSuggestion: string | null
    unitName: string
    npsScore: number | null
    submittedAt: string
    conditionType?: string | null
    h1Liked?: string[] | null
    h2Suggested?: string[] | null
  }[]
  recentAlerts: Alert[]
  demographics: {
    ageRangeDistribution: Record<string, number>
    genderDistribution: Record<string, number>
    patientTypeDistribution: Record<string, number>
    conditionTypeDistribution: Record<string, number>
    educationDistribution: Record<string, number>
    topTreatments: { name: string; count: number }[]
  }
  trendData: { date: string; count: number }[]
  responseRate: number
  overallSatisfaction: number
  hospital: Hospital
  // Diagnosis-level analytics
  diagnosisPainData: DiagnosisPainData[]
  diagnosisSatisfactionData: DiagnosisSatisfactionData[]
  topDiagnosis: TopDiagnosis | null
  worstServqualDimension: { name: string; score: number }

  // v2.0 Spiritual 9 Dimensions (F1-F9)
  spiritual9Avg?: {
    f1AdabIslami: number
    f2GenderConcordance: number
    f3PrayerAccommodation: number
    f4HalalAssurance: number
    f5TibbNabawi: number
    f6SpiritualActivation: number
    f7HolisticPeace: number
    f8SpiritualCommunication: number
    f9KedekatanTuhan: number
    f9Reversed: number
  }

  // v2.0 Clarity of Role (D1-D4)
  clarityAvg?: {
    d1ClarityRole: number
    d2ClarityExplanation: number
    d3ClarityComfortable: number
    d4ClaritySpecialist: number
  }

  // v2.0 Herbal Service
  herbAvg?: {
    prescribedPct: number
    prescribedCount: number
    explanation: number
    usageGuide: number
    safetyTrust: number
    availability: number
    affordability: number
    pharmacist: number
  }

  // v2.0 Clinical Outcomes
  clinicalData?: {
    barthel: {
      respondentCount: number
      avgFirst: number
      avgCurrent: number
      improvementPct: number
      level: string
    }
    isi: {
      respondentCount: number
      avgScore: number
      severity: string
    }
    wellness: {
      respondentCount: number
      avgScore: number
    }
  }

  // Backward compat outcomeAvg
  outcomeAvg?: {
    barthelIndex: number
    isiScore: number
    wellnessScore: number
  }

  // v2.0 Loyalty Data
  loyaltyData?: {
    visitPlanDist: Record<string, number>
    hasRecommendedDist: Record<string, number>
    recommendationCountDist: Record<string, number>
  }

  // v2.0 WTP Data
  wtpData?: {
    avgCostToday: number
    respondentCount: number
    increase20Dist: Record<string, number>
    packageInterestDist: Record<string, number>
    maxAcceptableDist: Record<string, number>
  }

  // Backward compat
  willingnessToPay?: number
}