'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Heart,
  BarChart3,
  Users,
  Star,
  ClipboardList,
  QrCode,
  Clock,
  MonitorDot,
  FileText,
  Route,
  Sparkles,
  ArrowRight,
  Cross,
  Menu,
  X,
  TrendingUp,
  Layers,
  Check,
  Lock,
  MessageSquareHeart,
  BadgeDollarSign,
  Leaf,
  Brain,
  ShieldCheck,
  Zap,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════════
   CONSTANTS & DESIGN TOKENS
   ════════════════════════════════════════════════════════════════════ */

const TEAL = {
  deep: '#0F7A6E',
  medium: '#14B8A6',
  bright: '#2DD4BF',
  light: '#5EEAD4',
  lighter: '#99F6E4',
  lightest: '#CCFBF1',
}

const DARK = {
  950: '#030712',
  900: '#0B1120',
  800: '#111827',
  700: '#1F2937',
}

const SLATE = {
  600: '#475569',
  500: '#64748B',
  400: '#94A3B8',
  300: '#CBD5E1',
  200: '#E2E8F0',
  100: '#F1F5F9',
  50: '#F8FAFC',
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

/* ════════════════════════════════════════════════════════════════════
   HOOKS
   ════════════════════════════════════════════════════════════════════ */

function useCounter(
  target: number,
  inView: boolean,
  duration = 1500,
  decimals = 0
) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target
      setValue(current)
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [inView, target, duration])

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value)
}

/* ════════════════════════════════════════════════════════════════════
   ANIMATION HELPERS
   ════════════════════════════════════════════════════════════════════ */

function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  )
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
}

/* ════════════════════════════════════════════════════════════════════
   SECTION WRAPPER
   ════════════════════════════════════════════════════════════════════ */

function Section({
  children,
  className,
  id,
  style,
}: {
  children: React.ReactNode
  className?: string
  id?: string
  style?: React.CSSProperties
}) {
  return (
    <section id={id} className={`w-full py-20 md:py-28 ${className || ''}`} style={style}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════
   1. NAVBAR
   ════════════════════════════════════════════════════════════════════ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(3, 7, 18, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(20, 184, 166, 0.1)'
          : '1px solid transparent',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo-dpems.svg"
              alt="DPEMS Logo"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Fitur', href: '#fitur' },
              { label: 'Cara Kerja', href: '#cara-kerja' },
              { label: 'Metodologi', href: '#metodologi' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: SLATE[300] }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = SLATE[300])}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTAs + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/survey/consent"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: SLATE[300] }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = SLATE[300])}
            >
              Isi Survei
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-200 hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${TEAL.deep}, ${TEAL.medium})`,
                boxShadow: `0 2px 12px rgba(15, 122, 110, 0.3)`,
              }}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <button
              className="flex md:hidden items-center justify-center h-9 w-9 rounded-lg transition-colors"
              style={{ color: SLATE[300] }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 pt-2 space-y-1">
                {[
                  { label: 'Fitur', href: '#fitur' },
                  { label: 'Cara Kerja', href: '#cara-kerja' },
                  { label: 'Metodologi', href: '#metodologi' },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium rounded-lg"
                    style={{ color: SLATE[300] }}
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  href="/survey/consent"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium rounded-lg"
                  style={{ color: TEAL.light }}
                >
                  Isi Survei
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold rounded-lg text-white"
                  style={{
                    background: `linear-gradient(135deg, ${TEAL.deep}, ${TEAL.medium})`,
                  }}
                >
                  Dashboard Analitik
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

/* ════════════════════════════════════════════════════════════════════
   2. HERO
   ════════════════════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <header
      className="relative overflow-hidden"
      style={{ backgroundColor: DARK[950], minHeight: '100vh' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Radial mesh gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 40%, rgba(15, 122, 110, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse 40% 30% at 20% 60%, rgba(45, 212, 191, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 80% 30%, rgba(20, 184, 166, 0.1) 0%, transparent 60%)
            `,
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Floating orb 1 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            top: '10%',
            left: '-5%',
            background: `radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Floating orb 2 */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 350,
            height: 350,
            bottom: '10%',
            right: '-5%',
            background: `radial-gradient(circle, rgba(15, 122, 110, 0.15) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 pt-20 pb-16 text-center sm:px-6 lg:px-8">
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
        >
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: 'rgba(15, 122, 110, 0.1)',
              border: '1px solid rgba(20, 184, 166, 0.2)',
              color: TEAL.light,
            }}
          >
            <Cross className="h-4 w-4" />
            RSU Ja&apos;far Medika — Mojogedang, Karanganyar
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="lp-font-display mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE_OUT }}
          style={{ color: '#FFFFFF' }}
        >
          Digital Patient{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${TEAL.bright}, ${TEAL.light}, ${TEAL.bright})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Experience
          </span>{' '}
          Monitoring System
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="lp-font-body mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
          style={{ color: SLATE[400] }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE_OUT }}
        >
          Mengukur &amp; meningkatkan kualitas layanan integratif — akupunktur,
          herbal, dan terapi adjuvan — untuk pasien stroke, nyeri kronis,
          hingga pemeliharaan kesehatan, dengan pendekatan
          evidence-based dan islamic holistic care.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: EASE_OUT }}
        >
          <Link
            href="/survey/consent"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl text-white transition-all duration-200 hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${TEAL.deep}, ${TEAL.medium})`,
              boxShadow: `0 4px 24px rgba(15, 122, 110, 0.35)`,
            }}
          >
            Mulai Isi Survei
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#fitur"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl transition-all duration-200"
            style={{
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: SLATE[200],
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)'
              e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Lihat Fitur
          </Link>
        </motion.div>

        {/* Bottom badges */}
        <motion.div
          className="mt-14 flex flex-wrap items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {['SERVQUAL Framework', 'VAS / Barthel / ISI', 'WHOQOL-BREF', 'NPS', 'Islamic Holistic Care', 'WTP'].map(
            (badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(148, 163, 184, 0.06)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  color: SLATE[500],
                }}
              >
                {badge}
              </span>
            )
          )}
        </motion.div>

      </div>
    </header>
  )
}

/* ════════════════════════════════════════════════════════════════════
   3. TRUST STRIP
   ════════════════════════════════════════════════════════════════════ */

const trustItems = [
  { label: 'Evidence-based Research', icon: Layers },
  { label: 'Antarmuka Ramah Lansia', icon: Heart },
  { label: 'Real-time Analytics', icon: BarChart3 },
  { label: 'Data Terenkripsi & Aman', icon: Lock },
  { label: 'Save & Resume Survei', icon: Zap },
  { label: 'Export PDF & Excel', icon: FileText },
]

function TrustStrip() {
  return (
    <div
      className="w-full"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: `1px solid ${SLATE[200]}`,
        borderBottom: `1px solid ${SLATE[200]}`,
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <Check
                className="h-4 w-4 shrink-0"
                style={{ color: TEAL.deep }}
              />
              <span
                className="text-sm font-medium lp-font-body"
                style={{ color: SLATE[500] }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   4. METRICS
   ════════════════════════════════════════════════════════════════════ */

interface MetricData {
  icon: React.ElementType
  label: string
  value: string
  numericValue: number
  suffix: string
  decimals: number
}

const FALLBACK_METRICS: MetricData[] = [
  { icon: Users, label: 'Total Responden', value: '-', numericValue: 0, suffix: ' pasien', decimals: 0 },
  { icon: Activity, label: 'Rata-rata Pengurangan Nyeri', value: '-', numericValue: 0, suffix: '%', decimals: 1 },
  { icon: Star, label: 'NPS Score', value: '-', numericValue: 0, suffix: '', decimals: 0 },
  { icon: Heart, label: 'Tingkat Kepuasan', value: '-', numericValue: 0, suffix: '/5', decimals: 1 },
]

function MetricCard({ metric, inView }: { metric: MetricData; inView: boolean }) {
  const counterValue = useCounter(
    metric.numericValue,
    inView,
    1500,
    metric.decimals
  )
  const displayValue = metric.value === '-' ? '-' : counterValue

  return (
    <div
      className="lp-metric-card group relative rounded-2xl border p-6 transition-all duration-300 cursor-default"
      style={{
        backgroundColor: SLATE[50],
        borderColor: `${SLATE[200]}66`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${TEAL.medium}66`
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = `0 8px 30px ${TEAL.light}15`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${SLATE[200]}66`
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Top accent line */}
      <div
        className="lp-accent-line absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${TEAL.deep}, ${TEAL.bright})`,
        }}
      />
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${TEAL.light}20`,
          }}
        >
          <metric.icon className="h-6 w-6" style={{ color: TEAL.deep }} />
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-medium lp-font-body"
            style={{ color: SLATE[500] }}
          >
            {metric.label}
          </p>
          <p className="mt-2 lp-font-display text-3xl font-extrabold tracking-tight" style={{ color: DARK[950] }}>
            {displayValue}
            <span
              className="ml-1 text-base font-semibold lp-font-body"
              style={{ color: SLATE[400] }}
            >
              {metric.suffix}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricsSection() {
  const [metrics, setMetrics] = useState<MetricData[]>(FALLBACK_METRICS)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    fetch('/api/dashboard/data?period=30')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return
        const totalSurveys = data.totalSurveys ?? 0
        const avgPain = data.avgPainReduction ?? 0
        const npsScore = data.nps?.score ?? 0
        const satisfaction = data.overallSatisfaction ?? 0

        setMetrics([
          {
            icon: Users,
            label: 'Total Responden',
            value: totalSurveys.toString(),
            numericValue: totalSurveys,
            suffix: ' pasien',
            decimals: 0,
          },
          {
            icon: Activity,
            label: 'Rata-rata Pengurangan Nyeri',
            value: avgPain.toFixed(1),
            numericValue: avgPain,
            suffix: '%',
            decimals: 1,
          },
          {
            icon: Star,
            label: 'NPS Score',
            value: npsScore.toString(),
            numericValue: Math.abs(npsScore),
            suffix: '',
            decimals: 0,
          },
          {
            icon: Heart,
            label: 'Tingkat Kepuasan',
            value: satisfaction.toFixed(1),
            numericValue: satisfaction,
            suffix: '/5',
            decimals: 1,
          },
        ])
      })
      .catch((err) => {
        console.warn('[DPEMS Landing] Gagal fetch /api/dashboard/data, menggunakan fallback metrics:', err)
      })
  }, [])

  return (
    <Section style={{ backgroundColor: '#FFFFFF' }}>
      <FadeUp className="mb-12 text-center md:mb-16">
        <div
          className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium lp-font-body"
          style={{
            backgroundColor: `${TEAL.light}15`,
            color: TEAL.deep,
          }}
        >
          Data Terkini
        </div>
        <h2
          className="lp-font-display text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: DARK[950] }}
        >
          Capaian Sistem dalam Angka
        </h2>
        <p
          className="mx-auto mt-4 max-w-2xl text-base lp-font-body sm:text-lg"
          style={{ color: SLATE[500] }}
        >
          Ringkasan indikator utama dari pengukuran patient experience di
          RSU Ja&apos;far Medika
        </p>
      </FadeUp>

      <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} metric={m} inView={isInView} />
        ))}
      </div>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════
   5. FEATURES
   ════════════════════════════════════════════════════════════════════ */

const features = [
  {
    icon: Users,
    title: 'A — Data Responden',
    description:
      'Pengumpulan data demografi pasien meliputi usia, jenis kelamin, pendidikan, pekerjaan, pendapatan, jenis pasien, kondisi penyakit, jumlah kunjungan, dan sumber rujukan — sebagai basis segmentasi dan analisis multivariat.',
    tags: ['9 Item', 'Demografi', 'Segmentasi'],
  },
  {
    icon: ClipboardList,
    title: 'B — Kualitas Layanan (SERVQUAL)',
    description:
      'Penilaian 5 dimensi kualitas pelayanan — Tangibles, Reliability, Responsiveness, Assurance, dan Empathy — dengan 21 item Likert untuk evaluasi menyeluruh terhadap layanan akupunktur dan herbal.',
    tags: ['5 Dimensi', '21 Item', 'Evidence-based'],
  },
  {
    icon: Leaf,
    title: 'C — Layanan Herbal',
    description:
      'Evaluasi kepuasan terhadap layanan herbal secara kondisional — hanya ditampilkan kepada pasien yang mendapat resep herbal. Mencakup efektivitas, kejelasan informasi, ketersediaan, dan kepuasan keseluruhan terhadap produk herbal.',
    tags: ['Kondisional', '6 Item', 'Herbal Medicine'],
  },
  {
    icon: Brain,
    title: 'D — Persepsi Terapi',
    description:
      'Pengukuran pemahaman pasien terhadap peran terapi integratif sebagai pendukung (bukan pengganti) pengobatan konvensional, termasuk kejelasan penjelasan dokter dan kenyamanan bertanya.',
    tags: ['4 Item', 'Likert', 'Adjuvan Therapy'],
  },
  {
    icon: Activity,
    title: 'E — Outcome Klinis',
    description:
      'Pemantauan outcome klinis secara kondisional berdasarkan keluhan pasien: VAS (nyeri kronis), Barthel Index (stroke), Insomnia Severity Index (gangguan tidur), dan WHOQOL-BREF (wellness).',
    tags: ['Kondisional', 'VAS', 'Barthel', 'ISI', 'WHOQOL'],
  },
  {
    icon: Sparkles,
    title: 'F — Spiritual & Holistik',
    description:
      'Pengukuran kenyamanan spiritual dan kecocokan budaya islami — mencakup 9 dimensi: adab & etika, gender concordance, waktu ibadah, jaminan halal, pengenalan tibb nabawi, aktivasi spiritual, kedamaian holistik, komunikasi spiritual, dan reverse-coded item.',
    tags: ['9 Dimensi', 'Islamic Care', 'Holistik'],
  },
  {
    icon: TrendingUp,
    title: 'G — NPS & Loyaltas',
    description:
      'Net Promoter Score (0–10) untuk mengukur loyalitas dan rekomendasi pasien, dilengkapi rencana kunjungan ulang, riwayat rekomendasi, jumlah rekomendasi, dan kesediaan bayar jika harga naik 50%.',
    tags: ['NPS', '5 Item', 'Loyaltas'],
  },
  {
    icon: MessageSquareHeart,
    title: 'H — Masukan & Saran',
    description:
      'Feedback terstruktur multi-kategori — hal yang disukai (4 kategori, 16 item checkbox) dan saran perbaikan (5 kategori, 20 item checkbox), dilengkapi kolom testimoni bebas.',
    tags: ['Multi-kategori', '36+ Item', 'Testimoni'],
  },
  {
    icon: BadgeDollarSign,
    title: 'I — Kesediaan Bayar (WTP)',
    description:
      'Willingness to Pay dengan 4 instrumen: biaya hari ini, reaksi kenaikan 20%, minat paket diskon 4 sesi (-10%), dan payment card untuk batas maksimal harga yang dapat diterima pasien.',
    tags: ['4 Item', 'Payment Card', 'Ekonomi'],
  },
]

function FeaturesSection() {
  return (
    <Section id="fitur" style={{ backgroundColor: SLATE[50] }}>
      <FadeUp className="mb-12 text-center md:mb-16">
        <div
          className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium lp-font-body"
          style={{
            backgroundColor: `${TEAL.light}15`,
            color: TEAL.deep,
          }}
        >
          Fitur Unggulan
        </div>
        <h2
          className="lp-font-display text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: DARK[950] }}
        >
          Sistem Monitoring Komprehensif
        </h2>
        <p
          className="mx-auto mt-4 max-w-2xl text-base lp-font-body sm:text-lg"
          style={{ color: SLATE[500] }}
        >
          Sembilan bagian kuesioner integratif yang dirancang khusus untuk
          kebutuhan rumah sakit dengan layanan kedokteran integratif
        </p>
      </FadeUp>

      <StaggerContainer
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        staggerDelay={0.08}
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            variants={staggerItem}
            className="group relative rounded-2xl border bg-white p-6 transition-all duration-300"
            style={{
              borderColor: `${SLATE[200]}80`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${TEAL.medium}66`
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `0 8px 30px ${TEAL.light}15`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${SLATE[200]}80`
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Number prefix */}
            <span
              className="mb-3 inline-block text-xs font-semibold lp-font-body tracking-wider"
              style={{ color: TEAL.deep }}
            >
              {String(i + 1).padStart(2, '0')} — Bagian
            </span>

            {/* Icon */}
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${TEAL.light}20`,
              }}
            >
              <f.icon className="h-5 w-5" style={{ color: TEAL.deep }} />
            </div>

            <h3
              className="lp-font-display mb-2 text-lg font-semibold"
              style={{ color: DARK[950] }}
            >
              {f.title}
            </h3>
            <p
              className="mb-4 text-sm leading-relaxed lp-font-body"
              style={{ color: SLATE[500] }}
            >
              {f.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {f.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium lp-font-body"
                  style={{
                    backgroundColor: `${TEAL.lightest}`,
                    color: TEAL.deep,
                    border: `1px solid ${TEAL.light}40`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </StaggerContainer>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════
   6. HOW IT WORKS
   ════════════════════════════════════════════════════════════════════ */

const steps = [
  {
    icon: QrCode,
    step: '01',
    title: 'Scan QR Code',
    description:
      'Pasien scan QR code yang tersedia di ruang tunggu poli. Tidak perlu install aplikasi — langsung terhubung ke survei digital.',
  },
  {
    icon: Clock,
    step: '02',
    title: 'Isi Survei 13–15 Menit',
    description:
      'Kuesioner 9 bagian (A–I) dirancang sesuai standar penelitian akademik — data responden, SERVQUAL, layanan herbal, persepsi terapi, outcome klinis kondisional (VAS/Barthel/ISI/WHOQOL), spiritual & holistik, NPS & loyaltas, feedback terstruktur, dan kesediaan bayar.',
  },
  {
    icon: MonitorDot,
    step: '03',
    title: 'Data Real-time',
    description:
      'Manajemen rumah sakit langsung melihat hasil survei, tren kepuasan, dan indikator kualitas melalui dashboard analitik.',
  },
]

function HowItWorksSection() {
  return (
    <Section id="cara-kerja" style={{ backgroundColor: '#FFFFFF' }}>
      <FadeUp className="mb-12 text-center md:mb-16">
        <div
          className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium lp-font-body"
          style={{
            backgroundColor: `${TEAL.light}15`,
            color: TEAL.deep,
          }}
        >
          Cara Kerja
        </div>
        <h2
          className="lp-font-display text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: DARK[950] }}
        >
          Sederhana, Cepat, &amp; Efektif
        </h2>
        <p
          className="mx-auto mt-4 max-w-2xl text-base lp-font-body sm:text-lg"
          style={{ color: SLATE[500] }}
        >
          Tiga langkah mudah untuk mulai mengukur dan meningkatkan pengalaman
          pasien
        </p>
      </FadeUp>

      <div className="relative">
        {/* Horizontal connector line (desktop) */}
        <div
          className="absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] hidden lg:block"
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${TEAL.light}30, ${TEAL.bright}50, ${TEAL.light}30)`,
          }}
        />

        <StaggerContainer className="grid gap-8 lg:grid-cols-3 lg:gap-6">
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={staggerItem}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step circle */}
              <div
                className="relative z-10 mb-6 flex h-[104px] w-[104px] items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${TEAL.deep}, ${TEAL.medium})`,
                  boxShadow: `0 4px 24px ${TEAL.deep}35`,
                }}
              >
                <s.icon className="h-10 w-10 text-white" />
                <span
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white lp-font-display"
                  style={{ backgroundColor: TEAL.bright }}
                >
                  {s.step}
                </span>
              </div>

              {/* Icon block below */}
              <h3
                className="lp-font-display mb-3 text-xl font-bold"
                style={{ color: DARK[950] }}
              >
                {s.title}
              </h3>
              <p
                className="max-w-xs text-base leading-relaxed lp-font-body"
                style={{ color: SLATE[500] }}
              >
                {s.description}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════
   7. METHODOLOGY
   ════════════════════════════════════════════════════════════════════ */

function MethodologySection() {
  const methodologyItems = [
    {
      icon: Layers,
      title: 'SERVQUAL',
      source: 'Parasuraman et al., 1988',
      desc: '5 dimensi kualitas layanan — Tangibles, Reliability, Responsiveness, Assurance, dan Empathy — dengan 21 item Likert untuk evaluasi menyeluruh pengalaman pasien terhadap layanan integratif.',
    },
    {
      icon: Activity,
      title: 'Visual Analogue Scale',
      source: 'Huskisson, 1974',
      desc: 'Pengukuran subjektif intensitas nyeri (0–10) sebelum dan sesudah terapi — digunakan untuk kondisi nyeri sendi, punggung, migrain, dan kondisi neurologis lainnya.',
    },
    {
      icon: Route,
      title: 'Barthel Index',
      source: 'Mahoney & Barthel, 1965',
      desc: 'Skala kemandirian aktivitas sehari-hari (ADL) dengan 10 komponen, skor 0–100 — mengukur progres rehabilitasi pasien stroke/pasca stroke secara longitudinal.',
    },
    {
      icon: Star,
      title: 'Insomnia Severity Index',
      source: 'Morin, 2011',
      desc: '7 item penilaian keparahan gangguan tidur (skor 0–28) — mengukur severity insomnia pasien sebelum dan selama terapi integratif.',
    },
    {
      icon: TrendingUp,
      title: 'Net Promoter Score',
      source: 'Reichheld, 2003',
      desc: 'Indikator loyalitas dan rekomendasi pasien terhadap layanan rumah sakit (skor 0–10), dilengkapi data rencana kunjungan ulang, riwayat rekomendasi, dan kesediaan bayar.',
    },
    {
      icon: ShieldCheck,
      title: 'WHOQOL-BREF',
      source: 'WHO, 1996',
      desc: 'Instrumen kualitas hidup dari World Health Organization dengan 3 item yang mengukur aspek fisik, psikologis, dan sosial pasien selama terapi integratif.',
    },
    {
      icon: Sparkles,
      title: 'Islamic Holistic Care',
      source: 'Pendekatan Kontekstual',
      desc: '9 dimensi spiritual yang mencakup adab & etika islami, gender concordance, waktu ibadah, jaminan halal, tibb nabawi, aktivasi spiritual, kedamaian holistik, komunikasi spiritual, dan dukungan holistik.',
    },
    {
      icon: BadgeDollarSign,
      title: 'Willingness to Pay',
      source: 'Payment Card Method',
      desc: 'Pengukuran kesediaan membayar pasien melalui 4 instrumen — biaya aktual, reaksi kenaikan harga, minat paket diskon, dan payment card untuk menentukan batas harga maksimal.',
    },
  ]

  return (
    <Section id="metodologi" style={{ backgroundColor: '#FFFFFF' }}>
      <FadeUp>
        <div
          className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium lp-font-body"
          style={{
            backgroundColor: `${TEAL.light}15`,
            color: TEAL.deep,
          }}
        >
          Metodologi
        </div>
        <h2
          className="lp-font-display text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: DARK[950] }}
        >
          Fondasi Ilmiah yang Kuat
        </h2>
        <p
          className="mt-4 max-w-2xl text-base leading-relaxed lp-font-body sm:text-lg"
          style={{ color: SLATE[500] }}
        >
          Sistem DPEMS dibangun berdasarkan 8 kerangka penelitian yang
          telah teruji dan diakui secara internasional dalam bidang
          manajemen kesehatan, patient experience, dan ilmu ekonomi kesehatan.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {methodologyItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border p-6 transition-all duration-300"
              style={{
                backgroundColor: SLATE[50],
                borderColor: `${SLATE[200]}66`,
              }}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${TEAL.light}20`,
                }}
              >
                <item.icon className="h-5 w-5" style={{ color: TEAL.deep }} />
              </div>
              <h3
                className="lp-font-display text-base font-semibold"
                style={{ color: DARK[950] }}
              >
                {item.title}
              </h3>
              <span
                className="text-xs font-medium lp-font-body"
                style={{ color: TEAL.medium }}
              >
                {item.source}
              </span>
              <p
                className="mt-2 text-sm leading-relaxed lp-font-body"
                style={{ color: SLATE[500] }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </FadeUp>
    </Section>
  )
}

/* ════════════════════════════════════════════════════════════════════
   8. CTA SECTION
   ════════════════════════════════════════════════════════════════════ */

function CtaSection() {
  return (
    <section
      className="relative w-full py-20 md:py-28 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${TEAL.deep}, ${TEAL.medium}, ${TEAL.deep})`,
      }}
    >
      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium lp-font-body"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
            }}
          >
            <Heart className="h-4 w-4" />
            Partisipasi Anda Penting
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2
            className="lp-font-display mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: '#FFFFFF' }}
          >
            Suara Anda Membentuk Pelayanan yang Lebih Baik
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed lp-font-body"
            style={{ color: 'rgba(255, 255, 255, 0.75)' }}
          >
            Setiap respons survei Anda berkontribusi pada penelitian
            peningkatan mutu pelayanan kesehatan berbasis bukti di
            RSU Ja&apos;far Medika Karanganyar.
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4 sm:justify-center">
            <Link
              href="/survey/consent"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: '#FFFFFF',
                color: TEAL.deep,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              }}
            >
              Isi Survei Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl transition-all duration-200"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.4)',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
              }}
            >
              Buka Dashboard
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════
   9. FOOTER
   ════════════════════════════════════════════════════════════════════ */

function FooterSection() {
  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Fitur', href: '#fitur' },
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Metodologi', href: '#metodologi' },
    { label: 'Isi Survei', href: '/survey/consent' },
  ]

  const badges = ['Integrative Medicine', 'Evidence-based', 'Patient Experience', 'WTP']

  return (
    <footer style={{ backgroundColor: DARK[950] }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${TEAL.deep}, ${TEAL.bright})`,
                }}
              >
                <Cross className="h-5 w-5 text-white" />
              </span>
              <span
                className="text-lg font-bold text-white lp-font-display"
              >
                DPEMS
              </span>
            </div>
            <p
              className="text-sm leading-relaxed lp-font-body mb-5"
              style={{ color: SLATE[400] }}
            >
              Digital Patient Experience Monitoring System — proyek penelitian
              akademis untuk meningkatkan kualitas layanan integratif di
              RSU Ja&apos;far Medika Karanganyar.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium lp-font-body"
                  style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.08)',
                    color: TEAL.light,
                    border: '1px solid rgba(20, 184, 166, 0.12)',
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <h4
              className="lp-font-display mb-5 text-sm font-semibold uppercase tracking-wider"
              style={{ color: SLATE[300] }}
            >
              Navigasi
            </h4>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium lp-font-body transition-colors"
                    style={{ color: SLATE[500] }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = TEAL.light)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = SLATE[500])}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Researcher */}
          <div>
            <h4
              className="lp-font-display mb-5 text-sm font-semibold uppercase tracking-wider"
              style={{ color: SLATE[300] }}
            >
              Peneliti
            </h4>
            <p
              className="lp-font-display text-base font-bold"
              style={{ color: '#FFFFFF' }}
            >
              Imam Maliki
            </p>
            <p className="mt-1 text-sm lp-font-body" style={{ color: SLATE[500] }}>
              Program Studi Magister
            </p>
            <p className="text-sm lp-font-body" style={{ color: SLATE[500] }}>
              RSU Ja&apos;far Medika
            </p>
            <p className="text-sm lp-font-body" style={{ color: SLATE[500] }}>
              Karanganyar, Jawa Tengah
            </p>
          </div>

          {/* Col 4 — Quick Info */}
          <div>
            <h4
              className="lp-font-display mb-5 text-sm font-semibold uppercase tracking-wider"
              style={{ color: SLATE[300] }}
            >
              Informasi
            </h4>
            <ul className="space-y-3">
              <li>
                <span
                  className="text-xs font-medium lp-font-body"
                  style={{ color: SLATE[500] }}
                >
                  Tempat
                </span>
                <p className="text-sm font-medium text-white lp-font-body">
                  Poli Akupuntur &amp; Herbal
                </p>
              </li>
              <li>
                <span
                  className="text-xs font-medium lp-font-body"
                  style={{ color: SLATE[500] }}
                >
                  Responden
                </span>
                <p className="text-sm font-medium text-white lp-font-body">
                  Pasien Stroke, Nyeri Kronis, &amp; Wellness
                </p>
              </li>
              <li>
                <span
                  className="text-xs font-medium lp-font-body"
                  style={{ color: SLATE[500] }}
                >
                  Metode
                </span>
                <p className="text-sm font-medium text-white lp-font-body">
                  SERVQUAL + VAS + Barthel + ISI + WHOQOL + NPS + WTP
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center gap-2 pt-6 text-center"
          style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}
        >
          <p className="text-sm lp-font-body" style={{ color: SLATE[500] }}>
            &copy; {new Date().getFullYear()} DPEMS &mdash; Digital Patient
            Experience Monitoring System
          </p>
          <p className="text-xs lp-font-body" style={{ color: SLATE[600] }}>
            Mojogedang, Karanganyar — Jawa Tengah
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <MetricsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MethodologySection />
      <CtaSection />
      <FooterSection />
    </main>
  )
}