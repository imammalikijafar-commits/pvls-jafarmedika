'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import SurveyProgress from '@/components/survey/SurveyProgress'
import {
  Shield,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
  Phone,
  Clock,
  Award,
  Archive,
  CheckCircle2,
  XCircle,
  Stethoscope,
} from 'lucide-react'
import { saveSurveyData } from '@/lib/survey-storage'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function ConsentPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [disagreed, setDisagreed] = useState(false)
  const [scrollToBottom, setScrollToBottom] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 30) {
      setScrollToBottom(true)
    }
  }

  const handleProceed = () => {
    if (agreed) {
      saveSurveyData({ consent_agreed: true })
      router.push('/survey/screening')
    }
  }

  const handleDecline = () => {
    setDisagreed(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="sticky top-0 z-50 bg-white/80 border-b border-slate-200/60 px-4 py-3"
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">
                RSU Ja&apos;far Medika Karanganyar
              </p>
              <p className="text-sm font-bold text-slate-800">Informed Consent</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/survey')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <SurveyProgress currentStep={2} totalSteps={9} label="Persetujuan" />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="text-center mt-4 mb-8 space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/80 border border-teal-200/60 flex items-center justify-center">
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lembar Persetujuan Penelitian
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Mohon baca seluruh informasi di bawah ini dengan seksama sebelum memutuskan untuk
            berpartisipasi dalam penelitian ini.
          </p>
        </motion.div>

        {/* Consent Document */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE_OUT }}
        >
          <Card className="border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
            <CardContent className="p-6 sm:p-8">
              <div
                onScroll={handleScroll}
                className="h-[55vh] overflow-y-auto pr-2 space-y-6 text-sm leading-relaxed text-slate-600 custom-scrollbar"
              >
                {/* Header with version */}
                <div className="text-center border-b border-slate-200 pb-5">
                  <h2 className="text-base font-bold text-slate-900">
                    INFORMED CONSENT / LEMBAR PERSETUJUAN
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Survei Pengalaman Pasien Layanan Akupunktur &amp; Herbal RSU
                    Ja&apos;far Medika
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-2.5">
                    <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
                      Versi 1.0 &bull; 5 Mei 2026
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
                      No. Protokol Etik: [XXXX/UN27.06/KEPK/2026]
                    </span>
                  </div>
                </div>

                {/* Section 1 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">1. Judul Penelitian</h3>
                  <p className="text-slate-600">
                    &ldquo;Pengaruh Nilai yang Dipersepsikan terhadap Loyalitas Pasien dengan
                    Kepercayaan dan Kepuasan sebagai Mediator pada Layanan Integratif
                    Out-of-Pocket&rdquo;
                  </p>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">2. Peneliti</h3>
                  <p className="mb-2">
                    <strong>Peneliti Utama:</strong> Imam Maliki
                    <br />
                    <strong>Institusi:</strong> Program Studi Magister Administrasi Rumah Sakit
                    (MARS), Universitas Muhammadiyah Surakarta
                    <br />
                    <strong>Tempat Penelitian:</strong> Poli Akupunktur &amp; Herbal, RSU
                    Ja&apos;far Medika, Mojogedang, Karanganyar, Jawa Tengah
                  </p>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/40 border border-teal-200/60">
                    <Award className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-teal-700 leading-relaxed">
                      Penelitian ini telah mendapat persetujuan dari Komite Etik Penelitian
                      Kesehatan. No. Protokol:{' '}
                      <strong>[XXXX/UN27.06/KEPK/2026]</strong>. Penelitian dilaksanakan sesuai
                      dengan pedoman etik penelitian yang berlaku.
                    </p>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">3. Tujuan Penelitian</h3>
                  <p>
                    Penelitian ini bertujuan untuk menganalisis pengaruh nilai yang dipersepsikan
                    (perceived value) terhadap loyalitas pasien, dengan kepercayaan (trust) dan
                    kepuasan (satisfaction) sebagai mediator, pada layanan integratif akupunktur
                    dan herbal medicine yang bersifat out-of-pocket di RSU Ja&apos;far Medika.
                    Hasil penelitian ini akan digunakan sebagai dasar perbaikan mutu layanan
                    secara berbasis bukti (evidence-based).
                  </p>
                </div>

                {/* Section 4 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">4. Prosedur Partisipasi</h3>
                  <p className="mb-2">Jika Anda setuju untuk berpartisipasi, Anda akan diminta untuk:</p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
                    <li>
                      Mengisi kuesioner elektronik yang terdiri dari 24 item pernyataan
                    </li>
                    <li>
                      Kuesioner mencakup: data demografi, penilaian layanan (perceived value),
                      kepercayaan, kepuasan, dan loyalitas pasien
                    </li>
                    <li>
                      Pengisian dilakukan secara daring (online) melalui perangkat elektronik
                    </li>
                  </ul>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/60 mt-3">
                    <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong>Estimasi waktu pengisian: 7–10 menit.</strong> Anda dapat mengisi
                      dengan tenang tanpa terburu-buru.
                    </p>
                  </div>
                </div>

                {/* Section 5 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">5. Risiko dan Manfaat</h3>
                  <p className="mb-3">
                    <strong className="text-slate-700">Risiko:</strong> Tidak ada risiko fisik.
                    Kuesioner hanya berisi pertanyaan terkait persepsi dan pengalaman Anda sebagai
                    pasien. Tidak ada intervensi medis yang dilakukan.
                  </p>
                  <p>
                    <strong className="text-slate-700">Manfaat:</strong> Partisipasi Anda secara
                    langsung berkontribusi pada peningkatan kualitas layanan kesehatan integratif
                    di rumah sakit. Hasil penelitian akan digunakan sebagai rekomendasi perbaikan
                    pelayanan bagi semua pasien ke depannya.
                  </p>
                </div>

                {/* Section 6 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">6. Kerahasiaan Data</h3>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/60 border border-teal-200/60 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p>
                        Seluruh data yang dikumpulkan dijamin kerahasiaannya. Kuesioner bersifat{' '}
                        <strong>anonim</strong> &mdash; tidak meminta nama, NIK, atau identitas
                        personal lainnya. Data dikumpulkan sebagai angka, bukan cerita pribadi.
                        Akses data hanya diberikan kepada peneliti utama dan pembimbing penelitian.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <Archive className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Retensi Data:</strong> Data akan disimpan selama{' '}
                      <strong>5 (lima) tahun</strong> sejak pengumpulan, sesuai ketentuan
                      penelitian kesehatan. Setelah masa penyimpanan berakhir, seluruh data akan{' '}
                      <strong>dihapus secara permanen</strong> dan tidak dapat dipulihkan.
                    </p>
                  </div>
                </div>

                {/* Section 7 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">7. Kesukarelaan</h3>
                  <p>
                    Partisipasi dalam penelitian ini sepenuhnya bersifat{' '}
                    <strong>sukarela</strong>. Anda berhak untuk menolak berpartisipasi atau
                    mengundurkan diri kapan saja <strong>tanpa konsekuensi apa pun</strong>{' '}
                    terhadap pelayanan medis yang Anda terima di rumah sakit. Pengobatan dan
                    layanan Anda tetap berjalan normal. Anda juga dapat menghentikan pengisian
                    kuesioner kapan saja tanpa perlu memberikan alasan.
                  </p>
                </div>

                {/* Section 8 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">8. Hak Responden</h3>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
                    <li>
                      Mendapatkan penjelasan tentang tujuan dan prosedur penelitian
                    </li>
                    <li>
                      Menolak atau mengundurkan diri tanpa konsekuensi terhadap layanan medis
                    </li>
                    <li>Menanyakan hal-hal yang belum dipahami kepada peneliti</li>
                    <li>
                      Tidak dipaksa untuk menjawab pertanyaan yang tidak diinginkan
                    </li>
                    <li>
                      Mendapatkan salinan hasil penelitian dalam bentuk ringkasan jika diminta
                    </li>
                  </ul>
                </div>

                {/* Section 9 */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">9. Kontak Peneliti</h3>
                  <p className="mb-3">
                    Jika Anda memiliki pertanyaan, keluhan, atau memerlukan informasi lebih lanjut
                    terkait penelitian ini, Anda dapat menghubungi:
                  </p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm text-teal-600 shrink-0 mt-px">&#9679;</span>
                      <p>
                        <strong className="text-slate-700">Peneliti:</strong> Imam Maliki
                        &mdash; Mahasiswa MARS UMS
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm text-teal-600 shrink-0 mt-px">&#9679;</span>
                      <p>
                        <strong className="text-slate-700">Pembimbing:</strong> [Nama Dosen
                        Pembimbing]
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Phone className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-1" />
                      <p>
                        <strong className="text-slate-700">Telepon/WhatsApp:</strong>{' '}
                        081-XXX-XXXX
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm text-teal-600 shrink-0 mt-px">&#9679;</span>
                      <p>
                        <strong className="text-slate-700">Tempat:</strong> Poli Akupunktur
                        &amp; Herbal, RSU Ja&apos;far Medika, Mojogedang, Karanganyar, Jawa
                        Tengah
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scroll hint */}
                {!scrollToBottom && (
                  <div className="text-center py-3">
                    <motion.p
                      animate={{ y: [0, 6, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-xs text-slate-400"
                    >
                      Scroll ke bawah untuk membaca seluruh informasi ▼
                    </motion.p>
                  </div>
                )}
              </div>

              {/* Agreement Section */}
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={agreed}
                    onCheckedChange={(checked) => {
                      setAgreed(checked === true)
                      if (checked === true) setDisagreed(false)
                    }}
                    disabled={!scrollToBottom}
                    className="mt-1 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <label
                    htmlFor="consent"
                    className="text-sm font-medium text-slate-600 leading-relaxed cursor-pointer select-none"
                  >
                    Saya telah membaca dan menyetujui informed consent ini. Dengan sadar dan tanpa
                    paksaan, saya bersedia berpartisipasi dalam penelitian ini serta memberikan
                    persetujuan untuk data kuesioner saya digunakan sesuai ketentuan kerahasiaan
                    yang telah dijelaskan.
                  </label>
                </div>

                {/* Two Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleProceed}
                    disabled={!agreed}
                    className={
                      agreed
                        ? 'h-12 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 gap-2'
                        : 'h-12 text-sm font-semibold rounded-xl bg-slate-200 text-slate-400 cursor-not-allowed'
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Setuju, Lanjutkan
                    {agreed && <ArrowRight className="h-4 w-4" />}
                  </Button>

                  <Button
                    onClick={handleDecline}
                    variant="outline"
                    disabled={!scrollToBottom}
                    className={
                      !scrollToBottom
                        ? 'h-12 text-sm font-semibold rounded-xl text-slate-300 border-slate-200 cursor-not-allowed'
                        : 'h-12 text-sm font-semibold rounded-xl text-slate-500 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 gap-2'
                    }
                  >
                    <XCircle className="h-4 w-4" />
                    Tidak Setuju
                  </Button>
                </div>

                {disagreed && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-center space-y-3"
                  >
                    <p className="text-sm text-slate-600 font-medium">
                      Tidak masalah! Partisipasi Anda sepenuhnya sukarela.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Anda tetap mendapatkan layanan medis yang sama baiknya. Pengobatan dan
                      perawatan Anda <strong>tidak akan terganggu</strong> sama sekali. Terima
                      kasih atas waktu Anda.
                    </p>
                    <Button
                      onClick={() => router.push('/')}
                      variant="ghost"
                      className="text-sm text-slate-500 hover:text-slate-700 gap-1.5"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Beranda
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
