'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExtremePatternTable from '@/components/dashboard/ExtremePatternTable'
import type { SurveyResponse } from '@/lib/types'

export default function ExtremePatternsPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResponses = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/responses?pageSize=999')
      if (!res.ok) throw new Error('Gagal memuat data')
      const data = await res.json()
      setResponses(data.responses)
    } catch (err) {
      console.error('Fetch extreme patterns error:', err)
      setError('Gagal memuat data pola ekstrem. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResponses()
  }, [])

  // Count extreme patterns
  const pvHighLoyaltyLowCount = responses.filter(
    (r) => r.extreme_pattern_flag === 'pv_high_loyalty_low'
  ).length
  const pvMediumLoyaltyHighCount = responses.filter(
    (r) => r.extreme_pattern_flag === 'pv_medium_loyalty_high'
  ).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pola Ekstrem</h1>
          <p className="text-sm text-gray-500 mt-1">
            Identifikasi responden dengan pola nilai ekstrem yang memerlukan perhatian khusus
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchResponses}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Badges */}
      <div className="flex gap-4">
        <div className="px-4 py-2 rounded-lg bg-red-50 border border-red-100">
          <p className="text-xs text-red-500 font-medium">PV Tinggi, Loyalitas Rendah</p>
          <p className="text-xl font-bold text-red-700">{pvHighLoyaltyLowCount}</p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-500 font-medium">PV Sedang, Loyalitas Tinggi</p>
          <p className="text-xl font-bold text-amber-700">{pvMediumLoyaltyHighCount}</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Memuat data pola ekstrem...</p>
        </div>
      ) : (
        <ExtremePatternTable responses={responses} />
      )}
    </div>
  )
}
