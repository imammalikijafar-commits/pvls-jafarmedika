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

    // === Sheet 1: Data Survei ===
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
        'No': i + 1,
        'Tanggal': s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID') : '',
        'Usia': s.age_range || '-',
        'Gender': s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-',
        'Pendidikan': s.education || '-',
        'Pekerjaan': s.occupation || '-',
        'Jenis Pasien': s.payment_type || '-',
        'Kondisi': s.condition_type || '-',
        'Kunjungan': s.visit_count || '-',
        'Tangibles': s.tangibles ?? '-',
        'Reliability': s.reliability ?? '-',
        'Responsiveness': s.responsiveness ?? '-',
        'Assurance': s.assurance ?? '-',
        'Empathy': s.empathy ?? '-',
        'NPS': s.nps_score ?? '-',
        'Nyeri Sebelum': painBefore ?? '-',
        'Nyeri Sesudah': painAfter ?? '-',
        'Pengurangan Nyeri (%)': painReduction !== null ? `${painReduction}%` : '-',
        'Perubahan Kondisi': s.condition_change || '-',
        'Pengalaman Terbaik': s.best_experience || '-',
        'Saran Perbaikan': s.improvement_suggestion || '-',
        'Testimoni': s.testimonial || '-',
      }
    })

    const ws1 = XLSX.utils.json_to_sheet(mainData)
    // Set column widths
    ws1['!cols'] = [
      { wch: 5 },  // No
      { wch: 14 }, // Tanggal
      { wch: 10 }, // Usia
      { wch: 12 }, // Gender
      { wch: 16 }, // Pendidikan
      { wch: 20 }, // Pekerjaan
      { wch: 18 }, // Jenis Pasien
      { wch: 28 }, // Kondisi
      { wch: 14 }, // Kunjungan
      { wch: 11 }, // Tangibles
      { wch: 11 }, // Reliability
      { wch: 14 }, // Responsiveness
      { wch: 11 }, // Assurance
      { wch: 10 }, // Empathy
      { wch: 6 },  // NPS
      { wch: 12 }, // Nyeri Sebelum
      { wch: 12 }, // Nyeri Sesudah
      { wch: 18 }, // Pengurangan Nyeri
      { wch: 18 }, // Perubahan Kondisi
      { wch: 40 }, // Pengalaman Terbaik
      { wch: 40 }, // Saran Perbaikan
      { wch: 40 }, // Testimoni
    ]
    XLSX.utils.book_append_sheet(wb, ws1, 'Data Survei')

    // === Sheet 2: SERVQUAL Detail (v2.2: 5 dimensions x 5 items = 25) ===
    const servqualData = surveys.map((s, i) => ({
      'No': i + 1,
      'Tanggal': s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID') : '',
      // B1 Tangibles (5 items)
      'B1_1_Facility_Condition': s.b1_1_facility_condition ?? '-',
      'B1_2_Equipment_Modern': s.b1_2_equipment_modern ?? '-',
      'B1_3_Staff_Appearance': s.b1_3_staff_appearance ?? '-',
      'B1_4_Facility_Comfort': s.b1_4_facility_comfort ?? '-',
      'B1_5_Islamic_Facilities': s.b1_5_islamic_facilities ?? '-',
      // B2 Reliability (5 items)
      'B2_1_Service_Accuracy': s.b2_1_service_accuracy ?? '-',
      'B2_2_Punctuality': s.b2_2_punctuality ?? '-',
      'B2_3_Admin_Accuracy': s.b2_3_admin_accuracy ?? '-',
      'B2_4_Consistency': s.b2_4_consistency ?? '-',
      'B2_5_Prayer_Accommodation': s.b2_5_prayer_accommodation ?? '-',
      // B3 Responsiveness (5 items)
      'B3_1_Quick_Response': s.b3_1_quick_response ?? '-',
      'B3_2_Staff_Willingness': s.b3_2_staff_willingness ?? '-',
      'B3_3_Complaint_Handling': s.b3_3_complaint_handling ?? '-',
      'B3_4_Waiting_Time': s.b3_4_waiting_time ?? '-',
      'B3_5_Information_Clarity': s.b3_5_information_clarity ?? '-',
      // B4 Assurance (5 items)
      'B4_1_Staff_Competence': s.b4_1_staff_competence ?? '-',
      'B4_2_Patient_Trust': s.b4_2_patient_trust ?? '-',
      'B4_3_Safety_Feeling': s.b4_3_safety_feeling ?? '-',
      'B4_4_Staff_Courtesy': s.b4_4_staff_courtesy ?? '-',
      'B4_5_Knowledge': s.b4_5_knowledge ?? '-',
      // B5 Empathy (5 items)
      'B5_1_Individual_Attention': s.b5_1_individual_attention ?? '-',
      'B5_2_Understanding_Needs': s.b5_2_understanding_needs ?? '-',
      'B5_3_Respectful_Treatment': s.b5_3_respectful_treatment ?? '-',
      'B5_4_Followup_Visits': s.b5_4_followup_visits ?? '-',
      'B5_5_Operating_Hours': s.b5_5_operating_hours ?? '-',
      // Dimension averages (computed by DB trigger)
      'AVG_Tangibles': s.tangibles ?? '-',
      'AVG_Reliability': s.reliability ?? '-',
      'AVG_Responsiveness': s.responsiveness ?? '-',
      'AVG_Assurance': s.assurance ?? '-',
      'AVG_Empathy': s.empathy ?? '-',
    }))

    const ws2 = XLSX.utils.json_to_sheet(servqualData)
    ws2['!cols'] = [
      { wch: 5 },  // No
      { wch: 14 }, // Tanggal
      // B1 Tangibles (5)
      { wch: 24 }, { wch: 20 }, { wch: 22 }, { wch: 20 }, { wch: 22 },
      // B2 Reliability (5)
      { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 24 },
      // B3 Responsiveness (5)
      { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 24 },
      // B4 Assurance (5)
      { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 22 },
      // B5 Empathy (5)
      { wch: 24 }, { wch: 22 }, { wch: 24 }, { wch: 18 }, { wch: 18 },
      // Averages (5)
      { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 16 }, { wch: 16 },
    ]
    XLSX.utils.book_append_sheet(wb, ws2, 'SERVQUAL Detail')

    // === Sheet 3: Demografi Ringkasan ===
    const genderCount = { L: 0, P: 0 }
    const ageCount: Record<string, number> = {}
    const educationCount: Record<string, number> = {}
    const conditionCount: Record<string, number> = {}
    const patientTypeCount: Record<string, number> = {}

    surveys.forEach((s) => {
      if (s.gender === 'L') genderCount.L++
      if (s.gender === 'P') genderCount.P++
      if (s.age_range) ageCount[s.age_range] = (ageCount[s.age_range] || 0) + 1
      if (s.education) educationCount[s.education] = (educationCount[s.education] || 0) + 1
      if (s.condition_type) conditionCount[s.condition_type] = (conditionCount[s.condition_type] || 0) + 1
      if (s.payment_type) patientTypeCount[s.payment_type] = (patientTypeCount[s.payment_type] || 0) + 1
    })

    const summaryRows: (string | number)[][] = [
      ['RINGKASAN DEMOGRAFI', ''],
      ['', ''],
      ['Total Responden', surveys.length],
      ['', ''],
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
    ]

    const ws3 = XLSX.utils.aoa_to_sheet(summaryRows)
    XLSX.utils.book_append_sheet(wb, ws3, 'Demografi Ringkasan')

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