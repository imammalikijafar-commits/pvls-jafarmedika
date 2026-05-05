// ============================================================
// DPEMS Type Definitions
// Matching Supabase Schema v2.2 (SERVQUAL Item-Level + SCI Score)
// 9 Sections (A-I): Demographics, SERVQUAL, Herbal, Clarity,
//   Clinical, Spiritual 8D, NPS/Loyalty, Feedback, WTP
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
  gender_preference: string | null          // A2b: Ya / Tidak / Tidak ada preferensi
  education: string | null
  occupation: string | null
  occupation_other: string | null
  income_range: string | null
  payment_type: string | null              // A6: Jenis pembayaran (was patient_type)
  payment_type_other: string | null        // A6 Lainnya
  condition_type: string | null
  condition_type_other: string | null
  visit_count: string | null
  referral_source: string | null

  // SERVQUAL Dimensions (aggregated averages, Bagian B)
  tangibles: number | null
  reliability: number | null
  responsiveness: number | null
  assurance: number | null
  empathy: number | null

  // SERVQUAL Item-Level (Bagian B) — 25 items untuk PLS-SEM analysis
  // Tangibles B1
  b1_1_facility_condition: number | null
  b1_2_equipment_modern: number | null
  b1_3_staff_appearance: number | null
  b1_4_facility_comfort: number | null
  b1_5_islamic_facilities: number | null
  // Reliability B2
  b2_1_service_accuracy: number | null
  b2_2_punctuality: number | null
  b2_3_admin_accuracy: number | null
  b2_4_consistency: number | null
  b2_5_prayer_accommodation: number | null  // moved from F3
  // Responsiveness B3
  b3_1_quick_response: number | null
  b3_2_staff_willingness: number | null
  b3_3_complaint_handling: number | null
  b3_4_waiting_time: number | null
  b3_5_information_clarity: number | null
  // Assurance B4
  b4_1_staff_competence: number | null
  b4_2_patient_trust: number | null
  b4_3_safety_feeling: number | null
  b4_4_staff_courtesy: number | null
  b4_5_knowledge: number | null
  // Empathy B5
  b5_1_individual_attention: number | null
  b5_2_understanding_needs: number | null
  b5_3_respectful_treatment: number | null
  b5_4_followup_visits: number | null
  b5_5_operating_hours: number | null

  // Herbal Service (Bagian C)
  herbal_prescribed: boolean | null
  herb_explanation: number | null
  herb_usage_guide: number | null
  herb_safety_trust: number | null
  herb_availability: number | null
  herb_affordability: number | null
  herb_pharmacist: number | null

  // Clarity of Therapeutic Role (Bagian D) — 4 items
  d1_clarity_role: number | null
  d2_clarity_explanation: number | null
  d3_clarity_comfortable: number | null
  d4_clarity_specialist: number | null

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

  // Spiritual & Holistic 8 Dimensions (Bagian F) — F1-F8 (v2.1)
  // F1-F5 renumbered from v2.0 F4-F8; F2(gender), F3(prayer) moved to A/B
  f1_halal_assurance: number | null          // was f4
  f2_tibb_nabawi: number | null              // was f5
  f3_spiritual_activation: number | null     // was f6
  f4_holistic_peace: number | null           // was f7
  f5_spiritual_communication: number | null  // was f8
  f6_tawakkal: number | null                 // NEW: Tawakkal / Spiritual Intention
  f7_ridha: number | null                    // NEW: Acceptance / Ridha
  f8_reverse_coded: number | null            // was f9

  // NPS & Loyalty (Bagian G)
  nps_score: number | null
  visit_plan: string | null
  has_recommended: string | null
  recommendation_count: string | null

  // Feedback / Masukan (Bagian H)
  best_experience: string | null
  improvement_suggestion: string | null
  testimonial: string | null
  h1_liked: string[] | null
  h1_liked_other: string | null
  h2_suggested: string[] | null
  h2_suggested_other: string | null

  // Willingness to Pay (Bagian I)
  wtp_cost_today: number | null
  wtp_increase_20: string | null
  wtp_package_interest: string | null
  wtp_max_acceptable: string | null

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
  avg_sci_score: number | null  // SCI 8 dimensi (F8 sudah di-reverse)
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
    ageRange?: string | null
    gender?: string | null
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

  // v2.1 Spiritual 8 Dimensions (F1-F8) — primary spiritual data
  spiritual8Avg: {
    f1HalalAssurance: number
    f2TibbNabawi: number
    f3SpiritualActivation: number
    f4HolisticPeace: number
    f5SpiritualCommunication: number
    f6Tawakkal: number
    f7Ridha: number
    f8ReverseCoded: number
    f8Reversed: number
    overall: number
    sciScore: number  // avg keseluruhan SCI (sama dengan overall, alias untuk SEM)
  }

  // v2.0 Clarity of Role (D1-D4)
  clarityAvg: {
    d1ClarityRole: number
    d2ClarityExplanation: number
    d3ClarityComfortable: number
    d4ClaritySpecialist: number
    overall: number
  }

  // v2.0 Herbal Service
  herbAvg: {
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
  clinicalData: {
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
  loyaltyData: {
    visitPlanDist: Record<string, number>
    hasRecommendedDist: Record<string, number>
    recommendationCountDist: Record<string, number>
  }

  // v2.0 WTP Data
  wtpData: {
    avgCostToday: number
    respondentCount: number
    increase20Dist: Record<string, number>
    packageInterestDist: Record<string, number>
    maxAcceptableDist: Record<string, number>
  }
}