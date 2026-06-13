import { NextRequest, NextResponse } from 'next/server'
import { createSurvey, getUnitByQrCode, getSurveysPaginated } from '@/lib/db'
import { fullSurveySubmissionSchema as fullSurveySchema } from '@/lib/validators'

const ACUPUNTUR_HERBAL_QR = 'akupuntur-herbal'

// --- GET: Paginated surveys with search & filter ---
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams

    const params = {
      search: sp.get('search') || undefined,
      dateFrom: sp.get('dateFrom') || undefined,
      dateTo: sp.get('dateTo') || undefined,
      gender: sp.get('gender') || undefined,
      condition_type: sp.get('condition_type') || undefined,
      npsMin: sp.get('npsMin') ? parseInt(sp.get('npsMin')!) : undefined,
      npsMax: sp.get('npsMax') ? parseInt(sp.get('npsMax')!) : undefined,
      page: sp.get('page') ? parseInt(sp.get('page')!) : 1,
      pageSize: sp.get('pageSize') ? parseInt(sp.get('pageSize')!) : 10,
      sortBy: sp.get('sortBy') || 'submitted_at',
      sortDir: sp.get('sortDir') || 'desc',
    }

    const { surveys, total } = await getSurveysPaginated(params)
    const pageSize = Math.min(Math.max(params.pageSize || 10, 1), 100)
    const page = Math.max(params.page || 1, 1)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return NextResponse.json({
      surveys,
      total,
      page,
      pageSize,
      totalPages,
    })
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json({ error: 'Gagal mengambil data survei' }, { status: 500 })
  }
}

// --- POST: Create new survey ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Auto-detect device type
    const userAgent = request.headers.get('user-agent') || ''
    const deviceType = /Mobile|Android|iPhone/i.test(userAgent) ? 'mobile' : 'desktop'

    // Auto-set unit_id to Poli Akupuntur & Herbal (BEFORE validation)
    const unit = await getUnitByQrCode(ACUPUNTUR_HERBAL_QR)
    if (!unit) {
      console.error('Akupuntur-Herbal unit not found in database')
      return NextResponse.json(
        { error: 'Unit akupuntur-herbal belum terdaftar di sistem' },
        { status: 500 }
      )
    }

    // Build full payload with unit_id + device_type BEFORE validation
    const fullBody = {
      ...body,
      unit_id: unit.id,
      device_type: body.device_type || deviceType,
    }

    // Validate with Zod (now unit_id is present)
    const result = fullSurveySchema.safeParse(fullBody)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validasi gagal',
          details: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    const survey = await createSurvey(fullBody)
    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json({ error: 'Gagal menyimpan survei' }, { status: 500 })
  }
}