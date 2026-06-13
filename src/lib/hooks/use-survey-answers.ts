'use client'

import { useCallback, useSyncExternalStore, useRef } from 'react'
import { getSurveyData, saveSurveyData as saveData } from '@/lib/survey-storage'
import type { Question } from '@/lib/questions'

// ============================================================
// useSyncExternalStore-based hooks for localStorage data
// Avoids the react-hooks/set-state-in-effect lint rule
//
// CRITICAL: useSyncExternalStore requires getSnapshot to return
// the SAME reference if data hasn't changed. Since getSurveyData()
// always creates a new object via JSON.parse, we must cache the
// snapshot and only create a new reference when the underlying
// localStorage string actually changes.
// ============================================================

let listeners: (() => void)[] = []

function emitChange() {
  listeners.forEach((l) => l())
}

function subscribe(callback: () => void) {
  listeners = [...listeners, callback]
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

// ---- Snapshot cache (module-level) ----
// Ensures getSnapshot returns the same object reference when
// the underlying localStorage string has not changed.
let cachedRawString: string | null = null
let cachedParsed: Record<string, unknown> = {}

function getCachedSnapshot(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('pvls_survey_data')
    // Only re-parse if the string has changed
    if (raw !== cachedRawString) {
      cachedRawString = raw
      cachedParsed = raw ? JSON.parse(raw) : {}
    }
    return cachedParsed
  } catch {
    return cachedParsed
  }
}

// Invalidate cache when data is written
const originalSaveData = saveData
function saveAndInvalidate(data: Record<string, unknown>): void {
  originalSaveData(data)
  // Force cache invalidation so next getSnapshot returns fresh data
  cachedRawString = null
  emitChange()
}

/**
 * Hook for managing survey Likert-scale answers with localStorage persistence.
 * Uses useSyncExternalStore for SSR-safe hydration.
 */
export function useSurveyAnswers(questions: Question[]) {
  // Read from localStorage using useSyncExternalStore with cached snapshot
  const rawData = useSyncExternalStore(
    subscribe,
    getCachedSnapshot,
    () => ({}) // server snapshot
  )

  // Parse answers from raw data — use useRef to maintain stable reference
  const answersRef = useRef<Record<string, number | null>>({})
  const lastRawRef = useRef<Record<string, unknown>>({})

  // Only recompute answers if rawData reference changed
  if (rawData !== lastRawRef.current) {
    lastRawRef.current = rawData
    const newAnswers: Record<string, number | null> = {}
    questions.forEach((q) => {
      const key = q.code.toLowerCase()
      const val = rawData[key]
      newAnswers[key] = typeof val === 'number' ? val : null
    })
    answersRef.current = newAnswers
  }

  const answers = answersRef.current
  const answeredCount = Object.values(answers).filter((v) => v !== null).length
  const allAnswered = answeredCount === questions.length
  const mounted = typeof window !== 'undefined'

  const handleChange = useCallback((code: string, value: number) => {
    const key = code.toLowerCase()
    saveAndInvalidate({ [key]: value })
  }, [])

  return { answers, mounted, handleChange, answeredCount, allAnswered }
}

/**
 * Hook for managing demographic form data with localStorage persistence.
 */
export function useDemographicForm() {
  const rawData = useSyncExternalStore(
    subscribe,
    getCachedSnapshot,
    () => ({}) // server snapshot
  )

  // Cache formData to maintain stable reference
  const formDataRef = useRef<Record<string, string>>({})
  const lastRawRef = useRef<Record<string, unknown>>({})

  if (rawData !== lastRawRef.current) {
    lastRawRef.current = rawData
    const fields = [
      'age_group', 'gender', 'education', 'occupation', 'income_group',
      'service_type', 'visit_count', 'referral_source', 'main_complaint_category',
    ] as const

    const newFormData: Record<string, string> = {}
    fields.forEach((f) => {
      if (rawData[f] && typeof rawData[f] === 'string') {
        newFormData[f] = rawData[f] as string
      }
    })
    formDataRef.current = newFormData
  }

  const mounted = typeof window !== 'undefined'

  const handleSelectChange = useCallback((key: string, value: string) => {
    saveAndInvalidate({ [key]: value })
  }, [])

  return { formData: formDataRef.current, mounted, handleSelectChange }
}
