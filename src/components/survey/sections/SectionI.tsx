'use client'

import { motion } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Wallet, Info, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { WTP_INCREASE_OPTIONS, WTP_PACKAGE_OPTIONS, WTP_PAYMENT_OPTIONS } from '@/lib/validators'
import type { FormData } from './types'

interface SectionProps {
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

// ─── Helpers ──────────────────────────────────────────────
function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

export default function SectionI({ form, updateField }: SectionProps) {
  // Compute 20% increase from I1 input
  const increasedCost = useMemo(() => {
    if (form.wtp_cost_today > 0) {
      return Math.round(form.wtp_cost_today * 1.2)
    }
    return null
  }, [form.wtp_cost_today])

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
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Bagian I — Kesediaan Membayar (WTP)
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-body)]">
            Bagian ini menanyakan tentang biaya terapi. Tidak ada jawaban benar atau salah.
          </p>
        </div>
      </div>

      {/* Privacy info banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: EASE_OUT }}
        className="flex items-start gap-3 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-blue-100/60 p-4"
      >
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-blue-700 font-[family-name:var(--font-body)]">
          Data Anda dijamin kerahasiaannya dan hanya digunakan untuk keperluan penelitian.
        </p>
      </motion.div>

      {/* Sensitivity note */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: EASE_OUT }}
        className="flex items-start gap-3 rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-amber-100/60 p-4"
      >
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800 font-[family-name:var(--font-display)]">
            Pertanyaan Opsional
          </p>
          <p className="text-sm text-amber-700 mt-0.5 font-[family-name:var(--font-body)]">
            Pertanyaan tentang biaya bersifat opsional. Jawaban Anda membantu kami menentukan kebijakan tarif yang adil.
          </p>
        </div>
      </motion.div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />
        <div className="p-5 sm:p-6 space-y-6">

          {/* ─── I1: Biaya sesi hari ini ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35, ease: EASE_OUT }}
            className="space-y-3"
          >
            <div>
              <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
                <span className="text-teal-600 mr-1">I1.</span>
                Biaya sesi akupuntur/herbal Anda HARI INI{' '}
                <span className="text-slate-400 font-normal">(lihat struk)</span>
              </Label>
            </div>
            <div className="flex items-center gap-0">
              <div className="flex items-center h-10 px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 font-[family-name:var(--font-body)]">
                Rp
              </div>
              <Input
                type="number"
                min={0}
                value={form.wtp_cost_today || ''}
                onChange={(e) => {
                  const val = e.target.value
                  updateField('wtp_cost_today', val === '' ? 0 : parseInt(val))
                }}
                placeholder="Contoh: 150000"
                className="h-10 rounded-l-none rounded-r-xl border-slate-200 text-sm tabular-nums font-[family-name:var(--font-body)] focus-visible:ring-teal-500/20 focus-visible:border-teal-500/50"
              />
            </div>
            {form.wtp_cost_today > 0 && (
              <p className="text-xs text-slate-400 font-[family-name:var(--font-body)]">
                = Rp {formatRupiah(form.wtp_cost_today)}
              </p>
            )}
          </motion.div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* ─── I2: Jika biaya naik 20% ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: EASE_OUT }}
            className="space-y-3"
          >
            <div>
              <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
                <span className="text-teal-600 mr-1">I2.</span>
                Jika biaya per sesi naik 20%
                {increasedCost && (
                  <span className="text-teal-600 font-bold tabular-nums">
                    {' '} (menjadi Rp {formatRupiah(increasedCost)})
                  </span>
                )}
                , apakah Anda tetap akan datang?
              </Label>
              {!increasedCost && (
                <p className="text-[11px] text-slate-400 mt-0.5 font-[family-name:var(--font-body)]">
                  Isi biaya di I1 terlebih dahulu untuk melihat perhitungan
                </p>
              )}
            </div>
            <RadioGroup
              value={form.wtp_increase_20}
              onValueChange={(v) => updateField('wtp_increase_20', v)}
              className="space-y-2"
            >
              {WTP_INCREASE_OPTIONS.map((opt) => (
                <div
                  key={opt}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer',
                    form.wtp_increase_20 === opt
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30'
                  )}
                  onClick={() => updateField('wtp_increase_20', opt)}
                >
                  <RadioGroupItem
                    value={opt}
                    id={`i2-${opt.slice(0, 10)}`}
                    className="mt-0.5 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                  />
                  <Label
                    htmlFor={`i2-${opt.slice(0, 10)}`}
                    className="text-sm font-normal leading-relaxed cursor-pointer font-[family-name:var(--font-body)]"
                  >
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* ─── I3: Paket 4 sesi diskon 10% ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35, ease: EASE_OUT }}
            className="space-y-3"
          >
            <div>
              <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
                <span className="text-teal-600 mr-1">I3.</span>
                Jika RSU Ja&apos;far menawarkan PAKET 4 sesi dengan diskon 10%, apakah Anda tertarik?
              </Label>
              {form.wtp_cost_today > 0 && (
                <p className="text-[11px] text-teal-600 mt-1 font-[family-name:var(--font-body)]">
                  Estimasi: 4 x Rp {formatRupiah(form.wtp_cost_today)} = Rp {formatRupiah(form.wtp_cost_today * 4)}
                  {' '}&rarr; Diskon 10% = <strong>Rp {formatRupiah(Math.round(form.wtp_cost_today * 4 * 0.9))}</strong>
                </p>
              )}
            </div>
            <RadioGroup
              value={form.wtp_package_interest}
              onValueChange={(v) => updateField('wtp_package_interest', v)}
              className="space-y-2"
            >
              {WTP_PACKAGE_OPTIONS.map((opt) => (
                <div
                  key={opt}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer',
                    form.wtp_package_interest === opt
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30'
                  )}
                  onClick={() => updateField('wtp_package_interest', opt)}
                >
                  <RadioGroupItem
                    value={opt}
                    id={`i3-${opt.slice(0, 10)}`}
                    className="mt-0.5 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                  />
                  <Label
                    htmlFor={`i3-${opt.slice(0, 10)}`}
                    className="text-sm font-normal leading-relaxed cursor-pointer font-[family-name:var(--font-body)]"
                  >
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* ─── I4: Payment Card — Biaya maksimal ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35, ease: EASE_OUT }}
            className="space-y-3"
          >
            <div>
              <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
                <span className="text-teal-600 mr-1">I4.</span>
                Menurut Anda, berapa biaya MAKSIMAL yang masih pantas untuk 1 sesi akupuntur/herbal?
              </Label>
              <p className="text-[11px] text-slate-400 mt-0.5 font-[family-name:var(--font-body)]">
                Pilih satu opsi yang paling sesuai
              </p>
            </div>
            <RadioGroup
              value={form.wtp_max_acceptable}
              onValueChange={(v) => updateField('wtp_max_acceptable', v)}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {WTP_PAYMENT_OPTIONS.map((opt) => {
                const isLastOption = opt.startsWith('Tidak tahu')
                const isSelected = form.wtp_max_acceptable === opt
                return (
                  <div
                    key={opt}
                    className={cn(
                      'relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer text-center',
                      isSelected
                        ? 'border-teal-500 bg-teal-50 shadow-sm shadow-teal-500/10'
                        : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/30'
                    )}
                    onClick={() => updateField('wtp_max_acceptable', opt)}
                  >
                    <RadioGroupItem
                      value={opt}
                      id={`i4-${opt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`i4-${opt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`}
                      className={cn(
                        'cursor-pointer font-[family-name:var(--font-body)]',
                        isLastOption
                          ? 'text-[10px] leading-tight font-medium'
                          : 'text-sm font-bold tabular-nums'
                      )}
                    >
                      <span className={cn(
                        isSelected ? 'text-teal-700' : 'text-slate-600'
                      )}>
                        {opt}
                      </span>
                    </Label>
                    {/* Active indicator dot */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"
                      >
                        <span className="text-[10px] text-white leading-none">&check;</span>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </RadioGroup>
          </motion.div>

        </div>
      </div>
    </motion.div>
  )
}