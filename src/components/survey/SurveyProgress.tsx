'use client'

import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface SurveyProgressProps {
  currentStep: number
  totalSteps: number
  label: string
}

export default function SurveyProgress({
  currentStep,
  totalSteps,
  label,
}: SurveyProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="w-full space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-emerald-700 tabular-nums">
          Langkah {currentStep} dari {totalSteps}
        </span>
      </div>

      {/* Progress bar — teal/emerald themed */}
      <Progress
        value={percentage}
        className={cn(
          'h-2.5 bg-emerald-100 [&>[data-slot=progress-indicator]]:bg-emerald-500'
        )}
      />

      {/* Percentage hint */}
      <p className="text-xs text-slate-400 text-right tabular-nums">
        {percentage}%
      </p>
    </div>
  )
}
