'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SurveyResponse } from '@/lib/types'
import { EXTREME_PATTERN_LABELS } from '@/lib/scoring'

interface ResponseTableProps {
  responses: SurveyResponse[]
  pageSize?: number
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatMean(value: number | null): string {
  if (value === null || value === undefined) return '-'
  return value.toFixed(2)
}

function getPatternBadgeVariant(flag: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (flag === 'pv_high_loyalty_low') return 'destructive'
  if (flag === 'pv_medium_loyalty_high') return 'secondary'
  return 'outline'
}

export default function ResponseTable({ responses, pageSize = 10 }: ResponseTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(responses.length / pageSize))

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pageData = responses.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[140px]">Tanggal</TableHead>
                <TableHead>Jenis Layanan</TableHead>
                <TableHead className="text-center">PV Mean</TableHead>
                <TableHead className="text-center">Trust Mean</TableHead>
                <TableHead className="text-center">Satisfaction Mean</TableHead>
                <TableHead className="text-center">Loyalty Mean</TableHead>
                <TableHead>Pola Ekstrem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    Belum ada data respons
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(r.created_at)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {r.service_type ?? '-'}
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono">
                      {formatMean(r.pv_total_mean)}
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono">
                      {formatMean(r.trust_mean)}
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono">
                      {formatMean(r.satisfaction_mean)}
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono">
                      {formatMean(r.loyalty_mean)}
                    </TableCell>
                    <TableCell>
                      {r.extreme_pattern_flag && r.extreme_pattern_flag !== 'normal' && r.extreme_pattern_flag !== 'incomplete' ? (
                        <Badge variant={getPatternBadgeVariant(r.extreme_pattern_flag)}>
                          {EXTREME_PATTERN_LABELS[r.extreme_pattern_flag as keyof typeof EXTREME_PATTERN_LABELS] ?? r.extreme_pattern_flag}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">Normal</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan {startIndex + 1}–{Math.min(endIndex, responses.length)} dari {responses.length} data
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Hal {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
