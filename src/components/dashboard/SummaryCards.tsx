'use client'

import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  Target,
  TrendingUp,
  ShieldCheck,
  Star,
  Heart,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DashboardSummary } from '@/lib/types'

interface SummaryCardsProps {
  summary: DashboardSummary
}

const cards = [
  {
    key: 'totalRespondents' as const,
    title: 'Total Responden',
    icon: Users,
    color: 'emerald',
    format: (v: number) => v.toString(),
  },
  {
    key: 'validRespondents' as const,
    title: 'Responden Valid',
    icon: UserCheck,
    color: 'teal',
    format: (v: number) => v.toString(),
  },
  {
    key: 'targetProgress' as const,
    title: 'Progres Target 250',
    icon: Target,
    color: 'emerald',
    format: (v: number) => `${v.toFixed(1)}%`,
    isProgress: true,
  },
  {
    key: 'avgPV' as const,
    title: 'Rata-rata PV',
    icon: TrendingUp,
    color: 'teal',
    format: (v: number | null) => v !== null ? v.toFixed(2) : '-',
  },
  {
    key: 'avgTrust' as const,
    title: 'Rata-rata Trust',
    icon: ShieldCheck,
    color: 'emerald',
    format: (v: number | null) => v !== null ? v.toFixed(2) : '-',
  },
  {
    key: 'avgSatisfaction' as const,
    title: 'Rata-rata Satisfaction',
    icon: Star,
    color: 'teal',
    format: (v: number | null) => v !== null ? v.toFixed(2) : '-',
  },
  {
    key: 'avgLoyalty' as const,
    title: 'Rata-rata Loyalty',
    icon: Heart,
    color: 'emerald',
    format: (v: number | null) => v !== null ? v.toFixed(2) : '-',
  },
]

const colorMap: Record<string, { iconBg: string; barBg: string; text: string }> = {
  emerald: {
    iconBg: 'bg-emerald-500',
    barBg: 'bg-emerald-500',
    text: 'text-emerald-600',
  },
  teal: {
    iconBg: 'bg-teal-500',
    barBg: 'bg-teal-500',
    text: 'text-teal-600',
  },
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const value = summary[card.key]
        const c = colorMap[card.color] ?? colorMap.emerald

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${c.iconBg}`}
                  >
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-800 tracking-tight">
                    {card.format(value as never)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    {card.title}
                  </p>
                </div>
                {card.isProgress && (
                  <div className="mt-2">
                    <Progress value={value as number} className="h-2" />
                    <p className="text-xs text-gray-400 mt-1">
                      {summary.validRespondents} / 250 responden
                    </p>
                  </div>
                )}
                {!card.isProgress && (
                  <div className={`mt-2 h-1 rounded-full ${c.barBg}`} style={{ width: '35%' }} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
