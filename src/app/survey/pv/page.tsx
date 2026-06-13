'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import QuestionCard from '@/components/survey/QuestionCard'
import SurveyProgress from '@/components/survey/SurveyProgress'
import { ArrowLeft, ArrowRight, Stethoscope, AlertTriangle } from 'lucide-react'
import { useSurveyAnswers } from '@/lib/hooks/use-survey-answers'
import { getQuestionsByGroup, GROUP_TITLES, GROUP_DESCRIPTIONS } from '@/lib/questions'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const questions = getQuestionsByGroup('PV')

export default function PVPage() {
  const router = useRouter()
  const { answers, mounted, handleChange, answeredCount, allAnswered } = useSurveyAnswers(questions)
  const [showWarning, setShowWarning] = useState(false)

  const handleNext = () => {
    if (!allAnswered) {
      setShowWarning(true)
      return
    }
    router.push('/survey/trust')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Memuat...</div>
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
              <p className="text-sm font-bold text-slate-800">{GROUP_TITLES.PV}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            {answeredCount}/{questions.length} dijawab
          </Badge>
        </div>
      </motion.header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <SurveyProgress currentStep={5} totalSteps={9} label={GROUP_TITLES.PV} />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mt-4 mb-6 space-y-3"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {GROUP_TITLES.PV}
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            {GROUP_DESCRIPTIONS.PV}
          </p>
        </motion.div>

        {/* Warning */}
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Mohon jawab semua pertanyaan sebelum melanjutkan. Anda belum menjawab{' '}
              {questions.length - answeredCount} pertanyaan.
            </p>
          </motion.div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <motion.div
              key={q.code}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.03, duration: 0.35, ease: EASE_OUT }}
            >
              <QuestionCard
                code={q.code}
                text={q.text}
                value={answers[q.code.toLowerCase()]}
                onChange={(val) => handleChange(q.code, val)}
                index={idx}
              />
            </motion.div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/survey/demographic')}
            className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>

          <Button
            type="button"
            onClick={handleNext}
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
