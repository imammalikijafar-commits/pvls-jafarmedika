'use client'

import { motion } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VISIT_PLANS, RECOMMENDATION_STATUS, RECOMMENDATION_COUNTS } from '@/lib/validators'
import type { FormData } from './types'

interface SectionProps {
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const getNPSLabel = (v: number) => {
  if (v <= 6) return { text: 'Detractor', color: 'text-red-500', bg: 'bg-red-50 border-red-200' }
  if (v <= 8) return { text: 'Passive', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' }
  return { text: 'Promoter', color: 'text-teal-500', bg: 'bg-teal-50 border-teal-200' }
}

/** WTP price-increase slider labels (0-10) */
const getWTPLabel = (v: number) => {
  if (v <= 3) return { text: 'Tidak Bersedia', color: 'text-red-500', bg: 'bg-red-50 border-red-200' }
  if (v <= 6) return { text: 'Ragu-ragu', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' }
  return { text: 'Bersedia', color: 'text-teal-500', bg: 'bg-teal-50 border-teal-200' }
}

export default function SectionG({ form, updateField }: SectionProps) {
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
            <Star className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Bagian G — Loyaltas &amp; Rekomendasi (NPS)
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-body)]">
            Seberapa besar kemungkinan Anda merekomendasikan layanan ini?
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />
        <div className="p-5 sm:p-6 space-y-6">
          {/* G1: NPS Score */}
          <div className="space-y-4">
            <div className="text-center">
              <Label className="text-lg font-extrabold text-slate-900 font-[family-name:var(--font-display)]">
                G1. NPS Score:{' '}
                <span className="text-teal-600 tabular-nums">{form.nps_score}</span>
              </Label>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 mb-1 px-1 font-[family-name:var(--font-body)]">
              <span>Sangat Tidak Mungkin</span>
              <span>Sangat Pasti Merekomendasikan</span>
            </div>

            {/* Range slider */}
            <div className="relative">
              <input
                type="range"
                min={0} max={10}
                value={form.nps_score}
                onChange={(e) => updateField('nps_score', parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer accent-teal-600"
              />
              {/* Color zones background */}
              <div className="absolute top-full left-0 right-0 h-1 mt-0.5 rounded-full overflow-hidden flex">
                <div className="flex-[7] bg-red-100" />
                <div className="flex-[2] bg-amber-100" />
                <div className="flex-[2] bg-teal-100" />
              </div>
            </div>

            {/* Number circles */}
            <div className="flex justify-between px-0.5">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => updateField('nps_score', i)}
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold tabular-nums cursor-pointer transition-all',
                    getNPSLabel(i).bg,
                    'border',
                    form.nps_score === i && 'scale-110 shadow-md ring-2 ring-teal-400/50'
                  )}
                >
                  {i}
                </button>
              ))}
            </div>

            {/* NPS categories */}
            <div className="flex justify-center gap-6 text-xs font-medium pt-1">
              <span className="text-red-500 font-[family-name:var(--font-body)]">0-6: Detractor</span>
              <span className="text-amber-500 font-[family-name:var(--font-body)]">7-8: Passive</span>
              <span className="text-teal-500 font-[family-name:var(--font-body)]">9-10: Promoter</span>
            </div>
          </div>

          {/* G2: Visit Plan */}
          <div className="space-y-3 pt-5 border-t border-slate-200">
            <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
              <span className="text-teal-600 mr-1">G2.</span>
              Rencana Anda ke depan terkait layanan ini:
            </Label>
            <RadioGroup
              value={form.visit_plan}
              onValueChange={(v) => updateField('visit_plan', v)}
              className="space-y-2"
            >
              {VISIT_PLANS.map((opt) => (
                <div
                  key={opt}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer',
                    form.visit_plan === opt
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30'
                  )}
                  onClick={() => updateField('visit_plan', opt)}
                >
                  <RadioGroupItem value={opt} id={`plan-${opt.slice(0, 10)}`} className="mt-0.5 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500" />
                  <Label htmlFor={`plan-${opt.slice(0, 10)}`} className="text-sm font-normal leading-relaxed cursor-pointer font-[family-name:var(--font-body)]">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* G3: Recommendation */}
          <div className="space-y-3 pt-5 border-t border-slate-200">
            <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
              <span className="text-teal-600 mr-1">G3.</span>
              Apakah Anda pernah merekomendasikan layanan ini kepada orang lain?
            </Label>
            <RadioGroup
              value={form.has_recommended}
              onValueChange={(v) => updateField('has_recommended', v)}
              className="space-y-2"
            >
              {RECOMMENDATION_STATUS.map((opt) => (
                <div
                  key={opt}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer',
                    form.has_recommended === opt
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30'
                  )}
                  onClick={() => updateField('has_recommended', opt)}
                >
                  <RadioGroupItem value={opt} id={`rec-${opt.slice(0, 10)}`} className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500" />
                  <Label htmlFor={`rec-${opt.slice(0, 10)}`} className="text-sm font-normal cursor-pointer font-[family-name:var(--font-body)]">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* G4: Recommendation Count */}
          <div className="space-y-3 pt-5 border-t border-slate-200">
            <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
              <span className="text-teal-600 mr-1">G4.</span>
              Berapa kali Anda sudah merekomendasikan RSU Ja&apos;far ke orang lain?
            </Label>
            <RadioGroup
              value={form.recommendation_count}
              onValueChange={(v) => updateField('recommendation_count', v)}
              className="space-y-2"
            >
              {RECOMMENDATION_COUNTS.map((opt) => (
                <div
                  key={opt}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer',
                    form.recommendation_count === opt
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30'
                  )}
                  onClick={() => updateField('recommendation_count', opt)}
                >
                  <RadioGroupItem value={opt} id={`rcnt-${opt.slice(0, 10)}`} className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500" />
                  <Label htmlFor={`rcnt-${opt.slice(0, 10)}`} className="text-sm font-normal cursor-pointer font-[family-name:var(--font-body)]">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* G5: Willingness to Pay (Price Increase Tolerance) — 0-10 slider */}
          <div className="space-y-4 pt-5 border-t border-slate-200">
            <div className="text-center">
              <Label className="text-base font-extrabold text-slate-900 font-[family-name:var(--font-display)]">
                <span className="text-teal-600 mr-1">G5.</span>
                Seberapa besar kemungkinan Anda akan datang lagi{' '}
                <span className="text-amber-600">JIKA</span> biaya naik 50%?{' '}
                <span className="text-teal-600 tabular-nums">{form.wtp_price_increase}</span>
              </Label>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 mb-1 px-1 font-[family-name:var(--font-body)]">
              <span>Sangat tidak mungkin</span>
              <span>Sangat pasti</span>
            </div>

            {/* Range slider */}
            <div className="relative">
              <input
                type="range"
                min={0} max={10}
                value={form.wtp_price_increase}
                onChange={(e) => updateField('wtp_price_increase', parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer accent-teal-600"
              />
              {/* Color zones background */}
              <div className="absolute top-full left-0 right-0 h-1 mt-0.5 rounded-full overflow-hidden flex">
                <div className="flex-[4] bg-red-100" />
                <div className="flex-[3] bg-amber-100" />
                <div className="flex-[4] bg-teal-100" />
              </div>
            </div>

            {/* Number circles */}
            <div className="flex justify-between px-0.5">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => updateField('wtp_price_increase', i)}
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold tabular-nums cursor-pointer transition-all',
                    getWTPLabel(i).bg,
                    'border',
                    form.wtp_price_increase === i && 'scale-110 shadow-md ring-2 ring-teal-400/50'
                  )}
                >
                  {i}
                </button>
              ))}
            </div>

            {/* Slider labels */}
            <div className="flex justify-between px-0.5 text-[11px] font-medium pt-1">
              <span className="text-red-500 font-[family-name:var(--font-body)]">0-3: Tidak Bersedia</span>
              <span className="text-amber-500 font-[family-name:var(--font-body)]">4-6: Ragu-ragu</span>
              <span className="text-teal-500 font-[family-name:var(--font-body)]">7-10: Bersedia</span>
            </div>
            <p className="text-center text-xs text-slate-400 font-[family-name:var(--font-body)]">
              0 = Sangat tidak mungkin, 10 = Sangat pasti
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}