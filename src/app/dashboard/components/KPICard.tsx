'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { KPI_COLOR_MAP } from '../lib/constants'

export interface KpiItem {
  icon: LucideIcon
  title: string
  value: string
  subtitle: string
  trend: 'up' | 'down'
  color: 'teal' | 'blue' | 'amber' | 'rose'
}

export default function KPICard({ kpi, index }: { kpi: KpiItem; index: number }) {
  const Icon = kpi.icon
  const c = KPI_COLOR_MAP[kpi.color]

  return (
    <motion.div
      key={kpi.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.iconBg} shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {kpi.trend === 'up' ? (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 ${c.trendUp}`}>
            ↑
          </span>
        ) : (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
            ↓
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight font-[family-name:var(--font-display)]">
          {kpi.value}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{kpi.title}</p>
        <p className="text-[11px] font-semibold mt-1 text-teal-600">{kpi.subtitle}</p>
      </div>
      <div className={`mt-3 h-1 rounded-full ${c.iconBg}`} style={{ width: '40%' }} />
    </motion.div>
  )
}
