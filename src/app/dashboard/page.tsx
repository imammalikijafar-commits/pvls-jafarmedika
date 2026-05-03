'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Users, TrendingDown, Star, Heart, Activity, MessageCircle,
  BarChart3, RefreshCw, Shield, AlertTriangle, CheckCircle2,
  Bell, Search, ChevronLeft, ChevronRight,  // FIX 1: was ChevRight
  FileSpreadsheet, FileText,
  X, Filter, Database, SlidersHorizontal, ChevronDown, Eye, Menu, Home,
  Leaf, Pill, Wallet, Repeat, ThumbsUp, Moon, BookOpen,
  QrCode, Download, Printer, Copy, MapPin, Lightbulb, Check
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, Legend
} from 'recharts'
import { motion } from 'framer-motion'
import type { DashboardData } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { QRCodeCanvas } from 'qrcode.react'  // FIX 2: real QR code library

// ─── Color Constants ────────────────────────────────────────────
const TEAL = '#0D9488'
const TEAL_LIGHT = 'rgba(13,148,136,0.15)'
const AMBER = '#D97706'
const RED = '#DC2626'
const BLUE = '#2563EB'
const NPS_COLORS = ['#059669', '#d97706', '#dc2626']

const CONDITION_TYPES = [
  'Stroke / Pasca Stroke',
  'Nyeri Sendi (Rematik / OA)',
  'Nyeri Punggung / Saraf Kejepit',
  'Migrain / Sakit Kepala Kronis',
  'Gangguan Tidur (Insomnia)',
  'Kondisi Neurologis Lainnya',
  'Wellness / Pemeliharaan Kesehatan',
  'Lainnya',
]

// ─── Types ──────────────────────────────────────────────────────
interface SurveyRow {
  id: string
  submitted_at: string
  age_range: string | null
  gender: string | null
  condition_type: string | null
  nps_score: number | null
  pain_level_before: number | null
  pain_level_after: number | null
  tangibles: number | null
  reliability: number | null
  responsiveness: number | null
  assurance: number | null
  empathy: number | null
  best_experience: string | null
  improvement_suggestion: string | null
  testimonial: string | null
  education: string | null
  occupation: string | null
  patient_type: string | null
  visit_count: string | null
  condition_change: string | null
  herbal_prescribed: boolean | null
  visit_plan: string | null
  has_recommended: string | null
  units: { name: string } | null
  // v2.0 extra demographic fields
  occupation_other: string | null
  income_range: string | null
  condition_type_other: string | null
  referral_source: string | null
  // v2.0 herbal fields
  herb_explanation: number | null
  herb_usage_guide: number | null
  herb_safety_trust: number | null
  herb_availability: number | null
  herb_affordability: number | null
  herb_pharmacist: number | null
  adjuvant_role: string | null
  // v2.0 clarity (D1-D4)
  info_acupuncture_support: number | null
  info_understanding: number | null
  info_sufficient: number | null
  info_comfortable_asking: number | null
  // v2.0 Barthel Index
  barthel_eat_first: number | null
  barthel_eat_current: number | null
  barthel_bath_first: number | null
  barthel_bath_current: number | null
  barthel_groom_first: number | null
  barthel_groom_current: number | null
  barthel_dress_first: number | null
  barthel_dress_current: number | null
  barthel_toilet_first: number | null
  barthel_toilet_current: number | null
  barthel_bowel_first: number | null
  barthel_bowel_current: number | null
  barthel_bladder_first: number | null
  barthel_bladder_current: number | null
  barthel_transfer_first: number | null
  barthel_transfer_current: number | null
  barthel_mobility_first: number | null
  barthel_mobility_current: number | null
  barthel_stairs_first: number | null
  barthel_stairs_current: number | null
  // v2.0 ISI
  isi_1: number | null
  isi_2: number | null
  isi_3: number | null
  isi_4: number | null
  isi_5: number | null
  isi_6: number | null
  isi_7: number | null
  // v2.0 Wellness
  wellness_1: number | null
  wellness_2: number | null
  wellness_3: number | null
  // v2.0 Spiritual (F1-F5 original)
  spiritual_salam_doa: number | null
  spiritual_islam_respect: number | null
  spiritual_facility: number | null
  spiritual_healing: number | null
  spiritual_support: number | null
  // v2.0 Spiritual (F1-F9 extended)
  f1_adab_islami: number | null
  f2_gender_concordance: number | null
  f6_doa_kesembuhan: number | null
  f7_keluarga_support: number | null
  f8_keikhlasan: number | null
  f9_kedekatan_tuhan: number | null
  // v2.0 WTP fields
  wtp_price_increase: number | null
  wtp_cost_today: number | null
  wtp_increase_20: number | null
  // v2.0 Feedback (H1/H2)
  h1_liked: string[] | null
  h1_liked_other: string | null
  h2_suggested: string[] | null
  h2_suggested_other: string | null
}

interface SurveysResponse {
  surveys: SurveyRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Custom Tooltip ─────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
      {label && <p className="text-slate-500 mb-1 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || TEAL }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── QR Code Generator Component ────────────────────────────────
// Standalone component — FIX 2: uses QRCodeCanvas from qrcode.react (real QR code)
function QRCodeGenerator({ data }: { data: DashboardData | null }) {
  const [copied, setCopied] = useState(false)
  const [qrSize, setQrSize] = useState(280)
  const qrContainerRef = useRef<HTMLDivElement>(null)

  // FIX 3: surveyUrl uses /survey/consent with dpems.rsjafarmedika.com fallback
  const surveyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/survey/consent`
    : 'https://dpems.rsjafarmedika.com/survey/consent'

  const handleDownload = () => {
    const canvas = qrContainerRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'QR-Akupuntur-Herbal-RSU-Jafar-Medika.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handlePrint = () => {
    const canvas = qrContainerRef.current?.querySelector('canvas')
    if (!canvas) return
    const imgSrc = canvas.toDataURL('image/png')
    const dateStr = new Date().toLocaleDateString('id-ID')
    const win = window.open('', '_blank')
    if (!win) return
    // FIX 3: string concatenation for </script> tags to avoid JSX parsing issues
    const html = '<html><head><title>QR Code - Poli Akupuntur & Herbal</title>'
      + '<style>'
      + 'body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;margin:0;padding:40px}'
      + 'img{width:400px;height:400px;border:2px solid #0D9488;border-radius:16px;padding:16px}'
      + 'h1{font-size:18px;color:#1e293b;margin:16px 0 4px}'
      + 'h2{font-size:14px;color:#475569;margin:2px 0;font-weight:400}'
      + 'p{font-size:13px;color:#64748b;margin:2px 0}'
      + '.footer{margin-top:24px;font-size:11px;color:#94a3b8}'
      + '.placement{margin-top:20px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;text-align:left;max-width:500px}'
      + '.placement h3{font-size:13px;color:#1e293b;margin:0 0 8px}'
      + '.placement ul{margin:0;padding-left:20px;color:#64748b;font-size:12px}'
      + '.placement li{margin-bottom:4px}'
      + '</style></head>'
      + '<body>'
      + '<h1>Poli Akupuntur & Herbal</h1>'
      + "<h2>RSU Ja'far Medika Karanganyar</h2>"
      + '<img src="' + imgSrc + '" />'
      + '<p>Scan QR code untuk mengisi survei pengalaman pasien</p>'
      + '<p class="footer">Generated by DPEMS &mdash; ' + dateStr + '</p>'
      + '<div class="placement">'
      + '<h3>Panduan Penempatan</h3>'
      + '<ul>'
      + '<li>Ruang tunggu poli — tempel di dinding dekat kursi tunggu utama</li>'
      + '<li>Meja resepsionis — letakkan di meja depan agar staf bisa menunjukkan ke pasien</li>'
      + '<li>Area terapi / ruang akupuntur — pasang di dekat pintu masuk ruang terapi</li>'
      + '<li>Kartu nama / brosur pasien — sertakan di materi edukasi pasien baru</li>'
      + '</ul>'
      + '</div>'
      + '<scr' + 'ipt>window.onload=function(){window.print();};</scr' + 'ipt>'
      + '</body></html>'
    win.document.write(html)
    win.document.close()
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = surveyUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const placementGuides = [
    { location: 'Ruang tunggu poli', desc: 'Tempel di dinding dekat kursi tunggu utama', emoji: '🚪' },
    { location: 'Meja resepsionis', desc: 'Letakkan di meja depan agar staf bisa menunjukkan ke pasien', emoji: '📝' },
    { location: 'Area terapi / ruang akupuntur', desc: 'Pasang di dekat pintu masuk ruang terapi', emoji: '🪑' },
    { location: 'Kartu nama / brosur pasien', desc: 'Sertakan di materi edukasi pasien baru', emoji: '👨‍⚕️' },
  ]

  const usageTips = [
    { title: 'Ukuran Cetak', desc: 'Minimal 10x10 cm agar mudah discan dari jarak 1 meter' },
    { title: 'Laminasi', desc: 'Gunakan kertas glossy atau laminasi agar tahan lama' },
    { title: 'Pencahayaan', desc: 'Pastikan area penempatan QR Code memiliki cahaya cukup' },
    { title: 'Label', desc: 'Beri label "Scan untuk isi survei" di bawah QR Code' },
    { title: 'Maintenance', desc: 'Ganti QR Code setiap 6 bulan atau jika URL berubah' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center shrink-0 shadow-sm">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-display)]">
                QR Code Survei Pasien
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                Auto-Generate
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generate dan cetak QR Code untuk disimpan di ruang tunggu Poli Akupuntur &amp; Herbal. Pasien cukup scan QR code untuk langsung mengisi survei pengalaman mereka.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-display)]">Poli Akupuntur &amp; Herbal</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Layanan integratif stroke &amp; nyeri</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              Aktif
            </span>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div
              ref={qrContainerRef}
              className="p-4 bg-white rounded-2xl border-2 border-dashed border-teal-200 shadow-sm"
            >
              <QRCodeCanvas
                value={surveyUrl || 'https://dpems.rsjafarmedika.com/survey/consent'}
                size={qrSize}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
                includeMargin={false}
              />
            </div>

            {/* URL Preview */}
            <div className="mt-4 w-full bg-slate-50 rounded-lg p-3 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">URL Survei</p>
                <p className="text-xs text-slate-600 truncate font-mono">
                  {surveyUrl || 'https://dpems.rsjafarmedika.com/survey/consent'}
                </p>
              </div>
              <button
                onClick={handleCopyUrl}
                className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors shrink-0"
                title="Salin URL"
              >
                {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Size Selector */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-medium">Ukuran:</span>
            <div className="flex gap-1.5">
              {[
                { label: 'S', size: 200 },
                { label: 'M', size: 280 },
                { label: 'L', size: 380 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setQrSize(opt.size)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    qrSize === opt.size
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions + Placement + Tips + Stats */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-display)] mb-4">Aksi</h4>
            <button
              onClick={handleDownload}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
            >
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Download PNG</p>
                <p className="text-[10px] text-teal-100">Simpan file gambar QR Code</p>
              </div>
            </button>
            <button
              onClick={handlePrint}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Printer className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700">Cetak / Print</p>
                <p className="text-[10px] text-slate-400">Buka dialog cetak langsung</p>
              </div>
            </button>
            <button
              onClick={handleCopyUrl}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700">{copied ? 'URL Tersalin!' : 'Salin URL Survei'}</p>
                <p className="text-[10px] text-slate-400">{surveyUrl || 'https://dpems.rsjafarmedika.com/survey/consent'}</p>
              </div>
            </button>
          </div>

          {/* Placement Guide */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-display)] mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Panduan Penempatan
            </h4>
            <div className="space-y-2.5">
              {placementGuides.map((item) => (
                <div key={item.emoji} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200/60 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    {item.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{item.location}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-xl border border-amber-200 p-4">
            <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Tips Pemakaian
            </p>
            <ul className="space-y-1.5 text-[11px] text-amber-700 leading-relaxed">
              {usageTips.map((tip) => (
                <li key={tip.title} className="flex gap-2">
                  <span className="text-amber-500 shrink-0">&#8226;</span>
                  <span><span className="font-medium">{tip.title}:</span> {tip.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100/60 rounded-xl border border-teal-200 p-4">
            <p className="text-xs font-semibold text-teal-800 mb-3">Quick Stats</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-teal-700 font-[family-name:var(--font-display)]">{data?.totalSurveys ?? 0}</p>
                <p className="text-[10px] text-teal-600">Total Survei</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-teal-700 font-[family-name:var(--font-display)]">{data?.responseRate ?? 0}%</p>
                <p className="text-[10px] text-teal-600">Response Rate</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-amber-600 font-[family-name:var(--font-display)]">{data?.avgPainReduction ?? 0}%</p>
                <p className="text-[10px] text-teal-600">Pain Reduction</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-emerald-600 font-[family-name:var(--font-display)]">{data?.nps?.score > 0 ? `+${data.nps.score}` : data?.nps?.score ?? '-'}</p>
                <p className="text-[10px] text-teal-600">NPS Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────
export default function DashboardPage() {
  // ─── State ────────────────────────────────────────────────────
  const [data, setData] = useState<DashboardData | null>(null)
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Surveys tab state
  const [surveysData, setSurveysData] = useState<SurveysResponse | null>(null)
  const [surveysLoading, setSurveysLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [npsCategory, setNpsCategory] = useState('')
  const [npsMin, setNpsMin] = useState('')
  const [npsMax, setNpsMax] = useState('')
  const [surveyPage, setSurveyPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const surveysFetchRef = useRef(0)

  // Feedback filters
  const [fbSearch, setFbSearch] = useState('')
  const [fbCondition, setFbCondition] = useState('')
  const [fbNpsCategory, setFbNpsCategory] = useState('')
  const [fbDateFrom, setFbDateFrom] = useState('')
  const [fbDateTo, setFbDateTo] = useState('')
  const [fbFilterOpen, setFbFilterOpen] = useState(false)

  // Data Survei filter panel
  const [dataFilterOpen, setDataFilterOpen] = useState(false)

  // Error state
  const [fetchError, setFetchError] = useState<string | null>(null)

  // ─── Data Fetching ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch(`/api/dashboard/data?period=${period}`)
      if (!res.ok) {
        let errorMsg = 'Gagal memuat data dashboard. Silakan coba lagi.'
        try {
          const body = await res.json()
          errorMsg = body.error || body.message || errorMsg
        } catch { /* ignore parse error */ }
        throw new Error(errorMsg)
      }
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e)
      setFetchError(e instanceof Error ? e.message : 'Gagal memuat data dashboard. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [period])

  const fetchSurveys = useCallback(async (pageNum: number = 1) => {
    setSurveysLoading(true)
    const fetchId = ++surveysFetchRef.current
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (genderFilter) params.set('gender', genderFilter)
      if (conditionFilter) params.set('condition_type', conditionFilter)
      if (npsMin) params.set('npsMin', npsMin)
      if (npsMax) params.set('npsMax', npsMax)
      params.set('page', String(pageNum))
      params.set('pageSize', '10')

      const res = await fetch(`/api/surveys?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch surveys')
      const json = await res.json()
      if (fetchId === surveysFetchRef.current) {
        setSurveysData(json)
        setSurveyPage(pageNum)
      }
    } catch (e) {
      console.error('Failed to fetch surveys:', e)
    } finally {
      if (fetchId === surveysFetchRef.current) {
        setSurveysLoading(false)
      }
    }
  }, [search, dateFrom, dateTo, genderFilter, conditionFilter, npsMin, npsMax])

  // ─── Effects ──────────────────────────────────────────────────
  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('surveys-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'surveys' }, () => {
        fetchData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  useEffect(() => {
    fetchSurveys(1)
  }, [fetchSurveys])

  // ─── Helpers ──────────────────────────────────────────────────
  const resetSurveysFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setGenderFilter('')
    setConditionFilter('')
    setNpsCategory('')
    setNpsMin('')
    setNpsMax('')
  }

  const hasSurveysFilters = search || dateFrom || dateTo || genderFilter || conditionFilter || npsMin || npsMax || npsCategory

  const resetFbFilters = () => {
    setFbSearch('')
    setFbCondition('')
    setFbNpsCategory('')
    setFbDateFrom('')
    setFbDateTo('')
  }

  const getExportUrl = (type: 'excel' | 'pdf') => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (genderFilter) params.set('gender', genderFilter)
    if (conditionFilter) params.set('condition_type', conditionFilter)
    if (npsMin) params.set('npsMin', npsMin)
    if (npsMax) params.set('npsMax', npsMax)
    params.set('period', period)
    return `/api/export/${type}?${params.toString()}`
  }

  // ─── Computed Data ────────────────────────────────────────────
  const servqualData = data ? [
    { dimension: 'Tangibles', score: data.servqual.tangibles, fullMark: 5 },
    { dimension: 'Reliability', score: data.servqual.reliability, fullMark: 5 },
    { dimension: 'Responsiveness', score: data.servqual.responsiveness, fullMark: 5 },
    { dimension: 'Assurance', score: data.servqual.assurance, fullMark: 5 },
    { dimension: 'Empathy', score: data.servqual.empathy, fullMark: 5 },
  ] : []

  const npsData = data ? [
    { name: 'Promoters', value: data.nps.promoters, color: '#059669' },
    { name: 'Passives', value: data.nps.passives, color: '#d97706' },
    { name: 'Detractors', value: data.nps.detractors, color: '#dc2626' },
  ] : []

  const spiritualData = data ? [
    { dimension: 'Salam & Doa', score: data.spiritualAvg.spiritualComfort },
    { dimension: 'Respek Islam', score: data.spiritualAvg.culturalRespect },
    { dimension: 'Fasilitas Ibadah', score: data.spiritualAvg.facility },
    { dimension: 'Spiritual Healing', score: data.spiritualAvg.healing },
    { dimension: 'Dukungan Spiritual', score: data.spiritualAvg.support },
  ] : []

  // v2.0: Spiritual 9 Dimensions (F1-F9) with f9Reversed
  const spiritual9Data = data?.spiritual9Avg ? [
    { dimension: 'F1 Salam & Doa', score: data.spiritual9Avg.f1SalamDoa },
    { dimension: 'F2 Respek Islam', score: data.spiritual9Avg.f2IslamRespect },
    { dimension: 'F3 Fasilitas Ibadah', score: data.spiritual9Avg.f3Facility },
    { dimension: 'F4 Spiritual Healing', score: data.spiritual9Avg.f4Healing },
    { dimension: 'F5 Dukungan Spiritual', score: data.spiritual9Avg.f5Support },
    { dimension: 'F6 Doa Kesembuhan', score: data.spiritual9Avg.f6DoaKesembuhan },
    { dimension: 'F7 Keluarga Support', score: data.spiritual9Avg.f7KeluargaSupport },
    { dimension: 'F8 Keikhlasan', score: data.spiritual9Avg.f8Keikhlasan },
    { dimension: 'F9 Kedekatan Tuhan', score: data.spiritual9Avg.f9Reversed },
  ] : spiritualData

  // v2.0: Clarity of Role (D1-D4)
  const clarityData = data?.clarityAvg ? [
    { dimension: 'D1 Dukungan Akupuntur', score: data.clarityAvg.d1AcupunctureSupport },
    { dimension: 'D2 Pemahaman Info', score: data.clarityAvg.d2Understanding },
    { dimension: 'D3 Kecukupan Info', score: data.clarityAvg.d3SufficientInfo },
    { dimension: 'D4 Nyaman Bertanya', score: data.clarityAvg.d4ComfortableAsking },
  ] : []

  // v2.0: Herb Service Data
  const herbData = data?.herbAvg ? [
    { dimension: 'Penjelasan', score: data.herbAvg.explanation },
    { dimension: 'Panduan Pemakaian', score: data.herbAvg.usageGuide },
    { dimension: 'Kepercayaan Aman', score: data.herbAvg.safetyTrust },
    { dimension: 'Ketersediaan', score: data.herbAvg.availability },
    { dimension: 'Terjangkau Harga', score: data.herbAvg.affordability },
    { dimension: 'Pelayanan Apoteker', score: data.herbAvg.pharmacist },
  ] : []

  // Filtered feedback
  const filteredFeedback = data?.recentFeedback.filter((fb) => {
    if (fbNpsCategory === 'promoter' && (!fb.npsScore || fb.npsScore < 9)) return false
    if (fbNpsCategory === 'passive' && (!fb.npsScore || fb.npsScore < 7 || fb.npsScore > 8)) return false
    if (fbNpsCategory === 'detractor' && (!fb.npsScore || fb.npsScore > 6)) return false
    if (fbCondition && (fb as unknown as Record<string, string>).conditionType !== fbCondition) return false
    if (fbDateFrom && fb.submittedAt < fbDateFrom) return false
    if (fbDateTo && fb.submittedAt > fbDateTo + 'T23:59:59') return false
    if (fbSearch) {
      const q = fbSearch.toLowerCase()
      const haystack = [fb.testimonial, fb.bestExperience, fb.suggestions, fb.improvementSuggestion].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  }) ?? []

  // ─── Loading / Error ──────────────────────────────────────────
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-teal-500 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium font-[family-name:var(--font-body)]">Memuat data dashboard...</p>
        </div>
      </div>
    )
  }

  if (fetchError && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-red-600 font-medium">{fetchError}</p>
          <Button onClick={fetchData} variant="outline" className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  // ─── KPIs ─────────────────────────────────────────────────────
  const kpis = [
    {
      icon: Users, title: 'Total Responden',
      value: data.totalSurveys.toString(),
      subtitle: `Response Rate: ${data.responseRate}%`,
      trend: data.totalSurveys > 0 ? 'up' : 'down' as const,
      color: 'teal' as const,
    },
    {
      icon: TrendingDown, title: 'Pengurangan Nyeri',
      value: `${data.avgPainReduction}%`,
      subtitle: 'Kondisi Nyeri (VAS)',
      trend: data.avgPainReduction > 0 ? 'up' : 'down' as const,
      color: 'blue' as const,
    },
    {
      icon: Star, title: 'NPS Score',
      value: data.nps.score > 0 ? `+${data.nps.score}` : `${data.nps.score}`,
      subtitle: `P: ${data.nps.promoters} | D: ${data.nps.detractors}`,
      trend: data.nps.score > 0 ? 'up' : 'down' as const,
      color: 'amber' as const,
    },
    {
      icon: Heart, title: 'Kepuasan Overall',
      value: `${data.overallSatisfaction}/5`,
      subtitle: 'SERVQUAL Score',
      trend: data.overallSatisfaction >= 4 ? 'up' : 'down' as const,
      color: 'rose' as const,
    },
  ]

  const kpiColorMap: Record<string, { bg: string; iconBg: string; trendUp: string; trendDown: string }> = {
    teal: { bg: 'bg-teal-50', iconBg: 'bg-teal-600', trendUp: 'text-teal-600', trendDown: 'text-red-500' },
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-600', trendUp: 'text-teal-600', trendDown: 'text-red-500' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-500', trendUp: 'text-teal-600', trendDown: 'text-red-500' },
    rose: { bg: 'bg-rose-50', iconBg: 'bg-rose-500', trendUp: 'text-teal-600', trendDown: 'text-red-500' },
  }

  // ─── Tabs ─────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'clinical', label: 'Clinical' },
    { id: 'servqual', label: 'SERVQUAL' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'qrcode', label: 'QR Code' },
    { id: 'data', label: 'Data Survei' },
  ]

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-body)]">
      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              title="Kembali ke Beranda"
            >
              <Home className="w-4 h-4" />
            </a>
            <img src="/logo-dpems-icon.svg" alt="" className="h-7 w-7" />
            <h1 className="text-base lg:text-lg font-bold text-white tracking-tight font-[family-name:var(--font-display)]">
              DPEMS Dashboard
            </h1>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live
            </span>
          </div>
          <p className="hidden lg:block text-xs text-slate-400">
            {data.hospital?.name || "RSU Ja'far Medika Karanganyar"}
          </p>
          <div className="flex items-center gap-2">
            {/* Period + Refresh — hidden on mobile (moved to nav panel) */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="hidden lg:block text-sm bg-slate-800 border border-slate-600 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="7">7 Hari</option>
              <option value="30">30 Hari</option>
              <option value="90">90 Hari</option>
              <option value="365">1 Tahun</option>
            </select>
            <button
              onClick={fetchData}
              className="hidden lg:flex p-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE NAV PANEL ═══ */}
      <motion.div
        initial={false}
        animate={{ height: mobileNavOpen ? 'auto' : 0, opacity: mobileNavOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-slate-800/98 backdrop-blur-lg border-b border-slate-700/50 overflow-hidden"
        style={{ height: 0 }}
      >
        <div className="max-w-[1440px] mx-auto px-4 py-3 space-y-2">
          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileNavOpen(false) }}
                className={`flex flex-col items-center gap-0.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Period Selector + Refresh */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Periode</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="flex-1 text-xs bg-slate-700/80 border border-slate-600 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="7">7 Hari</option>
              <option value="30">30 Hari</option>
              <option value="90">90 Hari</option>
              <option value="365">1 Tahun</option>
            </select>
            <button
              onClick={() => { fetchData(); setMobileNavOpen(false) }}
              className="p-2 rounded-lg bg-slate-700/80 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Hospital Name */}
          <p className="text-[11px] text-slate-500 pb-0.5">
            {data.hospital?.name || "RSU Ja'far Medika Karanganyar"}
          </p>
        </div>
      </motion.div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="pt-[80px] max-w-[1440px] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* ─── KPI CARDS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon
            const c = kpiColorMap[kpi.color]
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.35 }}
                className="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.iconBg} shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {kpi.trend === 'up' ? (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 ${c.trendUp}`}>
                      ↑
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                      ↓
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight font-[family-name:var(--font-display)]">
                    {kpi.value}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{kpi.title}</p>
                  <p className="text-[11px] font-semibold mt-1 text-teal-600">{kpi.subtitle}</p>
                </div>
                <div className={`mt-3 h-1 rounded-full ${c.iconBg}`} style={{ width: '40%' }} />
              </motion.div>
            )
          })}
        </div>

        {/* ─── ALERT BAR ─── */}
        {data.recentAlerts && data.recentAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
          >
            <Bell className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                {data.recentAlerts.length} Alert Baru
              </p>
              <p className="text-xs text-amber-600 truncate">
                {data.recentAlerts[0]?.message || 'Review diperlukan'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 shrink-0 uppercase">
              {data.recentAlerts[0]?.severity || 'medium'}
            </span>
          </motion.div>
        )}

        {/* ─── TAB NAV ─── */}
        <div className="border-b border-slate-200">
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-teal-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            TAB: OVERVIEW
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  Tren Survei Harian
                </h3>
                <div className="h-64 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trendData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={TEAL} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} stroke="#94a3b8" />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="count" stroke={TEAL} fill="url(#colorCount)" strokeWidth={2} name="Survei" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* NPS Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                  <Star className="w-4 h-4 text-amber-500" />
                  NPS Distribution
                </h3>
                <div className="flex items-center gap-4 mt-3">
                  <div className="h-56 w-56 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={npsData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                          {npsData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="text-center mb-2">
                      <p className="text-3xl lg:text-4xl font-bold text-slate-800 font-[family-name:var(--font-display)]">
                        {data.nps.score > 0 ? `+${data.nps.score}` : data.nps.score}
                      </p>
                      <p className="text-xs text-slate-500">NPS Score</p>
                    </div>
                    {npsData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-slate-600">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{item.value}</span>
                          <span className="text-[11px] text-slate-400">
                            ({data.nps.total > 0 ? Math.round((item.value / data.nps.total) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top Diagnosis */}
              <div className="bg-linear-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-teal-800 text-sm font-[family-name:var(--font-display)]">Top Kondisi Pasien</p>
                    {data.topDiagnosis ? (
                      <>
                        <p className="text-teal-700 text-xs mt-1 truncate">{data.topDiagnosis.name}</p>
                        <p className="text-teal-600 text-[11px] mt-0.5">
                          {data.topDiagnosis.patientCount} pasien ({data.topDiagnosis.percentage}%) —
                          Kepuasan {data.topDiagnosis.avgSatisfaction}/5
                        </p>
                        {data.diagnosisSatisfactionData.length > 1 && (
                          <div className="mt-2 space-y-0.5">
                            {data.diagnosisSatisfactionData.slice(1, 4).map((d, i) => (
                              <p key={i} className="text-[10px] text-teal-500">
                                #{i + 2} {d.condition_type} ({d.patientCount})
                              </p>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-teal-500 text-xs mt-1">Belum ada data</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Perlu Perhatian */}
              <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-amber-800 text-sm font-[family-name:var(--font-display)]">Perlu Perhatian</p>
                    <p className="text-amber-700 text-xs mt-1">{data.worstServqualDimension.name}</p>
                    <p className="text-amber-600 text-[11px] mt-0.5">
                      Skor: {data.worstServqualDimension.score.toFixed(2)}/5 — Target: 4.2
                    </p>
                    <p className="text-amber-500 text-[11px] mt-1">
                      Rekomendasi: Fokus pada perbaikan dimensi ini untuk meningkatkan kualitas layanan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Spiritual Wellness */}
              <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-blue-800 text-sm font-[family-name:var(--font-display)]">Spiritual Wellness</p>
                    <div className="mt-2 space-y-1">
                      {spiritualData.map((s) => (
                        <div key={s.dimension} className="flex items-center justify-between text-[11px]">
                          <span className="text-blue-600">{s.dimension}</span>
                          <span className="font-bold text-blue-700">{s.score.toFixed(2)}/5</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-blue-500 text-[11px] mt-1">
                      Rata-rata: {((data.spiritualAvg.spiritualComfort + data.spiritualAvg.culturalRespect + data.spiritualAvg.facility + data.spiritualAvg.healing + data.spiritualAvg.support) / 5).toFixed(2)}/5
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* v2.0: Clarity of Role (D1-D4) */}
            {clarityData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                    <Shield className="w-4 h-4 text-teal-600" />
                    Clarity of Role (D1-D4)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pemahaman pasien tentang peran terapi adjuvan</p>
                  <div className="space-y-3 mt-4">
                    {clarityData.map((item) => (
                      <div key={item.dimension} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">{item.dimension}</span>
                          <span className={`text-sm font-bold ${item.score >= 4 ? 'text-teal-600' : 'text-amber-600'}`}>
                            {item.score.toFixed(2)} / 5
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${item.score >= 4 ? 'bg-teal-500' : 'bg-amber-500'}`}
                            style={{ width: `${(item.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loyalty & WTP */}
                <div className="space-y-6">
                  {/* Loyalty Section */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Loyalitas Pasien
                    </h3>
                    <div className="mt-4 space-y-4">
                      {data?.loyaltyData?.visitPlanDist && Object.entries(data.loyaltyData.visitPlanDist).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2">Rencana Kunjungan Ulang</p>
                          <div className="space-y-1.5">
                            {Object.entries(data.loyaltyData.visitPlanDist).sort((a, b) => b[1] - a[1]).map(([plan, count]) => {
                              const pct = data.totalSurveys > 0 ? (count / data.totalSurveys) * 100 : 0
                              return (
                                <div key={plan} className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-600 w-20 shrink-0">{plan || 'N/A'}</span>
                                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className={`h-2 rounded-full transition-all ${plan === 'Ya' ? 'bg-emerald-500' : plan === 'Tidak' ? 'bg-red-400' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-700 w-14 text-right">{count} ({pct.toFixed(0)}%)</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {data?.loyaltyData?.recommendedDist && Object.entries(data.loyaltyData.recommendedDist).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 mb-2">Sudah Merekomendasikan</p>
                          <div className="flex gap-3">
                            {Object.entries(data.loyaltyData.recommendedDist).sort((a, b) => b[1] - a[1]).map(([rec, count]) => (
                              <div key={rec} className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${rec === 'Ya' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                <span className="text-[11px] text-slate-600">{rec || 'N/A'}: </span>
                                <span className="text-[11px] font-bold text-slate-800">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Willingness to Pay */}
                  {data?.willingnessToPay !== undefined && data.willingnessToPay !== null && (
                    <div className="bg-linear-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-teal-800 text-sm font-[family-name:var(--font-display)]">Willingness to Pay</p>
                          <p className="text-2xl font-extrabold text-teal-700 mt-1 font-[family-name:var(--font-display)]">
                            {data.willingnessToPay.toFixed(1)}%
                          </p>
                          <p className="text-teal-600 text-[11px] mt-0.5">Persentase pasien bersedia membayar untuk layanan integratif</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: CLINICAL
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'clinical' && (
          <div className="space-y-6">
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pain Reduction per Diagnosis */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                  <Activity className="w-4 h-4 text-red-500" />
                  Outcome Klinis per Diagnosis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Rata-rata penurunan VAS Score (%) untuk kondisi nyeri</p>
                <div className="h-72 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[...data.diagnosisPainData].sort((a, b) => b.painReductionPct - a.painReductionPct)}
                      layout="vertical"
                      margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis type="category" dataKey="condition_type" width={160} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="painReductionPct" fill={TEAL} radius={[0, 6, 6, 0]} name="Pengurangan Nyeri (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Spiritual & Cultural Wellness Radar */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Spiritual & Cultural Wellness
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Rata-rata skor spiritual pasien (1-5)</p>
                <div className="h-72 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={spiritualData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} stroke="#64748b" />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Radar name="Skor" dataKey="score" stroke={TEAL} fill={TEAL} fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Kepuasan & Volume per Diagnosis */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                Kepuasan & Volume per Diagnosis
              </h3>
              <div className="h-72 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.diagnosisSatisfactionData} margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="condition_type" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={80} stroke="#94a3b8" />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 5]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="patientCount" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Volume Pasien" />
                    <Bar yAxisId="right" dataKey="avgSatisfaction" fill={TEAL} radius={[4, 4, 0, 0]} name="Kepuasan (1-5)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                <Users className="w-4 h-4 text-teal-600" />
                Profil Demografi Pasien
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {/* Age Distribution */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Kelompok Usia</p>
                  {Object.entries(data.demographics.ageRangeDistribution).sort((a, b) => b[1] - a[1]).map(([range, c]) => (
                    <div key={range} className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-teal-500 rounded-full h-2.5 transition-all" style={{ width: `${data.totalSurveys > 0 ? (c / data.totalSurveys) * 100 : 0}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-600 w-14 shrink-0">{range}</span>
                      <span className="text-[11px] font-bold w-6 text-right text-slate-700">{c}</span>
                    </div>
                  ))}
                </div>

                {/* Gender + Patient Type */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Gender</p>
                  {Object.entries(data.demographics.genderDistribution).map(([g, c]) => (
                    <div key={g} className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-500 rounded-full h-2.5 transition-all" style={{ width: `${data.totalSurveys > 0 ? (c / data.totalSurveys) * 100 : 0}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-600 w-16 shrink-0">{g === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      <span className="text-[11px] font-bold w-6 text-right text-slate-700">{c}</span>
                    </div>
                  ))}
                  <p className="text-xs font-semibold text-slate-700 mt-4 mb-2">Jenis Pasien</p>
                  {Object.entries(data.demographics.patientTypeDistribution).map(([t, c]) => (
                    <div key={t} className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-amber-500 rounded-full h-2.5 transition-all" style={{ width: `${data.totalSurveys > 0 ? (c / data.totalSurveys) * 100 : 0}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-600 w-16 shrink-0">{t}</span>
                      <span className="text-[11px] font-bold w-6 text-right text-slate-700">{c}</span>
                    </div>
                  ))}
                </div>

                {/* Treatments + Herbal */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Treatment Terbanyak</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.demographics.topTreatments.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
                        {t.name} <span className="font-bold text-teal-600">{t.count}</span>
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <p className="text-[11px] text-teal-700">
                      <span className="font-semibold">Herbal Prescribed:</span>
                      {data.demographics.conditionTypeDistribution && (
                        <span className="ml-1">
                          Data tersedia dalam {Object.keys(data.demographics.conditionTypeDistribution).length} kategori diagnosis
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* v2.0: Herbal Service Section */}
            {herbData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Herbal Service Quality
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Penilaian pasien terhadap layanan herbal</p>
                  <div className="h-56 mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={herbData} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} stroke="#64748b" />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                        <Radar name="Skor" dataKey="score" stroke="#059669" fill="#059669" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  {data?.herbAvg && (
                    <div className="mt-2 text-center">
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        Herbal Prescribed Rate: {data.herbAvg.prescribedPct.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Clarity D1-D4 (Clinical) */}
                {clarityData.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                      <Shield className="w-4 h-4 text-teal-600" />
                      Clarity of Role (D1-D4)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Skor pemahaman pasien (1-5)</p>
                    <div className="h-56 mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={clarityData} cx="50%" cy="50%" outerRadius="70%">
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9 }} stroke="#64748b" />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                          <Radar name="Skor" dataKey="score" stroke={TEAL} fill={TEAL} fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* v2.0: Outcome Cards (Barthel / ISI / Wellness) */}
            {data?.outcomeAvg && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-teal-800 text-sm font-[family-name:var(--font-display)]">Barthel Index</p>
                      <p className="text-2xl font-extrabold text-teal-700 mt-1 font-[family-name:var(--font-display)]">
                        {data.outcomeAvg.barthelIndex.toFixed(1)}
                      </p>
                      <p className="text-teal-600 text-[11px] mt-0.5">Rata-rata skor kemampuan aktivitas harian (0-100)</p>
                      <div className="mt-2 h-1.5 bg-teal-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600 rounded-full" style={{ width: `${data.outcomeAvg.barthelIndex}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-amber-800 text-sm font-[family-name:var(--font-display)]">ISI Score</p>
                      <p className="text-2xl font-extrabold text-amber-700 mt-1 font-[family-name:var(--font-display)]">
                        {data.outcomeAvg.isiScore.toFixed(1)}
                      </p>
                      <p className="text-amber-600 text-[11px] mt-0.5">Insomnia Severity Index (0-28)</p>
                      <div className="mt-2 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(data.outcomeAvg.isiScore / 28) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-emerald-800 text-sm font-[family-name:var(--font-display)]">Wellness Score</p>
                      <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-[family-name:var(--font-display)]">
                        {data.outcomeAvg.wellnessScore.toFixed(1)}
                      </p>
                      <p className="text-emerald-600 text-[11px] mt-0.5">WHOQOL-BREF wellness (1-5)</p>
                      <div className="mt-2 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(data.outcomeAvg.wellnessScore / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: SERVQUAL
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'servqual' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  SERVQUAL Radar Chart
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Skor rata-rata 5 dimensi (1-5)</p>
                <div className="h-72 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={servqualData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} stroke="#64748b" />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Radar name="Skor" dataKey="score" stroke={TEAL} fill={TEAL} fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-display)]">
                  SERVQUAL Detail per Dimensi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Target minimal: 4.2/5</p>
                <div className="space-y-4 mt-4">
                  {servqualData.map((item) => {
                    const belowTarget = item.score < 4.2
                    return (
                      <div key={item.dimension} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">{item.dimension}</span>
                          <span className={`text-sm font-bold ${belowTarget ? 'text-amber-600' : 'text-teal-600'}`}>
                            {item.score.toFixed(2)} / 5
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all ${belowTarget ? 'bg-amber-500' : 'bg-teal-500'}`}
                            style={{ width: `${(item.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800">Overall SERVQUAL</span>
                      <span className={`text-sm font-bold ${data.servqual.overall < 4.2 ? 'text-amber-600' : 'text-teal-600'}`}>
                        {data.servqual.overall.toFixed(2)} / 5
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mt-1.5">
                      <div
                        className={`h-3 rounded-full transition-all ${data.servqual.overall < 4.2 ? 'bg-amber-500' : 'bg-teal-500'}`}
                        style={{ width: `${(data.servqual.overall / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Box */}
            {servqualData.some(d => d.score < 4.2) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Dimensi di Bawah Target</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {servqualData.filter(d => d.score < 4.2).map(d => `${d.dimension} (${d.score.toFixed(2)})`).join(', ')} — perlu perbaikan untuk mencapai target 4.2/5.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: FEEDBACK
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {/* Search + Filter Toggle */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari testimoni, pengalaman terbaik, atau saran perbaikan..."
                    value={fbSearch}
                    onChange={(e) => setFbSearch(e.target.value)}
                    onFocus={() => setFbFilterOpen(true)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
                  />
                </div>
                <button
                  onClick={() => setFbFilterOpen(!fbFilterOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
                    fbFilterOpen || fbNpsCategory || fbCondition || fbDateFrom || fbDateTo
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {(fbFilterOpen || fbNpsCategory || fbCondition || fbDateFrom || fbDateTo) && (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Collapsible Filter Panel */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  fbFilterOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">Kategori NPS</label>
                    <select
                      value={fbNpsCategory}
                      onChange={(e) => setFbNpsCategory(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    >
                      <option value="">Semua</option>
                      <option value="promoter">Promoter (9-10)</option>
                      <option value="passive">Passive (7-8)</option>
                      <option value="detractor">Detractor (0-6)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">Kondisi/Diagnosis</label>
                    <select
                      value={fbCondition}
                      onChange={(e) => setFbCondition(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    >
                      <option value="">Semua Kondisi</option>
                      {CONDITION_TYPES.map((ct) => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">Dari Tanggal</label>
                    <input
                      type="date"
                      value={fbDateFrom}
                      onChange={(e) => setFbDateFrom(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">Sampai Tanggal</label>
                    <input
                      type="date"
                      value={fbDateTo}
                      onChange={(e) => setFbDateTo(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                </div>
                {(fbNpsCategory || fbCondition || fbDateFrom || fbDateTo || fbSearch) && (
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={resetFbFilters}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" /> Reset Filter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Cards */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Belum ada feedback</p>
                </div>
              ) : (
                filteredFeedback.map((fb, i) => {
                  const isPositive = fb.npsScore !== null && fb.npsScore !== undefined && fb.npsScore >= 9
                  const isNegative = fb.npsScore !== null && fb.npsScore !== undefined && fb.npsScore <= 6
                  const borderColor = isPositive ? 'border-l-emerald-500' : isNegative ? 'border-l-red-500' : 'border-l-amber-500'
                  const bgColor = isPositive ? 'bg-emerald-50/50' : isNegative ? 'bg-red-50/50' : 'bg-white'

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`${bgColor} border border-slate-200 border-l-4 ${borderColor} rounded-xl p-4 space-y-2`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {(i + 1).toString().padStart(2, '0')}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-700">{fb.unitName}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(fb.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(fb as unknown as Record<string, string>).conditionType && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {(fb as unknown as Record<string, string>).conditionType}
                            </span>
                          )}
                          {fb.npsScore !== null && fb.npsScore !== undefined && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isPositive ? 'bg-emerald-100 text-emerald-700' : isNegative ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              NPS {fb.npsScore}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      {fb.testimonial && (
                        <p className="text-sm text-slate-700 leading-relaxed pl-10">
                          &ldquo;{fb.testimonial}&rdquo;
                        </p>
                      )}
                      {fb.bestExperience && (
                        <p className="text-sm text-slate-600 pl-10">
                          <span className="text-emerald-600 font-medium text-xs">Pengalaman Terbaik: </span>
                          {fb.bestExperience}
                        </p>
                      )}
                      {(fb.suggestions || fb.improvementSuggestion) && (
                        <div className="bg-blue-50/60 rounded-lg p-3 ml-10">
                          <p className="text-xs text-blue-800 font-medium">Saran:</p>
                          <p className="text-sm text-blue-700 mt-0.5">{fb.suggestions || fb.improvementSuggestion}</p>
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB: QR CODE — delegated to QRCodeGenerator component
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'qrcode' && <QRCodeGenerator data={data} />}

        {/* ═══════════════════════════════════════════════════════
            TAB: DATA SURVEI
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Search + Filter Toggle + Export */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari pasien, feedback..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setDataFilterOpen(true)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
                  />
                </div>
                <button
                  onClick={() => setDataFilterOpen(!dataFilterOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
                    dataFilterOpen || hasSurveysFilters
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
                <a href={getExportUrl('excel')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Excel</span>
                </a>
                <a href={getExportUrl('pdf')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </a>
              </div>

              {/* Collapsible Filter Panel */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  dataFilterOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">Dari Tanggal</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">Sampai Tanggal</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">Gender</label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    >
                      <option value="">Semua</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">Kondisi/Diagnosis</label>
                    <select
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    >
                      <option value="">Semua Kondisi</option>
                      {CONDITION_TYPES.map((ct) => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">NPS Min (0-10)</label>
                    <input
                      type="number"
                      value={npsMin}
                      onChange={(e) => setNpsMin(e.target.value)}
                      placeholder="0"
                      min={0}
                      max={10}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium mb-1 block">NPS Max (0-10)</label>
                    <input
                      type="number"
                      value={npsMax}
                      onChange={(e) => setNpsMax(e.target.value)}
                      placeholder="10"
                      min={0}
                      max={10}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={resetSurveysFilters}
                      className="w-full text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reset Semua Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                  <Database className="w-4 h-4 text-teal-600" />
                  Data Survei Individual
                </h3>
                {surveysData && (
                  <span className="text-[11px] text-slate-500">{surveysData.total} total hasil</span>
                )}
              </div>

              <div className="p-0">
                {surveysLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <RefreshCw className="w-5 h-5 text-teal-500 animate-spin" />
                    <span className="ml-2 text-sm text-slate-500">Memuat data...</span>
                  </div>
                ) : !surveysData || surveysData.surveys.length === 0 ? (
                  <div className="text-center py-16">
                    <Database className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Tidak ada data survei ditemukan</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-slate-50 border-b border-slate-200 text-left">
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 w-10">#</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Tanggal</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Usia</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Gender</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Diagnosis</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">NPS</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Nyeri Sblm</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Nyeri Ssd</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">SERVQUAL</th>
                            <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {surveysData.surveys.map((s, i) => {
                            const no = (surveyPage - 1) * surveysData.pageSize + i + 1
                            const isPromoter = s.nps_score !== null && s.nps_score >= 9
                            const isDetractor = s.nps_score !== null && s.nps_score <= 6
                            const overallServ = s.tangibles && s.reliability && s.responsiveness && s.assurance && s.empathy
                              ? ((s.tangibles + s.reliability + s.responsiveness + s.assurance + s.empathy) / 5).toFixed(1)
                              : null
                            const isExpanded = expandedRow === s.id

                            return (
                              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td colSpan={10} className="p-0">
                                  {/* Main Row */}
                                  <button
                                    onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                                    className="w-full text-left px-3 py-3 flex items-center gap-0 cursor-pointer"
                                  >
                                    <span className="font-medium text-slate-400 w-10 text-xs shrink-0">{no}</span>
                                    <span className="text-slate-700 text-xs w-24 shrink-0">
                                      {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                                    </span>
                                    <span className="text-slate-600 text-xs w-16 shrink-0">{s.age_range || '-'}</span>
                                    <span className="text-slate-600 text-xs w-14 shrink-0">
                                      {s.gender === 'L' ? 'L' : s.gender === 'P' ? 'P' : '-'}
                                    </span>
                                    <span className="text-slate-600 text-xs flex-1 min-w-0 truncate">
                                      {s.condition_type || '-'}
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-10 text-center shrink-0 ${
                                      isPromoter ? 'bg-emerald-100 text-emerald-700' : isDetractor ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                      {s.nps_score ?? '-'}
                                    </span>
                                    <span className="text-slate-500 text-xs w-14 text-center shrink-0">
                                      {s.pain_level_before ?? '-'}
                                    </span>
                                    <span className="text-slate-500 text-xs w-14 text-center shrink-0">
                                      {s.pain_level_after ?? '-'}
                                    </span>
                                    <span className={`text-xs font-bold w-16 text-center shrink-0 ${
                                      overallServ && parseFloat(overallServ) >= 4 ? 'text-teal-600' : overallServ && parseFloat(overallServ) >= 3 ? 'text-amber-600' : 'text-red-600'
                                    }`}>
                                      {overallServ ? `${overallServ}/5` : '-'}
                                    </span>
                                    <span className="w-16 flex justify-center shrink-0">
                                      <Eye className="w-4 h-4 text-slate-400" />
                                    </span>
                                  </button>

                                  {/* Expanded Detail */}
                                  <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                      isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    <div className="px-3 pb-4 pt-1">
                                      <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                                        {/* Demographics Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                          <div>
                                            <span className="text-[11px] text-slate-400 block">Pendidikan</span>
                                            <span className="text-xs font-medium text-slate-700">{s.education || '-'}</span>
                                          </div>
                                          <div>
                                            <span className="text-[11px] text-slate-400 block">Pekerjaan</span>
                                            <span className="text-xs font-medium text-slate-700">{s.occupation || '-'}</span>
                                          </div>
                                          <div>
                                            <span className="text-[11px] text-slate-400 block">Jenis Pasien</span>
                                            <span className="text-xs font-medium text-slate-700">{s.patient_type || '-'}</span>
                                          </div>
                                          <div>
                                            <span className="text-[11px] text-slate-400 block">Kunjungan</span>
                                            <span className="text-xs font-medium text-slate-700">{s.visit_count || '-'}</span>
                                          </div>
                                          <div>
                                            <span className="text-[11px] text-slate-400 block">Herbal</span>
                                            <span className="text-xs font-medium text-slate-700">{s.herbal_prescribed ? 'Ya' : 'Tidak'}</span>
                                          </div>
                                          <div>
                                            <span className="text-[11px] text-slate-400 block">Perubahan Kondisi</span>
                                            <span className="text-xs font-medium text-slate-700">{s.condition_change || '-'}</span>
                                          </div>
                                          <div>
                                            <span className="text-[11px] text-slate-400 block">Rencana Kunjungan</span>
                                            <span className="text-xs font-medium text-slate-700">{s.visit_plan || '-'}</span>
                                          </div>
                                          <div>
                                            <span className="text-[11px] text-slate-400 block">Sudah Rekomendasi</span>
                                            <span className="text-xs font-medium text-slate-700">{s.has_recommended || '-'}</span>
                                          </div>
                                        </div>

                                        <div className="border-t border-slate-200 pt-3">
                                          <span className="text-[11px] text-slate-400 block mb-2">SERVQUAL Scores</span>
                                          <div className="flex flex-wrap gap-2">
                                            {[
                                              { label: 'Tangibles', value: s.tangibles },
                                              { label: 'Reliability', value: s.reliability },
                                              { label: 'Responsiveness', value: s.responsiveness },
                                              { label: 'Assurance', value: s.assurance },
                                              { label: 'Empathy', value: s.empathy },
                                            ].map((dim) => (
                                              <span
                                                key={dim.label}
                                                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                                  dim.value !== null && dim.value >= 4
                                                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                                    : dim.value !== null && dim.value >= 3
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}
                                              >
                                                {dim.label}: {dim.value ?? '-'}
                                              </span>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Testimonial / Best Experience / Suggestion */}
                                        {(s.best_experience || s.improvement_suggestion || s.testimonial) && (
                                          <div className="border-t border-slate-200 pt-3 space-y-2">
                                            {s.best_experience && (
                                              <div>
                                                <span className="text-[11px] text-teal-600 font-semibold block">Pengalaman Terbaik:</span>
                                                <p className="text-xs text-slate-700 mt-0.5">{s.best_experience}</p>
                                              </div>
                                            )}
                                            {s.improvement_suggestion && (
                                              <div>
                                                <span className="text-[11px] text-amber-600 font-semibold block">Saran Perbaikan:</span>
                                                <p className="text-xs text-slate-700 mt-0.5">{s.improvement_suggestion}</p>
                                              </div>
                                            )}
                                            {s.testimonial && (
                                              <div>
                                                <span className="text-[11px] text-blue-600 font-semibold block">Testimoni:</span>
                                                <p className="text-xs text-slate-700 mt-0.5 italic">&ldquo;{s.testimonial}&rdquo;</p>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* v2.0: H1 Liked / H2 Suggested */}
                                        {(s.h1_liked && s.h1_liked.length > 0) || (s.h2_suggested && s.h2_suggested.length > 0) ? (
                                          <div className="border-t border-slate-200 pt-3 space-y-2">
                                            {s.h1_liked && s.h1_liked.length > 0 && (
                                              <div>
                                                <span className="text-[11px] text-teal-600 font-semibold block">H1 - Yang Disukai:</span>
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                  {s.h1_liked.map((item, idx) => (
                                                    <span key={idx} className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">{item}</span>
                                                  ))}
                                                  {s.h1_liked_other && (
                                                    <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">{s.h1_liked_other}</span>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            {s.h2_suggested && s.h2_suggested.length > 0 && (
                                              <div>
                                                <span className="text-[11px] text-amber-600 font-semibold block">H2 - Yang Disarankan:</span>
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                  {s.h2_suggested.map((item, idx) => (
                                                    <span key={idx} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{item}</span>
                                                  ))}
                                                  {s.h2_suggested_other && (
                                                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{s.h2_suggested_other}</span>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ) : null}

                                        {/* v2.0: Clarity D1-D4 */}
                                        {(s.info_acupuncture_support || s.info_understanding || s.info_sufficient || s.info_comfortable_asking) && (
                                          <div className="border-t border-slate-200 pt-3">
                                            <span className="text-[11px] text-slate-400 block mb-2">Clarity of Role (D1-D4)</span>
                                            <div className="flex flex-wrap gap-2">
                                              {[
                                                { label: 'D1 Dukungan', value: s.info_acupuncture_support },
                                                { label: 'D2 Pemahaman', value: s.info_understanding },
                                                { label: 'D3 Kecukupan', value: s.info_sufficient },
                                                { label: 'D4 Nyaman', value: s.info_comfortable_asking },
                                              ].map((dim) => (
                                                <span
                                                  key={dim.label}
                                                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                                    dim.value !== null && dim.value >= 4
                                                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                                      : dim.value !== null && dim.value >= 3
                                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                  }`}
                                                >
                                                  {dim.label}: {dim.value ?? '-'}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* v2.0: Spiritual F1-F9 */}
                                        {(s.spiritual_salam_doa || s.spiritual_islam_respect || s.spiritual_facility || s.spiritual_healing || s.spiritual_support || s.f6_doa_kesembuhan || s.f7_keluarga_support || s.f8_keikhlasan || s.f9_kedekatan_tuhan) && (
                                          <div className="border-t border-slate-200 pt-3">
                                            <span className="text-[11px] text-slate-400 block mb-2">Spiritual (F1-F9)</span>
                                            <div className="flex flex-wrap gap-2">
                                              {[
                                                { label: 'F1 Salam Doa', value: s.spiritual_salam_doa },
                                                { label: 'F2 Respek Islam', value: s.spiritual_islam_respect },
                                                { label: 'F3 Fasilitas', value: s.spiritual_facility },
                                                { label: 'F4 Healing', value: s.spiritual_healing },
                                                { label: 'F5 Support', value: s.spiritual_support },
                                                { label: 'F6 Doa Kesembuhan', value: s.f6_doa_kesembuhan },
                                                { label: 'F7 Keluarga', value: s.f7_keluarga_support },
                                                { label: 'F8 Keikhlasan', value: s.f8_keikhlasan },
                                                { label: 'F9 Kedekatan Tuhan', value: s.f9_kedekatan_tuhan },
                                              ].map((dim) => (
                                                <span
                                                  key={dim.label}
                                                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                                    dim.value !== null && dim.value >= 4
                                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                      : dim.value !== null && dim.value >= 3
                                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                  }`}
                                                >
                                                  {dim.label}: {dim.value ?? '-'}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* v2.0: Herbal scores */}
                                        {(s.herb_explanation || s.herb_usage_guide || s.herb_safety_trust || s.herb_availability || s.herb_affordability || s.herb_pharmacist) && (
                                          <div className="border-t border-slate-200 pt-3">
                                            <span className="text-[11px] text-slate-400 block mb-2">Herbal Service</span>
                                            <div className="flex flex-wrap gap-2">
                                              {[
                                                { label: 'Penjelasan', value: s.herb_explanation },
                                                { label: 'Panduan', value: s.herb_usage_guide },
                                                { label: 'Kepercayaan', value: s.herb_safety_trust },
                                                { label: 'Ketersediaan', value: s.herb_availability },
                                                { label: 'Terjangkau', value: s.herb_affordability },
                                                { label: 'Apoteker', value: s.herb_pharmacist },
                                              ].map((dim) => (
                                                <span
                                                  key={dim.label}
                                                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                                    dim.value !== null && dim.value >= 4
                                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                      : dim.value !== null && dim.value >= 3
                                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                  }`}
                                                >
                                                  {dim.label}: {dim.value ?? '-'}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {surveysData.totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                        <span className="text-xs text-slate-500">
                          Halaman {surveyPage} dari {surveysData.totalPages} ({surveysData.total} total)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            disabled={surveyPage <= 1}
                            onClick={() => fetchSurveys(surveyPage - 1)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                          </button>
                          <span className="text-sm font-medium px-3 text-slate-700">{surveyPage}</span>
                          <button
                            disabled={surveyPage >= surveysData.totalPages}
                            onClick={() => fetchSurveys(surveyPage + 1)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}