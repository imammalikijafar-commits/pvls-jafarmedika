'use client'

import { motion } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Stethoscope, Info, AlertTriangle, Brain, Heart, Activity, Moon } from 'lucide-react'
import PainScale from '@/components/survey/PainScale'
import LikertScale from '@/components/survey/LikertScale'
import { cn } from '@/lib/utils'
import { PAIN_CONDITIONS, STROKE_CONDITION, INSOMNIA_CONDITION, WELLNESS_CONDITION } from '@/lib/validators'
import { barthelActivities, isiQuestions, ISI_LABELS, wellnessQuestions, WELLNESS_LABELS } from './types'
import type { FormData } from './types'

interface SectionProps {
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
  visitCount?: string
  conditionType?: string
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

// ─── ISI Scale Component (0-4) ─────────────────────────────
function ISILikert({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {ISI_LABELS.map((label, i) => {
        const isSelected = value === i
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all min-w-[60px]',
              'hover:scale-105 active:scale-95',
              isSelected
                ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10 scale-105'
                : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
            )}
          >
            <span className={cn(
              'text-xl font-bold tabular-nums',
              isSelected ? 'text-emerald-700' : 'text-slate-400'
            )}>
              {i}
            </span>
            <span className={cn(
              'text-[10px] leading-tight text-center max-w-[65px]',
              isSelected ? 'text-emerald-700 font-semibold' : 'text-slate-400'
            )}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Barthel Activity Row ─────────────────────────────────
function BarthelRow({ activity, form, updateField }: {
  activity: typeof barthelActivities[0]
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3"
    >
      <div>
        <p className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
          {activity.label}
        </p>
        {activity.sublabel && (
          <p className="text-xs text-slate-400 mt-0.5 font-[family-name:var(--font-body)]">
            ({activity.sublabel})
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider font-[family-name:var(--font-display)]">
            Saat Pertama Terapi
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activity.options.map((opt) => {
              const isSelected = form[activity.firstKey] === opt.score
              return (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => updateField(activity.firstKey, opt.score)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    isSelected
                      ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider font-[family-name:var(--font-display)]">
            Kondisi Saat Ini
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activity.options.map((opt) => {
              const isSelected = form[activity.currentKey] === opt.score
              return (
                <button
                  key={`c-${opt.score}`}
                  type="button"
                  onClick={() => updateField(activity.currentKey, opt.score)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    isSelected
                      ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                  )}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Barthel Score Display ─────────────────────────────────
function BarthelScoreDisplay({ form }: { form: FormData }) {
  const firstKeys = barthelActivities.map((a) => form[a.firstKey] as number)
  const currentKeys = barthelActivities.map((a) => form[a.currentKey] as number)

  const sumFirst = firstKeys.reduce((a, b) => a + (b ?? 0), 0)
  const sumCurrent = currentKeys.reduce((a, b) => a + (b ?? 0), 0)

  const allFilledFirst = firstKeys.every((v) => v !== null)
  const allFilledCurrent = currentKeys.every((v) => v !== null)

  const getLevel = (score: number) => {
    if (score <= 20) return { text: 'Ketergantungan Total', color: 'text-red-600', bg: 'bg-red-50' }
    if (score <= 60) return { text: 'Berat', color: 'text-orange-600', bg: 'bg-orange-50' }
    if (score <= 90) return { text: 'Sedang', color: 'text-amber-600', bg: 'bg-amber-50' }
    if (score <= 99) return { text: 'Ringan', color: 'text-blue-600', bg: 'bg-blue-50' }
    return { text: 'Mandiri Penuh', color: 'text-teal-600', bg: 'bg-teal-50' }
  }

  const levelFirst = getLevel(sumFirst)
  const levelCurrent = getLevel(sumCurrent)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-teal-50/60 border border-purple-200/40"
    >
      <div className="text-center space-y-1">
        <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Saat Pertama</p>
        <p className={cn('text-2xl font-extrabold font-[family-name:var(--font-display)] tabular-nums', levelFirst.color)}>
          {allFilledFirst ? sumFirst : '—'}
        </p>
        {allFilledFirst && <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', levelFirst.bg, levelFirst.color)}>{levelFirst.text}</span>}
      </div>
      <div className="text-center space-y-1">
        <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">Saat Ini</p>
        <p className={cn('text-2xl font-extrabold font-[family-name:var(--font-display)] tabular-nums', levelCurrent.color)}>
          {allFilledCurrent ? sumCurrent : '—'}
        </p>
        {allFilledCurrent && <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', levelCurrent.bg, levelCurrent.color)}>{levelCurrent.text}</span>}
      </div>
    </motion.div>
  )
}

// ─── ISI Score Display ────────────────────────────────────
function ISIScoreDisplay({ form }: { form: FormData }) {
  const scores = [form.isi_1, form.isi_2, form.isi_3, form.isi_4, form.isi_5, form.isi_6, form.isi_7]
  const total = scores.reduce<number>((a, b) => a + (b ?? 0), 0)
  const allFilled = scores.every((v) => v !== null)

  const getLevel = (score: number) => {
    if (score <= 7) return { text: 'Tidak ada insomnia', color: 'text-teal-600', bg: 'bg-teal-50' }
    if (score <= 14) return { text: 'Insomnia Ringan', color: 'text-amber-600', bg: 'bg-amber-50' }
    if (score <= 21) return { text: 'Insomnia Sedang', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { text: 'Insomnia Berat', color: 'text-red-600', bg: 'bg-red-50' }
  }

  if (!allFilled) return null
  const level = getLevel(total)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200/40 space-y-1"
    >
      <p className="text-xs text-slate-500 font-medium">Total Skor ISI</p>
      <p className="text-3xl font-extrabold font-[family-name:var(--font-display)] tabular-nums text-emerald-700">{total}<span className="text-lg text-slate-400"> / 28</span></p>
      <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', level.bg, level.color)}>{level.text}</span>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// Main SectionE Component — Branching Logic
// ═══════════════════════════════════════════════════════════

export default function SectionE({ form, updateField, visitCount, conditionType }: SectionProps) {
  const isFirstVisit = visitCount === 'Pertama kali (ke-1)'
  const isStroke = conditionType === STROKE_CONDITION
  const isInsomnia = conditionType === INSOMNIA_CONDITION
  const isWellness = conditionType === WELLNESS_CONDITION
  const isPain = !isStroke && !isInsomnia && !isWellness && (conditionType ? PAIN_CONDITIONS.includes(conditionType as typeof PAIN_CONDITIONS[number]) : false)

  // Determine which instrument to show
  const showVAS = isPain || (!isStroke && !isInsomnia && !isWellness)
  const showBarthel = isStroke
  const showISI = isInsomnia
  const showWellness = isWellness

  // Pain-specific calculations
  const painAfterDisplay = isFirstVisit ? form.pain_level_before : (form.pain_level_after ?? form.pain_level_before)
  const painReduction = !isFirstVisit && form.pain_level_before > 0 && form.pain_level_after !== null
    ? Math.round(((form.pain_level_before - painAfterDisplay) / form.pain_level_before) * 100)
    : 0

  // Section header color/icon
  const sectionConfig = showBarthel
    ? { icon: Brain, gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20', accent: 'bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600', label: 'Barthel Index', desc: 'Mengukur kemandirian aktivitas sehari-hari (ADL). Skor 0-100.' }
    : showISI
      ? { icon: Moon, gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20', accent: 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600', label: 'Insomnia Severity Index', desc: 'Dalam 2 minggu terakhir, seberapa berat masalah tidur Anda?' }
      : showWellness
        ? { icon: Heart, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20', accent: 'bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600', label: 'WHOQOL-BREF', desc: 'Seberapa baik kondisi kesehatan dan kualitas hidup Anda?' }
        : { icon: Stethoscope, gradient: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-500/20', accent: 'bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600', label: 'VAS', desc: '0 = tidak ada nyeri, 10 = nyeri paling hebat' }

  const Icon = sectionConfig.icon

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
          <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md', sectionConfig.gradient, sectionConfig.shadow)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Bagian E — Penilaian Outcome Klinis
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-body)]">
            {sectionConfig.desc}
          </p>
        </div>
      </div>

      {/* Condition info banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-blue-100/60 p-4"
      >
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800 font-[family-name:var(--font-display)]">
            {conditionType || 'Pilih keluhan utama di Bagian A terlebih dahulu'}
          </p>
          <p className="text-sm text-blue-700 mt-1 font-[family-name:var(--font-body)]">
            {showBarthel && 'Instrumen: Barthel Index — Mengukur kemandirian aktivitas sehari-hari sebelum dan setelah terapi akupuntur.'}
            {showISI && 'Instrumen: Insomnia Severity Index (ISI) — Menilai tingkat keparahan gangguan tidur dalam 2 minggu terakhir.'}
            {showWellness && 'Instrumen: WHOQOL-BREF — Menilai kualitas kesehatan fisik secara keseluruhan.'}
            {showVAS && 'Instrumen: Visual Analogue Scale (VAS) — Mengukur intensitas nyeri sebelum dan sesudah terapi.'}
          </p>
        </div>
      </motion.div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className={cn('h-1', sectionConfig.accent)} />
        <div className="p-5 sm:p-6 space-y-6">

          {/* ═══════ E1: VAS (Pain Conditions) ═══════ */}
          {showVAS && (
            <>
              {/* First visit banner */}
              {isFirstVisit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-amber-100/60 p-4"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 font-[family-name:var(--font-display)]">Kunjungan Pertama Kali</p>
                    <p className="text-sm text-amber-700 mt-1 font-[family-name:var(--font-body)]">
                      Karena ini kunjungan pertama Anda, penilaian &quot;Sesudah terapi&quot; tidak tersedia. Hanya perlu mengisi tingkat nyeri saat ini (sebelum terapi dimulai).
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section label */}
              <div className="space-y-1">
                <p className="text-sm font-bold text-orange-700 font-[family-name:var(--font-display)]">
                  E1 — Untuk Kondisi Nyeri
                </p>
                <p className="text-xs text-slate-400 font-[family-name:var(--font-body)]">
                  (Nyeri Sendi / Rematik, Nyeri Punggung / Saraf Kejepit, Migrain, Kondisi Neurologis dengan nyeri)
                </p>
              </div>

              <PainScale
                label="E1a. Sebelum terapi akupuntur/herbal pertama kali, seberapa berat NYERI Anda?"
                value={form.pain_level_before}
                onChange={(v) => updateField('pain_level_before', v)}
              />

              {!isFirstVisit ? (
                <PainScale
                  label="E1b. SAAT INI (setelah menjalani beberapa kali terapi), seberapa berat NYERI Anda?"
                  value={painAfterDisplay}
                  onChange={(v) => updateField('pain_level_after', v)}
                />
              ) : (
                <PainScale
                  label="E1b. SAAT INI — Tidak tersedia (kunjungan pertama)"
                  value={form.pain_level_before}
                  onChange={() => {}}
                  disabled
                />
              )}

              {/* Pain reduction indicator */}
              {!isFirstVisit && painReduction !== 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'text-center p-5 rounded-xl',
                    painReduction > 0
                      ? 'bg-gradient-to-br from-teal-50 to-teal-100/60 border border-teal-200/60'
                      : 'bg-gradient-to-br from-red-50 to-red-100/60 border border-red-200/60'
                  )}
                >
                  <p className="text-xs font-medium text-slate-500 mb-1 font-[family-name:var(--font-body)]">Pengurangan Nyeri</p>
                  <p className={cn('text-3xl font-extrabold font-[family-name:var(--font-display)] tabular-nums', painReduction > 0 ? 'text-teal-600' : 'text-red-600')}>
                    {painReduction > 0 ? '\u2193' : '\u2191'} {Math.abs(painReduction)}%
                  </p>
                </motion.div>
              )}

              {/* E1c: GRoC */}
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
                  <span className="text-teal-600 mr-1">E1c.</span>
                  Secara keseluruhan sejak terapi, perubahan kondisi nyeri Anda:
                </Label>
                <RadioGroup
                  value={form.condition_change}
                  onValueChange={(v) => updateField('condition_change', v)}
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                >
                  {[
                    { value: 'Sangat Memburuk', emoji: '\uD83D\uDE1E', color: 'text-red-500', activeBg: 'bg-red-50 border-red-400' },
                    { value: 'Agak Memburuk', emoji: '\uD83D\uDE1F', color: 'text-orange-500', activeBg: 'bg-orange-50 border-orange-400' },
                    { value: 'Tidak Berubah', emoji: '\uD83D\uDE10', color: 'text-slate-500', activeBg: 'bg-slate-50 border-slate-400' },
                    { value: 'Agak Membaik', emoji: '\uD83D\uDE42', color: 'text-blue-500', activeBg: 'bg-blue-50 border-blue-400' },
                    { value: 'Sangat Membaik', emoji: '\uD83D\uDE0A', color: 'text-teal-500', activeBg: 'bg-teal-50 border-teal-400' },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer',
                        form.condition_change === opt.value
                          ? cn('border-current shadow-sm', opt.activeBg)
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      )}
                      onClick={() => updateField('condition_change', opt.value)}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <RadioGroupItem value={opt.value} id={`cc-${opt.value}`} className="sr-only" />
                      <Label htmlFor={`cc-${opt.value}`} className={cn(
                        'text-[11px] text-center font-semibold cursor-pointer font-[family-name:var(--font-body)]',
                        form.condition_change === opt.value ? opt.color : 'text-slate-400'
                      )}>
                        {opt.value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}

          {/* ═══════ E2: Barthel Index (Stroke) ═══════ */}
          {showBarthel && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-bold text-purple-700 font-[family-name:var(--font-display)]">
                  E2 — Untuk Kondisi Stroke / Pasca Stroke
                </p>
                <p className="text-xs text-slate-400 font-[family-name:var(--font-body)]">
                  (Khusus pasien stroke atau pasca stroke yang menjalani rehabilitasi)
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-purple-200/60 bg-gradient-to-r from-purple-50 to-purple-100/60 p-4">
                <Activity className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-sm text-purple-700 font-[family-name:var(--font-body)]">
                  <strong>Petunjuk:</strong> Pilih kondisi yang PALING SESUAI untuk setiap aktivitas. Bandingkan kondisi SAAT PERTAMA KALI terapi dan SAAT INI. Skor total 0-100.
                </p>
              </div>

              {/* Score display */}
              <BarthelScoreDisplay form={form} />

              {/* Activities */}
              <div className="space-y-3">
                {barthelActivities.map((activity, i) => (
                  <BarthelRow
                    key={activity.id}
                    activity={activity}
                    form={form}
                    updateField={updateField}
                  />
                ))}
              </div>
            </>
          )}

          {/* ═══════ E3: ISI (Insomnia) ═══════ */}
          {showISI && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-700 font-[family-name:var(--font-display)]">
                  E3 — Untuk Gangguan Tidur (Insomnia)
                </p>
                <p className="text-xs text-slate-400 font-[family-name:var(--font-body)]">
                  (Khusus pasien dengan keluhan utama gangguan tidur / insomnia)
                </p>
              </div>

              <div className="space-y-5">
                {isiQuestions.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35, ease: EASE_OUT }}
                    className="space-y-2.5"
                  >
                    <p className="text-sm font-medium text-slate-600 leading-relaxed font-[family-name:var(--font-body)]">{q.text}</p>
                    <ISILikert
                      value={form[q.key] as number | null}
                      onChange={(v) => updateField(q.key, v)}
                    />
                  </motion.div>
                ))}
              </div>

              <ISIScoreDisplay form={form} />
            </>
          )}

          {/* ═══════ E4: Wellness (WHOQOL-BREF) ═══════ */}
          {showWellness && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-bold text-blue-700 font-[family-name:var(--font-display)]">
                  E4 — Untuk Wellness / Pemeliharaan Kesehatan
                </p>
                <p className="text-xs text-slate-400 font-[family-name:var(--font-body)]">
                  (Khusus pasien yang datang untuk menjaga dan meningkatkan kesehatan)
                </p>
              </div>

              <LikertScale
                value={form.wellness_1 as number | null}
                onChange={(v) => updateField('wellness_1', v)}
                labels={WELLNESS_LABELS}
              />

              <div className="space-y-5">
                {wellnessQuestions.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35, ease: EASE_OUT }}
                    className="space-y-2.5"
                  >
                    <p className="text-sm font-medium text-slate-600 leading-relaxed font-[family-name:var(--font-body)]">{q.text}</p>
                    <LikertScale
                      value={form[q.key] as number | null}
                      onChange={(v) => updateField(q.key, v)}
                      labels={WELLNESS_LABELS}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* ═══════ No condition selected ═══════ */}
          {!conditionType && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <AlertTriangle className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-sm text-slate-500 font-[family-name:var(--font-body)]">
                Silakan pilih keluhan utama (A6) di Bagian A terlebih dahulu untuk menampilkan instrumen yang sesuai.
              </p>
            </div>
          )}

          {/* ═══════ "Lainnya" fallback — use VAS ═══════ */}
          {conditionType === 'Lainnya' && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-amber-100/60 p-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 font-[family-name:var(--font-display)]">Keluhan &quot;Lainnya&quot;</p>
                <p className="text-sm text-amber-700 mt-1 font-[family-name:var(--font-body)]">
                  Untuk keluhan lainnya, digunakan VAS (Visual Analogue Scale) untuk mengukur tingkat gejala.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  )
}