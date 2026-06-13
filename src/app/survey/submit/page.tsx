'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import SurveyProgress from '@/components/survey/SurveyProgress'
import {
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Send,
  Loader2,
  AlertCircle,
  PartyPopper,
} from 'lucide-react'
import {
  getSurveyData,
  getDurationSeconds,
  clearSurveyData,
  getSurveyStartTime,
} from '@/lib/survey-storage'
import { calculateScores, getExtremePattern } from '@/lib/scoring'
import type { SurveySubmission } from '@/lib/types'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function SubmitPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [summary, setSummary] = useState({
    totalQuestions: 24,
    answeredQuestions: 0,
    durationMinutes: 0,
  })

  useEffect(() => {
    const data = getSurveyData()
    const startTime = getSurveyStartTime()

    // Count answered Likert items
    const likertKeys = [
      'pv1', 'pv2', 'pv3', 'pv4', 'pv5', 'pv6', 'pv7', 'pv8', 'pv9', 'pv10', 'pv11', 'pv12',
      'tr1', 'tr2', 'tr3', 'tr4',
      'sat1', 'sat2', 'sat3', 'sat4',
      'loy1', 'loy2', 'loy3', 'loy4',
    ]
    const answeredCount = likertKeys.filter((k) => typeof data[k] === 'number').length

    // Calculate duration
    const durationSec = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
    const durationMin = Math.round(durationSec / 60)

    setSummary({
      totalQuestions: 24,
      answeredQuestions: answeredCount,
      durationMinutes: durationMin,
    })
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const data = getSurveyData()

      // Build submission payload
      const payload: Record<string, unknown> = {
        consent_agreed: data.consent_agreed ?? true,
        eligible: data.eligible ?? true,
        age_group: data.age_group ?? '',
        gender: data.gender ?? '',
        education: data.education ?? '',
        occupation: data.occupation ?? '',
        income_group: data.income_group ?? '',
        service_type: data.service_type ?? '',
        visit_count: data.visit_count ?? '',
        referral_source: data.referral_source ?? '',
        main_complaint_category: data.main_complaint_category ?? '',
        pv1: data.pv1,
        pv2: data.pv2,
        pv3: data.pv3,
        pv4: data.pv4,
        pv5: data.pv5,
        pv6: data.pv6,
        pv7: data.pv7,
        pv8: data.pv8,
        pv9: data.pv9,
        pv10: data.pv10,
        pv11: data.pv11,
        pv12: data.pv12,
        tr1: data.tr1,
        tr2: data.tr2,
        tr3: data.tr3,
        tr4: data.tr4,
        sat1: data.sat1,
        sat2: data.sat2,
        sat3: data.sat3,
        sat4: data.sat4,
        loy1: data.loy1,
        loy2: data.loy2,
        loy3: data.loy3,
        loy4: data.loy4,
        duration_seconds: getDurationSeconds(),
        survey_version: '1.0',
        consent_version: '1.0',
      }

      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Gagal mengirim survei. Silakan coba lagi.')
        return
      }

      // Success
      clearSurveyData()
      setSubmitted(true)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Thank you screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="max-w-md w-full text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <PartyPopper className="w-12 h-12 text-emerald-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-3"
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Terima Kasih!
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Terima kasih atas partisipasi Anda! Jawaban Anda telah tersimpan dengan aman dan
              akan digunakan untuk kepentingan penelitian.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              onClick={() => router.push('/')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              Kembali ke Beranda
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

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
              <p className="text-sm font-bold text-slate-800">Kirim Survei</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/survey/loyalty')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <SurveyProgress currentStep={9} totalSteps={9} label="Kirim Survei" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mt-4 mb-8 space-y-3"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200/60 flex items-center justify-center">
              <Send className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kirim Survei
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Periksa kembali ringkasan survei Anda sebelum mengirim.
          </p>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE_OUT }}
          className="space-y-4 mb-6"
        >
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Ringkasan Survei</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pertanyaan Dijawab</p>
                    <p className="text-lg font-bold text-slate-800">
                      {summary.answeredQuestions}<span className="text-sm font-normal text-slate-400">/{summary.totalQuestions}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Estimasi Waktu</p>
                    <p className="text-lg font-bold text-slate-800">
                      ~{summary.durationMinutes || 7}<span className="text-sm font-normal text-slate-400"> menit</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Data yang Akan Dikirim</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Persetujuan informed consent
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Kriteria peserta (screening)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Data demografi responden
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  12 item Penilaian Layanan (PV)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  4 item Kepercayaan (TR)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  4 item Kepuasan (SAT)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  4 item Loyalitas (LOY)
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 font-medium">Gagal mengirim survei</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Incomplete Warning */}
        {summary.answeredQuestions < summary.totalQuestions && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Anda belum menjawab semua pertanyaan ({summary.totalQuestions - summary.answeredQuestions} belum terjawab).
              Survei tetap dapat dikirim, namun data yang tidak lengkap mungkin tidak dapat digunakan untuk analisis.
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/survey/loyalty')}
            disabled={isSubmitting}
            className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 h-12 px-6 text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Kirim Survei
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
