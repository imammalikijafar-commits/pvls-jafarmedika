'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Shield, BarChart3, Users, Heart, Lock, ArrowLeft, Stethoscope, ClipboardCheck, BadgeDollarSign, Leaf, Brain, Sparkles } from 'lucide-react'

/* ════════════════════════════════════════════════════════════════════
   DESIGN TOKENS (matching landing page + dashboard)
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

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

/* ════════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════════ */

export default function LoginPageClient() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message === 'Invalid login credentials'
          ? 'Email atau password salah'
          : signInError.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ═══════════════════════════════════════════════════════════
          LEFT PANEL — Dark branding panel (hidden on mobile)
      ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${DARK[950]} 0%, ${DARK[900]} 40%, #0a2f2e 100%)` }}
      >
        {/* Animated mesh grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating orbs */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${TEAL.medium}40, transparent 70%)` }}
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -right-16 w-[450px] h-[450px] rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${TEAL.bright}30, transparent 70%)` }}
        />
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${TEAL.light}50, transparent 70%)` }}
        />

        {/* Glassmorphism floating shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] right-[8%] w-32 h-32 rounded-2xl border border-white/[0.06] backdrop-blur-md bg-white/[0.03] shadow-lg"
        />
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -4, 2, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[25%] left-[5%] w-24 h-24 rounded-full border border-white/[0.06] backdrop-blur-sm bg-white/[0.03]"
        />
        <motion.div
          animate={{ y: [0, -8, 0], x: [0, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[55%] right-[15%] w-16 h-20 rounded-xl border border-white/[0.05] backdrop-blur-sm bg-white/[0.02]"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Top: Logo + Name */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="flex items-center"
            >
              <img src="/logo-dpems.svg" alt="DPEMS Logo" className="h-11 w-auto" />
            </motion.div>
          </div>

          {/* Center: Marketing content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
            className="space-y-8"
          >
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Digital Patient <br />
                <span style={{ color: TEAL.bright }}>Experience System</span>
              </h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-sm">
                Platform monitoring pengalaman pasien integratif dengan kuesioner 9 bagian (A–I) — data responden, SERVQUAL, layanan herbal, persepsi terapi, outcome klinis kondisional (VAS, Barthel, ISI, WHOQOL-BREF), spiritual &amp; holistik, NPS &amp; loyaltas, feedback multi-kategori, dan kesediaan bayar.
              </p>
            </div>

            {/* Feature pills — glassmorphism */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Shield, label: 'SERVQUAL 5D' },
                { icon: Stethoscope, label: 'Outcome Klinis' },
                { icon: Sparkles, label: 'Spiritual 9D' },
                { icon: Users, label: 'NPS & Loyaltas' },
                { icon: ClipboardCheck, label: 'Feedback Multi-Kategori' },
                { icon: BadgeDollarSign, label: 'Willingness to Pay' },
                { icon: Leaf, label: 'Layanan Herbal' },
                { icon: Brain, label: 'Persepsi Terapi' },
                { icon: BarChart3, label: 'Analitik Real-time' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: EASE_OUT }}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-white/[0.1] backdrop-blur-md bg-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:bg-white/[0.09] hover:border-white/[0.14] transition-all cursor-default"
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white/[0.08]">
                    <item.icon className="w-3 h-3" style={{ color: TEAL.bright }} strokeWidth={2.2} />
                  </div>
                  <span className="text-slate-200 text-[11px] font-medium">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom: Hospital info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT }}
            className="border-t border-white/[0.08] pt-6"
          >
            <p className="text-slate-500 text-xs font-medium">
              RSU Ja&apos;far Medika Karanganyar
            </p>
            <p className="text-slate-600 text-[11px] mt-1">
              Rumah Sakit Umum Tipe D — Integrative Medicine
            </p>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          RIGHT PANEL — Login form
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 relative min-h-screen lg:min-h-0"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #ecfdf5 100%)' }}
      >
        {/* Floating glass shapes — desktop only */}
        <div className="pointer-events-none hidden lg:block">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[12%] left-[8%] w-36 h-36 rounded-3xl border border-teal-200/30 backdrop-blur-lg bg-white/40 shadow-[0_8px_32px_rgba(13,148,136,0.08)]"
          />
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 4, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[15%] right-[6%] w-28 h-28 rounded-full border border-slate-200/40 backdrop-blur-lg bg-white/35 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
          />
          <motion.div
            animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[60%] left-[3%] w-20 h-24 rounded-2xl border border-teal-100/30 backdrop-blur-md bg-white/30"
          />
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[20%] right-[12%] w-16 h-16 rounded-xl border border-teal-200/20 backdrop-blur-md bg-white/25"
          />
        </div>

        {/* Mobile background decoration */}
        <div className="pointer-events-none fixed inset-0 lg:hidden overflow-hidden">
          <div className="absolute -top-24 -right-24 h-[350px] w-[350px] rounded-full bg-teal-100/40 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-slate-100/60 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* ── Glassmorphism Login Card ── */}
          <div className="rounded-2xl border border-white/60 backdrop-blur-xl bg-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-7 sm:p-8">

          {/* Mobile-only: Logo */}
          <div className="lg:hidden text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="inline-flex"
            >
              <img src="/logo-dpems.svg" alt="DPEMS Logo" className="h-11 w-auto" />
            </motion.div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold text-slate-900 tracking-tight">
              Masuk ke Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Masukkan kredensial untuk mengakses panel analitik.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="text-sm text-red-700 font-medium leading-snug">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[13px] font-semibold text-slate-700 block">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="nama@rsujafarmedika.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full h-12 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-[13px] font-semibold text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="w-4 h-4 text-slate-400" strokeWidth={2} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full h-12 pl-10 pr-12 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-md hover:bg-slate-100"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 rounded-xl text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
              style={{
                background: loading || !email || !password
                  ? 'linear-gradient(135deg, #0D9488, #14B8A6)'
                  : `linear-gradient(135deg, ${TEAL.medium}, ${TEAL.bright})`,
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </span>
              ) : (
                'Masuk ke Dashboard'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Info</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Access notice — glassmorphism */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/60 backdrop-blur-sm bg-white/50">
            <div className="w-8 h-8 rounded-lg bg-teal-50/80 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-teal-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">Akses Terbatas</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Hanya untuk direktur, manajer, dan kepala ruang. Hubungi admin IT untuk mendapatkan akses.
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-7 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Kembali ke Beranda
            </Link>
          </div>

          </div>{/* End glassmorphism card */}
        </motion.div>
      </div>
    </div>
  )
}