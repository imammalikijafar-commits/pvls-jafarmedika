import { NextRequest, NextResponse } from 'next/server'
import { getSurveys, getHospital, getAlerts } from '@/lib/db'
import type { Survey, Unit, Hospital } from '@/lib/types'

// --- Helpers ---
function avg(arr: (number | null)[]): number {
  const valid = arr.filter((v): v is number => v !== null && v !== undefined)
  if (valid.length === 0) return 0
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
}

/** Compute dimension average from item-level columns, fallback to aggregate column */
function dimAvg(surveys: (Survey & { units: Unit })[], itemCols: string[], fallbackCol: keyof Survey): number {
  // Try item-level first
  const itemAvgs = surveys
    .map(s => {
      const vals = itemCols
        .map(col => (s as unknown as Record<string, unknown>)[col] as number | null)
        .filter((v): v is number => v !== null && v !== undefined)
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    })
    .filter((v): v is number => v !== null)
  if (itemAvgs.length > 0) return parseFloat((itemAvgs.reduce((a, b) => a + b, 0) / itemAvgs.length).toFixed(2))
  // Fallback to aggregate column
  return avg(surveys.map(s => s[fallbackCol] as number | null))
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

    // SERVQUAL — prefer item-level columns (v2.2), fallback to aggregate
    const tangibles = dimAvg(surveys,
      ['b1_1_facility_condition', 'b1_2_equipment_modern', 'b1_3_staff_appearance', 'b1_4_facility_comfort', 'b1_5_islamic_facilities'],
      'tangibles')
    const reliability = dimAvg(surveys,
      ['b2_1_service_accuracy', 'b2_2_punctuality', 'b2_3_admin_accuracy', 'b2_4_consistency', 'b2_5_prayer_accommodation'],
      'reliability')
    const responsiveness = dimAvg(surveys,
      ['b3_1_quick_response', 'b3_2_staff_willingness', 'b3_3_complaint_handling', 'b3_4_waiting_time', 'b3_5_information_clarity'],
      'responsiveness')
    const assurance = dimAvg(surveys,
      ['b4_1_staff_competence', 'b4_2_patient_trust', 'b4_3_safety_feeling', 'b4_4_staff_courtesy', 'b4_5_knowledge'],
      'assurance')
    const empathy = dimAvg(surveys,
      ['b5_1_individual_attention', 'b5_2_understanding_needs', 'b5_3_respectful_treatment', 'b5_4_followup_visits', 'b5_5_operating_hours'],
      'empathy')
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

    // --- Spiritual 8D + Clarity computed below (lines ~195-235) ---

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
      if (s.payment_type) patientTypeMap.set(s.payment_type, (patientTypeMap.get(s.payment_type) || 0) + 1)
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
    // v2.1: Spiritual 8 Dimensions (F1-F8) — F8 reverse-coded
    // ═══════════════════════════════════════════════════════
    const spiritual8Fields = [
      'f1_halal_assurance', 'f2_tibb_nabawi', 'f3_spiritual_activation',
      'f4_holistic_peace', 'f5_spiritual_communication', 'f6_tawakkal',
      'f7_ridha', 'f8_reverse_coded'
    ]
    const spiritual8Sums: Record<string, { sum: number; count: number }> = {}
    spiritual8Fields.forEach(f => {
      spiritual8Sums[f] = { sum: 0, count: 0 }
    })
    surveys.forEach(s => {
      spiritual8Fields.forEach(f => {
        const v = (s as unknown as Record<string, unknown>)[f] as number | null
        if (v !== null && v !== undefined) { spiritual8Sums[f].sum += v; spiritual8Sums[f].count++ }
      })
    })
    const avg8 = (key: string) => spiritual8Sums[key].count > 0 ? parseFloat((spiritual8Sums[key].sum / spiritual8Sums[key].count).toFixed(2)) : 0
    const f8Reversed = spiritual8Sums['f8_reverse_coded'].count > 0 ? parseFloat((6 - spiritual8Sums['f8_reverse_coded'].sum / spiritual8Sums['f8_reverse_coded'].count).toFixed(2)) : 0
    // Overall spiritual: average of F1-F7 raw + F8 reversed
    const spiritual8Overall = parseFloat(((avg8('f1_halal_assurance') + avg8('f2_tibb_nabawi') + avg8('f3_spiritual_activation') +
      avg8('f4_holistic_peace') + avg8('f5_spiritual_communication') + avg8('f6_tawakkal') +
      avg8('f7_ridha') + f8Reversed) / 8).toFixed(2))
    const spiritual8Avg = {
      f1HalalAssurance: avg8('f1_halal_assurance'),
      f2TibbNabawi: avg8('f2_tibb_nabawi'),
      f3SpiritualActivation: avg8('f3_spiritual_activation'),
      f4HolisticPeace: avg8('f4_holistic_peace'),
      f5SpiritualCommunication: avg8('f5_spiritual_communication'),
      f6Tawakkal: avg8('f6_tawakkal'),
      f7Ridha: avg8('f7_ridha'),
      f8ReverseCoded: avg8('f8_reverse_coded'),
      f8Reversed,
      overall: spiritual8Overall,
      sciScore: spiritual8Overall,  // alias: avg keseluruhan SCI (F8 sudah di-reverse)
    }

    // ═══════════════════════════════════════════════════════
    // v2.1: Clarity D1-D4
    // ═══════════════════════════════════════════════════════
    const clarityD1 = avg(surveys.map(s => s.d1_clarity_role))
    const clarityD2 = avg(surveys.map(s => s.d2_clarity_explanation))
    const clarityD3 = avg(surveys.map(s => s.d3_clarity_comfortable))
    const clarityD4 = avg(surveys.map(s => s.d4_clarity_specialist))
    const clarityOverall = parseFloat(((clarityD1 + clarityD2 + clarityD3 + clarityD4) / 4).toFixed(2))
    const clarityAvg = {
      d1ClarityRole: clarityD1,
      d2ClarityExplanation: clarityD2,
      d3ClarityComfortable: clarityD3,
      d4ClaritySpecialist: clarityD4,
      overall: clarityOverall,
    }

    // ═══════════════════════════════════════════════════════
    // v2.1: Herb Avg
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
    // v2.1: Clinical Outcomes
    // ═══════════════════════════════════════════════════════
    const barthelSurveys = surveys.filter(s => s.barthel_eat_first !== null || s.barthel_eat_current !== null)
    const barthelFields = ['eat', 'bath', 'groom', 'dress', 'toilet', 'bowel', 'bladder', 'transfer', 'mobility', 'stairs']
    let barthelAvgFirst = 0, barthelAvgCurrent = 0
    if (barthelSurveys.length > 0) {
      const firstScores = barthelSurveys.map(s => {
        let total = 0
        barthelFields.forEach(f => { total += (s as unknown as Record<string, unknown>)[`barthel_${f}_first`] as number || 0 })
        return total
      })
      const currentScores = barthelSurveys.map(s => {
        let total = 0
        barthelFields.forEach(f => { total += (s as unknown as Record<string, unknown>)[`barthel_${f}_current`] as number || 0 })
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
        for (let i = 1; i <= 7; i++) { total += (s as unknown as Record<string, unknown>)[`isi_${i}`] as number || 0 }
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
        for (let i = 1; i <= 3; i++) { total += (s as unknown as Record<string, unknown>)[`wellness_${i}`] as number || 0 }
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
    // v2.1: Loyalty Data
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
    // v2.1: WTP Data
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
      // v2.1 additions
      spiritual8Avg,
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