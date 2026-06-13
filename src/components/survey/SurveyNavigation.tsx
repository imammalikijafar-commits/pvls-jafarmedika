'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

interface SurveyNavigationProps {
  onBack?: () => void
  onNext?: () => void
  canNext?: boolean
  isSubmitting?: boolean
  nextLabel?: string
  backLabel?: string
}

export default function SurveyNavigation({
  onBack,
  onNext,
  canNext = true,
  isSubmitting = false,
  nextLabel = 'Lanjut',
  backLabel = 'Kembali',
}: SurveyNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      {/* Back button — hidden when no onBack (first step) */}
      {onBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className={cn(
            'gap-2 border-slate-300 text-slate-600',
            'hover:bg-slate-50 hover:text-slate-800'
          )}
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Button>
      ) : (
        <div />
      )}

      {/* Next / Submit button */}
      <Button
        type="button"
        onClick={onNext}
        disabled={!canNext || isSubmitting}
        className={cn(
          'gap-2 bg-emerald-600 text-white hover:bg-emerald-700',
          'disabled:bg-slate-200 disabled:text-slate-400'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  )
}
