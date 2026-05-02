import { NextRequest, NextResponse } from 'next/server'
import { getSurveys } from '@/lib/db'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const EMERALD: [number, number, number] = [5, 150, 105]
const DARK_GRAY: [number, number, number] = [55, 65, 81]
const LIGHT_GRAY: [number, number, number] = [243, 244, 246]
const BLUE: [number, number, number] = [37, 99, 235]
const AMBER: [number, number, number] = [217, 119, 6]
const ROSE: [number, number, number] = [225, 29, 72]
const AMBER_DARK: [number, number, number] = [217, 119, 6]

function avg(arr: (number | null)[]): number {
  const valid = arr.filter((v): v is number => v !== null && v !== undefined)
  if (valid.length === 0) return 0
  return parseFloat((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2))
}

/** Get Y position after last autoTable (jspdf-autotable sets this on the doc instance) */
function afterTable(doc: jsPDF, fallback: number): number {
  const lat = (doc as any).lastAutoTable
  if (lat && typeof lat.finalY === 'number') return lat.finalY
  return fallback
}

function addPageNumber(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
  }
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(EMERALD[0], EMERALD[1], EMERALD[2])
  doc.text(text, 14, y)
  return y + 8
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const period = parseInt(sp.get('period') || '30')
    const dateFrom = sp.get('dateFrom') || undefined
    const dateTo = sp.get('dateTo') || undefined

    let since: Date | undefined
    if (dateFrom) {
      since = new Date(dateFrom)
    } else {
      since = new Date(Date.now() - period * 24 * 60 * 60 * 1000)
    }

    const surveys = await getSurveys(since)

    // Filter by dateTo if provided
    const workingData = dateTo
      ? surveys.filter((s) => s.submitted_at <= dateTo + 'T23:59:59')
      : surveys

    const n = workingData.length

    // Compute KPIs
    const painBeforeArr = workingData.map((s) => s.pain_level_before).filter((v): v is number => v !== null)
    const painAfterArr = workingData.map((s) => s.pain_level_after).filter((v): v is number => v !== null)
    const avgPB = painBeforeArr.length > 0 ? painBeforeArr.reduce((a, b) => a + b, 0) / painBeforeArr.length : 0
    const avgPA = painAfterArr.length > 0 ? painAfterArr.reduce((a, b) => a + b, 0) / painAfterArr.length : 0
    const avgPainReduction = avgPB > 0 ? parseFloat((((avgPB - avgPA) / avgPB) * 100).toFixed(1)) : 0

    const npsScores = workingData.map((s) => s.nps_score).filter((v): v is number => v !== null)
    const promoters = npsScores.filter((s) => s >= 9).length
    const passives = npsScores.filter((s) => s >= 7 && s <= 8).length
    const detractors = npsScores.filter((s) => s <= 6).length
    const npsTotal = promoters + passives + detractors
    const npsScore = npsTotal > 0 ? Math.round(((promoters - detractors) / npsTotal) * 100) : 0

    const tang = avg(workingData.map((s) => s.tangibles))
    const rel = avg(workingData.map((s) => s.reliability))
    const resp = avg(workingData.map((s) => s.responsiveness))
    const assur = avg(workingData.map((s) => s.assurance))
    const emp = avg(workingData.map((s) => s.empathy))
    const overall = parseFloat(((tang + rel + resp + assur + emp) / 5).toFixed(2))

    // Demographics
    const ageMap: Record<string, number> = {}
    const genderMap: Record<string, number> = { L: 0, P: 0 }
    const eduMap: Record<string, number> = {}
    const patientTypeMap: Record<string, number> = {}
    const conditionMap: Record<string, number> = {}
    const conditionChangeMap: Record<string, number> = {}
    const visitPlanMap: Record<string, number> = {}
    const hasRecommendedMap: Record<string, number> = {}

    workingData.forEach((s) => {
      if (s.age_range) ageMap[s.age_range] = (ageMap[s.age_range] || 0) + 1
      if (s.gender === 'L') genderMap.L++
      if (s.gender === 'P') genderMap.P++
      if (s.education) eduMap[s.education] = (eduMap[s.education] || 0) + 1
      if (s.patient_type) patientTypeMap[s.patient_type] = (patientTypeMap[s.patient_type] || 0) + 1
      if (s.condition_type) conditionMap[s.condition_type] = (conditionMap[s.condition_type] || 0) + 1
      if (s.condition_change) conditionChangeMap[s.condition_change] = (conditionChangeMap[s.condition_change] || 0) + 1
      if (s.visit_plan) visitPlanMap[s.visit_plan] = (visitPlanMap[s.visit_plan] || 0) + 1
      if (s.has_recommended) hasRecommendedMap[s.has_recommended] = (hasRecommendedMap[s.has_recommended] || 0) + 1
    })

    // Spiritual averages
    // Spiritual F1-F5 (v2.0 new columns)
    const spiritF1 = avg(workingData.map(s => s.f1_adab_islami))
    const spiritF2 = avg(workingData.map(s => s.f2_gender_concordance))
    const spiritF3 = avg(workingData.map(s => s.f3_prayer_accommodation))
    const spiritF4 = avg(workingData.map(s => s.f4_halal_assurance))
    const spiritF5 = avg(workingData.map(s => s.f5_tibb_nabawi))

    // Feedback
    const topExperiences = workingData.filter((s) => s.best_experience).slice(0, 5).map((s) => s.best_experience!)
    const topSuggestions = workingData.filter((s) => s.improvement_suggestion).slice(0, 5).map((s) => s.improvement_suggestion!)
    const topTestimonials = workingData.filter((s) => s.testimonial).slice(0, 5).map((s) => s.testimonial!)

    // Herbal averages
    const herbExplanation = avg(workingData.map((s) => s.herb_explanation))
    const herbUsage = avg(workingData.map((s) => s.herb_usage_guide))
    const herbSafety = avg(workingData.map((s) => s.herb_safety_trust))
    const herbAvail = avg(workingData.map((s) => s.herb_availability))
    const herbAfford = avg(workingData.map((s) => s.herb_affordability))
    const herbPharm = avg(workingData.map((s) => s.herb_pharmacist))

    // Clarity averages (Bagian D)

    // Date range for report
    const firstDate = workingData.length > 0
      ? new Date(workingData[workingData.length - 1].submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-'
    const lastDate = workingData.length > 0
      ? new Date(workingData[0].submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-'

    // =====================
    // BUILD PDF
    // =====================
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 14

    // --- PAGE 1: COVER ---
    doc.setFillColor(EMERALD[0], EMERALD[1], EMERALD[2])
    doc.rect(0, 0, pageW, 60, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255)
    doc.text('RSU Ja\'far Medika Karanganyar', pageW - margin, 15, { align: 'right' })
    doc.setFontSize(8)
    doc.text('Logo RS', pageW - margin, 22, { align: 'right' })

    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('Laporan Evaluasi', margin, 25)
    doc.text('Pengalaman Pasien', margin, 35)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Layanan Integrative Medicine (Akupuntur dan Herbal)', margin, 45)

    doc.setFillColor(255, 255, 255)
    doc.rect(0, 60, pageW, pageH - 60, 'F')

    let y = 80
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Informasi Laporan', margin, y)
    y += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)

    const infoItems: [string, string][] = [
      ['Rumah Sakit', 'RSU Ja\'far Medika Karanganyar'],
      ['Layanan', 'Poli Akupuntur & Herbal (Integrative Medicine)'],
      ['Periode', `${firstDate} - ${lastDate}`],
      ['Total Responden', `${n}`],
      ['Tanggal Laporan', new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
    ]

    infoItems.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
      doc.text(`${label}:`, margin, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(value, margin + 45, y)
      y += 7
    })

    y += 10
    doc.setDrawColor(EMERALD[0], EMERALD[1], EMERALD[2])
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 10

    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text('Laporan ini dihasilkan secara otomatis oleh sistem DPEMS (Digital Patient Experience Monitoring System).', margin, y)
    y += 5
    doc.text('Data bersifat rahasia dan hanya untuk keperluan evaluasi internal rumah sakit.', margin, y)

    // --- PAGE 2: RINGKASAN EKSEKUTIF ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Ringkasan Eksekutif', y)
    y += 2

    // KPI boxes
    const kpis: { label: string; value: string; color: [number, number, number] }[] = [
      { label: 'Total Responden', value: `${n}`, color: EMERALD },
      { label: 'Pengurangan Nyeri', value: `${avgPainReduction}%`, color: BLUE },
      { label: 'NPS Score', value: `${npsScore > 0 ? '+' : ''}${npsScore}`, color: AMBER },
      { label: 'Kepuasan Overall', value: `${overall.toFixed(1)}/5`, color: ROSE },
    ]

    const boxW = (pageW - margin * 2 - 15) / 4
    kpis.forEach((kpi, i) => {
      const bx = margin + i * (boxW + 5)
      const by = y
      doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2])
      doc.roundedRect(bx, by, boxW, 25, 2, 2, 'F')
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(kpi.value, bx + boxW / 2, by + 12, { align: 'center' })
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(kpi.label, bx + boxW / 2, by + 20, { align: 'center' })
    })

    y += 35

    // NPS breakdown
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Distribusi NPS', margin, y)
    y += 6

    autoTable(doc, {
      startY: y,
      head: [['Kategori', 'Jumlah', 'Persentase']],
      body: [
        ['Promoters (9-10)', `${promoters}`, npsTotal > 0 ? `${((promoters / npsTotal) * 100).toFixed(1)}%` : '0%'],
        ['Passives (7-8)', `${passives}`, npsTotal > 0 ? `${((passives / npsTotal) * 100).toFixed(1)}%` : '0%'],
        ['Detractors (0-6)', `${detractors}`, npsTotal > 0 ? `${((detractors / npsTotal) * 100).toFixed(1)}%` : '0%'],
      ],
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 30) + 8

    // Clinical summary
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Ringkasan Klinis', margin, y)
    y += 6

    autoTable(doc, {
      startY: y,
      head: [['Indikator', 'Nilai']],
      body: [
        ['Rata-rata VAS Sebelum', `${avgPB.toFixed(1)}`],
        ['Rata-rata VAS Sesudah', `${avgPA.toFixed(1)}`],
        ['Pengurangan Nyeri Rata-rata', `${avgPainReduction}%`],
        ['SERVQUAL Overall', `${overall.toFixed(2)} / 5`],
      ],
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    // --- PAGE 3: DEMOGRAFI ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian A: Profil Demografi Responden', y)
    y += 2

    // Gender
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Distribusi Gender', margin, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Gender', 'Jumlah', 'Persentase']],
      body: [
        ['Laki-laki', `${genderMap.L}`, n > 0 ? `${((genderMap.L / n) * 100).toFixed(1)}%` : '0%'],
        ['Perempuan', `${genderMap.P}`, n > 0 ? `${((genderMap.P / n) * 100).toFixed(1)}%` : '0%'],
      ],
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
      tableWidth: 80,
    })

    y = afterTable(doc, y + 20) + 8

    // Age
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Distribusi Usia', margin, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Kelompok Usia', 'Jumlah', 'Persentase']],
      body: Object.entries(ageMap)
        .sort((a, b) => b[1] - a[1])
        .map(([range, count]) => [range, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
      tableWidth: 80,
    })

    y = afterTable(doc, y + 30) + 8

    // Education
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Distribusi Pendidikan', margin, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Pendidikan', 'Jumlah', 'Persentase']],
      body: Object.entries(eduMap)
        .sort((a, b) => b[1] - a[1])
        .map(([edu, count]) => [edu, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 30)
    if (y > pageH - 40) { doc.addPage(); y = margin }
    y += 8

    // Patient type
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Jenis Pasien', margin, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Jenis Pasien', 'Jumlah', 'Persentase']],
      body: Object.entries(patientTypeMap)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => [type, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 30)
    if (y > pageH - 40) { doc.addPage(); y = margin }
    y += 8

    // Condition
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Distribusi Kondisi / Keluhan', margin, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Kondisi / Keluhan', 'Jumlah', 'Persentase']],
      body: Object.entries(conditionMap)
        .sort((a, b) => b[1] - a[1])
        .map(([cond, count]) => [cond, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    // --- PAGE 4: SERVQUAL ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian B: Analisis SERVQUAL', y)
    y += 2

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text('Skor rata-rata dimensi layanan (skala 1-5)', margin, y)
    y += 8

    autoTable(doc, {
      startY: y,
      head: [['Dimensi', 'Rata-rata', 'Kepuasan (%)', 'Status']],
      body: [
        ['Tangibles', `${tang.toFixed(2)}`, `${((tang / 5) * 100).toFixed(0)}%`, tang >= 4.2 ? 'Excellent' : tang >= 3.5 ? 'Good' : 'Perlu Perbaikan'],
        ['Reliability', `${rel.toFixed(2)}`, `${((rel / 5) * 100).toFixed(0)}%`, rel >= 4.2 ? 'Excellent' : rel >= 3.5 ? 'Good' : 'Perlu Perbaikan'],
        ['Responsiveness', `${resp.toFixed(2)}`, `${((resp / 5) * 100).toFixed(0)}%`, resp >= 4.2 ? 'Excellent' : resp >= 3.5 ? 'Good' : 'Perlu Perbaikan'],
        ['Assurance', `${assur.toFixed(2)}`, `${((assur / 5) * 100).toFixed(0)}%`, assur >= 4.2 ? 'Excellent' : assur >= 3.5 ? 'Good' : 'Perlu Perbaikan'],
        ['Empathy', `${emp.toFixed(2)}`, `${((emp / 5) * 100).toFixed(0)}%`, emp >= 4.2 ? 'Excellent' : emp >= 3.5 ? 'Good' : 'Perlu Perbaikan'],
        ['OVERALL', `${overall.toFixed(2)}`, `${((overall / 5) * 100).toFixed(0)}%`, overall >= 4.2 ? 'Excellent' : overall >= 3.5 ? 'Good' : 'Perlu Perbaikan'],
      ],
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 40) + 10

    // Individual question averages
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Detail Pertanyaan per Dimensi', margin, y)
    y += 6

    const questionKeys = [
      { dim: 'Tangibles', keys: ['b1_t1_kebersihan', 'b1_t2_steril', 'b1_t3_berbaring', 'b1_t4_suasana'], labels: ['Kebersihan', 'Sterilisasi', 'Kenyamanan Berbaring', 'Suasana Kamar'] },
      { dim: 'Reliability', keys: ['b2_r1_tepat_waktu', 'b2_r2_hadir', 'b2_r3_terstandar', 'b2_r4_rekam_medis'], labels: ['Ketepatan Waktu', 'Kehadiran Terapis', 'Prosedur Terstandar', 'Rekam Medis'] },
      { dim: 'Responsiveness', keys: ['b3_c1_tunggu', 'b3_c2_respons', 'b3_c3_jelas', 'b3_c4_efek_samping'], labels: ['Waktu Tunggu', 'Respons Cepat', 'Penjelasan Jelas', 'Informasi Efek Samping'] },
      { dim: 'Assurance', keys: ['b4_a1_kompetensi', 'b4_a2_diagnosis', 'b4_a3_aman', 'b4_a4_sertifikasi'], labels: ['Kompetensi Terapis', 'Diagnosis Akurat', 'Rasa Aman', 'Sertifikasi'] },
      { dim: 'Empathy', keys: ['b5_e1_personal', 'b5_e2_kekhawatiran', 'b5_e3_hormat', 'b5_e4_perkembangan'], labels: ['Pelayanan Personal', 'Perhatian Kekhawatiran', 'Respek', 'Info Perkembangan'] },
    ]

    const questionRows: string[][] = []
    questionKeys.forEach((dim) => {
      dim.keys.forEach((key, i) => {
        const scores = workingData
          .map((s) => (s.responses_json?.[key] as number) ?? null)
          .filter((v): v is number => v !== null)
        const qAvg = scores.length > 0 ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0
        questionRows.push([`${dim.dim} - ${dim.labels[i]}`, `${qAvg.toFixed(2)}`, `${((qAvg / 5) * 100).toFixed(0)}%`])
      })
    })

    autoTable(doc, {
      startY: y,
      head: [['Pertanyaan', 'Rata-rata', 'Kepuasan (%)']],
      body: questionRows,
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    // --- PAGE 5: HERBAL & ADJUVAN ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian C: Layanan Herbal', y)
    y += 2

    const herbalPrescribed = workingData.filter((s) => s.herbal_prescribed === true).length
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`Pasien yang diresepkan herbal: ${herbalPrescribed} dari ${n} (${n > 0 ? ((herbalPrescribed / n) * 100).toFixed(1) : 0}%)`, margin, y)
    y += 8

    if (herbalPrescribed > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Aspek Herbal', 'Rata-rata', 'Kepuasan (%)']],
        body: [
          ['Penjelasan Herbal', `${herbExplanation.toFixed(2)}`, `${((herbExplanation / 5) * 100).toFixed(0)}%`],
          ['Panduan Penggunaan', `${herbUsage.toFixed(2)}`, `${((herbUsage / 5) * 100).toFixed(0)}%`],
          ['Kepercayaan Keamanan', `${herbSafety.toFixed(2)}`, `${((herbSafety / 5) * 100).toFixed(0)}%`],
          ['Ketersediaan', `${herbAvail.toFixed(2)}`, `${((herbAvail / 5) * 100).toFixed(0)}%`],
          ['Keterjangkauan Harga', `${herbAfford.toFixed(2)}`, `${((herbAfford / 5) * 100).toFixed(0)}%`],
          ['Pelayanan Apoteker', `${herbPharm.toFixed(2)}`, `${((herbPharm / 5) * 100).toFixed(0)}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 40)
    } else {
      y += 4
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text('Tidak ada data layanan herbal untuk periode ini.', margin, y)
      y += 15
    }

    y += 10
    y = sectionTitle(doc, 'Bagian D: Clarity of Therapeutic Role (D1-D4)', y)
    y += 2

    // Clarity averages
    const clarityRole = avg(workingData.map(s => s.d1_clarity_role))
    const clarityExpl = avg(workingData.map(s => s.d2_clarity_explanation))
    const clarityComf = avg(workingData.map(s => s.d3_clarity_comfortable))
    const claritySpec = avg(workingData.map(s => s.d4_clarity_specialist))
    const clarityOverall = parseFloat(((clarityRole + clarityExpl + clarityComf + claritySpec) / 4).toFixed(2))

    autoTable(doc, {
      startY: y,
      head: [['Aspek', 'Rata-rata', 'Kepuasan (%)']],
      body: [
        ['D1 Klaritas Role Terapis', `${clarityRole.toFixed(2)}`, `${((clarityRole / 5) * 100).toFixed(0)}%`],
        ['D2 Klaritas Penjelasan', `${clarityExpl.toFixed(2)}`, `${((clarityExpl / 5) * 100).toFixed(0)}%`],
        ['D3 Kenyamanan', `${clarityComf.toFixed(2)}`, `${((clarityComf / 5) * 100).toFixed(0)}%`],
        ['D4 Spesialis Terpercaya', `${claritySpec.toFixed(2)}`, `${((claritySpec / 5) * 100).toFixed(0)}%`],
        ['OVERALL', `${clarityOverall.toFixed(2)}`, `${((clarityOverall / 5) * 100).toFixed(0)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 30) + 10

    // --- PAGE 6: CLINICAL OUTCOMES ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian E1: Outcomes Klinis (VAS)', y)
    y += 2

    autoTable(doc, {
      startY: y,
      head: [['Indikator', 'Nilai']],
      body: [
        ['Rata-rata VAS Sebelum Terapi', `${avgPB.toFixed(2)}`],
        ['Rata-rata VAS Sesudah Terapi', `${avgPA.toFixed(2)}`],
        ['Pengurangan Nyeri Rata-rata', `${avgPainReduction}%`],
        ['Responden dengan Nyeri Turun', `${painBeforeArr.filter((_, i) => painAfterArr[i] !== undefined && painAfterArr[i] < painBeforeArr[i]).length}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 30) + 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Distribusi Perubahan Kondisi', margin, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Perubahan Kondisi', 'Jumlah', 'Persentase']],
      body: Object.entries(conditionChangeMap)
        .sort((a, b) => b[1] - a[1])
        .map(([change, count]) => [change, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    // --- PAGE: BARTHEL INDEX (E2) ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian E2: Barthel Index (Stroke)', y)
    y += 2

    const strokePatients = workingData.filter(s => {
      const ct = s.condition_type
      return ct && (ct.includes('Stroke') || ct.includes('Pasca Stroke'))
    })

    const barthelPairs = [
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
    ]

    function classifyBarthel(score: number): string {
      if (score <= 20) return 'Total Dependen'
      if (score <= 60) return 'Dependen Berat'
      if (score <= 90) return 'Dependen Sedang'
      if (score <= 99) return 'Dependen Ringan'
      return 'Mandiri'
    }

    if (strokePatients.length > 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Total pasien stroke: ${strokePatients.length}`, margin, y)
      y += 8

      // Compute per-item averages
      const barthelItemRows: string[][] = []
      const itemLabels = ['Makan', 'Mandi', 'Perawatan Diri', 'Berpakaian', 'Toilet', 'Kont. Usus', 'Kont. Kandung Kemih', 'Transfer', 'Mobilitas', 'Tangga']
      barthelPairs.forEach(([fKey, cKey], idx) => {
        const firstScores = strokePatients.map(s => (s as any)[fKey] as number).filter((v): v is number => v !== null && v !== undefined)
        const currentScores = strokePatients.map(s => (s as any)[cKey] as number).filter((v): v is number => v !== null && v !== undefined)
        const avgFirst = firstScores.length > 0 ? avg(firstScores) : 0
        const avgCurrent = currentScores.length > 0 ? avg(currentScores) : 0
        barthelItemRows.push([itemLabels[idx], `${avgFirst.toFixed(1)}`, `${avgCurrent.toFixed(1)}`, avgCurrent > avgFirst ? '+' + (avgCurrent - avgFirst).toFixed(1) : (avgCurrent - avgFirst).toFixed(1)])
      })

      autoTable(doc, {
        startY: y,
        head: [['Aktivitas', 'Rata-rata Awal', 'Rata-rata Sekarang', 'Perubahan']],
        body: barthelItemRows,
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 60) + 10

      // Summary scores
      const barthelScores = strokePatients.map(s => {
        let first = 0, current = 0
        for (const [fKey, cKey] of barthelPairs) {
          first += ((s as any)[fKey] as number) || 0
          current += ((s as any)[cKey] as number) || 0
        }
        return { first, current }
      })

      const avgFirstBarthel = avg(barthelScores.map(b => b.first))
      const avgCurrentBarthel = avg(barthelScores.map(b => b.current))
      const avgImprovement = avgCurrentBarthel - avgFirstBarthel
      const depFirst = classifyBarthel(avgFirstBarthel)
      const depCurrent = classifyBarthel(avgCurrentBarthel)

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
      doc.text('Ringkasan Barthel Index', margin, y)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [['Indikator', 'Nilai']],
        body: [
          ['Rata-rata Skor Awal', `${avgFirstBarthel.toFixed(1)} (${depFirst})`],
          ['Rata-rata Skor Sekarang', `${avgCurrentBarthel.toFixed(1)} (${depCurrent})`],
          ['Rata-rata Peningkatan', `${avgImprovement > 0 ? '+' : ''}${avgImprovement.toFixed(1)}`],
          ['Klasifikasi Ketergantungan Awal', depFirst],
          ['Klasifikasi Ketergantungan Sekarang', depCurrent],
        ],
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })
    } else {
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text('Tidak ada data pasien stroke untuk periode ini.', margin, y)
    }

    // --- PAGE: ISI (E3) ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian E3: Insomnia Severity Index (ISI)', y)
    y += 2

    const isiPatients = workingData.filter(s => {
      const ct = s.condition_type
      return ct && (ct.includes('Insomnia') || ct.includes('Gangguan Tidur'))
    })

    if (isiPatients.length > 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Total pasien insomnia: ${isiPatients.length}`, margin, y)
      y += 8

      // Compute ISI scores from individual items
      const isiItemKeys = [
        { key: 'isi_1', label: 'Kesulitan Tidur' },
        { key: 'isi_2', label: 'Tetap Tidur' },
        { key: 'isi_3', label: 'Bangun Terlalu Awal' },
        { key: 'isi_4', label: 'Puas dengan Pola Tidur' },
        { key: 'isi_5', label: 'Gangguan Terlihat Orang Lain' },
        { key: 'isi_6', label: 'Cemas tentang Tidur' },
        { key: 'isi_7', label: 'Gangguan Fungsi Siang Hari' },
      ]

      const isiItemRows: string[][] = []
      isiItemKeys.forEach(item => {
        const scores = isiPatients.map(s => (s as any)[item.key] as number).filter((v): v is number => v !== null && v !== undefined)
        const itemAvg = scores.length > 0 ? avg(scores) : 0
        isiItemRows.push([item.label, `${itemAvg.toFixed(2)}`, `${scores.length}`])
      })

      autoTable(doc, {
        startY: y,
        head: [['Dimensi ISI', 'Rata-rata', 'Responden']],
        body: isiItemRows,
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 50) + 10

      // Total ISI scores
      const isiTotalScores = isiPatients.map(s => {
        let total = 0
        isiItemKeys.forEach(item => {
          total += ((s as any)[item.key] as number) || 0
        })
        return total
      }).filter(t => t > 0)

      const avgIsiTotal = isiTotalScores.length > 0 ? avg(isiTotalScores) : 0
      const isiBeforeScores = isiPatients.map(s => (s as any).isi_total_before as number).filter((v): v is number => v !== null && v !== undefined)
      const isiAfterScores = isiPatients.map(s => (s as any).isi_total_after as number).filter((v): v is number => v !== null && v !== undefined)
      const avgIsiBefore = isiBeforeScores.length > 0 ? avg(isiBeforeScores) : 0
      const avgIsiAfter = isiAfterScores.length > 0 ? avg(isiAfterScores) : 0

      function classifyIsi(score: number): string {
        if (score <= 7) return 'Subklinis'
        if (score <= 14) return 'Ringan'
        if (score <= 21) return 'Sedang'
        return 'Berat'
      }

      // Distribution of severity
      const isiSeverityMap: Record<string, number> = {}
      isiTotalScores.forEach(score => {
        const severity = classifyIsi(score)
        isiSeverityMap[severity] = (isiSeverityMap[severity] || 0) + 1
      })

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
      doc.text('Ringkasan ISI', margin, y)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [['Indikator', 'Nilai']],
        body: [
          ['Rata-rata Total ISI', `${avgIsiTotal.toFixed(1)} / 28 (${classifyIsi(avgIsiTotal)})`],
          ['Rata-rata ISI Sebelum', avgIsiBefore > 0 ? `${avgIsiBefore.toFixed(1)} (${classifyIsi(avgIsiBefore)})` : 'N/A'],
          ['Rata-rata ISI Sesudah', avgIsiAfter > 0 ? `${avgIsiAfter.toFixed(1)} (${classifyIsi(avgIsiAfter)})` : 'N/A'],
          ['Peningkatan', avgIsiBefore > 0 && avgIsiAfter > 0 ? `${(avgIsiBefore - avgIsiAfter) > 0 ? '' : '+'}${(avgIsiAfter - avgIsiBefore).toFixed(1)}` : 'N/A'],
        ],
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 40) + 10

      // Severity distribution
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
      doc.text('Distribusi Keparahan Insomnia', margin, y)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [['Tingkat Keparahan', 'Skor', 'Jumlah', 'Persentase']],
        body: [
          ['Subklinis', '0-7', `${isiSeverityMap['Subklinis'] || 0}`, isiTotalScores.length > 0 ? `${(((isiSeverityMap['Subklinis'] || 0) / isiTotalScores.length) * 100).toFixed(1)}%` : '0%'],
          ['Ringan', '8-14', `${isiSeverityMap['Ringan'] || 0}`, isiTotalScores.length > 0 ? `${(((isiSeverityMap['Ringan'] || 0) / isiTotalScores.length) * 100).toFixed(1)}%` : '0%'],
          ['Sedang', '15-21', `${isiSeverityMap['Sedang'] || 0}`, isiTotalScores.length > 0 ? `${(((isiSeverityMap['Sedang'] || 0) / isiTotalScores.length) * 100).toFixed(1)}%` : '0%'],
          ['Berat', '22-28', `${isiSeverityMap['Berat'] || 0}`, isiTotalScores.length > 0 ? `${(((isiSeverityMap['Berat'] || 0) / isiTotalScores.length) * 100).toFixed(1)}%` : '0%'],
        ],
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })
    } else {
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text('Tidak ada data pasien insomnia untuk periode ini.', margin, y)
    }

    // --- PAGE: WHOQOL-BREF WELLNESS (E4) ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian E4: WHOQOL-BREF Wellness', y)
    y += 2

    const wellnessPatients = workingData.filter(s => {
      const ct = s.condition_type
      return ct && (ct.includes('Pemeliharaan') || ct.includes('Wellness'))
    })

    if (wellnessPatients.length > 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Total pasien wellness: ${wellnessPatients.length}`, margin, y)
      y += 8

      const wellnessAvg1 = avg(wellnessPatients.map(s => (s as any).wellness_1 as number).filter((v): v is number => v !== null && v !== undefined))
      const wellnessAvg2 = avg(wellnessPatients.map(s => (s as any).wellness_2 as number).filter((v): v is number => v !== null && v !== undefined))
      const wellnessAvg3 = avg(wellnessPatients.map(s => (s as any).wellness_3 as number).filter((v): v is number => v !== null && v !== undefined))
      const wellnessOverall = [wellnessAvg1, wellnessAvg2, wellnessAvg3].filter(v => v > 0).length > 0
        ? avg([wellnessAvg1, wellnessAvg2, wellnessAvg3])
        : 0

      autoTable(doc, {
        startY: y,
        head: [['Dimensi Wellness', 'Rata-rata', 'Kategori']],
        body: [
          ['Fisik (Q1)', `${wellnessAvg1.toFixed(2)}`, wellnessAvg1 >= 4 ? 'Baik' : wellnessAvg1 >= 3 ? 'Cukup' : 'Perlu Perhatian'],
          ['Psikologis (Q2)', `${wellnessAvg2.toFixed(2)}`, wellnessAvg2 >= 4 ? 'Baik' : wellnessAvg2 >= 3 ? 'Cukup' : 'Perlu Perhatian'],
          ['Sosial (Q3)', `${wellnessAvg3.toFixed(2)}`, wellnessAvg3 >= 4 ? 'Baik' : wellnessAvg3 >= 3 ? 'Cukup' : 'Perlu Perhatian'],
          ['Overall', `${wellnessOverall.toFixed(2)}`, wellnessOverall >= 4 ? 'Baik' : wellnessOverall >= 3 ? 'Cukup' : 'Perlu Perhatian'],
        ],
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })
    } else {
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text('Tidak ada data pasien wellness untuk periode ini.', margin, y)
    }

    // --- PAGE 7: SPIRITUAL WELLNESS (9 DIMENSIONS) ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian F: Spiritual & Holistic Wellness (9 Dimensi)', y)
    y += 2

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text('Skor rata-rata dimensi spiritual (skala 1-5)', margin, y)
    y += 8

    // Compute all 9 spiritual dimensions
    const spiritF6 = avg(workingData.map(s => s.f6_spiritual_activation).filter((v): v is number => v !== null && v !== undefined))
    const spiritF7 = avg(workingData.map(s => s.f7_holistic_peace).filter((v): v is number => v !== null && v !== undefined))
    const spiritF8 = avg(workingData.map(s => s.f8_spiritual_communication).filter((v): v is number => v !== null && v !== undefined))
    const spiritF9Raw = avg(workingData.map(s => s.f9_reverse_coded).filter((v): v is number => v !== null && v !== undefined))
    // F9 reverse scoring: per-respondent reverse (6 - raw), then average
    const spiritF9 = avg(workingData.map(s => {
      const raw = s.f9_reverse_coded
      return raw !== null && raw !== undefined ? 6 - raw : null
    }))

    autoTable(doc, {
      startY: y,
      head: [['No', 'Dimensi Spiritual', 'Rata-rata', 'Kepuasan (%)']],
      body: [
        ['F1', 'Adab & Etika Islami', `${spiritF1.toFixed(2)}`, `${((spiritF1 / 5) * 100).toFixed(0)}%`],
        ['F2', 'Gender Concordance', `${spiritF2.toFixed(2)}`, `${((spiritF2 / 5) * 100).toFixed(0)}%`],
        ['F3', 'Waktu Shalat', `${spiritF3.toFixed(2)}`, `${((spiritF3 / 5) * 100).toFixed(0)}%`],
        ['F4', 'Jaminan Halal & Thayyib', `${spiritF4.toFixed(2)}`, `${((spiritF4 / 5) * 100).toFixed(0)}%`],
        ['F5', 'Tibb Nabawi', `${spiritF5.toFixed(2)}`, `${((spiritF5 / 5) * 100).toFixed(0)}%`],
        ['F6', 'Aktivasi Spiritual', `${spiritF6.toFixed(2)}`, `${((spiritF6 / 5) * 100).toFixed(0)}%`],
        ['F7', 'Ketenangan Holistik', `${spiritF7.toFixed(2)}`, `${((spiritF7 / 5) * 100).toFixed(0)}%`],
        ['F8', 'Komunikasi Spiritual', `${spiritF8.toFixed(2)}`, `${((spiritF8 / 5) * 100).toFixed(0)}%`],
        ['F9*', `Reverse-Coded (Raw: ${spiritF9Raw.toFixed(1)} | Reversed: ${spiritF9.toFixed(2)})`, `${spiritF9.toFixed(2)}`, `${((spiritF9 / 5) * 100).toFixed(0)}%`],
        ['', 'OVERALL (9 Dimensi, F9 Reversed)', `${((spiritF1 + spiritF2 + spiritF3 + spiritF4 + spiritF5 + spiritF6 + spiritF7 + spiritF8 + spiritF9) / 9).toFixed(2)}`, `${(((spiritF1 + spiritF2 + spiritF3 + spiritF4 + spiritF5 + spiritF6 + spiritF7 + spiritF8 + spiritF9) / 9 / 5) * 100).toFixed(0)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    // Footnote for F9
    y = afterTable(doc, y + 50) + 6
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(120)
    doc.text('*F9 Reverse-Coded: Skor dibalik sebelum dihitung (1 menjadi 5, 5 menjadi 1). Item ini mengukur apakah aspek keagamaan terlalu sering disebutkan.', margin, y)

    // --- PAGE 8: NPS & LOYALTY ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian G: NPS & Loyalitas Pasien', y)
    y += 2

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`NPS Score: ${npsScore > 0 ? '+' : ''}${npsScore} (skala -100 sampai +100)`, margin, y)
    y += 8

    autoTable(doc, {
      startY: y,
      head: [['Kategori NPS', 'Skor', 'Jumlah', 'Persentase']],
      body: [
        ['Promoter (9-10)', '9-10', `${promoters}`, npsTotal > 0 ? `${((promoters / npsTotal) * 100).toFixed(1)}%` : '0%'],
        ['Passive (7-8)', '7-8', `${passives}`, npsTotal > 0 ? `${((passives / npsTotal) * 100).toFixed(1)}%` : '0%'],
        ['Detractor (0-6)', '0-6', `${detractors}`, npsTotal > 0 ? `${((detractors / npsTotal) * 100).toFixed(1)}%` : '0%'],
      ],
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 30) + 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Rencana Kunjungan', margin, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Rencana Kunjungan', 'Jumlah', 'Persentase']],
      body: Object.entries(visitPlanMap)
        .sort((a, b) => b[1] - a[1])
        .map(([plan, count]) => [plan, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 30) + 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Sudah Merekomendasikan?', margin, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Status', 'Jumlah', 'Persentase']],
      body: Object.entries(hasRecommendedMap)
        .sort((a, b) => b[1] - a[1])
        .map(([status, count]) => [status, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
      theme: 'grid',
      headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: margin, right: margin },
    })

    y = afterTable(doc, y + 30) + 10

    // G4: Recommendation Count
    const recCountMap: Record<string, number> = {}
    workingData.forEach(s => {
      if (s.recommendation_count) recCountMap[s.recommendation_count] = (recCountMap[s.recommendation_count] || 0) + 1
    })

    if (Object.keys(recCountMap).length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
      doc.text('Jumlah Orang Direkomendasikan (G4)', margin, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Kategori', 'Jumlah', 'Persentase']],
        body: Object.entries(recCountMap)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, count]) => [cat, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 30) + 10
    }

    // G5: WTP Price Increase
    const wtpPriceIncreaseMap: Record<string, number> = {}
    workingData.forEach(s => {
      if (s.wtp_price_increase !== null && s.wtp_price_increase !== undefined) {
        const val = String(s.wtp_price_increase)
        wtpPriceIncreaseMap[val] = (wtpPriceIncreaseMap[val] || 0) + 1
      }
    })

    if (Object.keys(wtpPriceIncreaseMap).length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
      doc.text('WTP Price Increase (G5)', margin, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Skor', 'Jumlah', 'Persentase']],
        body: Object.entries(wtpPriceIncreaseMap)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([score, count]) => [score, `${count}`, n > 0 ? `${((count / n) * 100).toFixed(1)}%` : '0%']),
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 30) + 10
    }

    // --- PAGE 9: FEEDBACK ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian H: Feedback & Testimoni Pasien', y)
    y += 2

    // Positive feedback
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(EMERALD[0], EMERALD[1], EMERALD[2])
    doc.text('Pengalaman Terbaik', margin, y)
    y += 4

    if (topExperiences.length > 0) {
      topExperiences.forEach((exp) => {
        if (y > pageH - 20) { doc.addPage(); y = margin }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80)
        const lines = doc.splitTextToSize(`- ${exp}`, pageW - margin * 2)
        doc.text(lines, margin, y)
        y += lines.length * 4 + 2
      })
    } else {
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text('Belum ada feedback pengalaman terbaik.', margin, y)
      y += 6
    }

    y += 8

    // Suggestions
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(AMBER_DARK[0], AMBER_DARK[1], AMBER_DARK[2])
    doc.text('Saran Perbaikan', margin, y)
    y += 4

    if (topSuggestions.length > 0) {
      topSuggestions.forEach((sug) => {
        if (y > pageH - 20) { doc.addPage(); y = margin }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80)
        const lines = doc.splitTextToSize(`- ${sug}`, pageW - margin * 2)
        doc.text(lines, margin, y)
        y += lines.length * 4 + 2
      })
    } else {
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text('Belum ada saran perbaikan.', margin, y)
      y += 6
    }

    y += 8

    // Testimonials
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
    doc.text('Testimoni Pasien', margin, y)
    y += 4

    if (topTestimonials.length > 0) {
      topTestimonials.forEach((testi) => {
        if (y > pageH - 25) { doc.addPage(); y = margin }
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(60)
        const lines = doc.splitTextToSize(`"${testi}"`, pageW - margin * 2 - 10)
        const textHeight = lines.length * 4 + 6
        doc.setDrawColor(200)
        doc.setFillColor(250, 250, 250)
        doc.roundedRect(margin, y - 3, pageW - margin * 2, textHeight, 2, 2, 'FD')
        doc.setTextColor(80)
        doc.text(lines, margin + 5, y)
        y += textHeight + 4
      })
    } else {
      doc.setFontSize(9)
      doc.setTextColor(150)
      doc.text('Belum ada testimoni.', margin, y)
    }

    // --- PAGE: WTP (BAGIAN I) ---
    doc.addPage()
    y = margin
    y = sectionTitle(doc, 'Bagian I: Kesediaan Bayar (Willingness to Pay)', y)
    y += 2

    const wtpSurveys = workingData.filter(s => s.wtp_cost_today !== null && s.wtp_cost_today !== undefined)
    const avgWtpCost = wtpSurveys.length > 0
      ? parseFloat((wtpSurveys.reduce((sum, s) => sum + (s.wtp_cost_today || 0), 0) / wtpSurveys.length).toFixed(0))
      : 0

    if (wtpSurveys.length > 0) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Total responden WTP: ${wtpSurveys.length} dari ${n}`, margin, y)
      y += 8

      // Summary KPIs
      autoTable(doc, {
        startY: y,
        head: [['Indikator WTP', 'Nilai']],
        body: [
          ['Rata-rata Biaya Hari Ini', `Rp ${avgWtpCost.toLocaleString('id-ID')}`],
          ['Jumlah Responden WTP', `${wtpSurveys.length}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 30) + 10

      // Distribution: wtp_increase_20
      const wtpIncrease20Map: Record<string, number> = {}
      wtpSurveys.forEach(s => {
        const val = s.wtp_increase_20 as string
        if (val) wtpIncrease20Map[val] = (wtpIncrease20Map[val] || 0) + 1
      })

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
      doc.text('Kesediaan Bayar 20% Lebih', margin, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Jawaban', 'Jumlah', 'Persentase']],
        body: ['Ya', 'Tidak', 'Mungkin'].map(label => [
          label,
          `${wtpIncrease20Map[label] || 0}`,
          wtpSurveys.length > 0 ? `${(((wtpIncrease20Map[label] || 0) / wtpSurveys.length) * 100).toFixed(1)}%` : '0%',
        ]),
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 30) + 10

      // Distribution: wtp_package_interest
      const wtpPackageMap: Record<string, number> = {}
      wtpSurveys.forEach(s => {
        const val = s.wtp_package_interest as string
        if (val) wtpPackageMap[val] = (wtpPackageMap[val] || 0) + 1
      })

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
      doc.text('Minat Paket Terapi', margin, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Jawaban', 'Jumlah', 'Persentase']],
        body: ['Ya', 'Tidak', 'Mungkin'].map(label => [
          label,
          `${wtpPackageMap[label] || 0}`,
          wtpSurveys.length > 0 ? `${(((wtpPackageMap[label] || 0) / wtpSurveys.length) * 100).toFixed(1)}%` : '0%',
        ]),
        theme: 'grid',
        headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT_GRAY },
        margin: { left: margin, right: margin },
      })

      y = afterTable(doc, y + 30) + 10

      // Distribution: wtp_max_acceptable
      const wtpMaxMap: Record<string, number> = {}
      wtpSurveys.forEach(s => {
        const val = s.wtp_max_acceptable as string
        if (val) wtpMaxMap[val] = (wtpMaxMap[val] || 0) + 1
      })

      if (Object.keys(wtpMaxMap).length > 0) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(DARK_GRAY[0], DARK_GRAY[1], DARK_GRAY[2])
        doc.text('Distribusi Biaya Maksimal yang Diterima', margin, y)
        y += 4

        autoTable(doc, {
          startY: y,
          head: [['Rentang Biaya', 'Jumlah', 'Persentase']],
          body: Object.entries(wtpMaxMap)
            .sort((a, b) => b[1] - a[1])
            .map(([range, count]) => [
              range,
              `${count}`,
              wtpSurveys.length > 0 ? `${((count / wtpSurveys.length) * 100).toFixed(1)}%` : '0%',
            ]),
          theme: 'grid',
          headStyles: { fillColor: EMERALD, textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: LIGHT_GRAY },
          margin: { left: margin, right: margin },
        })
      }
    } else {
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text('Tidak ada data WTP untuk periode ini.', margin, y)
    }

    // Add page numbers
    addPageNumber(doc)

    // Generate buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    const today = new Date().toISOString().split('T')[0]
    const filename = `laporan_dpems_${today}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF report:', error)
    return NextResponse.json({ error: 'Gagal menghasilkan laporan PDF' }, { status: 500 })
  }
}