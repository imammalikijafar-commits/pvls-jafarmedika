import { NextRequest, NextResponse } from 'next/server'
import { getSurveys, getHospital, getAlerts } from '@/lib/db'
import type { Survey, Unit, Hospital } from '@/lib/types'

// --- Helpers ---
function avg(arr: (number | null)[]): number {
  const valid = arr.filter((v): v is number => v !== null && v !== undefined)
  if (valid.length === 0) return 0
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
}

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

    // --- Pain Reduction ---
    const painBeforeArr = surveys.map((s) => s.pain_level_before).filter((v): v is number => v !== null)
    const painAfterArr = surveys.map((s) => s.pain_level_after).filter((v): v is number => v !== null)
    const avgPainBefore = painBeforeArr.length > 0 ? painBeforeArr.reduce((a, b) => a + b, 0) / painBeforeArr.length : 0
    const avgPainAfter = painAfterArr.length > 0 ? painAfterArr.reduce((a, b) => a + b, 0) / painAfterArr.length : 0
    const avgPainReduction = avgPainBefore > 0 ? parseFloat((((avgPainBefore - avgPainAfter) / avgPainBefore) * 100).toFixed(1)) : 0

    // --- NPS ---
    const npsScores = surveys.map((s) => s.nps_score).filter((v): v is number => v !== null)
    const promoters = npsScores.filter((s) => s >= 9).length
    const passives = npsScores.filter((s) => s >= 7 && s <= 8).length
    const detractors = npsScores.filter((s) => s <= 6).length
    const npsTotal = promoters + passives + detractors
    const npsScore = npsTotal > 0 ? Math.round(((promoters - detractors) / npsTotal) * 100) : 0

    // --- SERVQUAL (stored as dimension averages in DB) ---
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

    // --- Spiritual Averages (using all 5 schema fields) ---
    const spiritualAvg = {
      spiritualComfort: avg(surveys.map((s) => s.spiritual_salam_doa)),
      culturalRespect: avg(surveys.map((s) => s.spiritual_islam_respect)),
      facility: avg(surveys.map((s) => s.spiritual_facility)),
      healing: avg(surveys.map((s) => s.spiritual_healing)),
      support: avg(surveys.map((s) => s.spiritual_support)),
    }

    // --- Unit Performance (single unit) ---
    const unitPerformance = [{
      unitName: 'Poli Akupuntur & Herbal',
      unitType: 'Integrative Medicine',
      surveyCount: totalSurveys,
      avgSatisfaction: overall,
      avgPainReduction,
    }]

    // --- Recent Feedback (with full survey context for filtering) ---
    const recentFeedback = surveys
      .filter((s) => s.best_experience || s.improvement_suggestion || s.testimonial)
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
        }
      })

    // --- Demographics ---
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

    // --- Diagnosis-Level Pain Reduction ---
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
        return {
          condition_type,
          avgPainBefore: parseFloat(avgPB.toFixed(1)),
          avgPainAfter: parseFloat(avgPA.toFixed(1)),
          painReductionPct: reduction,
          patientCount: group.length,
        }
      })
      .sort((a, b) => b.painReductionPct - a.painReductionPct)

    // --- Diagnosis-Level Satisfaction ---
    const diagnosisSatisfactionData = Array.from(diagnosisGroups.entries())
      .map(([condition_type, group]) => {
        const satScores = group
          .map((s) => s.tangibles && s.reliability && s.responsiveness && s.assurance && s.empathy
            ? (s.tangibles + s.reliability + s.responsiveness + s.assurance + s.empathy) / 5
            : null)
          .filter((v): v is number => v !== null)
        return {
          condition_type,
          avgSatisfaction: satScores.length > 0 ? parseFloat((satScores.reduce((a, b) => a + b, 0) / satScores.length).toFixed(1)) : 0,
          patientCount: group.length,
        }
      })
      .sort((a, b) => b.patientCount - a.patientCount)

    // --- Top Diagnosis (most patients) ---
    const sortedByCount = [...diagnosisSatisfactionData].sort((a, b) => b.patientCount - a.patientCount)
    const topDiagnosis = sortedByCount.length > 0
      ? {
          name: sortedByCount[0].condition_type,
          patientCount: sortedByCount[0].patientCount,
          percentage: totalSurveys > 0 ? parseFloat(((sortedByCount[0].patientCount / totalSurveys) * 100).toFixed(1)) : 0,
          avgSatisfaction: sortedByCount[0].avgSatisfaction,
        }
      : null

    // --- Trend Data ---
    const trendData: { date: string; count: number }[] = []
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      const dayCount = surveys.filter((s) => s.submitted_at.split('T')[0] === dateStr).length
      trendData.push({ date: dateStr, count: dayCount })
    }

    // --- Response Rate ---
    const responseRate = Math.min(95, parseFloat(((totalSurveys / (totalSurveys + 45)) * 100).toFixed(1)))

    // ═══════════════════════════════════════════════════════
    // v2.0: Spiritual 9 Dimensions (F1-F9)
    // ═══════════════════════════════════════════════════════
    const spiritual9Fields = [
      'f1_adab_islami', 'f2_gender_concordance', 'f3_prayer_accommodation',
      'f4_halal_assurance', 'f5_tibb_nabawi', 'f6_spiritual_activation',
      'f7_holistic_peace', 'f8_spiritual_communication', 'f9_reverse_coded'
    ]
    const spiritual9Sums: Record<string, { sum: number; count: number }> = {}
    spiritual9Fields.forEach(f => {
      spiritual9Sums[f] = { sum: 0, count: 0 }
    })
    surveys.forEach(s => {
      spiritual9Fields.forEach(f => {
        const v = (s as Record<string, unknown>)[f] as number | null
        if (v !== null && v !== undefined) { spiritual9Sums[f].sum += v; spiritual9Sums[f].count++ }
      })
    })
    const avg9 = (key: string) => spiritual9Sums[key].count > 0 ? parseFloat((spiritual9Sums[key].sum / spiritual9Sums[key].count).toFixed(2)) : 0
    const spiritual9Avg = {
      f1AdabIslami: avg9('f1_adab_islami'),
      f2GenderConcordance: avg9('f2_gender_concordance'),
      f3PrayerAccommodation: avg9('f3_prayer_accommodation'),
      f4HalalAssurance: avg9('f4_halal_assurance'),
      f5TibbNabawi: avg9('f5_tibb_nabawi'),
      f6SpiritualActivation: avg9('f6_spiritual_activation'),
      f7HolisticPeace: avg9('f7_holistic_peace'),
      f8SpiritualCommunication: avg9('f8_spiritual_communication'),
      f9KedekatanTuhan: avg9('f9_reverse_coded'),
      f9Reversed: spiritual9Sums['f9_reverse_coded'].count > 0 ? parseFloat((6 - spiritual9Sums['f9_reverse_coded'].sum / spiritual9Sums['f9_reverse_coded'].count).toFixed(2)) : 0,
    }

    // ═══════════════════════════════════════════════════════
    // v2.0: Clarity D1-D4
    // ═══════════════════════════════════════════════════════
    const clarityAvg = {
      d1ClarityRole: avg(surveys.map(s => s.info_acupuncture_support)),
      d2ClarityExplanation: avg(surveys.map(s => s.info_understanding)),
      d3ClarityComfortable: avg(surveys.map(s => s.info_sufficient)),
      d4ClaritySpecialist: avg(surveys.map(s => s.info_comfortable_asking)),
    }

    // ═══════════════════════════════════════════════════════
    // v2.0: Herb Avg
    // ═══════════════════════════════════════════════════════
    const herbPrescribed = surveys.filter(s => s.herbal_prescribed === true).length
    const herbAvg = {
      prescribedPct: totalSurveys > 0 ? parseFloat(((herbPrescribed / totalSurveys) * 100).toFixed(1)) : 0,
      prescribedCount: herbPrescribed,
      explanation: avg(surveys.filter(s => s.herbal_prescribed).map(s => s.herb_explanation)),
      usageGuide: avg(surveys.filter(s => s.herbal_prescribed).map(s => s.herb_usage_guide)),
      safetyTrust: avg(surveys.filter(s => s.herbal_prescribed).map(s => s.herb_safety_trust)),
      availability: avg(surveys.filter(s => s.herbal_prescribed).map(s => s.herb_availability)),
      affordability: avg(surveys.filter(s => s.herbal_prescribed).map(s => s.herb_affordability)),
      pharmacist: avg(surveys.filter(s => s.herbal_prescribed).map(s => s.herb_pharmacist)),
    }

    // ═══════════════════════════════════════════════════════
    // v2.0: Clinical Outcomes
    // ═══════════════════════════════════════════════════════
    const barthelSurveys = surveys.filter(s => s.barthel_eat_first !== null || s.barthel_eat_current !== null)
    const barthelFields = ['eat', 'bath', 'groom', 'dress', 'toilet', 'bowel', 'bladder', 'transfer', 'mobility', 'stairs']
    let barthelAvgFirst = 0, barthelAvgCurrent = 0
    if (barthelSurveys.length > 0) {
      const firstScores = barthelSurveys.map(s => {
        let total = 0
        barthelFields.forEach(f => { total += (s as Record<string, unknown>)[`barthel_${f}_first`] as number || 0 })
        return total
      })
      const currentScores = barthelSurveys.map(s => {
        let total = 0
        barthelFields.forEach(f => { total += (s as Record<string, unknown>)[`barthel_${f}_current`] as number || 0 })
        return total
      })
      barthelAvgFirst = firstScores.reduce((a, b) => a + b, 0) / firstScores.length
      barthelAvgCurrent = currentScores.reduce((a, b) => a + b, 0) / currentScores.length
    }
    const barthelLevel = barthelAvgCurrent >= 60 ? 'Ringan' : barthelAvgCurrent >= 40 ? 'Sedang' : 'Berat'

    const isiSurveys = surveys.filter(s => s.isi_1 !== null)
    let isiAvgScore = 0
    if (isiSurveys.length > 0) {
      const isiScores = isiSurveys.map(s => {
        let total = 0
        for (let i = 1; i <= 7; i++) { total += (s as Record<string, unknown>)[`isi_${i}`] as number || 0 }
        return total
      })
      isiAvgScore = isiScores.reduce((a, b) => a + b, 0) / isiScores.length
    }
    const isiSeverity = isiAvgScore <= 7 ? 'Tidak Ada Insomnia' : isiAvgScore <= 14 ? 'Subklinis' : isiAvgScore <= 21 ? 'Ringan Sedang' : 'Sedang Berat'

    const wellnessSurveys = surveys.filter(s => s.wellness_1 !== null)
    let wellnessAvgScore = 0
    if (wellnessSurveys.length > 0) {
      const wellnessScores = wellnessSurveys.map(s => {
        let total = 0
        for (let i = 1; i <= 3; i++) { total += (s as Record<string, unknown>)[`wellness_${i}`] as number || 0 }
        return total / 3
      })
      wellnessAvgScore = wellnessScores.reduce((a, b) => a + b, 0) / wellnessScores.length
    }

    const clinicalData = {
      barthel: {
        respondentCount: barthelSurveys.length,
        avgFirst: parseFloat(barthelAvgFirst.toFixed(1)),
        avgCurrent: parseFloat(barthelAvgCurrent.toFixed(1)),
        improvementPct: barthelAvgFirst > 0 ? parseFloat((((barthelAvgCurrent - barthelAvgFirst) / barthelAvgFirst) * 100).toFixed(1)) : 0,
        level: barthelLevel,
      },
      isi: {
        respondentCount: isiSurveys.length,
        avgScore: parseFloat(isiAvgScore.toFixed(1)),
        severity: isiSeverity,
      },
      wellness: {
        respondentCount: wellnessSurveys.length,
        avgScore: parseFloat(wellnessAvgScore.toFixed(1)),
      },
    }

    const outcomeAvg = {
      barthelIndex: clinicalData.barthel.avgCurrent,
      isiScore: clinicalData.isi.avgScore,
      wellnessScore: clinicalData.wellness.avgScore,
    }

    // ═══════════════════════════════════════════════════════
    // v2.0: Loyalty Data
    // ═══════════════════════════════════════════════════════
    const visitPlanMap = new Map<string, number>()
    const hasRecommendedMap = new Map<string, number>()
    const recommendationCountMap = new Map<string, number>()
    surveys.forEach(s => {
      if (s.visit_plan) visitPlanMap.set(s.visit_plan, (visitPlanMap.get(s.visit_plan) || 0) + 1)
      if (s.has_recommended) hasRecommendedMap.set(s.has_recommended, (hasRecommendedMap.get(s.has_recommended) || 0) + 1)
      if (s.recommendation_count !== null && s.recommendation_count !== undefined) {
        const label = String(s.recommendation_count)
        recommendationCountMap.set(label, (recommendationCountMap.get(label) || 0) + 1)
      }
    })

    const loyaltyData = {
      visitPlanDist: Object.fromEntries(visitPlanMap),
      hasRecommendedDist: Object.fromEntries(hasRecommendedMap),
      recommendationCountDist: Object.fromEntries(recommendationCountMap),
    }

    // ═══════════════════════════════════════════════════════
    // v2.0: WTP Data
    // ═══════════════════════════════════════════════════════
    const wtpSurveys = surveys.filter(s => s.wtp_cost_today !== null || s.wtp_increase_20 !== null)
    const increase20Map = new Map<string, number>()
    const packageInterestMap = new Map<string, number>()
    const maxAcceptableMap = new Map<string, number>()
    surveys.forEach(s => {
      if (s.wtp_increase_20) increase20Map.set(String(s.wtp_increase_20), (increase20Map.get(String(s.wtp_increase_20)) || 0) + 1)
      if (s.wtp_package_interest) packageInterestMap.set(String(s.wtp_package_interest), (packageInterestMap.get(String(s.wtp_package_interest)) || 0) + 1)
      if (s.wtp_max_acceptable) maxAcceptableMap.set(String(s.wtp_max_acceptable), (maxAcceptableMap.get(String(s.wtp_max_acceptable)) || 0) + 1)
    })

    const wtpData = {
      avgCostToday: avg(surveys.map(s => s.wtp_cost_today)),
      respondentCount: wtpSurveys.length,
      increase20Dist: Object.fromEntries(increase20Map),
      packageInterestDist: Object.fromEntries(packageInterestMap),
      maxAcceptableDist: Object.fromEntries(maxAcceptableMap),
    }

    return NextResponse.json({
      totalSurveys,
      avgPainReduction,
      nps: { promoters, passives, detractors, score: npsScore, total: npsTotal },
      servqual,
      unitPerformance,
      spiritualAvg,
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
      // v2.0 additions
      spiritual9Avg,
      clarityAvg,
      herbAvg,
      clinicalData,
      outcomeAvg,
      loyaltyData,
      wtpData,
    })
  } catch (error) {
    console.error('Error computing dashboard data:', error)
    return NextResponse.json({ error: 'Failed to compute dashboard data' }, { status: 500 })
  }
}
