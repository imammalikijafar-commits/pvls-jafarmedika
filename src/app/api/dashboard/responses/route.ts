// ============================================================
// PVLS Ja'far Medika — Dashboard Responses API
// GET /api/dashboard/responses?page=1&pageSize=10&search=
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdmin } from '@/lib/supabase/server'
import type { SurveyResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Auth check — hanya user yang sudah login bisa akses
    const user = await requireAdmin()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized — silakan login terlebih dahulu' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const search = searchParams.get('search') || ''

    const supabase = createAdminClient()

    // Build query
    let query = supabase
      .from('survey_responses')
      .select('*', { count: 'exact' })
      .eq('is_complete', true)
      .order('created_at', { ascending: false })

    // Apply search filter if provided
    if (search) {
      query = query.or(
        `service_type.ilike.%${search}%,age_group.ilike.%${search}%,gender.ilike.%${search}%,occupation.ilike.%${search}%,education.ilike.%${search}%,extreme_pattern_flag.ilike.%${search}%`
      )
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching responses:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil data respons' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      responses: (data ?? []) as SurveyResponse[],
      total: count ?? 0,
      page,
      pageSize,
    })
  } catch (err) {
    console.error('Dashboard responses error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
