'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SurveyProgress from '@/components/survey/SurveyProgress'
import { ArrowLeft, ArrowRight, Stethoscope, AlertCircle } from 'lucide-react'
import { saveSurveyData } from '@/lib/survey-storage'
import { useDemographicForm } from '@/lib/hooks/use-survey-answers'
import {
  demographicsSchema,
  AGE_GROUPS,
  GENDERS,
  EDUCATIONS,
  OCCUPATIONS,
  INCOME_GROUPS,
  SERVICE_TYPES,
  VISIT_COUNTS,
  REFERRAL_SOURCES,
  MAIN_COMPLAINT_CATEGORIES,
} from '@/lib/validators'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const SELECT_FIELDS = [
  { key: 'age_group', label: 'Kelompok Usia', options: AGE_GROUPS, placeholder: 'Pilih kelompok usia' },
  { key: 'gender', label: 'Jenis Kelamin', options: GENDERS, placeholder: 'Pilih jenis kelamin' },
  { key: 'education', label: 'Pendidikan Terakhir', options: EDUCATIONS, placeholder: 'Pilih pendidikan' },
  { key: 'occupation', label: 'Pekerjaan', options: OCCUPATIONS, placeholder: 'Pilih pekerjaan' },
  { key: 'income_group', label: 'Pendapatan Bulanan', options: INCOME_GROUPS, placeholder: 'Pilih pendapatan' },
  { key: 'service_type', label: 'Jenis Layanan', options: SERVICE_TYPES, placeholder: 'Pilih jenis layanan' },
  { key: 'visit_count', label: 'Jumlah Kunjungan', options: VISIT_COUNTS, placeholder: 'Pilih jumlah kunjungan' },
  { key: 'referral_source', label: 'Sumber Rujukan', options: REFERRAL_SOURCES, placeholder: 'Pilih sumber rujukan' },
  { key: 'main_complaint_category', label: 'Keluhan Utama', options: MAIN_COMPLAINT_CATEGORIES, placeholder: 'Pilih keluhan utama' },
] as const

export default function DemographicPage() {
  const router = useRouter()
  const { formData, mounted, handleSelectChange } = useDemographicForm()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNext = () => {
    const result = demographicsSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0]?.toString()
        if (field) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    saveSurveyData(formData)
    router.push('/survey/pv')
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
              <p className="text-sm font-bold text-slate-800">Data Umum</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/survey/screening')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <SurveyProgress currentStep={4} totalSteps={9} label="Data Umum Responden" />
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
            Data Umum Responden
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Silakan lengkapi data berikut. Semua data bersifat anonim dan hanya digunakan untuk
            keperluan penelitian.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE_OUT }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5 sm:p-6 space-y-5">
              {SELECT_FIELDS.map((field, idx) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.04, duration: 0.3, ease: EASE_OUT }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor={field.key}
                    className="text-sm font-medium text-slate-700"
                  >
                    {field.label}
                    <span className="text-red-400 ml-0.5">*</span>
                  </Label>
                  <Select
                    value={formData[field.key] || ''}
                    onValueChange={(value) => handleSelectChange(field.key, value)}
                  >
                    <SelectTrigger
                      id={field.key}
                      className={`w-full ${
                        errors[field.key]
                          ? 'border-red-300 focus:ring-red-200'
                          : formData[field.key]
                            ? 'border-emerald-300'
                            : ''
                      }`}
                    >
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[field.key] && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors[field.key]}
                    </p>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/survey/screening')}
            className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Lanjut
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
