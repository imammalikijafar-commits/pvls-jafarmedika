import { NextRequest, NextResponse } from 'next/server'
import { getSurveys, getHospital, getAlerts } from '@/lib/db'
import type { Survey, Unit, Hospital } from '@/lib/types'

// --- Helpers ---
function avg(arr: (number | null)[]): number {
  const valid = arr.filter((v): v is number => v !== null && v !== undefined)
  if (valid.length === 0) return 0
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
}

function dist(arr: (string | null)[]): Record<string, number> {
  const map: Record<string, number> = {}
  arr.forEach((v) => { if (v) map[v] = (map[v] || 0) + 1 })
  return map
}

// Barthel scoring helper
function barthelScore(survey: Survey): { first: number; current: number } {
  const pairs = [
    ['barthel_eat_first', 'barthel_eat_current'],
    ['barthel_bath_first', 'barthel_bath_current'],
    ['barthel_groom_first', 'barthel_groom_current'],
    ['barthel_dress_first', 'barthel_dress_current'],
    ['barthel_toilet_first', 'barthel_toilet_current'],
    ['barthel_bowel_first', 'barthel_bowel_current'],
    ['barthel_bladder_first', 'barthel_bladder_current'],
    ['barthel_transfer_first', 'barthel_transfer_current'],
    ['barthel_mobility_first', 'barthel_mobility_current'],
    ['barthel_stairs_first', 'barthel_stairs_current'],
  ] as const
  let first = 0, current = 0
  for (const [fKey, cKey] of pairs) {
    first += (survey[fKey] as number) || 0
    current += (survey[cKey] as number) || 0
  }
  return { first, current }
}

// ISI scoring helper
function isiScore(survey: Survey): number | null {
  const keys = ['isi_1', 'isi_2', 'isi_3', 'isi_4', 'isi_5', 'isi_6', 'isi_7'] as const
  const vals = keys.map((k) => survey[k]).filter((v): v is number => v !== null)
  if (vals.length < 7) return null
  return vals.reduce((a, b) => a + b, 0)
}

// Wellness scoring helper
function wellnessScore(survey: Survey): number | null {
  const keys = ['wellness_1', 'wellness_2', 'wellness_3'] as const
  const vals = keys.map((k) => survey[k]).filter((v): v is number => v !== null)
  if (vals.length < 3) return null
  return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2))
}

// Condition type categories for clinical branching
const PAIN_CONDITIONS = ['Nyeri Sendi', 'Nyeri Punggung', 'Migrain', 'Neurologis Lainnya', 'Lainnya']
const STROKE_CONDITIONS = ['Stroke', 'Pasca Stroke']
const INSOMNIA_CONDITIONS = ['Insomnia', 'Gangguan Tidur']
const WELLNESS_CONDITIONS = ['Pemeliharaan Kesehatan', 'Wellness']

function isPainCondition(ct: string | null): boolean { return ct ? PAIN_CONDITIONS.some((p) => ct.includes(p)) || ['Lainnya'].includes(ct) : false }
function isStrokeCondition(ct: string | null): boolean { return ct ? STROKE_CONDITIONS.some((s) => ct.includes(s)) : false }
function isInsomniaCondition(ct: string | null): boolean { return ct ? INSOMNIA_CONDITIONS.some((i) => ct.includes(i)) : false }
function isWellnessCondition(ct: string | null): boolean { return ct ? WELLNESS_CONDITIONS.some((w) => ct.includes(w)) : false }

export async function GET(request: NextRequest) {
  try {
    const period = parseInt(request.nextUrl.searchParams.get('period') || '30')
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000)

    const [surveys, hospital, alerts] = await Promise.all([
      getSurveys(since),
      getHospital(),
      getAlerts(false, 5),
    ])

    const totalSurveys = surveys.length

    // ════════════════════════════════════════
    // PAIN REDUCTION (VAS — E1 for pain conditions)
    // ════════════════════════════════════════
    const painSurveys = surveys.filter((s) => isPainCondition(s.condition_type))
    const painBeforeArr = painSurveys.map((s) => s.pain_level_before).filter((v): v is number => v !== null && v > 0)
    const painAfterArr = painSurveys.map((s) => s.pain_level_after).filter((v): v is number => v !== null)
    const avgPainBefore = painBeforeArr.length > 0 ? painBeforeArr.reduce((a, b) => a + b, 0) / painBeforeArr.length : 0
    const avgPainAfter = painAfterArr.length > 0 ? painAfterArr.reduce((a, b) => a + b, 0) / painAfterArr.length : 0
    const avgPainReduction = avgPainBefore > 0 ? parseFloat((((avgPainBefore - avgPainAfter) / avgPainBefore) * 100).toFixed(1)) : 0

    // ════════════════════════════════════════
    // NPS (G)
    // ════════════════════════════════════════
    const npsScores = surveys.map((s) => s.nps_score).filter((v): v is number => v !== null)
    const promoters = npsScores.filter((s) => s >= 9).length
    const passives = npsScores.filter((s) => s >= 7 && s <= 8).length
    const detractors = npsScores.filter((s) => s <= 6).length
    const npsTotal = promoters + passives + detractors
    const npsScore = npsTotal > 0 ? Math.round(((promoters - detractors) / npsTotal) * 100) : 0

    // ════════════════════════════════════════
    // SERVQUAL (B) — dimension averages
    // ════════════════════════════════════════
    const tangibles = avg(surveys.map((s) => s.tangibles))
    const reliability = avg(surveys.map((s) => s.reliability))
    const responsiveness = avg(surveys.map((s) => s.responsiveness))
    const assurance = avg(surveys.map((s) => s.assurance))
    const empathy = avg(surveys.map((s) => s.empathy))
    const overall = parseFloat(((tangibles + reliability + responsiveness + assurance + empathy) / 5).toFixed(2))

    const servqual = { tangibles, reliability, responsiveness, assurance, empathy, overall }

    // Worst SERVQUAL dimension
    const servqualDims = [
      { name: 'Tangibles (Bukti Fisik)', score: tangibles },
      { name: 'Reliability (Keandalan)', score: reliability },
      { name: 'Responsiveness (Daya Tanggap)', score: responsiveness },
      { name: 'Assurance (Jaminan)', score: assurance },
      { name: 'Empathy (Empati)', score: empathy },
    ]
    servqualDims.sort((a, b) => a.score - b.score)
    const worstServqualDimension = { name: servqualDims[0].name, score: servqualDims[0].score }

    // ════════════════════════════════════════
    // SPIRITUAL (F) — 9 dimensions (F9 reverse-coded)
    // F9 reverse scoring: 1→5, 2→4, 3→3, 4→2, 5→1
    // ════════════════════════════════════════
    const f1 = avg(surveys.map((s) => s.f1_adab_islami))
    const f2 = avg(surveys.map((s) => s.f2_gender_concordance))
    const f3 = avg(surveys.map((s) => s.f3_prayer_accommodation))
    const f4 = avg(surveys.map((s) => s.f4_halal_assurance))
    const f5 = avg(surveys.map((s) => s.f5_tibb_nabawi))
    const f6 = avg(surveys.map((s) => s.f6_spiritual_activation))
    const f7 = avg(surveys.map((s) => s.f7_holistic_peace))
    const f8 = avg(surveys.map((s) => s.f8_spiritual_communication))
    // F9 reverse scoring: per-respondent reverse (6 - raw), then average
    const f9Raw = avg(surveys.map((s) => s.f9_reverse_coded))
    const f9Reversed = avg(surveys.map((s) => {
      const raw = s.f9_reverse_coded
      return raw !== null && raw !== undefined ? 6 - raw : null
    }))
    const spiritOverall = parseFloat(((f1 + f2 + f3 + f4 + f5 + f6 + f7 + f8 + f9Reversed) / 9).toFixed(2))

    const spiritualAvg = {
      f1AdabIslami: f1,
      f2GenderConcordance: f2,
      f3PrayerAccommodation: f3,
      f4HalalAssurance: f4,
      f5TibbNabawi: f5,
      f6SpiritualActivation: f6,
      f7HolisticPeace: f7,
      f8SpiritualCommunication: f8,
      f9ReverseCoded: f9Raw,    // Raw average (1-5)
      f9Reversed: f9Reversed,    // Per-respondent reversed average (5-1)
      overall: spiritOverall,
    }

    // ════════════════════════════════════════
    // HERBAL (C)
    // ════════════════════════════════════════
    const herbalPrescribedCount = surveys.filter((s) => s.herbal_prescribed === true).length
    const herbalAvg = {
      explanation: avg(surveys.map((s) => s.herb_explanation)),
      usageGuide: avg(surveys.map((s) => s.herb_usage_guide)),
      safetyTrust: avg(surveys.map((s) => s.herb_safety_trust)),
      availability: avg(surveys.map((s) => s.herb_availability)),
      affordability: avg(surveys.map((s) => s.herb_affordability)),
      pharmacist: avg(surveys.map((s) => s.herb_pharmacist)),
      prescribedCount: herbalPrescribedCount,
      prescribedPct: totalSurveys > 0 ? parseFloat(((herbalPrescribedCount / totalSurveys) * 100).toFixed(1)) : 0,
    }

    // ════════════════════════════════════════
    // CLARITY OF THERAPEUTIC ROLE (D) — v2.0
    // ════════════════════════════════════════
    const clarityAvg = {
      roleClarity: avg(surveys.map((s) => s.d1_clarity_role)),
      explanationClarity: avg(surveys.map((s) => s.d2_clarity_explanation)),
      comfortableClarity: avg(surveys.map((s) => s.d3_clarity_comfortable)),
      specialistClarity: avg(surveys.map((s) => s.d4_clarity_specialist)),
      overall: 0,
    }
    clarityAvg.overall = parseFloat(((clarityAvg.roleClarity + clarityAvg.explanationClarity + clarityAvg.comfortableClarity + clarityAvg.specialistClarity) / 4).toFixed(2))

    // ════════════════════════════════════════
    // CLINICAL OUTCOMES (E) — conditional
    // ════════════════════════════════════════
    // VAS
    const vasRespondentCount = painSurveys.length

    // Barthel (stroke)
    const strokeSurveys = surveys.filter((s) => isStrokeCondition(s.condition_type))
    const barthelResults = strokeSurveys.map((s) => barthelScore(s))
    const barthelFirstArr = barthelResults.map((r) => r.first).filter((v) => v > 0)
    const barthelCurrentArr = barthelResults.map((r) => r.current).filter((v) => v > 0)
    const avgBarthelFirst = barthelFirstArr.length > 0 ? barthelFirstArr.reduce((a, b) => a + b, 0) / barthelFirstArr.length : 0
    const avgBarthelCurrent = barthelCurrentArr.length > 0 ? barthelCurrentArr.reduce((a, b) => a + b, 0) / barthelCurrentArr.length : 0
    const barthelImprovement = avgBarthelFirst > 0 ? parseFloat((((avgBarthelCurrent - avgBarthelFirst) / avgBarthelFirst) * 100).toFixed(1)) : 0

    // ISI (insomnia)
    const insomniaSurveys = surveys.filter((s) => isInsomniaCondition(s.condition_type))
    const isiScores = insomniaSurveys.map((s) => isiScore(s)).filter((v): v is number => v !== null)
    const avgIsiScore = isiScores.length > 0 ? parseFloat((isiScores.reduce((a, b) => a + b, 0) / isiScores.length).toFixed(1)) : 0
    const isiSeverity = avgIsiScore >= 22 ? 'Berat' : avgIsiScore >= 15 ? 'Sedang' : avgIsiScore >= 8 ? 'Ringan' : avgIsiScore > 0 ? 'Subklinis' : 'N/A'

    // Wellness (WHOQOL-BREF)
    const wellnessSurveys = surveys.filter((s) => isWellnessCondition(s.condition_type))
    const wellnessScores = wellnessSurveys.map((s) => wellnessScore(s)).filter((v): v is number => v !== null)
    const avgWellnessScore = wellnessScores.length > 0 ? parseFloat((wellnessScores.reduce((a, b) => a + b, 0) / wellnessScores.length).toFixed(2)) : 0

    const clinicalData = {
      vas: { avgBefore: parseFloat(avgPainBefore.toFixed(1)), avgAfter: parseFloat(avgPainAfter.toFixed(1)), reductionPct: avgPainReduction, respondentCount: vasRespondentCount },
      barthel: { avgFirst: avgBarthelFirst, avgCurrent: avgBarthelCurrent, improvementPct: barthelImprovement, respondentCount: strokeSurveys.length, avgScoreCurrent: avgBarthelCurrent },
      isi: { avgScore: avgIsiScore, respondentCount: insomniaSurveys.length, severity: isiSeverity },
      wellness: { avgScore: avgWellnessScore, respondentCount: wellnessSurveys.length },
    }

    // ════════════════════════════════════════
    // LOYALTY DATA (G extras)
    // ════════════════════════════════════════
    const loyaltyData = {
      visitPlanDist: dist(surveys.map((s) => s.visit_plan)),
      hasRecommendedDist: dist(surveys.map((s) => s.has_recommended)),
      recommendationCountDist: dist(surveys.map((s) => s.recommendation_count)),
      wtpPriceIncreaseDist: dist(surveys.map((s) => s.wtp_price_increase ? String(s.wtp_price_increase) : null)),
    }

    // ════════════════════════════════════════
    // WTP DATA (I)
    // ════════════════════════════════════════
    const wtpSurveys = surveys.filter((s) => s.wtp_cost_today !== null && s.wtp_cost_today !== undefined)
    const wtpCostArr = wtpSurveys.map((s) => s.wtp_cost_today!).filter((v): v is number => v > 0)
    const wtpData = {
      avgCostToday: wtpCostArr.length > 0 ? parseFloat((wtpCostArr.reduce((a, b) => a + b, 0) / wtpCostArr.length).toFixed(0)) : 0,
      increase20Dist: dist(surveys.map((s) => s.wtp_increase_20)),
      packageInterestDist: dist(surveys.map((s) => s.wtp_package_interest)),
      maxAcceptableDist: dist(surveys.map((s) => s.wtp_max_acceptable)),
      respondentCount: wtpSurveys.length,
    }

    // ════════════════════════════════════════
    // UNIT PERFORMANCE
    // ════════════════════════════════════════
    const unitPerformance = [{
      unitName: 'Poli Akupuntur & Herbal',
      unitType: 'Integrative Medicine',
      surveyCount: totalSurveys,
      avgSatisfaction: overall,
      avgPainReduction,
    }]

    // ════════════════════════════════════════
    // RECENT FEEDBACK (H)
    // ════════════════════════════════════════
    const recentFeedback = surveys
      .filter((s) => s.best_experience || s.improvement_suggestion || s.testimonial || (s.h1_liked && s.h1_liked.length > 0) || (s.h2_suggested && s.h2_suggested.length > 0))
      .slice(0, 50)
      .map((s) => {
        const unit = s.units as Unit
        return {
          testimonial: s.testimonial,
          bestExperience: s.best_experience,
          complaints: null,
          suggestions: s.improvement_suggestion,
          improvementSuggestion: s.improvement_suggestion,
          unitName: unit?.name || 'Poli Akupuntur & Herbal',
          npsScore: s.nps_score,
          submittedAt: s.submitted_at,
          conditionType: s.condition_type,
          ageRange: s.age_range,
          gender: s.gender,
          h1Liked: s.h1_liked,
          h2Suggested: s.h2_suggested,
          h1LikedOther: (s as any).h1_liked_other ?? null,
          h2SuggestedOther: (s as any).h2_suggested_other ?? null,
        }
      })

    // ════════════════════════════════════════
    // DEMOGRAPHICS (A)
    // ════════════════════════════════════════
    const ageRangeMap = new Map<string, number>()
    const genderMap = new Map<string, number>()
    const patientTypeMap = new Map<string, number>()
    const conditionMap = new Map<string, number>()
    const educationMap = new Map<string, number>()

    surveys.forEach((s) => {
      if (s.age_range) ageRangeMap.set(s.age_range, (ageRangeMap.get(s.age_range) || 0) + 1)
      if (s.gender) genderMap.set(s.gender, (genderMap.get(s.gender) || 0) + 1)
      if (s.patient_type) patientTypeMap.set(s.patient_type, (patientTypeMap.get(s.patient_type) || 0) + 1)
      if (s.condition_type) conditionMap.set(s.condition_type, (conditionMap.get(s.condition_type) || 0) + 1)
      if (s.education) educationMap.set(s.education, (educationMap.get(s.education) || 0) + 1)
    })

    const topTreatments = Array.from(conditionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }))

    // ════════════════════════════════════════
    // DIAGNOSIS-LEVEL ANALYTICS
    // ════════════════════════════════════════
    const diagnosisGroups = new Map<string, Survey[]>()
    surveys.forEach((s) => {
      if (s.condition_type) {
        const key = s.condition_type
        if (!diagnosisGroups.has(key)) diagnosisGroups.set(key, [])
        diagnosisGroups.get(key)!.push(s)
      }
    })

    const diagnosisPainData = Array.from(diagnosisGroups.entries())
      .map(([condition_type, group]) => {
        const pbArr = group.map((s) => s.pain_level_before).filter((v): v is number => v !== null && v > 0)
        const paArr = group.map((s) => s.pain_level_after).filter((v): v is number => v !== null)
        const avgPB = pbArr.length > 0 ? pbArr.reduce((a, b) => a + b, 0) / pbArr.length : 0
        const avgPA = paArr.length > 0 ? paArr.reduce((a, b) => a + b, 0) / paArr.length : 0
        const reduction = avgPB > 0 ? parseFloat((((avgPB - avgPA) / avgPB) * 100).toFixed(1)) : 0
        return { condition_type, avgPainBefore: parseFloat(avgPB.toFixed(1)), avgPainAfter: parseFloat(avgPA.toFixed(1)), painReductionPct: reduction, patientCount: group.length }
      })
      .sort((a, b) => b.painReductionPct - a.painReductionPct)

    const diagnosisSatisfactionData = Array.from(diagnosisGroups.entries())
      .map(([condition_type, group]) => {
        const satScores = group
          .map((s) => s.tangibles && s.reliability && s.responsiveness && s.assurance && s.empathy
            ? (s.tangibles + s.reliability + s.responsiveness + s.assurance + s.empathy) / 5
            : null)
          .filter((v): v is number => v !== null)
        return { condition_type, avgSatisfaction: satScores.length > 0 ? parseFloat((satScores.reduce((a, b) => a + b, 0) / satScores.length).toFixed(1)) : 0, patientCount: group.length }
      })
      .sort((a, b) => b.patientCount - a.patientCount)

    const sortedByCount = [...diagnosisSatisfactionData].sort((a, b) => b.patientCount - a.patientCount)
    const topDiagnosis = sortedByCount.length > 0
      ? { name: sortedByCount[0].condition_type, patientCount: sortedByCount[0].patientCount, percentage: totalSurveys > 0 ? parseFloat(((sortedByCount[0].patientCount / totalSurveys) * 100).toFixed(1)) : 0, avgSatisfaction: sortedByCount[0].avgSatisfaction }
      : null

    // ════════════════════════════════════════
    // TREND DATA
    // ════════════════════════════════════════
    const trendData: { date: string; count: number }[] = []
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      const dayCount = surveys.filter((s) => s.submitted_at.split('T')[0] === dateStr).length
      trendData.push({ date: dateStr, count: dayCount })
    }

    // ════════════════════════════════════════
    // RESPONSE RATE
    // ════════════════════════════════════════
    const responseRate = Math.min(95, parseFloat(((totalSurveys / (totalSurveys + 45)) * 100).toFixed(1)))

    return NextResponse.json({
      totalSurveys,
      avgPainReduction,
      nps: { promoters, passives, detractors, score: npsScore, total: npsTotal },
      servqual,
      unitPerformance,
      spiritualAvg,
      herbalAvg,
      clarityAvg,
      clinicalData,
      loyaltyData,
      wtpData,
      recentFeedback,
      recentAlerts: alerts || [],
      demographics: {
        ageRangeDistribution: Object.fromEntries(ageRangeMap),
        genderDistribution: Object.fromEntries(genderMap),
        patientTypeDistribution: Object.fromEntries(patientTypeMap),
        conditionTypeDistribution: Object.fromEntries(conditionMap),
        educationDistribution: Object.fromEntries(educationMap),
        topTreatments,
      },
      trendData,
      responseRate,
      overallSatisfaction: parseFloat(overall.toFixed(1)),
      hospital: hospital || { name: "RSU Ja'far Medika", code: 'RS-JMK-001' },
      diagnosisPainData,
      diagnosisSatisfactionData,
      topDiagnosis,
      worstServqualDimension,
    })
  } catch (error) {
    console.error('Error computing dashboard data:', error)
    return NextResponse.json({ error: 'Failed to compute dashboard data' }, { status: 500 })
  }
}