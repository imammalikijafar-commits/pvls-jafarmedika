// ============================================================
// PVLS Ja'far Medika — Export API
// GET /api/export?format=csv|xlsx
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { responsesToCSV, responsesToSheetData } from '@/lib/export'
import type { SurveyResponse } from '@/lib/types'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    const supabase = createAdminClient()

    // Fetch all completed survey responses
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('is_complete', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching responses for export:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil data untuk ekspor' },
        { status: 500 }
      )
    }

    const responses = (data ?? []) as SurveyResponse[]

    if (format === 'xlsx') {
      // Generate Excel file
      const sheetData = responsesToSheetData(responses)
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(sheetData)

      // Set column widths
      ws['!cols'] = Object.keys(sheetData[0] ?? {}).map(() => ({ wch: 18 }))

      XLSX.utils.book_append_sheet(wb, ws, 'Data PVLS')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="pvls_data.xlsx"',
        },
      })
    }

    // Default: CSV format
    const csv = responsesToCSV(responses)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="pvls_data.csv"',
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengekspor data' },
      { status: 500 }
    )
  }
}
