// ============================================================
// PVLS Ja'far Medika — Survey localStorage Helper
// Persists survey data across multi-step pages
// ============================================================

const STORAGE_KEY = 'pvls_survey_data'
const START_TIME_KEY = 'pvls_survey_start'

/** Read all survey data from localStorage */
export function getSurveyData(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

/** Write partial survey data (merges with existing) */
export function saveSurveyData(data: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getSurveyData()
    const merged = { ...existing, ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // localStorage might be full or unavailable
  }
}

/** Get a single value from survey data */
export function getSurveyValue<T = unknown>(key: string): T | null {
  const data = getSurveyData()
  return (data[key] as T) ?? null
}

/** Initialize survey start time (only if not already set) */
export function initSurveyStartTime(): void {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(START_TIME_KEY)) {
    localStorage.setItem(START_TIME_KEY, Date.now().toString())
  }
}

/** Get survey start time */
export function getSurveyStartTime(): number | null {
  if (typeof window === 'undefined') return null
  const val = localStorage.getItem(START_TIME_KEY)
  return val ? parseInt(val, 10) : null
}

/** Calculate duration in seconds from start time */
export function getDurationSeconds(): number {
  const startTime = getSurveyStartTime()
  if (!startTime) return 0
  return Math.round((Date.now() - startTime) / 1000)
}

/** Clear all survey data */
export function clearSurveyData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(START_TIME_KEY)
}
