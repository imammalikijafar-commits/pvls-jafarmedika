'use client'

import { FileText, FileSpreadsheet, Info, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ExportButton from '@/components/dashboard/ExportButton'

export default function ExportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Export Data</h1>
        <p className="text-sm text-gray-500 mt-1">
          Unduh data survei dalam format CSV atau Excel untuk analisis lebih lanjut
        </p>
      </div>

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            Ekspor Data Survei
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Data yang diekspor hanya mencakup respons survei yang telah lengkap
            (is_complete = true). Data mencakup seluruh 24 item kuesioner,
            data demografi, skor rata-rata dimensi, serta flag pola ekstrem.
          </p>
          <ExportButton />
        </CardContent>
      </Card>

      {/* Format Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Format CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#8226;</span>
                File teks dengan pemisah koma
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#8226;</span>
                Kompatibel dengan SmartPLS, SPSS, dan R
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#8226;</span>
                Ukuran file ringan
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">&#8226;</span>
                Encoding UTF-8
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-teal-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              Format Excel (XLSX)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">&#8226;</span>
                Format spreadsheet dengan satu sheet &quot;Data PVLS&quot;
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">&#8226;</span>
                Kolom dengan label yang mudah dibaca
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">&#8226;</span>
                Kompatibel dengan Microsoft Excel, Google Sheets, LibreOffice Calc
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">&#8226;</span>
                Lebar kolom otomatis
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* SmartPLS Info */}
      <Card className="border-amber-100 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            Informasi Format SmartPLS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Format ekspor ini dirancang agar kompatibel dengan analisis SmartPLS.
            Berikut informasi penting:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold mt-0.5">1.</span>
              <span>
                Kolom item kuesioner menggunakan kode asli (PV1–PV12, TR1–TR4, SAT1–SAT4, LOY1–LOY4)
                agar mudah dipetakan ke konstruk di SmartPLS.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold mt-0.5">2.</span>
              <span>
                Skor rata-rata dimensi (PV_Total_Mean, Trust_Mean, dll.) disertakan
                untuk validasi dan analisis deskriptif.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold mt-0.5">3.</span>
              <span>
                Kolom Extreme_Pattern menandai responden dengan pola nilai ekstrem
                yang dapat dikeluarkan dari analisis atau dianalisis terpisah.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold mt-0.5">4.</span>
              <span>
                Data demografi (usia, jenis kelamin, pendidikan, dll.) dapat digunakan
                sebagai variabel moderator atau kontrol di SmartPLS.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
