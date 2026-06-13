'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import SurveyProgress from '@/components/survey/SurveyProgress'
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Stethoscope } from 'lucide-react'
import { saveSurveyData } from '@/lib/survey-storage'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const SCREENING_QUESTIONS = [
  {
    key: 'is_acupuncture_herbal_patient',
    text: 'Apakah Anda merupakan pasien layanan akupunktur dan/atau herbal medicine di RSU Ja\'far Medika?',
  },
  {
    key: 'is_out_of_pocket',
    text: 'Apakah Anda membayar biaya layanan secara mandiri (out-of-pocket)?',
  },
  {
    key: 'has_previous_visit',
    text: 'Apakah Anda sudah pernah berkunjung minimal 1 kali sebelumnya?',
  },
] as const

export default function ScreeningPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    is_acupuncture_herbal_patient: null,
    is_out_of_pocket: null,
    has_previous_visit: null,
  })
  const [notEligible, setNotEligible] = useState(false)

  const allAnswered = Object.values(answers).every((v) => v !== null)
  const allYes = Object.values(answers).every((v) => v === true)

  const handleAnswer = (key: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setNotEligible(false)
  }

  const handleNext = () => {
    if (allYes) {
      saveSurveyData({
        is_acupuncture_herbal_patient: true,
        is_out_of_pocket: true,
        has_previous_visit: true,
        eligible: true,
      })
      router.push('/survey/demographic')
    } else {
      setNotEligible(true)
    }
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
              <p className="text-sm font-bold text-slate-800">Kriteria Peserta</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/survey/consent')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <SurveyProgress currentStep={3} totalSteps={9} label="Kriteria Peserta" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mt-4 mb-8 space-y-3"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kriteria Peserta Survei
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Mohon jawab pertanyaan berikut untuk memastikan Anda memenuhi kriteria sebagai
            responden survei ini.
          </p>
        </motion.div>

        {/* Screening Questions */}
        <div className="space-y-4">
          {SCREENING_QUESTIONS.map((q, idx) => (
            <motion.div
              key={q.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.4, ease: EASE_OUT }}
            >
              <Card
                className={`border-2 transition-colors ${
                  answers[q.key] === true
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : answers[q.key] === false
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <CardContent className="p-5">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4 font-medium">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAnswer(q.key, true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                        answers[q.key] === true
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswer(q.key, false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                        answers[q.key] === false
                          ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                          : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Tidak
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Not Eligible Message */}
        {notEligible && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-3"
          >
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              Mohon maaf, berdasarkan kriteria Anda belum memenuhi syarat untuk mengikuti survei
              ini. Terima kasih atas waktu Anda.
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="text-sm text-amber-700 hover:text-amber-900 gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/survey/consent')}
            className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={!allAnswered || notEligible}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400"
          >
            Lanjut
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
