'use client'

import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import type { SurveyResponse } from '@/lib/types'
import { EXTREME_PATTERN_LABELS, EXTREME_PATTERN_DESCRIPTIONS } from '@/lib/scoring'

interface ExtremePatternTableProps {
  responses: SurveyResponse[]
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

export default function ExtremePatternTable({ responses }: ExtremePatternTableProps) {
  const pvHighLoyaltyLow = useMemo(
    () => responses.filter((r) => r.extreme_pattern_flag === 'pv_high_loyalty_low'),
    [responses]
  )

  const pvMediumLoyaltyHigh = useMemo(
    () => responses.filter((r) => r.extreme_pattern_flag === 'pv_medium_loyalty_high'),
    [responses]
  )

  const renderTable = (data: SurveyResponse[], emptyMessage: string) => (
    <div className="rounded-lg border overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[140px]">Tanggal</TableHead>
              <TableHead>Jenis Layanan</TableHead>
              <TableHead className="text-center">PV Mean</TableHead>
              <TableHead className="text-center">Loyalty Mean</TableHead>
              <TableHead>Usia</TableHead>
              <TableHead>Pendidikan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(r.created_at)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {r.service_type ?? '-'}
                  </TableCell>
                  <TableCell className="text-center text-sm font-mono font-semibold">
                    {formatMean(r.pv_total_mean)}
                  </TableCell>
                  <TableCell className="text-center text-sm font-mono font-semibold">
                    {formatMean(r.loyalty_mean)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.age_group ?? '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.education ?? '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  return (
    <Tabs defaultValue="pv_high_loyalty_low" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="pv_high_loyalty_low" className="gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          PV Tinggi, Loyalitas Rendah
          <Badge variant="destructive" className="ml-1 text-xs">
            {pvHighLoyaltyLow.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="pv_medium_loyalty_high" className="gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          PV Sedang, Loyalitas Tinggi
          <Badge variant="secondary" className="ml-1 text-xs">
            {pvMediumLoyaltyHigh.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pv_high_loyalty_low">
        <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-700 font-medium">
            {EXTREME_PATTERN_LABELS.pv_high_loyalty_low}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {EXTREME_PATTERN_DESCRIPTIONS.pv_high_loyalty_low}
          </p>
        </div>
        {renderTable(pvHighLoyaltyLow, 'Tidak ada data dengan pola PV Tinggi, Loyalitas Rendah')}
      </TabsContent>

      <TabsContent value="pv_medium_loyalty_high">
        <div className="mb-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-sm text-amber-700 font-medium">
            {EXTREME_PATTERN_LABELS.pv_medium_loyalty_high}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {EXTREME_PATTERN_DESCRIPTIONS.pv_medium_loyalty_high}
          </p>
        </div>
        {renderTable(pvMediumLoyaltyHigh, 'Tidak ada data dengan pola PV Sedang, Loyalitas Tinggi')}
      </TabsContent>
    </Tabs>
  )
}
