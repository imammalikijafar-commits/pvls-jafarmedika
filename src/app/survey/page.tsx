'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ClipboardList,
  Clock,
  ShieldCheck,
  Leaf,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
} from 'lucide-react'
import { initSurveyStartTime } from '@/lib/survey-storage'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const INFO_ITEMS = [
  {
    icon: ClipboardList,
    label: '24 item kuesioner',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    icon: Clock,
    label: 'Estimasi 7–10 menit',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  {
    icon: ShieldCheck,
    label: 'Anonim',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
  {
    icon: Leaf,
    label: 'Khusus pasien akupunktur & herbal',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  {
    icon: GraduationCap,
    label: 'Data digunakan untuk penelitian tesis',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
]

export default function SurveyIntroPage() {
  const router = useRouter()

  useEffect(() => {
    initSurveyStartTime()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="sticky top-0 z-50 bg-white/80 border-b border-slate-200/60 px-4 py-3"
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">
                RSU Ja&apos;far Medika Karanganyar
              </p>
              <p className="text-sm font-bold text-slate-800">Survei Pasien</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mt-4 mb-8 space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200/60 flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Survei Kepuasan dan Loyalitas Pasien
          </h1>
          <p className="text-base text-emerald-700 font-semibold">
            RSU Ja&apos;far Medika &middot; Layanan Akupunktur &amp; Herbal
          </p>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Survei ini bertujuan untuk mengukur persepsi nilai, kepercayaan, kepuasan, dan
            loyalitas Anda terhadap layanan integratif yang Anda terima. Hasil survei akan
            digunakan untuk penelitian tesis dan perbaikan kualitas layanan.
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: EASE_OUT }}
          className="space-y-3 mb-8"
        >
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Informasi Survei
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INFO_ITEMS.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.06, duration: 0.4, ease: EASE_OUT }}
              >
                <Card className={`${item.border} bg-white hover:shadow-sm transition-shadow`}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Steps overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: EASE_OUT }}
          className="mb-10"
        >
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
            Alur Survei
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Persetujuan',
              'Kriteria',
              'Data Umum',
              'Penilaian Layanan',
              'Kepercayaan',
              'Kepuasan',
              'Loyalitas',
              'Kirim',
            ].map((step, idx) => (
              <span
                key={step}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
              >
                <span className="text-emerald-600 font-bold">{idx + 1}</span>
                {step}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: EASE_OUT }}
          className="space-y-3"
        >
          <Button
            onClick={() => router.push('/survey/consent')}
            className="w-full h-14 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all gap-2"
          >
            Mulai Survei
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="w-full text-sm text-slate-500 hover:text-slate-700 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
