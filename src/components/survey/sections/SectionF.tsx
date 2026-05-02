'use client'

import { motion } from 'framer-motion'
import { Sparkles, RotateCcw } from 'lucide-react'
import LikertScale from '@/components/survey/LikertScale'
import { spiritualQuestions } from './types'
import type { SpiritualQuestion } from './types'
import type { FormData } from './types'

interface SectionProps {
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

/** Teal shade map per dimension for visual grouping */
const dimensionColors: Record<string, { badge: string; border: string; dot: string }> = {
  'Adab & Etika Islami':       { badge: 'bg-teal-100 text-teal-700',       border: 'border-l-teal-500',  dot: 'bg-teal-500' },
  'Gender Concordance':        { badge: 'bg-cyan-100 text-cyan-700',        border: 'border-l-cyan-500',  dot: 'bg-cyan-500' },
  'Prayer-Time Accommodation': { badge: 'bg-emerald-100 text-emerald-700',  border: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  'Halal Assurance':           { badge: 'bg-green-100 text-green-700',      border: 'border-l-green-500', dot: 'bg-green-500' },
  'Tibb Nabawi Recognition':   { badge: 'bg-teal-100 text-teal-700',        border: 'border-l-teal-500',  dot: 'bg-teal-500' },
  'Spiritual Activation':      { badge: 'bg-sky-100 text-sky-700',          border: 'border-l-sky-500',   dot: 'bg-sky-500' },
  'Holistic Peace':            { badge: 'bg-emerald-100 text-emerald-700',  border: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  'Spiritual Communication':   { badge: 'bg-cyan-100 text-cyan-700',        border: 'border-l-cyan-500',  dot: 'bg-cyan-500' },
  'Reverse-Coded':             { badge: 'bg-amber-100 text-amber-700',      border: 'border-l-amber-500', dot: 'bg-amber-500' },
}

export default function SectionF({ form, updateField }: SectionProps) {
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
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Bagian F — Dimensi Spiritual &amp; Holistik
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-body)]">
            Pengalaman spiritual selama mendapat layanan
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />
        <div className="p-5 sm:p-6 space-y-1">
          <p className="text-sm font-semibold text-teal-700 font-[family-name:var(--font-display)] mb-4">
            F1. Pengalaman spiritual selama mendapatkan layanan di RSU Ja&apos;far Medika:
          </p>

          {spiritualQuestions.map((q: SpiritualQuestion, i: number) => {
            const colors = dimensionColors[q.dimension] ?? dimensionColors['Adab & Etika Islami']
            const isReverse = q.reverseCoded === true

            return (
              <motion.div
                key={q.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: EASE_OUT }}
                className={`
                  rounded-xl border-l-4 ${colors.border} bg-slate-50/60
                  px-4 py-4 sm:py-5 space-y-3 transition-colors
                  ${isReverse ? 'mb-1' : 'mb-1'}
                `}
              >
                {/* Dimension label + optional reverse badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {q.dimension}
                  </span>
                  {isReverse && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      <RotateCcw className="w-3 h-3" />
                      Reverse Score
                    </span>
                  )}
                </div>

                {/* Question text */}
                <p className={`
                  text-sm font-medium leading-relaxed font-[family-name:var(--font-body)]
                  ${isReverse ? 'text-slate-700' : 'text-slate-600'}
                `}>
                  {q.text}
                  {isReverse && (
                    <span className="ml-2 text-xs text-amber-600 font-normal italic">
                      (Skor akan dibalik saat pengolahan)
                    </span>
                  )}
                </p>

                {/* Likert Scale */}
                <LikertScale
                  value={form[q.key] as number | null}
                  onChange={(v) => updateField(q.key, v)}
                  labels={['😞', '😕', '😐', '😊', '😍']}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}