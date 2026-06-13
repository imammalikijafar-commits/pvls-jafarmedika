'use client'

import { cn } from '@/lib/utils'

interface LikertScaleProps {
  value: number | null
  onChange: (val: number) => void
  disabled?: boolean
}

const OPTIONS = [
  { value: 1, emoji: '😞', label: 'Sangat Tidak Setuju' },
  { value: 2, emoji: '😕', label: 'Tidak Setuju' },
  { value: 3, emoji: '😐', label: 'Netral' },
  { value: 4, emoji: '😊', label: 'Setuju' },
  { value: 5, emoji: '😄', label: 'Sangat Setuju' },
] as const

export default function LikertScale({ value, onChange, disabled = false }: LikertScaleProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 justify-center">
      {OPTIONS.map((opt) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            aria-label={`${opt.value} — ${opt.label}`}
            aria-pressed={isSelected}
            className={cn(
              'flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-200 min-w-0 sm:min-w-[72px] flex-1 sm:flex-none',
              'hover:scale-[1.03] active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:pointer-events-none',
              isSelected
                ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/15 scale-[1.03]'
                : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
            )}
          >
            <span className="text-2xl sm:text-3xl leading-none" aria-hidden="true">
              {opt.emoji}
            </span>
            <span
              className={cn(
                'text-xs font-bold tabular-nums',
                isSelected ? 'text-emerald-700' : 'text-slate-400'
              )}
            >
              {opt.value}
            </span>
            <span
              className={cn(
                'text-[10px] sm:text-[11px] leading-tight text-center max-w-[80px]',
                isSelected ? 'text-emerald-700 font-semibold' : 'text-slate-400'
              )}
            >
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}