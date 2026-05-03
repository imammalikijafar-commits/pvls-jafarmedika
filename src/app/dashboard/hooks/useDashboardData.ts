'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DashboardData } from '@/lib/types'

export function useDashboardData(period: string) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(`/api/dashboard/data?period=${period}`)
      if (!res.ok) {
        let errorMsg = 'Gagal memuat data dashboard. Silakan coba lagi.'
        try {
          const body = await res.json()
          errorMsg = body.error || body.message || errorMsg
        } catch { /* ignore parse error */ }
        throw new Error(errorMsg)
      }
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e)
      setFetchError(e instanceof Error ? e.message : 'Gagal memuat data dashboard. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, fetchError, refetch: fetchData }
}
