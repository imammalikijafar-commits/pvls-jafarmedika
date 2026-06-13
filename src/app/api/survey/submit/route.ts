// ============================================================
// PVLS Ja'far Medika — Survey Submission API
// POST /api/survey/submit
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { fullSurveySubmissionSchema } from '@/lib/validators'
import { calculateScores, getExtremePattern } from '@/lib/scoring'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the submission data
    const parseResult = fullSurveySubmissionSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = parseResult.data

    // Calculate scores from answers (using uppercase codes for scoring)
    const answersForScoring: Record<string, number | null | undefined> = {}
    // Map lowercase keys to uppercase for the scoring function
    for (let i = 1; i <= 12; i++) {
      answersForScoring[`PV${i}`] = data[`pv${i}` as keyof typeof data] as number
    }
    for (let i = 1; i <= 4; i++) {
      answersForScoring[`TR${i}`] = data[`tr${i}` as keyof typeof data] as number
      answersForScoring[`SAT${i}`] = data[`sat${i}` as keyof typeof data] as number
      answersForScoring[`LOY${i}`] = data[`loy${i}` as keyof typeof data] as number
    }

    const scores = calculateScores(answersForScoring)
    const extremePattern = getExtremePattern(scores)

    // Build the database row
    const row = {
      // Consent & Screening
      consent_agreed: data.consent_agreed,
      eligible: data.eligible,
      consent_version: data.consent_version ?? '1.0',
      survey_version: data.survey_version ?? '1.0',

      // Demographics
      age_group: data.age_group,
      gender: data.gender,
      education: data.education,
      occupation: data.occupation,
      income_group: data.income_group,
      service_type: data.service_type,
      visit_count: data.visit_count,
      referral_source: data.referral_source,
      main_complaint_category: data.main_complaint_category,

      // PV items
      pv1: data.pv1,
      pv2: data.pv2,
      pv3: data.pv3,
      pv4: data.pv4,
      pv5: data.pv5,
      pv6: data.pv6,
      pv7: data.pv7,
      pv8: data.pv8,
      pv9: data.pv9,
      pv10: data.pv10,
      pv11: data.pv11,
      pv12: data.pv12,

      // Trust items
      tr1: data.tr1,
      tr2: data.tr2,
      tr3: data.tr3,
      tr4: data.tr4,

      // Satisfaction items
      sat1: data.sat1,
      sat2: data.sat2,
      sat3: data.sat3,
      sat4: data.sat4,

      // Loyalty items
      loy1: data.loy1,
      loy2: data.loy2,
      loy3: data.loy3,
      loy4: data.loy4,

      // Computed scores
      pv_quality_mean: scores.pv_quality_mean,
      pv_emotional_mean: scores.pv_emotional_mean,
      pv_price_mean: scores.pv_price_mean,
      pv_social_mean: scores.pv_social_mean,
      pv_total_mean: scores.pv_total_mean,
      trust_mean: scores.trust_mean,
      satisfaction_mean: scores.satisfaction_mean,
      loyalty_mean: scores.loyalty_mean,

      // Extreme pattern
      extreme_pattern_flag: extremePattern,

      // Metadata
      duration_seconds: data.duration_seconds ?? null,
      is_complete: true,
    }

    // Insert into Supabase
    const supabase = createAdminClient()
    const { data: insertedRow, error: insertError } = await supabase
      .from('survey_responses')
      .insert(row)
      .select('id')
      .single()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Gagal menyimpan data. Silakan coba lagi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: insertedRow?.id,
      message: 'Survei berhasil dikirim',
    })
  } catch (err) {
    console.error('Survey submit error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
