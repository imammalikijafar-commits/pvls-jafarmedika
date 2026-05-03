'use client'

import { useState } from 'react'
import {
  Search, SlidersHorizontal, ChevronDown, MessageCircle, X
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { DashboardData } from '@/lib/types'
import { CONDITION_TYPES } from '../lib/constants'

interface FeedbackPanelProps {
  data: DashboardData
}

export default function FeedbackPanel({ data }: FeedbackPanelProps) {
  const [fbSearch, setFbSearch] = useState('')
  const [fbCondition, setFbCondition] = useState('')
  const [fbNpsCategory, setFbNpsCategory] = useState('')
  const [fbDateFrom, setFbDateFrom] = useState('')
  const [fbDateTo, setFbDateTo] = useState('')
  const [fbFilterOpen, setFbFilterOpen] = useState(false)

  const resetFbFilters = () => {
    setFbSearch('')
    setFbCondition('')
    setFbNpsCategory('')
    setFbDateFrom('')
    setFbDateTo('')
  }

  const filteredFeedback = data?.recentFeedback.filter((fb) => {
    if (fbNpsCategory === 'promoter' && (!fb.npsScore || fb.npsScore < 9)) return false
    if (fbNpsCategory === 'passive' && (!fb.npsScore || fb.npsScore < 7 || fb.npsScore > 8)) return false
    if (fbNpsCategory === 'detractor' && (!fb.npsScore || fb.npsScore > 6)) return false
    if (fbCondition && fb.conditionType !== fbCondition) return false
    if (fbDateFrom && fb.submittedAt < fbDateFrom) return false
    if (fbDateTo && fb.submittedAt > fbDateTo + 'T23:59:59') return false
    if (fbSearch) {
      const q = fbSearch.toLowerCase()
      const haystack = [fb.testimonial, fb.bestExperience, fb.suggestions, fb.improvementSuggestion].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  }) ?? []

  return (
    <div className="space-y-4">
      {/* Search + Filter Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari testimoni, pengalaman terbaik, atau saran perbaikan..."
              value={fbSearch}
              onChange={(e) => setFbSearch(e.target.value)}
              onFocus={() => setFbFilterOpen(true)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
            />
          </div>
          <button
            onClick={() => setFbFilterOpen(!fbFilterOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
              fbFilterOpen || fbNpsCategory || fbCondition || fbDateFrom || fbDateTo
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {(fbFilterOpen || fbNpsCategory || fbCondition || fbDateFrom || fbDateTo) && (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            fbFilterOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Kategori NPS</label>
              <select
                value={fbNpsCategory}
                onChange={(e) => setFbNpsCategory(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="">Semua</option>
                <option value="promoter">Promoter (9-10)</option>
                <option value="passive">Passive (7-8)</option>
                <option value="detractor">Detractor (0-6)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Kondisi/Diagnosis</label>
              <select
                value={fbCondition}
                onChange={(e) => setFbCondition(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="">Semua Kondisi</option>
                {CONDITION_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Dari Tanggal</label>
              <input
                type="date"
                value={fbDateFrom}
                onChange={(e) => setFbDateFrom(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Sampai Tanggal</label>
              <input
                type="date"
                value={fbDateTo}
                onChange={(e) => setFbDateTo(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
          </div>
          {(fbNpsCategory || fbCondition || fbDateFrom || fbDateTo || fbSearch) && (
            <div className="pt-3 flex justify-end">
              <button
                onClick={resetFbFilters}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" /> Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Belum ada feedback</p>
          </div>
        ) : (
          filteredFeedback.map((fb, i) => {
            const isPositive = fb.npsScore !== null && fb.npsScore !== undefined && fb.npsScore >= 9
            const isNegative = fb.npsScore !== null && fb.npsScore !== undefined && fb.npsScore <= 6
            const borderColor = isPositive ? 'border-l-emerald-500' : isNegative ? 'border-l-red-500' : 'border-l-amber-500'
            const bgColor = isPositive ? 'bg-emerald-50/50' : isNegative ? 'bg-red-50/50' : 'bg-white'

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`${bgColor} border border-slate-200 border-l-4 ${borderColor} rounded-xl p-4 space-y-2`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{fb.unitName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(fb.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fb.conditionType && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {fb.conditionType}
                      </span>
                    )}
                    {fb.npsScore !== null && fb.npsScore !== undefined && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isPositive ? 'bg-emerald-100 text-emerald-700' : isNegative ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        NPS {fb.npsScore}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                {fb.testimonial && (
                  <p className="text-sm text-slate-700 leading-relaxed pl-10">
                    &ldquo;{fb.testimonial}&rdquo;
                  </p>
                )}
                {fb.bestExperience && (
                  <p className="text-sm text-slate-600 pl-10">
                    <span className="text-emerald-600 font-medium text-xs">Pengalaman Terbaik: </span>
                    {fb.bestExperience}
                  </p>
                )}
                {(fb.suggestions || fb.improvementSuggestion) && (
                  <div className="bg-blue-50/60 rounded-lg p-3 ml-10">
                    <p className="text-xs text-blue-800 font-medium">Saran:</p>
                    <p className="text-sm text-blue-700 mt-0.5">{fb.suggestions || fb.improvementSuggestion}</p>
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
