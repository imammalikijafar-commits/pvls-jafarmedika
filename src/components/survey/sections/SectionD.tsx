'use client'

import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import LikertScale from '@/components/survey/LikertScale'
import { clarityQuestions } from './types'
import type { FormData } from './types'

interface SectionProps {
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function SectionD({ form, updateField }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Bagian D — Persepsi Keterangan Terapi
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-body)]">
            Perceived Clarity of Therapeutic Role
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />
        <div className="p-5 sm:p-6 space-y-6">
          {/* D1–D4: Clarity Likert Items */}
          <div className="space-y-5">
            <p className="text-sm font-semibold text-teal-700 font-[family-name:var(--font-display)]">
              Skala: 1 = Sangat Tidak Setuju, 5 = Sangat Setuju
            </p>
            {clarityQuestions.map((q, i) => (
              <div key={i} className="space-y-2.5">
                <p className="text-sm font-medium text-slate-600 leading-relaxed font-[family-name:var(--font-body)]">
                  <span className="text-teal-600 font-semibold mr-1">D{i + 1}.</span>
                  {q.text}
                </p>
                <LikertScale
                  value={form[q.key] as number | null}
                  onChange={(v) => updateField(q.key, v)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}