'use client'

import { useState, useEffect } from 'react'
import {
  Users, TrendingDown, Star, Heart, Activity,
  BarChart3, RefreshCw, Shield, AlertTriangle, CheckCircle2,
  Bell, Home, Menu, X,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Area, AreaChart, Legend, Tooltip
} from 'recharts'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"

import type { DashboardData } from '@/lib/types'
import { TEAL, TEAL_LIGHT, AMBER, RED, BLUE, VIOLET, EMERALD, NPS_COLORS } from './lib/constants'

import { useDashboardData } from './hooks/useDashboardData'
import { useSurveys } from './hooks/useSurveys'
import { useRealtime } from './hooks/useRealtime'
import ChartTooltip from './components/ChartTooltip'
import KPICard, { type KpiItem } from './components/KPICard'
import QRCodeGenerator from './components/QRCodeGenerator'
import FeedbackPanel from './components/FeedbackPanel'
import SurveyTable from './components/SurveyTable'

// ─── Main Component ─────────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod] = useState('30')
  const [activeTab, setActiveTab] = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const { data, loading, fetchError, refetch } = useDashboardData(period)
  const surveys = useSurveys(period)

  // Realtime subscription
  useRealtime(refetch)

  // Fetch surveys when tab changes to data
  useEffect(() => {
    if (activeTab === 'data') {
      surveys.fetchSurveys(1)
    }
  }, [activeTab, surveys.fetchSurveys])

  // Also fetch surveys when filters change
  useEffect(() => {
    surveys.fetchSurveys(1)
  }, [surveys.filters])

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

  // v2.0: Spiritual 9 Dimensions
  const spiritual9Data = data?.spiritual9Avg ? [
    { dimension: 'F1 Adab Islami', score: data.spiritual9Avg.f1AdabIslami },
    { dimension: 'F2 Gender Concord.', score: data.spiritual9Avg.f2GenderConcordance },
    { dimension: 'F3 Prayer Accom.', score: data.spiritual9Avg.f3PrayerAccommodation },
    { dimension: 'F4 Halal Assurance', score: data.spiritual9Avg.f4HalalAssurance },
    { dimension: 'F5 Tibb Nabawi', score: data.spiritual9Avg.f5TibbNabawi },
    { dimension: 'F6 Spiritual Act.', score: data.spiritual9Avg.f6SpiritualActivation },
    { dimension: 'F7 Holistic Peace', score: data.spiritual9Avg.f7HolisticPeace },
    { dimension: 'F8 Spiritual Comm.', score: data.spiritual9Avg.f8SpiritualCommunication },
    { dimension: 'F9 Kedekatan Tuhan', score: data.spiritual9Avg.f9Reversed },
  ] : spiritualData

  // v2.0: Clarity of Role (D1-D4)
  const clarityData = data?.clarityAvg ? [
    { dimension: 'D1 Clarity Role', score: data.clarityAvg.d1ClarityRole },
    { dimension: 'D2 Penjelasan', score: data.clarityAvg.d2ClarityExplanation },
    { dimension: 'D3 Nyaman', score: data.clarityAvg.d3ClarityComfortable },
    { dimension: 'D4 Spesialis', score: data.clarityAvg.d4ClaritySpecialist },
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-red-600 font-medium">{fetchError}</p>
          <Button onClick={refetch} variant="outline" className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" /> Coba Lagi
          </Button>
          <div className="text-left bg-slate-100 rounded-xl p-4 mt-4 text-xs text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-700 text-sm mb-2">Debug Checklist:</p>
            <p>1. Pastikan file <code className="bg-slate-200 px-1 rounded">.env.local</code> berisi variabel Supabase</p>
            <p>2. Cek: <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></p>
            <p>3. Cek: <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></p>
            <p>4. Cek: <code className="bg-slate-200 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code></p>
            <p>5. Pastikan schema sudah di-apply di Supabase SQL Editor</p>
            <p>6. Buka DevTools (F12) → Console → lihat detail error</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  // ─── KPIs ─────────────────────────────────────────────────────
  const kpis: KpiItem[] = [
    {
      icon: Users, title: 'Total Responden',
      value: data.totalSurveys.toString(),
      subtitle: `Response Rate: ${data.responseRate}%`,
      trend: data.totalSurveys > 0 ? 'up' : 'down',
      color: 'teal',
    },
    {
      icon: TrendingDown, title: 'Pengurangan Nyeri',
      value: `${data.avgPainReduction}%`,
      subtitle: 'Kondisi Nyeri (VAS)',
      trend: data.avgPainReduction > 0 ? 'up' : 'down',
      color: 'blue',
    },
    {
      icon: Star, title: 'NPS Score',
      value: data.nps.score > 0 ? `+${data.nps.score}` : `${data.nps.score}`,
      subtitle: `P: ${data.nps.promoters} | D: ${data.nps.detractors}`,
      trend: data.nps.score > 0 ? 'up' : 'down',
      color: 'amber',
    },
    {
      icon: Heart, title: 'Kepuasan Overall',
      value: `${data.overallSatisfaction}/5`,
      subtitle: 'SERVQUAL Score',
      trend: data.overallSatisfaction >= 4 ? 'up' : 'down',
      color: 'rose',
    },
  ]

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
              onClick={refetch}
              className="hidden lg:flex p-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
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
              onClick={() => { refetch(); setMobileNavOpen(false) }}
              className="p-2 rounded-lg bg-slate-700/80 border border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 pb-0.5">
            {data.hospital?.name || "RSU Ja'far Medika Karanganyar"}
          </p>
        </div>
      </motion.div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="pt-[80px] max-w-[1440px] mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* ─── KPI CARDS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {kpis.map((kpi, idx) => (
            <KPICard key={kpi.title} kpi={kpi} index={idx} />
          ))}
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

            {/* v2.0: Clinical Outcome Cards — Barthel, ISI, Wellness */}
            {data?.clinicalData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Barthel Index */}
                <div className="bg-linear-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-teal-800 text-sm font-[family-name:var(--font-display)]">Barthel Index</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-extrabold text-teal-700 font-[family-name:var(--font-display)]">
                          {data.clinicalData.barthel.avgCurrent.toFixed(1)}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          data.clinicalData.barthel.level === 'Ringan' ? 'bg-teal-200 text-teal-800' :
                          data.clinicalData.barthel.level === 'Sedang' ? 'bg-amber-200 text-amber-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {data.clinicalData.barthel.level}
                        </span>
                      </div>
                      <p className="text-teal-600 text-[11px] mt-0.5">
                        {data.clinicalData.barthel.respondentCount} responden | Avg First: {data.clinicalData.barthel.avgFirst.toFixed(1)}
                      </p>
                      <p className="text-teal-600 text-[11px]">
                        Improvement: {data.clinicalData.barthel.improvementPct > 0 ? '+' : ''}{data.clinicalData.barthel.improvementPct}%
                      </p>
                      <div className="mt-2 h-1.5 bg-teal-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600 rounded-full" style={{ width: `${data.clinicalData.barthel.avgCurrent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ISI Score */}
                <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-amber-800 text-sm font-[family-name:var(--font-display)]">ISI Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-extrabold text-amber-700 font-[family-name:var(--font-display)]">
                          {data.clinicalData.isi.avgScore.toFixed(1)}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          data.clinicalData.isi.severity === 'Tidak Ada Insomnia' ? 'bg-emerald-200 text-emerald-800' :
                          data.clinicalData.isi.severity === 'Subklinis' ? 'bg-amber-200 text-amber-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {data.clinicalData.isi.severity}
                        </span>
                      </div>
                      <p className="text-amber-600 text-[11px] mt-0.5">
                        {data.clinicalData.isi.respondentCount} responden | Insomnia Severity Index (0-28)
                      </p>
                      <div className="mt-2 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(data.clinicalData.isi.avgScore / 28) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wellness */}
                <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-emerald-800 text-sm font-[family-name:var(--font-display)]">Wellness Score</p>
                      <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-[family-name:var(--font-display)]">
                        {data.clinicalData.wellness.avgScore.toFixed(1)}
                      </p>
                      <p className="text-emerald-600 text-[11px] mt-0.5">
                        {data.clinicalData.wellness.respondentCount} responden | WHOQOL-BREF (1-5)
                      </p>
                      <div className="mt-2 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(data.clinicalData.wellness.avgScore / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* v2.0: Spiritual 9D + Clarity + Loyalty + WTP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spiritual 9D Radar */}
              {spiritual9Data.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Spiritual 9 Dimensions (F1-F9)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Rata-rata skor spiritual pasien (1-5)</p>
                  <div className="h-72 mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={spiritual9Data} cx="50%" cy="50%" outerRadius="75%">
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} stroke="#64748b" />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                        <Radar name="Skor" dataKey="score" stroke={BLUE} fill={BLUE} fillOpacity={0.15} strokeWidth={2} />
                        {data?.spiritual9Avg && (
                          <Radar name="F9 (reversed)" dataKey="score" stroke={VIOLET} fill={VIOLET} fillOpacity={0.05} strokeWidth={1} />
                        )}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  {data?.spiritual9Avg && (
                    <div className="mt-2 flex items-center gap-2 justify-center">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: VIOLET }} />
                      <span className="text-[11px] text-slate-500">F9 Kedekatan Tuhan (reverse-coded): {data.spiritual9Avg.f9Reversed.toFixed(2)}/5</span>
                    </div>
                  )}
                </div>
              )}

              {/* Clarity of Role + Loyalty */}
              <div className="space-y-6">
                {/* Clarity D1-D4 */}
                {clarityData.length > 0 && (
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
                )}

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
                    {data?.loyaltyData?.hasRecommendedDist && Object.entries(data.loyaltyData.hasRecommendedDist).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-2">Sudah Merekomendasikan</p>
                        <div className="flex gap-3">
                          {Object.entries(data.loyaltyData.hasRecommendedDist).sort((a, b) => b[1] - a[1]).map(([rec, count]) => (
                            <div key={rec} className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${rec === 'Ya' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                              <span className="text-[11px] text-slate-600">{rec || 'N/A'}: </span>
                              <span className="text-[11px] font-bold text-slate-800">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data?.loyaltyData?.recommendationCountDist && Object.entries(data.loyaltyData.recommendationCountDist).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-2">Jumlah Rekomendasi</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(data.loyaltyData.recommendationCountDist).sort((a, b) => b[1] - a[1]).map(([count, num]) => (
                            <span key={count} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                              {count} orang: {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* WTP Section */}
                {data?.wtpData && (
                  <div className="bg-linear-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-teal-800 text-sm font-[family-name:var(--font-display)]">Willingness to Pay</p>
                        <p className="text-2xl font-extrabold text-teal-700 mt-1 font-[family-name:var(--font-display)]">
                          {data.wtpData.respondentCount > 0 ? `Rp ${data.wtpData.avgCostToday.toFixed(0)}` : '-'}
                        </p>
                        <p className="text-teal-600 text-[11px] mt-0.5">
                          Avg cost today ({data.wtpData.respondentCount} responden)
                        </p>
                        {Object.entries(data.wtpData.increase20Dist).length > 0 && (
                          <div className="mt-2">
                            <p className="text-[11px] font-semibold text-teal-700 mb-1">Bersedia Bayar +20%?</p>
                            <div className="flex gap-2">
                              {Object.entries(data.wtpData.increase20Dist).sort((a, b) => b[1] - a[1]).map(([val, cnt]) => (
                                <span key={val} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  val === 'Ya' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                                }`}>
                                  {val}: {cnt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {Object.entries(data.wtpData.packageInterestDist).length > 0 && (
                          <div className="mt-2">
                            <p className="text-[11px] font-semibold text-teal-700 mb-1">Minat Paket</p>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(data.wtpData.packageInterestDist).map(([val, cnt]) => (
                                <span key={val} className="text-[10px] bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full font-medium">
                                  {val}: {cnt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                        Herbal Prescribed Rate: {data.herbAvg.prescribedPct.toFixed(1)}% ({data.herbAvg.prescribedCount} pasien)
                      </span>
                    </div>
                  )}
                </div>

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

            {/* Outcome Cards (backward compat) */}
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
        {activeTab === 'feedback' && <FeedbackPanel data={data} />}

        {/* ═══════════════════════════════════════════════════════
            TAB: QR CODE
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'qrcode' && <QRCodeGenerator data={data} />}

        {/* ═══════════════════════════════════════════════════════
            TAB: DATA SURVEI
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'data' && (
          <SurveyTable
            surveysData={surveys.surveysData}
            surveysLoading={surveys.surveysLoading}
            fetchSurveys={surveys.fetchSurveys}
            filters={surveys.filters}
            setFilter={surveys.setFilter}
            resetFilters={surveys.resetFilters}
            hasFilters={surveys.hasFilters}
            expandedRow={surveys.expandedRow}
            setExpandedRow={surveys.setExpandedRow}
            dataFilterOpen={surveys.dataFilterOpen}
            setDataFilterOpen={surveys.setDataFilterOpen}
            getExportUrl={surveys.getExportUrl}
          />
        )}
      </main>
    </div>
  )
}