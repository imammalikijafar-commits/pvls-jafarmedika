'use client'

import {
  Search, Filter, Database, FileSpreadsheet, FileText,
  RefreshCw, X, ChevronLeft, ChevronRight, Eye
} from 'lucide-react'
import { CONDITION_TYPES } from '../lib/constants'
import type { SurveyRow, SurveysResponse, SurveyFilters } from '../hooks/useSurveys'

interface SurveyTableProps {
  surveysData: SurveysResponse | null
  surveysLoading: boolean
  fetchSurveys: (page: number) => void
  filters: {
    search: string
    dateFrom: string
    dateTo: string
    gender: string
    condition: string
    npsMin: string
    npsMax: string
  }
  setFilter: <K extends keyof SurveyFilters>(key: K, value: SurveyFilters[K]) => void
  resetFilters: () => void
  hasFilters: boolean
  expandedRow: string | null
  setExpandedRow: (id: string | null) => void
  dataFilterOpen: boolean
  setDataFilterOpen: (open: boolean) => void
  getExportUrl: (type: 'excel' | 'pdf') => string
}

export default function SurveyTable({
  surveysData,
  surveysLoading,
  fetchSurveys,
  filters,
  setFilter,
  resetFilters,
  hasFilters,
  expandedRow,
  setExpandedRow,
  dataFilterOpen,
  setDataFilterOpen,
  getExportUrl,
}: SurveyTableProps) {
  const currentPage = surveysData?.page ?? 1

  return (
    <div className="space-y-4">
      {/* Search + Filter Toggle + Export */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pasien, feedback..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              onFocus={() => setDataFilterOpen(true)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
            />
          </div>
          <button
            onClick={() => setDataFilterOpen(!dataFilterOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
              dataFilterOpen || hasFilters
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <a href={getExportUrl('excel')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </a>
          <a href={getExportUrl('pdf')} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </a>
        </div>

        {/* Collapsible Filter Panel */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            dataFilterOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Dari Tanggal</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilter('dateFrom', e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilter('dateTo', e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilter('gender', e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="">Semua</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">Kondisi/Diagnosis</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilter('condition', e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="">Semua Kondisi</option>
                {CONDITION_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">NPS Min (0-10)</label>
              <input
                type="number"
                value={filters.npsMin}
                onChange={(e) => setFilter('npsMin', e.target.value)}
                placeholder="0"
                min={0}
                max={10}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium mb-1 block">NPS Max (0-10)</label>
              <input
                type="number"
                value={filters.npsMax}
                onChange={(e) => setFilter('npsMax', e.target.value)}
                placeholder="10"
                min={0}
                max={10}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Reset Semua Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-[family-name:var(--font-display)]">
            <Database className="w-4 h-4 text-teal-600" />
            Data Survei Individual
          </h3>
          {surveysData && (
            <span className="text-[11px] text-slate-500">{surveysData.total} total hasil</span>
          )}
        </div>

        <div className="p-0">
          {surveysLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-5 h-5 text-teal-500 animate-spin" />
              <span className="ml-2 text-sm text-slate-500">Memuat data...</span>
            </div>
          ) : !surveysData || surveysData.surveys.length === 0 ? (
            <div className="text-center py-16">
              <Database className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Tidak ada data survei ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 border-b border-slate-200 text-left">
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 w-10">#</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Tanggal</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Usia</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Gender</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Diagnosis</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">NPS</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Nyeri Sblm</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">Nyeri Ssd</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">SERVQUAL</th>
                      <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveysData.surveys.map((s, i) => {
                      const no = (currentPage - 1) * surveysData.pageSize + i + 1
                      const isPromoter = s.nps_score !== null && s.nps_score >= 9
                      const isDetractor = s.nps_score !== null && s.nps_score <= 6
                      const overallServ = s.tangibles && s.reliability && s.responsiveness && s.assurance && s.empathy
                        ? ((s.tangibles + s.reliability + s.responsiveness + s.assurance + s.empathy) / 5).toFixed(1)
                        : null
                      const isExpanded = expandedRow === s.id

                      return (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td colSpan={10} className="p-0">
                            {/* Main Row */}
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                              className="w-full text-left px-3 py-3 flex items-center gap-0 cursor-pointer"
                            >
                              <span className="font-medium text-slate-400 w-10 text-xs shrink-0">{no}</span>
                              <span className="text-slate-700 text-xs w-24 shrink-0">
                                {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                              </span>
                              <span className="text-slate-600 text-xs w-16 shrink-0">{s.age_range || '-'}</span>
                              <span className="text-slate-600 text-xs w-14 shrink-0">
                                {s.gender === 'L' ? 'L' : s.gender === 'P' ? 'P' : '-'}
                              </span>
                              <span className="text-slate-600 text-xs flex-1 min-w-0 truncate">
                                {s.condition_type || '-'}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-10 text-center shrink-0 ${
                                isPromoter ? 'bg-emerald-100 text-emerald-700' : isDetractor ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {s.nps_score ?? '-'}
                              </span>
                              <span className="text-slate-500 text-xs w-14 text-center shrink-0">
                                {s.pain_level_before ?? '-'}
                              </span>
                              <span className="text-slate-500 text-xs w-14 text-center shrink-0">
                                {s.pain_level_after ?? '-'}
                              </span>
                              <span className={`text-xs font-bold w-16 text-center shrink-0 ${
                                overallServ && parseFloat(overallServ) >= 4 ? 'text-teal-600' : overallServ && parseFloat(overallServ) >= 3 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {overallServ ? `${overallServ}/5` : '-'}
                              </span>
                              <span className="w-16 flex justify-center shrink-0">
                                <Eye className="w-4 h-4 text-slate-400" />
                              </span>
                            </button>

                            {/* Expanded Detail */}
                            <div
                              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className="px-3 pb-4 pt-1">
                                <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                                  {/* Demographics Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Pendidikan</span>
                                      <span className="text-xs font-medium text-slate-700">{s.education || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Pekerjaan</span>
                                      <span className="text-xs font-medium text-slate-700">{s.occupation || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Jenis Pasien</span>
                                      <span className="text-xs font-medium text-slate-700">{s.patient_type || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Kunjungan</span>
                                      <span className="text-xs font-medium text-slate-700">{s.visit_count || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Herbal</span>
                                      <span className="text-xs font-medium text-slate-700">{s.herbal_prescribed ? 'Ya' : 'Tidak'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Perubahan Kondisi</span>
                                      <span className="text-xs font-medium text-slate-700">{s.condition_change || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Rencana Kunjungan</span>
                                      <span className="text-xs font-medium text-slate-700">{s.visit_plan || '-'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Sudah Rekomendasi</span>
                                      <span className="text-xs font-medium text-slate-700">{s.has_recommended || '-'}</span>
                                    </div>
                                  </div>

                                  <div className="border-t border-slate-200 pt-3">
                                    <span className="text-[11px] text-slate-400 block mb-2">SERVQUAL Scores</span>
                                    <div className="flex flex-wrap gap-2">
                                      {[
                                        { label: 'Tangibles', value: s.tangibles },
                                        { label: 'Reliability', value: s.reliability },
                                        { label: 'Responsiveness', value: s.responsiveness },
                                        { label: 'Assurance', value: s.assurance },
                                        { label: 'Empathy', value: s.empathy },
                                      ].map((dim) => (
                                        <span
                                          key={dim.label}
                                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                            dim.value !== null && dim.value >= 4
                                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                              : dim.value !== null && dim.value >= 3
                                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                                          }`}
                                        >
                                          {dim.label}: {dim.value ?? '-'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Testimonial / Best Experience / Suggestion */}
                                  {(s.best_experience || s.improvement_suggestion || s.testimonial) && (
                                    <div className="border-t border-slate-200 pt-3 space-y-2">
                                      {s.best_experience && (
                                        <div>
                                          <span className="text-[11px] text-teal-600 font-semibold block">Pengalaman Terbaik:</span>
                                          <p className="text-xs text-slate-700 mt-0.5">{s.best_experience}</p>
                                        </div>
                                      )}
                                      {s.improvement_suggestion && (
                                        <div>
                                          <span className="text-[11px] text-amber-600 font-semibold block">Saran Perbaikan:</span>
                                          <p className="text-xs text-slate-700 mt-0.5">{s.improvement_suggestion}</p>
                                        </div>
                                      )}
                                      {s.testimonial && (
                                        <div>
                                          <span className="text-[11px] text-blue-600 font-semibold block">Testimoni:</span>
                                          <p className="text-xs text-slate-700 mt-0.5 italic">&ldquo;{s.testimonial}&rdquo;</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* H1 Liked / H2 Suggested */}
                                  {(s.h1_liked && s.h1_liked.length > 0) || (s.h2_suggested && s.h2_suggested.length > 0) ? (
                                    <div className="border-t border-slate-200 pt-3 space-y-2">
                                      {s.h1_liked && s.h1_liked.length > 0 && (
                                        <div>
                                          <span className="text-[11px] text-teal-600 font-semibold block">H1 - Yang Disukai:</span>
                                          <div className="flex flex-wrap gap-1 mt-0.5">
                                            {s.h1_liked.map((item, idx) => (
                                              <span key={idx} className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">{item}</span>
                                            ))}
                                            {s.h1_liked_other && (
                                              <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">{s.h1_liked_other}</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      {s.h2_suggested && s.h2_suggested.length > 0 && (
                                        <div>
                                          <span className="text-[11px] text-amber-600 font-semibold block">H2 - Yang Disarankan:</span>
                                          <div className="flex flex-wrap gap-1 mt-0.5">
                                            {s.h2_suggested.map((item, idx) => (
                                              <span key={idx} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{item}</span>
                                            ))}
                                            {s.h2_suggested_other && (
                                              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{s.h2_suggested_other}</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : null}

                                  {/* Clarity D1-D4 */}
                                  {(s.info_acupuncture_support || s.info_understanding || s.info_sufficient || s.info_comfortable_asking) && (
                                    <div className="border-t border-slate-200 pt-3">
                                      <span className="text-[11px] text-slate-400 block mb-2">Clarity of Role (D1-D4)</span>
                                      <div className="flex flex-wrap gap-2">
                                        {[
                                          { label: 'D1 Dukungan', value: s.info_acupuncture_support },
                                          { label: 'D2 Pemahaman', value: s.info_understanding },
                                          { label: 'D3 Kecukupan', value: s.info_sufficient },
                                          { label: 'D4 Nyaman', value: s.info_comfortable_asking },
                                        ].map((dim) => (
                                          <span
                                            key={dim.label}
                                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                              dim.value !== null && dim.value >= 4
                                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                                : dim.value !== null && dim.value >= 3
                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}
                                          >
                                            {dim.label}: {dim.value ?? '-'}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Spiritual F1-F9 */}
                                  {(s.spiritual_salam_doa || s.spiritual_islam_respect || s.spiritual_facility || s.spiritual_healing || s.spiritual_support || s.f6_doa_kesembuhan || s.f7_keluarga_support || s.f8_keikhlasan || s.f9_kedekatan_tuhan) && (
                                    <div className="border-t border-slate-200 pt-3">
                                      <span className="text-[11px] text-slate-400 block mb-2">Spiritual (F1-F9)</span>
                                      <div className="flex flex-wrap gap-2">
                                        {[
                                          { label: 'F1 Salam Doa', value: s.spiritual_salam_doa },
                                          { label: 'F2 Respek Islam', value: s.spiritual_islam_respect },
                                          { label: 'F3 Fasilitas', value: s.spiritual_facility },
                                          { label: 'F4 Healing', value: s.spiritual_healing },
                                          { label: 'F5 Support', value: s.spiritual_support },
                                          { label: 'F6 Doa Kesembuhan', value: s.f6_doa_kesembuhan },
                                          { label: 'F7 Keluarga', value: s.f7_keluarga_support },
                                          { label: 'F8 Keikhlasan', value: s.f8_keikhlasan },
                                          { label: 'F9 Kedekatan Tuhan', value: s.f9_kedekatan_tuhan },
                                        ].map((dim) => (
                                          <span
                                            key={dim.label}
                                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                              dim.value !== null && dim.value >= 4
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : dim.value !== null && dim.value >= 3
                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}
                                          >
                                            {dim.label}: {dim.value ?? '-'}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Herbal scores */}
                                  {(s.herb_explanation || s.herb_usage_guide || s.herb_safety_trust || s.herb_availability || s.herb_affordability || s.herb_pharmacist) && (
                                    <div className="border-t border-slate-200 pt-3">
                                      <span className="text-[11px] text-slate-400 block mb-2">Herbal Service</span>
                                      <div className="flex flex-wrap gap-2">
                                        {[
                                          { label: 'Penjelasan', value: s.herb_explanation },
                                          { label: 'Panduan', value: s.herb_usage_guide },
                                          { label: 'Kepercayaan', value: s.herb_safety_trust },
                                          { label: 'Ketersediaan', value: s.herb_availability },
                                          { label: 'Terjangkau', value: s.herb_affordability },
                                          { label: 'Apoteker', value: s.herb_pharmacist },
                                        ].map((dim) => (
                                          <span
                                            key={dim.label}
                                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                              dim.value !== null && dim.value >= 4
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : dim.value !== null && dim.value >= 3
                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}
                                          >
                                            {dim.label}: {dim.value ?? '-'}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {surveysData.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                  <span className="text-xs text-slate-500">
                    Halaman {currentPage} dari {surveysData.totalPages} ({surveysData.total} total)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => fetchSurveys(currentPage - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                    </button>
                    <span className="text-sm font-medium px-3 text-slate-700">{currentPage}</span>
                    <button
                      disabled={currentPage >= surveysData.totalPages}
                      onClick={() => fetchSurveys(currentPage + 1)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Berikutnya <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}