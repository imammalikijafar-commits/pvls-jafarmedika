'use client'

import { motion } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { User } from 'lucide-react'
import { AGE_RANGES, EDUCATIONS, OCCUPATIONS, INCOME_RANGES, PATIENT_TYPES, CONDITION_TYPES, VISIT_COUNTS, REFERRAL_SOURCES } from '@/lib/validators'
import type { FormData } from './types'

interface SectionProps {
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const SelectField = ({ label, value, onChange, options, placeholder, step }: {
  label: string; value: string; onChange: (v: string) => void;
  options: readonly string[] | string[]; placeholder: string; step?: string
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-slate-700 font-[family-name:var(--font-display)]">
      {step && <span className="text-teal-600 mr-1">{step}</span>}
      {label}
    </Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm font-[family-name:var(--font-body)] hover:border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-sm font-[family-name:var(--font-body)]">{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

export default function SectionA({ form, updateField }: SectionProps) {
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
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Bagian A — Data Responden
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-body)]">
            Data Anda dijamin kerahasiaannya
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Accent line */}
        <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />

        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField step="A1" label="Usia Anda" value={form.age_range} onChange={(v) => updateField('age_range', v)} options={[...AGE_RANGES]} placeholder="Pilih usia" />
            <SelectField step="A2" label="Jenis Kelamin" value={form.gender} onChange={(v) => updateField('gender', v)} options={['Laki-laki', 'Perempuan']} placeholder="Pilih" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField step="A3" label="Pendidikan Terakhir" value={form.education} onChange={(v) => updateField('education', v)} options={[...EDUCATIONS]} placeholder="Pilih" />
            <div className="space-y-2">
              <SelectField step="A4" label="Pekerjaan" value={form.occupation} onChange={(v) => updateField('occupation', v)} options={[...OCCUPATIONS]} placeholder="Pilih" />
              {form.occupation === 'Lainnya' && (
                <Input
                  placeholder="Tuliskan pekerjaan Anda..."
                  value={form.occupation_other}
                  onChange={(e) => updateField('occupation_other', e.target.value)}
                  className="h-10 text-sm rounded-xl border-slate-200 font-[family-name:var(--font-body)]"
                />
              )}
            </div>
          </div>

          {/* A5 - Pendapatan (NEW) */}
          <SelectField step="A5" label="Pendapatan bulanan rumah tangga (bersih)" value={form.income_range} onChange={(v) => updateField('income_range', v)} options={[...INCOME_RANGES]} placeholder="Pilih" />

          {/* A6 - Jenis Pembayaran (updated label) */}
          <div className="space-y-2">
            <SelectField step="A6" label="Jenis pembayaran untuk terapi ini" value={form.patient_type} onChange={(v) => updateField('patient_type', v)} options={[...PATIENT_TYPES]} placeholder="Pilih" />
            {form.patient_type === 'Lainnya' && (
              <Input
                placeholder="Tuliskan jenis pembayaran Anda..."
                value={form.patient_type}
                onChange={(e) => updateField('patient_type', e.target.value)}
                className="h-10 text-sm rounded-xl border-slate-200 font-[family-name:var(--font-body)]"
              />
            )}
          </div>

          {/* A7 - Kondisi / Keluhan Utama (BUG FIX: now writes to condition_type_other) */}
          <div className="space-y-2">
            <SelectField step="A7" label="Kondisi / Keluhan Utama" value={form.condition_type} onChange={(v) => updateField('condition_type', v)} options={[...CONDITION_TYPES]} placeholder="Pilih keluhan" />
            {form.condition_type === 'Lainnya' && (
              <Input
                placeholder="Tuliskan keluhan Anda..."
                value={form.condition_type_other}
                onChange={(e) => updateField('condition_type_other', e.target.value)}
                className="h-10 text-sm rounded-xl border-slate-200 font-[family-name:var(--font-body)]"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField step="A8" label='Kunjungan Ke-' value={form.visit_count} onChange={(v) => updateField('visit_count', v)} options={[...VISIT_COUNTS]} placeholder="Pilih" />
            <SelectField step="A9" label="Sumber Rujukan" value={form.referral_source} onChange={(v) => updateField('referral_source', v)} options={[...REFERRAL_SOURCES]} placeholder="Pilih" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}