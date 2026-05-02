'use client'

import { motion } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { H1_LIKED_CATEGORIES, H2_SUGGESTED_CATEGORIES } from '@/lib/validators'
import type { FormData } from './types'

interface SectionProps {
  form: FormData
  updateField: (key: keyof FormData, value: string | number | null) => void
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

// ─── Checkbox Category Component ────────────────────────────────
interface CheckboxCategoryProps {
  title: string
  items: readonly string[] | string[]
  selected: string[]
  onToggle: (item: string) => void
  color?: 'teal' | 'blue' | 'amber'
}

function CheckboxCategory({ title, items, selected, onToggle, color = 'teal' }: CheckboxCategoryProps) {
  const [open, setOpen] = useState(true)
  const colorMap = {
    teal: { titleBg: 'bg-teal-50', titleText: 'text-teal-800', border: 'border-teal-200', activeBg: 'bg-teal-500', activeText: 'text-white', activeBorder: 'border-teal-500' },
    blue: { titleBg: 'bg-blue-50', titleText: 'text-blue-800', border: 'border-blue-200', activeBg: 'bg-blue-500', activeText: 'text-white', activeBorder: 'border-blue-500' },
    amber: { titleBg: 'bg-amber-50', titleText: 'text-amber-800', border: 'border-amber-200', activeBg: 'bg-amber-500', activeText: 'text-white', activeBorder: 'border-amber-500' },
  }
  const c = colorMap[color]

  return (
    <div className="rounded-xl border border-slate-200/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn('w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors', c.titleBg)}
      >
        <span className={cn('text-xs font-bold uppercase tracking-wider', c.titleText)}>{title}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 bg-white">
          {items.map((item) => {
            const isSelected = selected.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggle(item)}
                className={cn(
                  'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer font-[family-name:var(--font-body)]',
                  isSelected
                    ? cn('font-medium shadow-sm', c.activeBg, c.activeText)
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                )}
              >
                <span className={cn(
                  'w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] font-bold border transition-all',
                  isSelected
                    ? cn(c.activeBg, 'border-transparent', 'text-white')
                    : 'border-slate-300 text-transparent bg-white'
                )}>
                  {isSelected ? '\u2713' : ''}
                </span>
                {item}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────
export default function SectionH({ form, updateField }: SectionProps) {
  const toggleH1 = (item: string) => {
    const next = form.h1_liked.includes(item)
      ? form.h1_liked.filter((i) => i !== item)
      : [...form.h1_liked, item]
    // Use JSON stringify trick to pass array as string to updateField
    ;(updateField as (key: keyof FormData, value: unknown) => void)('h1_liked', next)
  }

  const toggleH2 = (item: string) => {
    const next = form.h2_suggested.includes(item)
      ? form.h2_suggested.filter((i) => i !== item)
      : [...form.h2_suggested, item]
    ;(updateField as (key: keyof FormData, value: unknown) => void)('h2_suggested', next)
  }

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
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Bagian H — Masukan & Saran
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-body)]">
            Boleh pilih lebih dari satu pada setiap pertanyaan
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />
        <div className="p-5 sm:p-6 space-y-6">

          {/* ─── H1: Hal yang Paling Disukai ─── */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-teal-700 font-[family-name:var(--font-display)]">
                H1. Hal yang PALING ANDA SUKAI dari layanan integrative medicine:
              </Label>
              <p className="text-[11px] text-slate-400 mt-0.5 font-[family-name:var(--font-body)]">
                Boleh pilih lebih dari satu
              </p>
            </div>
            <div className="space-y-2">
              {H1_LIKED_CATEGORIES.map((cat) => (
                <CheckboxCategory
                  key={cat.title}
                  title={cat.title}
                  items={cat.items}
                  selected={form.h1_liked}
                  onToggle={toggleH1}
                  color="teal"
                />
              ))}
            </div>
            {/* Lainnya */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-500 font-[family-name:var(--font-body)]">
                Lainnya (opsional):
              </Label>
              <input
                type="text"
                value={form.h1_liked_other}
                onChange={(e) => updateField('h1_liked_other', e.target.value)}
                placeholder="Tuliskan hal lain yang Anda sukai..."
                className="w-full h-10 text-sm rounded-xl border border-slate-200 bg-white px-3 font-[family-name:var(--font-body)] hover:border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* ─── H2: Saran Perbaikan ─── */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-blue-700 font-[family-name:var(--font-display)]">
                H2. Saran perbaikan yang Anda harapkan:
              </Label>
              <p className="text-[11px] text-slate-400 mt-0.5 font-[family-name:var(--font-body)]">
                Boleh pilih lebih dari satu
              </p>
            </div>
            <div className="space-y-2">
              {H2_SUGGESTED_CATEGORIES.map((cat) => (
                <CheckboxCategory
                  key={cat.title}
                  title={cat.title}
                  items={cat.items}
                  selected={form.h2_suggested}
                  onToggle={toggleH2}
                  color="blue"
                />
              ))}
            </div>
            {/* Lainnya */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-500 font-[family-name:var(--font-body)]">
                Lainnya (opsional):
              </Label>
              <input
                type="text"
                value={form.h2_suggested_other}
                onChange={(e) => updateField('h2_suggested_other', e.target.value)}
                placeholder="Saran perbaikan lainnya..."
                className="w-full h-10 text-sm rounded-xl border border-slate-200 bg-white px-3 font-[family-name:var(--font-body)] hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* ─── H3: Testimonial / Pengalaman ─── */}
          <div className="space-y-2">
            <div>
              <Label className="text-sm font-semibold text-amber-700 font-[family-name:var(--font-display)]">
                H3. Ceritakan pengalaman Anda menjalani terapi integratif:
              </Label>
              <p className="text-[11px] text-slate-400 mt-0.5 font-[family-name:var(--font-body)]">
                Opsional — boleh dilewati
              </p>
            </div>
            <Textarea
              value={form.testimonial}
              onChange={(e) => updateField('testimonial', e.target.value)}
              placeholder='Contoh: "Saya sudah 5 kali terapi dan nyeri punggung saya berkurang banyak..."'
              className="min-h-[120px] text-sm rounded-xl border-slate-200 font-[family-name:var(--font-body)] focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Closing message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center py-2"
      >
        <p className="text-xs text-slate-400 italic font-[family-name:var(--font-body)]">
          Terima kasih atas waktu dan partisipasi Anda. Semoga senantiasa diberikan kesehatan dan kesembuhan.
        </p>
      </motion.div>
    </motion.div>
  )
}