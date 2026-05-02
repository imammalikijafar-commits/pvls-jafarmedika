'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, FileText, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export default function ConsentPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [scrollToBottom, setScrollToBottom] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 30) {
      setScrollToBottom(true)
    }
  }

  const handleProceed = () => {
    if (agreed) {
      router.push('/survey')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============================================================ */}
      {/* Header */}
      {/* ============================================================ */}
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="sticky top-0 z-50 bg-white/80 border-b border-slate-200/60 px-4 py-3"
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-dpems-icon.svg" alt="" className="w-9 h-9" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium font-[family-name:var(--font-body)]">RSU Ja&apos;far Medika</p>
              <p className="text-sm font-bold text-slate-800 font-[family-name:var(--font-display)]">Informed Consent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400 font-[family-name:var(--font-body)]">Halaman Persetujuan</span>
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ============================================================ */}
      {/* Content */}
      {/* ============================================================ */}
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
            Lembar Persetujuan Penelitian
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto font-[family-name:var(--font-body)] leading-relaxed">
            Mohon baca seluruh informasi di bawah ini dengan seksama sebelum memutuskan untuk berpartisipasi dalam penelitian ini.
          </p>
        </motion.div>

        {/* Consent Document */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE_OUT }}
        >
          {/* Glass card */}
          <div className="rounded-2xl border border-white/60 backdrop-blur-xl bg-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-6 sm:p-8">
            <div
              onScroll={handleScroll}
              className="h-[55vh] overflow-y-auto pr-2 space-y-6 text-sm leading-relaxed text-slate-600 font-[family-name:var(--font-body)] custom-scrollbar"
            >
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-5">
                <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-display)]">
                  INFORMED CONSENT / LEMBAR PERSETUJUAN
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 font-[family-name:var(--font-body)]">
                  Penelitian Pengembangan Sistem Pemantauan Pengalaman Pasien
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">1. Judul Penelitian</h3>
                <p className="text-slate-600">
                  Pengembangan Digital Patient Experience Monitoring System (DPEMS) untuk Evaluasi Kualitas Layanan Integratif (Akupuntur dan Herbal) di RSU Ja&apos;far Medika Karanganyar.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">2. Peneliti</h3>
                <p>
                  <strong>Peneliti Utama:</strong> Imam Maliki<br />
                  <strong>Institusi:</strong> Program Studi Magister<br />
                  <strong>Tempat Penelitian:</strong> Poli Akupuntur &amp; Herbal, RSU Ja&apos;far Medika, Mojogedang, Karanganyar, Jawa Tengah
                </p>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">3. Tujuan Penelitian</h3>
                <p>
                  Penelitian ini bertujuan mengembangkan dan menguji sistem digital untuk mengukur pengalaman pasien terhadap layanan kedokteran integratif (akupunktur dan herbal) secara komprehensif. Sistem ini mencakup penilaian kualitas layanan (SERVQUAL), pemantauan outcome klinis secara kondisional berdasarkan keluhan pasien — Visual Analogue Scale (VAS) untuk nyeri kronis, Barthel Index untuk stroke/pasca stroke, Insomnia Severity Index (ISI) untuk gangguan tidur, dan WHOQOL-BREF untuk wellness — indeks perawatan spiritual islami, loyalitas pasien (NPS), serta feedback terstruktur multi-kategori. Hasil penelitian diharapkan dapat membantu rumah sakit dalam meningkatkan mutu pelayanan secara berbasis bukti.
                </p>
              </div>

              {/* Section 4 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">4. Prosedur Partisipasi</h3>
                <p className="mb-2">
                  Jika Anda setuju untuk berpartisipasi, Anda akan diminta untuk:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
                  <li>Mengisi kuesioner elektronik yang terdiri dari 8 bagian (A-H)</li>
                  <li>Kuesioner mencakup data demografi, penilaian kualitas layanan (SERVQUAL), penilaian layanan herbal, edukasi terapi adjuvan, penilaian outcome klinis kondisional (VAS/Barthel/ISI/WHOQOL), dimensi spiritual islami, loyalitas pasien (NPS), dan masukan/saran terstruktur multi-kategori</li>
                  <li>Waktu pengisian perkiraan 5-10 menit</li>
                  <li>Anda dapat mengisi kuesioner ini setelah menjalani terapi akupuntur di poli</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">5. Risiko dan Manfaat</h3>
                <p className="mb-3">
                  <strong className="text-slate-700">Risiko:</strong> Penelitian ini tidak memiliki risiko fisik. Kuesioner hanya berisi pertanyaan terkait pengalaman Anda sebagai pasien. Tidak ada intervensi medis yang dilakukan dalam penelitian ini.
                </p>
                <p>
                  <strong className="text-slate-700">Manfaat:</strong> Partisipasi Anda secara langsung berkontribusi pada peningkatan kualitas layanan kesehatan, khususnya layanan integratif di rumah sakit. Hasil penelitian akan digunakan sebagai rekomendasi perbaikan pelayanan.
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">6. Kerahasiaan Data</h3>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/60 border border-teal-200/60">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="h-4 w-4 text-teal-600" />
                  </div>
                  <p>
                    Seluruh data yang dikumpulkan akan dijamin kerahasiaannya. Kuesioner bersifat <strong>anonim</strong> — tidak meminta nama, NIK, atau identitas personal lainnya. Data hanya digunakan untuk keperluan penelitian dan akan disimpan secara aman. Hasil penelitian dilaporkan dalam bentuk agregat (kelompok) tanpa dapat mengidentifikasi individu. Akses data hanya diberikan kepada peneliti utama dan pembimbing penelitian.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">7. Kesukarelaan</h3>
                <p>
                  Partisipasi dalam penelitian ini sepenuhnya bersifat <strong>sukarela</strong>. Anda berhak untuk menolak berpartisipasi atau mengundurkan diri kapan saja tanpa konsekuensi apa pun terhadap pelayanan medis yang Anda terima di rumah sakit. Anda juga dapat menghentikan pengisian kuesioner kapan saja tanpa perlu memberikan alasan.
                </p>
              </div>

              {/* Section 8 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">8. Hak Responden</h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
                  <li>Mendapatkan penjelasan tentang tujuan dan prosedur penelitian</li>
                  <li>Menolak atau mengundurkan diri tanpa konsekuensi</li>
                  <li>Menanyakan hal-hal yang belum dipahami kepada peneliti</li>
                  <li>Tidak dipaksa untuk menjawab pertanyaan yang tidak diinginkan</li>
                </ul>
              </div>

              {/* Section 9 */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">9. Kontak Peneliti</h3>
                <p className="mb-3">
                  Jika Anda memiliki pertanyaan atau memerlukan informasi lebih lanjut terkait penelitian ini, Anda dapat menghubungi:
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <p><strong className="text-slate-700">Peneliti:</strong> Imam Maliki</p>
                  <p><strong className="text-slate-700">Institusi:</strong> Program Studi Magister</p>
                  <p><strong className="text-slate-700">Tempat:</strong> Poli Akupuntur &amp; Herbal, RSU Ja&apos;far Medika</p>
                </div>
              </div>

              {/* Section 10 */}
              <div className="border-t border-slate-200 pt-5">
                <h3 className="font-bold text-slate-800 mb-2 font-[family-name:var(--font-display)]">10. Pernyataan Persetujuan</h3>
                <p className="mb-2">
                  Dengan menandai checkbox persetujuan di bawah, saya menyatakan bahwa:
                </p>
                <ul className="list-none space-y-1.5 text-slate-600">
                  <li className="flex gap-2"><span className="text-teal-500 font-bold shrink-0">1.</span> Saya telah membaca dan memahami seluruh informasi di lembar persetujuan ini</li>
                  <li className="flex gap-2"><span className="text-teal-500 font-bold shrink-0">2.</span> Saya telah mendapat kesempatan untuk bertanya dan jawaban saya telah dipenuhi</li>
                  <li className="flex gap-2"><span className="text-teal-500 font-bold shrink-0">3.</span> Saya berpartisipasi secara sukarela tanpa paksaan dari pihak manapun</li>
                  <li className="flex gap-2"><span className="text-teal-500 font-bold shrink-0">4.</span> Saya memberikan persetujuan untuk data saya digunakan dalam penelitian ini dengan menjaga kerahasiaan identitas saya</li>
                </ul>
              </div>

              {/* Scroll hint */}
              {!scrollToBottom && (
                <div className="text-center py-3">
                  <motion.p
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-xs text-slate-400"
                  >
                    ↓ Scroll ke bawah untuk membaca seluruh informasi
                  </motion.p>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* Agreement Section */}
            {/* ============================================================ */}
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  className="mt-1 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                />
                <label htmlFor="consent" className="text-sm font-medium text-slate-600 leading-relaxed cursor-pointer select-none font-[family-name:var(--font-body)]">
                  Saya telah membaca dan memahami seluruh informasi di atas. Dengan sadar dan tanpa paksaan, saya bersedia berpartisipasi dalam penelitian ini serta memberikan persetujuan untuk data kuesioner saya digunakan sesuai ketentuan kerahasiaan yang telah dijelaskan.
                </label>
              </div>

              <Button
                onClick={handleProceed}
                disabled={!agreed}
                className={cn(
                  'w-full h-12 text-base font-semibold rounded-xl transition-all font-[family-name:var(--font-display)]',
                  agreed
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/35'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                <Shield className="h-5 w-5 mr-2" />
                {agreed ? 'Setuju & Lanjutkan ke Kuesioner' : 'Silakan Baca & Setujui Terlebih Dahulu'}
                {agreed && <ArrowRight className="h-5 w-5 ml-2" />}
              </Button>

              <p className="text-[11px] text-center text-slate-400 font-[family-name:var(--font-body)]">
                Dengan melanjutkan, Anda menyetujui ketentuan informed consent ini.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}