'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ResponseTable from '@/components/dashboard/ResponseTable'
import type { SurveyResponse } from '@/lib/types'

export default function ResponsesPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResponses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
      })
      const res = await fetch(`/api/dashboard/responses?${params}`)
      if (!res.ok) throw new Error('Gagal memuat data')
      const data = await res.json()
      setResponses(data.responses)
      setTotal(data.total)
    } catch (err) {
      console.error('Fetch responses error:', err)
      setError('Gagal memuat data respons. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on search
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Data Respons</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar respons survei yang telah lengkap (is_complete)
        </p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari layanan, usia, jenis kelamin..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchResponses}
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

      {/* Loading State */}
      {loading && responses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Memuat data respons...</p>
        </div>
      ) : (
        <>
          <ResponseTable responses={responses} pageSize={pageSize} />

          {/* Server-side Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total {total} data — Hal {page} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
