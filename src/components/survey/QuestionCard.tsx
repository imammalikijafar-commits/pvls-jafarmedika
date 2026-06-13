'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import LikertScale from '@/components/survey/LikertScale'

interface QuestionCardProps {
  code: string
  text: string
  value: number | null
  onChange: (val: number) => void
  index: number
  disabled?: boolean
}

export default function QuestionCard({
  code,
  text,
  value,
  onChange,
  index,
  disabled = false,
}: QuestionCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 sm:p-5 transition-colors',
        value ? 'border-emerald-200' : 'border-slate-200'
      )}
    >
      {/* Header: number + badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-slate-400 tabular-nums">
          {index + 1}.
        </span>
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold"
        >
          {code}
        </Badge>
      </div>

      {/* Question text */}
      <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
        {text}
      </p>

      {/* Likert scale */}
      <LikertScale value={value} onChange={onChange} disabled={disabled} />
    </div>
  )
}
