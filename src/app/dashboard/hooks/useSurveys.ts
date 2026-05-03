'use client'

import { useState, useCallback, useRef } from 'react'

export interface SurveyRow {
  id: string
  submitted_at: string
  age_range: string | null
  gender: string | null
  condition_type: string | null
  nps_score: number | null
  pain_level_before: number | null
  pain_level_after: number | null
  tangibles: number | null
  reliability: number | null
  responsiveness: number | null
  assurance: number | null
  empathy: number | null
  best_experience: string | null
  improvement_suggestion: string | null
  testimonial: string | null
  education: string | null
  occupation: string | null
  patient_type: string | null
  visit_count: string | null
  condition_change: string | null
  herbal_prescribed: boolean | null
  visit_plan: string | null
  has_recommended: string | null
  units: { name: string } | null
  occupation_other: string | null
  income_range: string | null
  condition_type_other: string | null
  referral_source: string | null
  herb_explanation: number | null
  herb_usage_guide: number | null
  herb_safety_trust: number | null
  herb_availability: number | null
  herb_affordability: number | null
  herb_pharmacist: number | null
  // Clarity of Role (Bagian D) — v2.0.0 FINAL
  d1_clarity_role: number | null
  d2_clarity_explanation: number | null
  d3_clarity_comfortable: number | null
  d4_clarity_specialist: number | null
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
  isi_1: number | null
  isi_2: number | null
  isi_3: number | null
  isi_4: number | null
  isi_5: number | null
  isi_6: number | null
  isi_7: number | null
  wellness_1: number | null
  wellness_2: number | null
  wellness_3: number | null
  // Spiritual 9 Dimensions (Bagian F) — v2.0.0 FINAL
  f1_adab_islami: number | null
  f2_gender_concordance: number | null
  f3_prayer_accommodation: number | null
  f4_halal_assurance: number | null
  f5_tibb_nabawi: number | null
  f6_spiritual_activation: number | null
  f7_holistic_peace: number | null
  f8_spiritual_communication: number | null
  f9_reverse_coded: number | null
  wtp_price_increase: number | null
  wtp_cost_today: number | null
  wtp_increase_20: string | null
  wtp_package_interest: string | null
  wtp_max_acceptable: string | null
  h1_liked: string[] | null
  h1_liked_other: string | null
  h2_suggested: string[] | null
  h2_suggested_other: string | null
}

export interface SurveysResponse {
  surveys: SurveyRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SurveyFilters {
  search: string
  dateFrom: string
  dateTo: string
  gender: string
  condition: string
  npsMin: string
  npsMax: string
}

export function useSurveys(period: string) {
  const [surveysData, setSurveysData] = useState<SurveysResponse | null>(null)
  const [surveysLoading, setSurveysLoading] = useState(false)
  const [filters, setFilters] = useState<SurveyFilters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    gender: '',
    condition: '',
    npsMin: '',
    npsMax: '',
  })
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [dataFilterOpen, setDataFilterOpen] = useState(false)
  const surveysFetchRef = useRef(0)

  const setFilter = useCallback(<K extends keyof SurveyFilters>(key: K, value: SurveyFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      gender: '',
      condition: '',
      npsMin: '',
      npsMax: '',
    })
  }, [])

  const fetchSurveys = useCallback(async (pageNum: number = 1) => {
    setSurveysLoading(true)
    const fetchId = ++surveysFetchRef.current
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)
      if (filters.gender) params.set('gender', filters.gender)
      if (filters.condition) params.set('condition_type', filters.condition)
      if (filters.npsMin) params.set('npsMin', filters.npsMin)
      if (filters.npsMax) params.set('npsMax', filters.npsMax)
      params.set('page', String(pageNum))
      params.set('pageSize', '10')

      const res = await fetch(`/api/surveys?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch surveys')
      const json = await res.json()
      if (fetchId === surveysFetchRef.current) {
        setSurveysData(json)
      }
    } catch (e) {
      console.error('Failed to fetch surveys:', e)
    } finally {
      if (fetchId === surveysFetchRef.current) {
        setSurveysLoading(false)
      }
    }
  }, [filters.search, filters.dateFrom, filters.dateTo, filters.gender, filters.condition, filters.npsMin, filters.npsMax])

  const hasFilters = !!(filters.search || filters.dateFrom || filters.dateTo || filters.gender || filters.condition || filters.npsMin || filters.npsMax)

  const getExportUrl = useCallback((type: 'excel' | 'pdf') => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    if (filters.gender) params.set('gender', filters.gender)
    if (filters.condition) params.set('condition_type', filters.condition)
    if (filters.npsMin) params.set('npsMin', filters.npsMin)
    if (filters.npsMax) params.set('npsMax', filters.npsMax)
    params.set('period', period)
    return `/api/export/${type}?${params.toString()}`
  }, [filters, period])

  return {
    surveysData,
    surveysLoading,
    filters,
    setFilter,
    resetFilters,
    hasFilters,
    fetchSurveys,
    expandedRow,
    setExpandedRow,
    dataFilterOpen,
    setDataFilterOpen,
    getExportUrl,
  }
}