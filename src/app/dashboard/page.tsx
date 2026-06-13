'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SummaryCards from '@/components/dashboard/SummaryCards'
import type { DashboardSummary } from '@/lib/types'

const CHART_COLORS = ['#059669', '#0D9488', '#14B8A6', '#2DD4BF']

const defaultSummary: DashboardSummary = {
  totalRespondents: 0,
  validRespondents: 0,
  targetProgress: 0,
  avgPV: null,
  avgTrust: null,
  avgSatisfaction: null,
  avgLoyalty: null,
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard/summary')
      if (!res.ok) throw new Error('Gagal memuat data')
      const data: DashboardSummary = await res.json()
      setSummary(data)
    } catch (err) {
      console.error('Fetch summary error:', err)
      setError('Gagal memuat data ringkasan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  // Prepare chart data
  const chartData = [
    { name: 'PV', value: summary.avgPV ?? 0 },
    { name: 'Trust', value: summary.avgTrust ?? 0 },
    { name: 'Satisfaction', value: summary.avgSatisfaction ?? 0 },
    { name: 'Loyalty', value: summary.avgLoyalty ?? 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan survei PVLS — RSU Ja&apos;far Medika
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSummary}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rata-rata Skor Dimensi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toFixed(2), 'Rata-rata']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={56}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Skor Likert 1–5 | Berdasarkan responden valid (is_complete = true)
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
