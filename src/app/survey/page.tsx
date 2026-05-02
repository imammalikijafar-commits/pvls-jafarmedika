'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2, ChevronRight, ChevronLeft, X,
  Activity, Star, MessageCircle, User,
  Leaf, BookOpen, Stethoscope, Sparkles,
  Hospital, ArrowLeft, Wallet, Clock, Pause,
  Gift, Volume2, Save, RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { computeDimensionAverage } from '@/lib/validators'
import type { FormData } from '@/components/survey/sections/types'
import { initialForm } from '@/components/survey/sections/types'
import SectionA from '@/components/survey/sections/SectionA'
import SectionB from '@/components/survey/sections/SectionB'
import SectionC from '@/components/survey/sections/SectionC'
import SectionD from '@/components/survey/sections/SectionD'
import SectionE from '@/components/survey/sections/SectionE'
import SectionF from '@/components/survey/sections/SectionF'
import SectionG from '@/components/survey/sections/SectionG'
import SectionH from '@/components/survey/sections/SectionH'
import SectionI from '@/components/survey/sections/SectionI'

// ============================================================
// 9 Steps matching Kuesioner A-I
// ============================================================

const STEPS = [
  { title: 'Data Responden', icon: User, shortTitle: 'A', desc: 'Demografi', estMinutes: 1.5 },
  { title: 'Kualitas Layanan', icon: Activity, shortTitle: 'B', desc: 'SERVQUAL', estMinutes: 3.5 },
  { title: 'Layanan Herbal', icon: Leaf, shortTitle: 'C', desc: 'Herbal', estMinutes: 0.8 },
  { title: 'Persepsi Terapi', icon: BookOpen, shortTitle: 'D', desc: 'Clarity', estMinutes: 0.7 },
  { title: 'Outcome Klinis', icon: Stethoscope, shortTitle: 'E', desc: 'Kondisional', estMinutes: 2.5 },
  { title: 'Dimensi Spiritual', icon: Sparkles, shortTitle: 'F', desc: 'Spiritual', estMinutes: 1.5 },
  { title: 'Loyaltas & NPS', icon: Star, shortTitle: 'G', desc: 'NPS', estMinutes: 0.8 },
  { title: 'Masukan & Saran', icon: MessageCircle, shortTitle: 'H', desc: 'Feedback', estMinutes: 0.5 },
  { title: 'Kesediaan Bayar', icon: Wallet, shortTitle: 'I', desc: 'WTP', estMinutes: 1.0 },
]

// Cumulative time estimates per step (minutes)
const CUMULATIVE_TIME = STEPS.reduce<number[]>((acc, s, i) => {
  const prev = i > 0 ? acc[i - 1] : 0
  acc.push(Math.round((prev + s.estMinutes) * 10) / 10)
  return acc
}, [])

// ============================================================
// Badges for gamification
// ============================================================

const SECTION_BADGES: Record<string, { name: string; emoji: string; description: string }> = {
  A: { name: 'Pendata Mandiri', emoji: '📋', description: 'Data diri lengkap!' },
  B: { name: 'Pengamat Teliti', emoji: '🔍', description: 'SERVQUAL selesai!' },
  C: { name: 'Herbalis Cerdas', emoji: '🌿', description: 'Pengetahuan herbal!' },
  D: { name: 'Pasien Paham', emoji: '💡', description: 'Memahami peran terapi!' },
  E: { name: 'Petarung Tangguh', emoji: '💪', description: 'Clinical outcomes selesai!' },
  F: { name: 'Jiwa Tenang', emoji: '🤲', description: 'Dimensi spiritual!' },
  G: { name: 'Duta RSU', emoji: '⭐', description: 'Loyaltas & NPS selesai!' },
  H: { name: 'Kritikus Kreatif', emoji: '💬', description: 'Feedback diberikan!' },
  I: { name: 'Finalis Sejati', emoji: '🏆', description: 'Semua selesai!' },
}

// ============================================================
// Animation variants
// ============================================================

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } }
}

// ============================================================
// Save/Resume Hook (localStorage)
// ============================================================

const STORAGE_KEY = 'dpems_survey_draft'
const RESUME_KEY = 'dpems_survey_resume'

function useDraftSave(form: FormData, step: number) {
  // Auto-save draft every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const draft = { form, step, savedAt: Date.now() }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
        localStorage.setItem(RESUME_KEY, JSON.stringify({ hasDraft: true, savedAt: Date.now(), step }))
      } catch {
        // localStorage might be full or unavailable
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [form, step])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(RESUME_KEY)
    } catch {
      // ignore
    }
  }, [])

  return { clearDraft }
}

function loadDraft(): { form: FormData; step: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data.form || typeof data.step !== 'number') return null
    // Only resume if less than 24 hours old
    if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) return null
    return { form: data.form, step: data.step }
  } catch {
    return null
  }
}

// ============================================================
// Main Component
// ============================================================

export default function SurveyPage() {
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sessionStart] = useState(Date.now())

  // Fatigue management state
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  const [showBadge, setShowBadge] = useState<string | null>(null)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  // Check for existing draft on mount
  useEffect(() => {
    if (draftLoaded) return
    const draft = loadDraft()
    if (draft) {
      setDraftLoaded(true)
      setForm(draft.form)
      setStep(draft.step)
    }
  }, [draftLoaded])

  // Save/Resume
  const { clearDraft } = useDraftSave(form, step)

  const updateField = useCallback((key: keyof FormData, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Show mini-break reminder after Section E (step 4 → step 5)
  const handleNext = useCallback(() => {
    if (step === 4) {
      setShowBreakReminder(true)
    }
    setStep((s) => s + 1)
  }, [step])

  // Show badge when completing a section
  useEffect(() => {
    if (step > 0) {
      const completedStep = step - 1
      const badge = SECTION_BADGES[STEPS[completedStep]?.shortTitle]
      if (badge) {
        setShowBadge(badge.emoji)
        const timer = setTimeout(() => setShowBadge(null), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [step])

  // Voice feature: read question text using Web Speech API
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }, [])

  // ============================================================
  // Submit: compute SERVQUAL averages from individual scores
  // ============================================================
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const sessionDuration = Math.round((Date.now() - sessionStart) / 1000)

      const tangibles = computeDimensionAverage([
        form.b1_t1_kebersihan, form.b1_t2_steril, form.b1_t3_berbaring, form.b1_t4_suasana, form.b1_t5_ibadah
      ])
      const reliability = computeDimensionAverage([
        form.b2_r1_tepat_waktu, form.b2_r2_hadir, form.b2_r3_terstandar, form.b2_r4_rekam_medis
      ])
      const responsiveness = computeDimensionAverage([
        form.b3_c1_tunggu, form.b3_c2_respons, form.b3_c3_jelas, form.b3_c4_efek_samping
      ])
      const assurance = computeDimensionAverage([
        form.b4_a1_kompetensi, form.b4_a2_diagnosis, form.b4_a3_aman, form.b4_a4_sertifikasi
      ])
      const empathy = computeDimensionAverage([
        form.b5_e1_personal, form.b5_e2_kekhawatiran, form.b5_e3_hormat, form.b5_e4_perkembangan
      ])
      const spiritualAvg = computeDimensionAverage([
        form.f1_adab_islami, form.f2_gender_concordance, form.f3_prayer_accommodation,
        form.f4_halal_assurance, form.f5_tibb_nabawi, form.f6_spiritual_activation,
        form.f7_holistic_peace, form.f8_spiritual_communication,
      ])

      const payload = {
        age_range: form.age_range,
        gender: form.gender,
        education: form.education,
        occupation: form.occupation === 'Lainnya' && form.occupation_other
          ? `Lainnya: ${form.occupation_other}`
          : form.occupation,
        income_range: form.income_range,
        patient_type: form.patient_type,
        condition_type: form.condition_type === 'Lainnya' && form.condition_type_other
          ? `Lainnya: ${form.condition_type_other}`
          : form.condition_type,
        visit_count: form.visit_count,
        referral_source: form.referral_source,
        tangibles, reliability, responsiveness, assurance, empathy,
        herbal_prescribed: form.herbal_prescribed === 'Ya',
        herb_explanation: form.herbal_prescribed === 'Ya' ? form.c2_herb_explanation : null,
        herb_usage_guide: form.herbal_prescribed === 'Ya' ? form.c2_herb_usage_guide : null,
        herb_safety_trust: form.herbal_prescribed === 'Ya' ? form.c2_herb_safety_trust : null,
        herb_availability: form.herbal_prescribed === 'Ya' ? form.c2_herb_availability : null,
        herb_affordability: form.herbal_prescribed === 'Ya' ? form.c2_herb_affordability : null,
        herb_pharmacist: form.herbal_prescribed === 'Ya' ? form.c2_herb_pharmacist : null,
        d1_clarity_role: form.d1_clarity_role,
        d2_clarity_explanation: form.d2_clarity_explanation,
        d3_clarity_comfortable: form.d3_clarity_comfortable,
        d4_clarity_specialist: form.d4_clarity_specialist,
        // Clinical outcomes (branching)
        pain_level_before: form.pain_level_before,
        pain_level_after: form.visit_count === 'Pertama kali (ke-1)' ? null : form.pain_level_after,
        condition_change: form.condition_change,
        // Spiritual (9 items) — F1-F9 murni, tanpa legacy mapping
        f1_adab_islami: form.f1_adab_islami,
        f2_gender_concordance: form.f2_gender_concordance,
        f3_prayer_accommodation: form.f3_prayer_accommodation,
        f4_halal_assurance: form.f4_halal_assurance,
        f5_tibb_nabawi: form.f5_tibb_nabawi,
        f6_spiritual_activation: form.f6_spiritual_activation,
        f7_holistic_peace: form.f7_holistic_peace,
        f8_spiritual_communication: form.f8_spiritual_communication,
        f9_reverse_coded: form.f9_reverse_coded,
        // NPS & Loyalty (5 items)
        nps_score: form.nps_score,
        visit_plan: form.visit_plan,
        has_recommended: form.has_recommended,
        recommendation_count: form.recommendation_count,
        wtp_price_increase: form.wtp_price_increase,
        // Feedback
        best_experience: form.h1_liked.length > 0 ? form.h1_liked.join('; ') + (form.h1_liked_other ? `; Lainnya: ${form.h1_liked_other}` : '') : null,
        improvement_suggestion: form.h2_suggested.length > 0 ? form.h2_suggested.join('; ') + (form.h2_suggested_other ? `; Lainnya: ${form.h2_suggested_other}` : '') : null,
        testimonial: form.testimonial || null,
        h1_liked: form.h1_liked,
        h1_liked_other: form.h1_liked_other || null,
        h2_suggested: form.h2_suggested,
        h2_suggested_other: form.h2_suggested_other || null,
        // WTP (Bagian I)
        wtp_cost_today: form.wtp_cost_today,
        wtp_increase_20: form.wtp_increase_20,
        wtp_package_interest: form.wtp_package_interest,
        wtp_max_acceptable: form.wtp_max_acceptable,
        responses_json: {
          demographics: { age_range: form.age_range, gender: form.gender, education: form.education, occupation: form.occupation, income_range: form.income_range, patient_type: form.patient_type, condition_type: form.condition_type, visit_count: form.visit_count, referral_source: form.referral_source },
          servqual_individual: {
            tangibles: [form.b1_t1_kebersihan, form.b1_t2_steril, form.b1_t3_berbaring, form.b1_t4_suasana, form.b1_t5_ibadah],
            reliability: [form.b2_r1_tepat_waktu, form.b2_r2_hadir, form.b2_r3_terstandar, form.b2_r4_rekam_medis],
            responsiveness: [form.b3_c1_tunggu, form.b3_c2_respons, form.b3_c3_jelas, form.b3_c4_efek_samping],
            assurance: [form.b4_a1_kompetensi, form.b4_a2_diagnosis, form.b4_a3_aman, form.b4_a4_sertifikasi],
            empathy: [form.b5_e1_personal, form.b5_e2_kekhawatiran, form.b5_e3_hormat, form.b5_e4_perkembangan],
          },
          servqual_averages: { tangibles, reliability, responsiveness, assurance, empathy, spiritual_average: spiritualAvg },
          clarity: { d1: form.d1_clarity_role, d2: form.d2_clarity_explanation, d3: form.d3_clarity_comfortable, d4: form.d4_clarity_specialist },
          clinical: {
            instrument: form.condition_type,
            vas: { pain_before: form.pain_level_before, pain_after: form.visit_count === 'Pertama kali (ke-1)' ? null : form.pain_level_after, condition_change: form.condition_change },
            barthel: {
              eat_first: form.barthel_eat_first, eat_current: form.barthel_eat_current,
              bath_first: form.barthel_bath_first, bath_current: form.barthel_bath_current,
              groom_first: form.barthel_groom_first, groom_current: form.barthel_groom_current,
              dress_first: form.barthel_dress_first, dress_current: form.barthel_dress_current,
              bowel_first: form.barthel_bowel_first, bowel_current: form.barthel_bowel_current,
              bladder_first: form.barthel_bladder_first, bladder_current: form.barthel_bladder_current,
              toilet_first: form.barthel_toilet_first, toilet_current: form.barthel_toilet_current,
              transfer_first: form.barthel_transfer_first, transfer_current: form.barthel_transfer_current,
              mobility_first: form.barthel_mobility_first, mobility_current: form.barthel_mobility_current,
              stairs_first: form.barthel_stairs_first, stairs_current: form.barthel_stairs_current,
            },
            isi: { isi_1: form.isi_1, isi_2: form.isi_2, isi_3: form.isi_3, isi_4: form.isi_4, isi_5: form.isi_5, isi_6: form.isi_6, isi_7: form.isi_7 },
            wellness: { wellness_1: form.wellness_1, wellness_2: form.wellness_2, wellness_3: form.wellness_3 },
          },
          spiritual_individual: [form.f1_adab_islami, form.f2_gender_concordance, form.f3_prayer_accommodation, form.f4_halal_assurance, form.f5_tibb_nabawi, form.f6_spiritual_activation, form.f7_holistic_peace, form.f8_spiritual_communication, form.f9_reverse_coded],
          loyalty: { nps_score: form.nps_score, visit_plan: form.visit_plan, has_recommended: form.has_recommended, recommendation_count: form.recommendation_count, wtp_price_increase: form.wtp_price_increase },
          feedback: { h1_liked: form.h1_liked, h1_liked_other: form.h1_liked_other || null, h2_suggested: form.h2_suggested, h2_suggested_other: form.h2_suggested_other || null, h3_testimonial: form.testimonial || null },
          wtp: { wtp_cost_today: form.wtp_cost_today, wtp_increase_20: form.wtp_increase_20, wtp_package_interest: form.wtp_package_interest, wtp_max_acceptable: form.wtp_max_acceptable },
        },
        session_duration_seconds: sessionDuration,
      }

      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const msg = errData?.error || `Gagal menyimpan (HTTP ${res.status})`
        console.error('Survey submit failed:', msg, errData)
        setSubmitError(msg)
        return
      }

      // Clear draft on successful submit
      clearDraft()
      setSubmitted(true)
    } catch (err) {
      console.error('Survey submit error:', err)
      setSubmitError('Gagal mengirim survei. Periksa koneksi internet Anda.')
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================
  // Time estimates for progress
  // ============================================================
  const timeRemaining = step < CUMULATIVE_TIME.length
    ? Math.round((CUMULATIVE_TIME[CUMULATIVE_TIME.length - 1] - CUMULATIVE_TIME[step]) * 10) / 10
    : 0
  const totalTime = CUMULATIVE_TIME[CUMULATIVE_TIME.length - 1]

  // ============================================================
  // Submitted Screen
  // ============================================================
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-teal-400/10 blur-[120px]" />
          <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-teal-600/8 blur-[120px]" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="max-w-lg w-full relative"
        >
          <div className="rounded-2xl border border-white/60 backdrop-blur-xl bg-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-8 sm:p-10 space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: EASE_OUT }}
              className="text-center space-y-3"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-[family-name:var(--font-display)] tracking-tight">
                Terima kasih atas partisipasi Anda!
              </h1>
              <p className="text-base text-slate-500 font-[family-name:var(--font-body)] leading-relaxed">
                Semoga Allah memberikan kesembuhan yang sempurna.
              </p>
            </motion.div>

            {/* Voucher info */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: EASE_OUT }}
              className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200/60 p-5 text-center"
            >
              <Gift className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-amber-800 font-[family-name:var(--font-display)]">
                Voucher Herbal Rp 25.000
              </p>
              <p className="text-xs text-amber-600 mt-1 font-[family-name:var(--font-body)]">
                Tunjukkan kode ini di apotek RSU Ja&apos;far Medika
              </p>
            </motion.div>

            {/* Quran verse card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: EASE_OUT }}
              className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/80 border border-teal-200/60 p-5"
            >
              <p className="text-sm italic text-teal-800 leading-relaxed text-center font-[family-name:var(--font-body)]">
                &ldquo;Dan Allah menyembuhkan kamu penyakitmu (QS. Yunus: 57)&rdquo;
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5, ease: EASE_OUT }}
            >
              <Button
                onClick={() => router.push('/')}
                className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/35"
                size="lg"
              >
                Kembali ke Beranda
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 pt-2"
            >
              <Hospital className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-medium text-slate-400 font-[family-name:var(--font-body)]">
                RSU Ja&apos;far Medika Karanganyar
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ============================================================
  // Section renderer
  // ============================================================
  const renderSection = () => {
    switch (step) {
      case 0: return <SectionA form={form} updateField={updateField} />
      case 1: return <SectionB form={form} updateField={updateField} />
      case 2: return <SectionC form={form} updateField={updateField} />
      case 3: return <SectionD form={form} updateField={updateField} />
      case 4: return <SectionE form={form} updateField={updateField} visitCount={form.visit_count} conditionType={form.condition_type} />
      case 5: return <SectionF form={form} updateField={updateField} />
      case 6: return <SectionG form={form} updateField={updateField} />
      case 7: return <SectionH form={form} updateField={updateField} />
      case 8: return <SectionI form={form} updateField={updateField} />
      default: return null
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ============================================================ */}
      {/* Header with step indicator */}
      {/* ============================================================ */}
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
        className="sticky top-0 z-50 border-b border-slate-200/60"
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        {/* Top bar */}
        <div className="bg-white/80 border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-dpems-icon.svg" alt="" className="w-9 h-9" />
              <div>
                <p className="text-[11px] text-slate-400 font-medium font-[family-name:var(--font-body)]">RSU Ja&apos;far Medika</p>
                <p className="text-sm font-bold text-slate-800 font-[family-name:var(--font-display)]">Poli Akupuntur & Herbal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Time remaining */}
              <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-slate-400 font-[family-name:var(--font-body)]">
                <Clock className="w-3.5 h-3.5" />
                <span>~{timeRemaining} menit lagi</span>
              </div>
              {/* Voice toggle for elderly */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  voiceEnabled ? 'bg-teal-50 text-teal-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                )}
                title={voiceEnabled ? 'Matikan suara' : 'Nyalakan suara untuk lansia'}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-400 font-[family-name:var(--font-body)] tabular-nums">
                {step + 1}/{STEPS.length}
              </span>
              <button
                onClick={() => router.push('/')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Kembali ke Beranda"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Step progress bar */}
        <div className="bg-white/60 px-4 sm:px-6 py-2.5">
          <div className="max-w-3xl mx-auto">
            {/* Progress bar with time estimate */}
            <div className="relative h-1.5 rounded-full bg-slate-200/80 mb-1 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-teal-600 font-[family-name:var(--font-body)]">
                {Math.round(progress)}% selesai
              </span>
              <span className="text-[10px] text-slate-400 font-[family-name:var(--font-body)]">
                Estimasi total: ~{totalTime} menit
              </span>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-between gap-0.5 overflow-x-auto">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const isCompleted = i < step
                const isCurrent = i === step
                return (
                  <button
                    key={i}
                    onClick={() => i < step && setStep(i)}
                    disabled={!isCompleted && !isCurrent}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-1.5 transition-all text-left shrink-0',
                      isCompleted && 'cursor-pointer hover:bg-teal-50',
                      isCurrent && 'bg-teal-50',
                      (!isCompleted && !isCurrent) && 'cursor-default opacity-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all shrink-0',
                        isCompleted && 'bg-teal-500 text-white',
                        isCurrent && 'bg-gradient-to-br from-teal-600 to-teal-500 text-white shadow-sm shadow-teal-500/20',
                        (!isCompleted && !isCurrent) && 'bg-slate-200 text-slate-400'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        s.shortTitle
                      )}
                    </div>
                    <div className="hidden sm:flex flex-col">
                      <span className={cn(
                        'text-[11px] font-semibold leading-tight font-[family-name:var(--font-display)]',
                        isCurrent ? 'text-teal-700' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                      )}>
                        {s.title}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ============================================================ */}
      {/* Mini-Break Reminder (after Section E) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showBreakReminder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-[120px] z-40 mx-4 mt-4 sm:mx-auto sm:max-w-3xl"
          >
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Pause className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-800 font-[family-name:var(--font-display)]">
                  Setengah Jalan! Istirahat Sejenak
                </p>
                <p className="text-xs text-blue-600 mt-0.5 font-[family-name:var(--font-body)]">
                  Anda sudah 60% selesai. Boleh istirahat 10 detik sebelum lanjut ke Bagian F.
                </p>
              </div>
              <button
                onClick={() => setShowBreakReminder(false)}
                className="text-blue-400 hover:text-blue-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* Badge Notification (gamification) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xl p-4 flex items-center gap-3 min-w-[200px]">
              <span className="text-3xl">{showBadge}</span>
              <div>
                <p className="text-xs font-bold text-teal-700 font-[family-name:var(--font-display)]">
                  Badge Baru!
                </p>
                <p className="text-[11px] text-slate-500 font-[family-name:var(--font-body)]">
                  {SECTION_BADGES[STEPS[Math.max(0, step - 1)]?.shortTitle]?.name}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* Save Confirmation Modal */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
            onClick={() => setShowSaveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl bg-white border border-slate-200 shadow-xl p-6 max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Save className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 font-[family-name:var(--font-display)]">Progress Tersimpan</p>
                  <p className="text-xs text-slate-500 font-[family-name:var(--font-body)]">Bagian {STEPS[step].shortTitle} ({Math.round(progress)}%)</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 font-[family-name:var(--font-body)]">
                Anda bisa melanjutkan nanti dengan scan QR ulang atau buka link yang sama. Data tersimpan otomatis.
              </p>
              <Button
                onClick={() => { setShowSaveConfirm(false); router.push('/') }}
                className="w-full h-10 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white"
              >
                Tutup & Lanjutkan Nanti
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* Content */}
      {/* ============================================================ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ============================================================ */}
      {/* Navigation Buttons */}
      {/* ============================================================ */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: EASE_OUT }}
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="h-4 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
        <div className="bg-white/90 border-t border-slate-200/60 px-4 py-3">
          <div className="max-w-3xl mx-auto grid grid-cols-1 gap-3 sm:flex sm:flex-nowrap sm:gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-11 text-sm font-semibold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-[family-name:var(--font-display)]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Kembali
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                className={cn(
                  'h-11 text-sm font-semibold rounded-xl text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/30 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 font-[family-name:var(--font-display)]',
                  step === 0 && 'flex-1'
                )}
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/30 disabled:opacity-60 disabled:cursor-not-allowed font-[family-name:var(--font-display)]"
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Kirim Survei
                    <CheckCircle2 className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
            {/* Save for later */}
            <Button
              variant="ghost"
              onClick={() => setShowSaveConfirm(true)}
              className="h-11 px-3 text-xs text-slate-400 hover:text-teal-600 rounded-xl"
              title="Simpan & lanjutkan nanti"
            >
              <Save className="w-4 h-4" />
            </Button>
            {/* Submit Error Display */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full mt-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center justify-between"
              >
                <p className="text-xs text-red-700 font-medium">{submitError}</p>
                <button
                  onClick={() => setSubmitError(null)}
                  className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
        <div className="h-safe-area-inset-bottom" />
      </motion.div>
    </div>
  )
}