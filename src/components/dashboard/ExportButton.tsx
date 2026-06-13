'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ExportButton() {
  const [loading, setLoading] = useState<'csv' | 'xlsx' | null>(null)

  const handleExport = (format: 'csv' | 'xlsx') => {
    setLoading(format)
    // Navigate to the export API endpoint
    window.location.href = `/api/export?format=${format}`
    // Reset loading after a short delay (download will start)
    setTimeout(() => setLoading(null), 2000)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={() => handleExport('csv')}
        disabled={loading !== null}
        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        size="lg"
      >
        {loading === 'csv' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Export CSV
      </Button>
      <Button
        onClick={() => handleExport('xlsx')}
        disabled={loading !== null}
        className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
        size="lg"
      >
        {loading === 'xlsx' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        Export Excel
      </Button>
    </div>
  )
}
