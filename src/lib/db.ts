// ============================================================
// DPEMS Database Client
// Supabase — matching Schema v2.2 (SERVQUAL Item-Level + SCI Score)
// Lazy initialization to avoid build-time crashes
// ============================================================

import { createAdminClient } from '@/lib/supabase/server'
import type { Unit, Survey, SurveyAggregation, Alert, Hospital } from '@/lib/types'

let _admin: ReturnType<typeof createAdminClient> | null = null

function getAdmin() {
  if (!_admin) {
    _admin = createAdminClient()
  }
  return _admin
}

// --- Hospital ---

export async function getHospital(): Promise<Hospital | null> {
  const { data, error } = await getAdmin()
    .from('hospitals')
    .select('*')
    .limit(1)
    .single()

  if (error) return null
  return data as Hospital
}

// --- Units ---

export async function getUnits(): Promise<Unit[]> {
  const { data, error } = await getAdmin()
    .from('units')
    .select('*, hospitals(*)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Failed to fetch units: ${error.message}`)
  return data as Unit[]
}

export async function getUnitByQrCode(qrCode: string): Promise<Unit | null> {
  const { data, error } = await getAdmin()
    .from('units')
    .select('*, hospitals(*)')
    .eq('qr_code', qrCode)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as Unit
}

// --- Surveys ---

export async function getSurveys(since?: Date): Promise<(Survey & { units: Unit })[]> {
  let query = getAdmin()
    .from('surveys')
    .select('*, units(*)')
    .order('submitted_at', { ascending: false })

  if (since) {
    query = query.gte('submitted_at', since.toISOString())
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch surveys: ${error.message}`)
  return (data || []) as (Survey & { units: Unit })[]
}

export async function createSurvey(data: Record<string, unknown>): Promise<Survey> {
  const { data: survey, error } = await getAdmin()
    .from('surveys')
    .insert(data)
    .select('*, units(*)')
    .single()

  if (error) throw new Error(`Failed to create survey: ${error.message}`)
  return survey as Survey & { units: Unit }
}

// --- Aggregations ---

export async function getAggregations(unitId?: string, since?: Date): Promise<SurveyAggregation[]> {
  let query = getAdmin()
    .from('survey_aggregations')
    .select('*')
    .order('date', { ascending: false })

  if (unitId) {
    query = query.eq('unit_id', unitId)
  }
  if (since) {
    query = query.gte('date', since.toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch aggregations: ${error.message}`)
  return (data || []) as SurveyAggregation[]
}

// --- Alerts ---

export async function getAlerts(resolved = false, limit = 10): Promise<Alert[]> {
  const { data, error } = await getAdmin()
    .from('alerts')
    .select('*, surveys(*)')
    .eq('is_resolved', resolved)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to fetch alerts: ${error.message}`)
  return (data || []) as Alert[]
}

export async function createAlert(alert: {
  survey_id?: string
  alert_type: string
  severity: string
  message?: string
}): Promise<Alert> {
  const { data, error } = await getAdmin()
    .from('alerts')
    .insert(alert)
    .select()
    .single()

  if (error) throw new Error(`Failed to create alert: ${error.message}`)
  return data as Alert
}

// --- Paginated & Export Surveys ---

export interface SurveyFilterParams {
  search?: string
  dateFrom?: string
  dateTo?: string
  gender?: string
  condition_type?: string
  npsMin?: number
  npsMax?: number
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: string
}

export async function getSurveysPaginated(params: SurveyFilterParams): Promise<{
  surveys: (Survey & { units: Unit })[]
  total: number
}> {
  const {
    search,
    dateFrom,
    dateTo,
    gender,
    condition_type,
    npsMin,
    npsMax,
    page = 1,
    pageSize = 10,
    sortBy = 'submitted_at',
    sortDir = 'desc',
  } = params

  const safePageSize = Math.min(Math.max(pageSize, 1), 100)
  const safePage = Math.max(page, 1)
  const from = (safePage - 1) * safePageSize
  const to = from + safePageSize - 1

  // Build query
  let query = getAdmin()
    .from('surveys')
    .select('*, units(*)', { count: 'exact', head: false })

  // Apply filters
  if (search) {
    query = query.or(`best_experience.ilike.%${search}%,improvement_suggestion.ilike.%${search}%,testimonial.ilike.%${search}%`)
  }
  if (dateFrom) {
    query = query.gte('submitted_at', dateFrom)
  }
  if (dateTo) {
    query = query.lte('submitted_at', dateTo + 'T23:59:59')
  }
  if (gender) {
    query = query.eq('gender', gender)
  }
  if (condition_type) {
    query = query.eq('condition_type', condition_type)
  }
  if (npsMin !== undefined && npsMin !== null) {
    query = query.gte('nps_score', npsMin)
  }
  if (npsMax !== undefined && npsMax !== null) {
    query = query.lte('nps_score', npsMax)
  }

  // Validate sort column to prevent injection
  const allowedSortColumns = ['submitted_at', 'nps_score', 'pain_level_before', 'pain_level_after', 'tangibles', 'reliability', 'responsiveness', 'assurance', 'empathy', 'age_range', 'gender']
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'submitted_at'
  const safeSortDir = sortDir === 'asc' ? true : false

  query = query
    .order(safeSortBy, { ascending: safeSortDir })
    .range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to fetch paginated surveys: ${error.message}`)
  return {
    surveys: (data || []) as (Survey & { units: Unit })[],
    total: count || 0,
  }
}

export async function getSurveysExport(params: Omit<SurveyFilterParams, 'page' | 'pageSize' | 'sortBy' | 'sortDir'>): Promise<(Survey & { units: Unit })[]> {
  const {
    search,
    dateFrom,
    dateTo,
    gender,
    condition_type,
    npsMin,
    npsMax,
  } = params

  let query = getAdmin()
    .from('surveys')
    .select('*, units(*)')

  if (search) {
    query = query.or(`best_experience.ilike.%${search}%,improvement_suggestion.ilike.%${search}%,testimonial.ilike.%${search}%`)
  }
  if (dateFrom) {
    query = query.gte('submitted_at', dateFrom)
  }
  if (dateTo) {
    query = query.lte('submitted_at', dateTo + 'T23:59:59')
  }
  if (gender) {
    query = query.eq('gender', gender)
  }
  if (condition_type) {
    query = query.eq('condition_type', condition_type)
  }
  if (npsMin !== undefined && npsMin !== null) {
    query = query.gte('nps_score', npsMin)
  }
  if (npsMax !== undefined && npsMax !== null) {
    query = query.lte('nps_score', npsMax)
  }

  query = query.order('submitted_at', { ascending: false })

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch surveys for export: ${error.message}`)
  return (data || []) as (Survey & { units: Unit })[]
}