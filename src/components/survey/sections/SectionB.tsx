'use client'

import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import LikertScale from '@/components/survey/LikertScale'
import { servqualSections } from './types'
import type { FormData } from './types'

interface SectionProps {
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function SectionB({ form, updateField }: SectionProps) {
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
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Bagian B — Kualitas Layanan Akupuntur
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-body)]">
            Skala: 1 = Sangat Tidak Setuju, 5 = Sangat Setuju
          </p>
        </div>
      </div>

      {/* SERVQUAL Dimension Cards — 21 items total (5+4+4+4+4) */}
      <div className="space-y-4">
        {servqualSections.map((section, si) => (
          <motion.div
            key={si}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.06, duration: 0.4, ease: EASE_OUT }}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden"
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center">
                <span className="text-xs font-bold text-teal-700 font-[family-name:var(--font-display)]">
                  {['B1', 'B2', 'B3', 'B4', 'B5'][si]}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 font-[family-name:var(--font-display)]">
                {section.title}
              </h3>
            </div>

            {/* Questions */}
            <div className="px-5 pb-5 space-y-5">
              {section.questions.map((q, qi) => (
                <div key={qi} className="space-y-2.5">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed font-[family-name:var(--font-body)]">
                    {q.text}
                  </p>
                  <LikertScale
                    value={form[q.key] as number | null}
                    onChange={(v) => updateField(q.key, v)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}