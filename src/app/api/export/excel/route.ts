import { NextRequest, NextResponse } from 'next/server'
import { getSurveysExport } from '@/lib/db'
import * as XLSX from 'xlsx'

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
    }

    const surveys = await getSurveysExport(params)

    const wb = XLSX.utils.book_new()

    // === Sheet 1: Data Survei (All sections A-I) ===
    const mainData = surveys.map((s, i) => {
      const painBefore = s.pain_level_before ?? null
      const painAfter = s.pain_level_after ?? null
      const painReduction = painBefore && painBefore > 0
        ? parseFloat((((painBefore - (painAfter ?? 0)) / painBefore) * 100).toFixed(1))
        : null
      const overall = s.tangibles && s.reliability && s.responsiveness && s.assurance && s.empathy
        ? parseFloat(((s.tangibles + s.reliability + s.responsiveness + s.assurance + s.empathy) / 5).toFixed(2))
        : null

      return {
        // Meta
        'No': i + 1,
        'Tanggal': s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID') : '',
        // A: Demographics
        'Usia': s.age_range || '-',
        'Gender': s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-',
        'Pendidikan': s.education || '-',
        'Pekerjaan': s.occupation || '-',
        'Pendapatan': s.income_range || '-',
        'Jenis Pasien': s.patient_type || '-',
        'Kondisi': s.condition_type || '-',
        'Kondisi_Lainnya': s.condition_type_other || '-',
        'Kunjungan': s.visit_count || '-',
        'Sumber Rujukan': s.referral_source || '-',
        // B: SERVQUAL
        'B_Tangibles': s.tangibles ?? '-',
        'B_Reliability': s.reliability ?? '-',
        'B_Responsiveness': s.responsiveness ?? '-',
        'B_Assurance': s.assurance ?? '-',
        'B_Empathy': s.empathy ?? '-',
        'B_SERVQUAL_Overall': overall ?? '-',
        // C: Herbal
        'C_Herbal_Diresepkan': s.herbal_prescribed === true ? 'Ya' : s.herbal_prescribed === false ? 'Tidak' : '-',
        'C_Penjelasan': s.herb_explanation ?? '-',
        'C_Panduan_Gunakan': s.herb_usage_guide ?? '-',
        'C_Keamanan': s.herb_safety_trust ?? '-',
        'C_Ketersediaan': s.herb_availability ?? '-',
        'C_Keterjangkauan': s.herb_affordability ?? '-',
        'C_Apoteker': s.herb_pharmacist ?? '-',
        // D: Clarity of Therapeutic Role (D1-D4)
        'D1_Klaritas_Role': s.d1_clarity_role ?? '-',
        'D2_Klaritas_Penjelasan': s.d2_clarity_explanation ?? '-',
        'D3_Kenyamanan': s.d3_clarity_comfortable ?? '-',
        'D4_Spesialis': s.d4_clarity_specialist ?? '-',
        // E: Clinical Outcomes — VAS
        'E_VAS_Sebelum': painBefore ?? '-',
        'E_VAS_Sesudah': painAfter ?? '-',
        'E_Pengurangan_Nyeri (%)': painReduction !== null ? `${painReduction}%` : '-',
        'E_Perubahan_Kondisi': s.condition_change || '-',
        // E: Clinical — Barthel Index (stroke)
        'E_Barthel_First': s.barthel_mobility_first !== null && s.barthel_mobility_first !== undefined
          ? [s.barthel_eat_first, s.barthel_bath_first, s.barthel_groom_first, s.barthel_dress_first, s.barthel_toilet_first, s.barthel_bowel_first, s.barthel_bladder_first, s.barthel_transfer_first, s.barthel_mobility_first, s.barthel_stairs_first].reduce((a: number, b: number | null) => a + (b || 0), 0) || '-'
          : '-',
        'E_Barthel_Current': s.barthel_mobility_current !== null && s.barthel_mobility_current !== undefined
          ? [s.barthel_eat_current, s.barthel_bath_current, s.barthel_groom_current, s.barthel_dress_current, s.barthel_toilet_current, s.barthel_bowel_current, s.barthel_bladder_current, s.barthel_transfer_current, s.barthel_mobility_current, s.barthel_stairs_current].reduce((a: number, b: number | null) => a + (b || 0), 0) || '-'
          : '-',
        // E: Clinical — ISI
        'E_ISI_Total': [s.isi_1, s.isi_2, s.isi_3, s.isi_4, s.isi_5, s.isi_6, s.isi_7].every(v => v !== null && v !== undefined)
          ? [s.isi_1, s.isi_2, s.isi_3, s.isi_4, s.isi_5, s.isi_6, s.isi_7].reduce((a: number, b: number | null) => a + (b || 0), 0) : '-',
        // E: Clinical — Wellness
        'E_Wellness_Avg': s.wellness_1 !== null && s.wellness_2 !== null && s.wellness_3 !== null
          ? parseFloat(((s.wellness_1 + s.wellness_2 + s.wellness_3) / 3).toFixed(2))
          : '-',
        // F: Spiritual & Holistik
        'F1_Adab_Islami': s.f1_adab_islami ?? '-',
        'F2_Gender_Concordance': s.f2_gender_concordance ?? '-',
        'F3_Waktu_Ibadah': s.f3_prayer_accommodation ?? '-',
        'F4_Jaminan_Halal': s.f4_halal_assurance ?? '-',
        'F5_Tibb_Nabawi': s.f5_tibb_nabawi ?? '-',
        'F6_Aktivasi_Spiritual': s.f6_spiritual_activation ?? '-',
        'F7_Ketenangan_Holistik': s.f7_holistic_peace ?? '-',
        'F8_Komunikasi_Spiritual': s.f8_spiritual_communication ?? '-',
        'F9_Raw': s.f9_reverse_coded ?? '-',
        'F9_Reversed': s.f9_reverse_coded !== null && s.f9_reverse_coded !== undefined ? 6 - s.f9_reverse_coded : '-',
        // G: NPS & Loyaltas
        'G_NPS_Score': s.nps_score ?? '-',
        'G_Rencana_Kunjungan': s.visit_plan || '-',
        'G_Sudah_Rekomendasi': s.has_recommended || '-',
        'G_Jumlah_Rekomendasi': s.recommendation_count || '-',
        'G_WTP_Price_Increase': s.wtp_price_increase ?? '-',
        // H: Feedback
        'H_Pengalaman_Terbaik': s.best_experience || '-',
        'H_Saran_Perbaikan': s.improvement_suggestion || '-',
        'H_H1_Liked': Array.isArray(s.h1_liked) ? s.h1_liked.join('; ') : '-',
        'H_H1_Liked_Other': s.h1_liked_other || '-',
        'H_H2_Suggested': Array.isArray(s.h2_suggested) ? s.h2_suggested.join('; ') : '-',
        'H_H2_Suggested_Other': s.h2_suggested_other || '-',
        'H_Testimoni': s.testimonial || '-',
        // I: WTP
        'I_Biaya_Hari_Ini': s.wtp_cost_today ?? '-',
        'I_Reaksi_Naik_20%': s.wtp_increase_20 || '-',
        'I_Minat_Paket_Diskon': s.wtp_package_interest || '-',
        'I_Maks_Diterima': s.wtp_max_acceptable || '-',
      }
    })

    const ws1 = XLSX.utils.json_to_sheet(mainData)
    ws1['!cols'] = [
      { wch: 5 }, // No
      { wch: 14 }, // Tanggal
      // A: Demographics (9+1 cols with condition_type_other)
      { wch: 10 }, { wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 18 },
      // B: SERVQUAL
      { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 11 }, { wch: 16 },
      // C: Herbal
      { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 12 },
      // D: Clarity (D1-D4)
      { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
      // E: Clinical
      { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 14 },
      // F: Spiritual (10 cols now: F1-F8 + F9_Raw + F9_Reversed)
      { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 10 }, { wch: 14 },
      // G: NPS
      { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 18 },
      // H: Feedback
      { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 20 },
      // I: WTP
      { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 16 },
    ]
    XLSX.utils.book_append_sheet(wb, ws1, 'Data Survei')

    // === Sheet 2: SERVQUAL Detail ===
    const servqualData = surveys.map((s, i) => {
      const responses = s.responses_json || {}
      return {
        'No': i + 1,
        'Tanggal': s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID') : '',
        'B1_T1_Kebersihan': (responses.b1_t1_kebersihan as number) ?? '-',
        'B1_T2_Steril': (responses.b1_t2_steril as number) ?? '-',
        'B1_T3_Berbaring': (responses.b1_t3_berbaring as number) ?? '-',
        'B1_T4_Suasana': (responses.b1_t4_suasana as number) ?? '-',
        'B1_T5_Fasilitas_Ibadah': (responses.b1_t5_ibadah as number) ?? '-',
        'B2_R1_Tepat_Waktu': (responses.b2_r1_tepat_waktu as number) ?? '-',
        'B2_R2_Hadir': (responses.b2_r2_hadir as number) ?? '-',
        'B2_R3_Terstandar': (responses.b2_r3_terstandar as number) ?? '-',
        'B2_R4_Rekam_Medis': (responses.b2_r4_rekam_medis as number) ?? '-',
        'B3_C1_Tunggu': (responses.b3_c1_tunggu as number) ?? '-',
        'B3_C2_Respons': (responses.b3_c2_respons as number) ?? '-',
        'B3_C3_Jelas': (responses.b3_c3_jelas as number) ?? '-',
        'B3_C4_Efek_Samping': (responses.b3_c4_efek_samping as number) ?? '-',
        'B4_A1_Kompetensi': (responses.b4_a1_kompetensi as number) ?? '-',
        'B4_A2_Diagnosis': (responses.b4_a2_diagnosis as number) ?? '-',
        'B4_A3_Aman': (responses.b4_a3_aman as number) ?? '-',
        'B4_A4_Sertifikasi': (responses.b4_a4_sertifikasi as number) ?? '-',
        'B5_E1_Personal': (responses.b5_e1_personal as number) ?? '-',
        'B5_E2_Kekhawatiran': (responses.b5_e2_kekhawatiran as number) ?? '-',
        'B5_E3_Hormat': (responses.b5_e3_hormat as number) ?? '-',
        'B5_E4_Perkembangan': (responses.b5_e4_perkembangan as number) ?? '-',
        'AVG_Tangibles': s.tangibles ?? '-',
        'AVG_Reliability': s.reliability ?? '-',
        'AVG_Responsiveness': s.responsiveness ?? '-',
        'AVG_Assurance': s.assurance ?? '-',
        'AVG_Empathy': s.empathy ?? '-',
      }
    })

    const ws2 = XLSX.utils.json_to_sheet(servqualData)
    XLSX.utils.book_append_sheet(wb, ws2, 'SERVQUAL Detail')

    // === Sheet 3: Ringkasan per Bagian (A-I Summary) ===
    const genderCount = { L: 0, P: 0 }
    const ageCount: Record<string, number> = {}
    const educationCount: Record<string, number> = {}
    const conditionCount: Record<string, number> = {}
    const patientTypeCount: Record<string, number> = {}
    const npsCatCount = { Promoters: 0, Passives: 0, Detractors: 0 }
    const visitPlanCount: Record<string, number> = {}
    const hasRecCount: Record<string, number> = {}
    const recCountMap: Record<string, number> = {}
    const wtpIncreaseCount: Record<string, number> = {}
    const wtpPackageCount: Record<string, number> = {}
    const wtpMaxCount: Record<string, number> = {}
    let herbalPrescribedCount = 0
    let wtpTotalCount = 0
    let wtpCostSum = 0
    let clarityRoleSum = 0, clarityRoleCount = 0
    let clarityExplSum = 0, clarityExplCount = 0
    let clarityComfSum = 0, clarityComfCount = 0
    let claritySpecSum = 0, claritySpecCount = 0

    surveys.forEach((s) => {
      if (s.gender === 'L') genderCount.L++
      if (s.gender === 'P') genderCount.P++
      if (s.age_range) ageCount[s.age_range] = (ageCount[s.age_range] || 0) + 1
      if (s.education) educationCount[s.education] = (educationCount[s.education] || 0) + 1
      if (s.condition_type) conditionCount[s.condition_type] = (conditionCount[s.condition_type] || 0) + 1
      if (s.patient_type) patientTypeCount[s.patient_type] = (patientTypeCount[s.patient_type] || 0) + 1
      if (s.herbal_prescribed === true) herbalPrescribedCount++
      const nps = s.nps_score
      if (nps !== null && nps !== undefined) {
        if (nps >= 9) npsCatCount.Promoters++
        else if (nps >= 7) npsCatCount.Passives++
        else npsCatCount.Detractors++
      }
      if (s.visit_plan) visitPlanCount[s.visit_plan] = (visitPlanCount[s.visit_plan] || 0) + 1
      if (s.has_recommended) hasRecCount[s.has_recommended] = (hasRecCount[s.has_recommended] || 0) + 1
      if (s.recommendation_count) recCountMap[s.recommendation_count] = (recCountMap[s.recommendation_count] || 0) + 1
      if (s.wtp_increase_20) wtpIncreaseCount[s.wtp_increase_20] = (wtpIncreaseCount[s.wtp_increase_20] || 0) + 1
      if (s.wtp_package_interest) wtpPackageCount[s.wtp_package_interest] = (wtpPackageCount[s.wtp_package_interest] || 0) + 1
      if (s.wtp_max_acceptable) wtpMaxCount[s.wtp_max_acceptable] = (wtpMaxCount[s.wtp_max_acceptable] || 0) + 1
      const wtpCost = s.wtp_cost_today
      if (wtpCost && wtpCost > 0) { wtpTotalCount++; wtpCostSum += wtpCost }
      if (s.d1_clarity_role !== null && s.d1_clarity_role !== undefined) { clarityRoleSum += s.d1_clarity_role; clarityRoleCount++ }
      if (s.d2_clarity_explanation !== null && s.d2_clarity_explanation !== undefined) { clarityExplSum += s.d2_clarity_explanation; clarityExplCount++ }
      if (s.d3_clarity_comfortable !== null && s.d3_clarity_comfortable !== undefined) { clarityComfSum += s.d3_clarity_comfortable; clarityComfCount++ }
      if (s.d4_clarity_specialist !== null && s.d4_clarity_specialist !== undefined) { claritySpecSum += s.d4_clarity_specialist; claritySpecCount++ }
    })

    const clarityRoleAvg = clarityRoleCount > 0 ? (clarityRoleSum / clarityRoleCount).toFixed(2) : '-'
    const clarityExplAvg = clarityExplCount > 0 ? (clarityExplSum / clarityExplCount).toFixed(2) : '-'
    const clarityComfAvg = clarityComfCount > 0 ? (clarityComfSum / clarityComfCount).toFixed(2) : '-'
    const claritySpecAvg = claritySpecCount > 0 ? (claritySpecSum / claritySpecCount).toFixed(2) : '-'
    const clarityTotals = [clarityRoleSum, clarityExplSum, clarityComfSum, claritySpecSum]
    const clarityCounts = [clarityRoleCount, clarityExplCount, clarityComfCount, claritySpecCount]
    const clarityOverallAvg = clarityCounts.reduce((a, c) => a + c, 0) > 0
      ? (clarityTotals.reduce((a, s) => a + s, 0) / clarityCounts.reduce((a, c) => a + c, 0)).toFixed(2)
      : '-'

    const summaryRows: (string | number)[][] = [
      ['RINGKASAN PENELITIAN DPEMS', ''],
      ['', ''],
      ['Total Responden', surveys.length],
      ['', ''],
      ['── BAGIAN A: DEMOGRAFI ──', ''],
      ['GENDER', 'Jumlah'],
      ['Laki-laki', genderCount.L],
      ['Perempuan', genderCount.P],
      ['', ''],
      ['KELOMPOK USIA', 'Jumlah'],
      ...Object.entries(ageCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['PENDIDIKAN', 'Jumlah'],
      ...Object.entries(educationCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['JENIS PASIEN', 'Jumlah'],
      ...Object.entries(patientTypeCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['KONDISI / KELUHAN', 'Jumlah'],
      ...Object.entries(conditionCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['── BAGIAN C: HERBAL ──', ''],
      ['Pasien Diresepkan Herbal', `${herbalPrescribedCount} (${surveys.length > 0 ? ((herbalPrescribedCount / surveys.length) * 100).toFixed(1) : 0}%)`],
      ['', ''],
      ['── BAGIAN G: NPS ──', ''],
      ['Promoters (9-10)', npsCatCount.Promoters],
      ['Passives (7-8)', npsCatCount.Passives],
      ['Detractors (0-6)', npsCatCount.Detractors],
      ['', ''],
      ['Rencana Kunjungan', 'Jumlah'],
      ...Object.entries(visitPlanCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['Sudah Merekomendasikan?', 'Jumlah'],
      ...Object.entries(hasRecCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['Jumlah Orang Direkomendasikan', 'Jumlah'],
      ...Object.entries(recCountMap).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['── BAGIAN D: CLARITY (D1-D4) ──', ''],
      ['D1 Klaritas Role', clarityRoleAvg],
      ['D2 Klaritas Penjelasan', clarityExplAvg],
      ['D3 Kenyamanan', clarityComfAvg],
      ['D4 Spesialis Terpercaya', claritySpecAvg],
      ['Clarity Overall', clarityOverallAvg],
      ['', ''],
      ['── BAGIAN I: WTP ──', ''],
      ['Responden WTP', wtpTotalCount],
      ['Rata-rata Biaya Hari Ini', wtpTotalCount > 0 ? `Rp ${Math.round(wtpCostSum / wtpTotalCount).toLocaleString('id-ID')}` : '-'],
      ['', ''],
      ['Reaksi Kenaikan 20%', 'Jumlah'],
      ...Object.entries(wtpIncreaseCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['Minat Paket Diskon 4 Sesi', 'Jumlah'],
      ...Object.entries(wtpPackageCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
      ['', ''],
      ['Harga Maks Diterima', 'Jumlah'],
      ...Object.entries(wtpMaxCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v] as [string, number]),
    ]

    const ws3 = XLSX.utils.aoa_to_sheet(summaryRows)
    XLSX.utils.book_append_sheet(wb, ws3, 'Ringkasan A-I')

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const today = new Date().toISOString().split('T')[0]
    const filename = `data_survei_dpems_${today}.xlsx`

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting Excel:', error)
    return NextResponse.json({ error: 'Gagal mengekspor data Excel' }, { status: 500 })
  }
}