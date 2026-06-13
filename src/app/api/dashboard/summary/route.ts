// ============================================================
// PVLS Ja'far Medika — Dashboard Summary API
// GET /api/dashboard/summary
// ============================================================

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { DashboardSummary } from '@/lib/types'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Fetch total respondents count
    const { count: totalCount, error: totalError } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error fetching total count:', totalError)
      return NextResponse.json(
        { error: 'Gagal mengambil data total responden' },
        { status: 500 }
      )
    }

    // Fetch valid respondents count
    const { count: validCount, error: validError } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true })
      .eq('is_complete', true)

    if (validError) {
      console.error('Error fetching valid count:', validError)
      return NextResponse.json(
        { error: 'Gagal mengambil data responden valid' },
        { status: 500 }
      )
    }

    // Fetch mean scores from valid respondents
    const { data: meanData, error: meanError } = await supabase
      .from('survey_responses')
      .select('pv_total_mean, trust_mean, satisfaction_mean, loyalty_mean')
      .eq('is_complete', true)

    if (meanError) {
      console.error('Error fetching mean data:', meanError)
      return NextResponse.json(
        { error: 'Gagal mengambil data rata-rata' },
        { status: 500 }
      )
    }

    // Calculate averages
    const totalRespondents = totalCount ?? 0
    const validRespondents = validCount ?? 0
    const targetProgress = Math.min((validRespondents / 250) * 100, 100)

    const computeAvg = (field: 'pv_total_mean' | 'trust_mean' | 'satisfaction_mean' | 'loyalty_mean') => {
      const validValues = meanData
        ?.map((r) => r[field])
        .filter((v): v is number => v !== null && v !== undefined) ?? []
      if (validValues.length === 0) return null
      return parseFloat((validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(2))
    }

    const summary: DashboardSummary = {
      totalRespondents,
      validRespondents,
      targetProgress: parseFloat(targetProgress.toFixed(1)),
      avgPV: computeAvg('pv_total_mean'),
      avgTrust: computeAvg('trust_mean'),
      avgSatisfaction: computeAvg('satisfaction_mean'),
      avgLoyalty: computeAvg('loyalty_mean'),
    }

    return NextResponse.json(summary)
  } catch (err) {
    console.error('Dashboard summary error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
