'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ClipboardCheck, Clock, Shield, HeartPulse, GraduationCap, ArrowRight, BarChart3, Users, CheckCircle2, Leaf, Eye } from 'lucide-react'

/* ════════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ════════════════════════════════════════════════════════════════════ */

const TEAL = {
  deep: '#0F7A6E',
  medium: '#14B8A6',
  bright: '#2DD4BF',
  light: '#5EEAD4',
  lighter: '#99F6E4',
  lightest: '#CCFBF1',
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

/* ════════════════════════════════════════════════════════════════════
   Animated Counter Hook
   ════════════════════════════════════════════════════════════════════ */

function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (startOnView && !isInView) return
    if (hasStarted.current) return
    hasStarted.current = true

    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration, isInView, startOnView])

  return { count, ref }
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const itemCount = useCounter(24, 1500)
  const minuteEst = useCounter(7, 1200)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* ═══════════════════════════════════════════════════════════
          HEADER / NAV
      ═══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-900 tracking-tight">
              PVLS
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">Ja&apos;far Medika</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors px-3 py-1.5"
            >
              Login Admin
            </Link>
            <Link
              href="/survey"
              className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 transition-colors shadow-sm"
            >
              Mulai Survei
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-teal-50/50 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 mb-6">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Penelitian Tesis</span>
            </div>

            {/* Title */}
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Survei Kepuasan dan{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Loyalitas Pasien
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-lg sm:text-xl font-medium text-slate-600">
              RSU Ja&apos;far Medika | Layanan Akupunktur &amp; Herbal
            </p>

            {/* Description */}
            <p className="mt-6 max-w-2xl mx-auto text-base text-slate-500 leading-relaxed">
              Website ini digunakan untuk mengumpulkan data penelitian mengenai nilai yang dipersepsikan,
              kepercayaan, kepuasan, dan loyalitas pasien layanan integratif out-of-pocket.
              Jawaban responden bersifat anonim dan hanya digunakan untuk kepentingan penelitian.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/survey"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${TEAL.medium}, ${TEAL.bright})`,
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                }}
              >
                Mulai Survei
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-slate-600 bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-600 transition-all shadow-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Login Admin
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INFO CARDS
      ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {[
            { icon: ClipboardCheck, label: '24 Item', desc: 'Kuesioner', color: 'emerald' },
            { icon: Clock, label: '7-10', desc: 'Menit', color: 'blue' },
            { icon: Shield, label: 'Anonim', desc: 'Data Aman', color: 'teal' },
            { icon: Leaf, label: 'Akupunktur & Herbal', desc: 'Khusus Pasien', color: 'green' },
            { icon: GraduationCap, label: 'Tesis', desc: 'Penelitian', color: 'violet' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: EASE_OUT }}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                item.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                item.color === 'green' ? 'bg-green-50 text-green-600' :
                'bg-violet-50 text-violet-600'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-900">{item.label}</span>
              <span className="text-xs text-slate-400 mt-0.5">{item.desc}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SURVEY PREVIEW SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-3">
              Apa yang Akan Anda Isi?
            </h2>
            <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
              Kuesioner terdiri dari 4 bagian utama yang mengukur persepsi Anda terhadap layanan
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Penilaian Layanan',
                subtitle: 'Perceived Value',
                items: '12 item',
                dimensions: ['Kualitas', 'Emosional', 'Harga', 'Sosial'],
                icon: Eye,
                color: 'emerald',
              },
              {
                title: 'Kepercayaan Pasien',
                subtitle: 'Trust',
                items: '4 item',
                dimensions: ['Kompetensi', 'Keamanan', 'Kejujuran', 'Kepentingan Pasien'],
                icon: Shield,
                color: 'blue',
              },
              {
                title: 'Kepuasan Pasien',
                subtitle: 'Satisfaction',
                items: '4 item',
                dimensions: ['Kepuasan Keseluruhan', 'Sesuai Harapan', 'Pengalaman Baik', 'Keputusan Tepat'],
                icon: CheckCircle2,
                color: 'teal',
              },
              {
                title: 'Loyalitas Pasien',
                subtitle: 'Loyalty',
                items: '4 item',
                dimensions: ['Niat Kembali', 'Rekomendasi', 'Pilihan Utama', 'Tidak Beralih'],
                icon: Users,
                color: 'violet',
              },
            ].map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_OUT }}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                  section.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                  section.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  section.color === 'teal' ? 'bg-teal-100 text-teal-600' :
                  'bg-violet-100 text-violet-600'
                }`}>
                  <section.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{section.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{section.subtitle} — {section.items}</p>
                <div className="flex flex-wrap gap-1.5">
                  {section.dimensions.map((dim) => (
                    <span key={dim} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">
                      {dim}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRIVACY SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/60 mb-6">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-xs font-medium text-teal-700">Privasi Terjamin</span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Data Anda Aman dan Anonim
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Kami tidak mengumpulkan nama, NIK, nomor rekam medis, nomor HP, alamat, atau diagnosis detail Anda.
              Data yang dikumpulkan hanya berupa kelompok demografi umum dan penilaian layanan.
              Semua jawaban dienkripsi dan hanya digunakan untuk kepentingan penelitian akademik.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
              {[
                { collected: false, text: 'Nama, NIK, Nomor HP' },
                { collected: false, text: 'Nomor Rekam Medis' },
                { collected: false, text: 'Alamat Lengkap' },
                { collected: false, text: 'Diagnosis Detail' },
                { collected: true, text: 'Kelompok Usia & Jenis Kelamin' },
                { collected: true, text: 'Penilaian Layanan (1-5)' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${
                  item.collected ? 'bg-emerald-50 border border-emerald-200/60' : 'bg-slate-50 border border-slate-200/60'
                }`}>
                  {item.collected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={`text-xs ${item.collected ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-b from-white to-emerald-50/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Siap Berpartisipasi?
            </h2>
            <p className="text-slate-500 mb-8">
              Survei ini hanya membutuhkan waktu sekitar 7-10 menit. Jawaban Anda sangat berharga
              bagi penelitian dan peningkatan layanan kesehatan integratif.
            </p>
            <Link
              href="/survey"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${TEAL.medium}, ${TEAL.bright})`,
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
              }}
            >
              Mulai Survei Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
              <HeartPulse className="w-3 h-3 text-emerald-600" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-sm font-bold text-slate-700">
              PVLS Ja&apos;far Medika
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Survei Kepuatan dan Loyalitas Pasien Layanan Akupunktur dan Herbal — RSU Ja&apos;far Medika Karanganyar
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Penelitian Tesis — Pengaruh Nilai yang Dipersepsikan terhadap Loyalitas Pasien
          </p>
        </div>
      </footer>
    </div>
  )
}
