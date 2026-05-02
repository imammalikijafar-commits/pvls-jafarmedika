// ============================================================
// Shared Form Data Interface & Question Data
// Used by all section components and the main page
// Version: 2.0.0 (Kuesioner Final - Integrative Medicine)
// ============================================================

export interface FormData {
  // Bagian A - Demographics (9 items)
  age_range: string
  gender: string
  education: string
  occupation: string
  occupation_other: string
  income_range: string           // A5 (NEW)
  patient_type: string           // A6 (payment type)
  condition_type: string         // A7
  condition_type_other: string   // A7 Lainnya (FIX: was writing to occupation_other)
  visit_count: string            // A8
  referral_source: string        // A9

  // Bagian B - SERVQUAL (21 individual questions: 5+4+4+4+4)
  b1_t1_kebersihan: number | null; b1_t2_steril: number | null; b1_t3_berbaring: number | null; b1_t4_suasana: number | null
  b1_t5_ibadah: number | null    // NEW: B1.5 fasilitas ibadah
  b2_r1_tepat_waktu: number | null; b2_r2_hadir: number | null; b2_r3_terstandar: number | null; b2_r4_rekam_medis: number | null
  b3_c1_tunggu: number | null; b3_c2_respons: number | null; b3_c3_jelas: number | null; b3_c4_efek_samping: number | null
  b4_a1_kompetensi: number | null; b4_a2_diagnosis: number | null; b4_a3_aman: number | null; b4_a4_sertifikasi: number | null
  b5_e1_personal: number | null; b5_e2_kekhawatiran: number | null; b5_e3_hormat: number | null; b5_e4_perkembangan: number | null

  // Bagian C - Herbal (conditional on prescription)
  herbal_prescribed: string
  c2_herb_explanation: number | null; c2_herb_usage_guide: number | null
  c2_herb_safety_trust: number | null; c2_herb_availability: number | null
  c2_herb_affordability: number | null; c2_herb_pharmacist: number | null

  // Bagian D - Perceived Clarity of Therapeutic Role (4 Likert, no radio)
  d1_clarity_role: number | null
  d2_clarity_explanation: number | null
  d3_clarity_comfortable: number | null
  d4_clarity_specialist: number | null

  // Bagian E - Clinical Outcomes (Branching based on condition_type)
  // E1: VAS (pain conditions)
  pain_level_before: number
  pain_level_after: number | null
  condition_change: string

  // E2: Barthel Index (stroke) - 10 activities × 2 timepoints
  barthel_eat_first: number | null; barthel_eat_current: number | null
  barthel_bath_first: number | null; barthel_bath_current: number | null
  barthel_groom_first: number | null; barthel_groom_current: number | null
  barthel_dress_first: number | null; barthel_dress_current: number | null
  barthel_toilet_first: number | null; barthel_toilet_current: number | null
  barthel_bowel_first: number | null; barthel_bowel_current: number | null
  barthel_bladder_first: number | null; barthel_bladder_current: number | null
  barthel_transfer_first: number | null; barthel_transfer_current: number | null
  barthel_mobility_first: number | null; barthel_mobility_current: number | null
  barthel_stairs_first: number | null; barthel_stairs_current: number | null

  // E3: ISI (insomnia) - 7 items, scale 0-4
  isi_1: number | null; isi_2: number | null; isi_3: number | null; isi_4: number | null
  isi_5: number | null; isi_6: number | null; isi_7: number | null

  // E4: Wellness (3-item Self-Rated Health) - 3 items, scale 1-5
  wellness_1: number | null; wellness_2: number | null; wellness_3: number | null

  // Bagian F - Spiritual & Holistik (9 items, F9 reverse-coded)
  f1_adab_islami: number | null
  f2_gender_concordance: number | null
  f3_prayer_accommodation: number | null
  f4_halal_assurance: number | null
  f5_tibb_nabawi: number | null
  f6_spiritual_activation: number | null
  f7_holistic_peace: number | null
  f8_spiritual_communication: number | null
  f9_reverse_coded: number | null

  // Bagian G - Loyaltas & NPS (5 items)
  nps_score: number
  visit_plan: string
  has_recommended: string
  recommendation_count: string      // G4 (NEW)
  wtp_price_increase: number        // G5 (NEW) - 0-10 slider

  // Bagian H - Feedback (checkbox kategori + testimonial)
  h1_liked: string[]
  h1_liked_other: string
  h2_suggested: string[]
  h2_suggested_other: string
  testimonial: string

  // Bagian I - Willingness to Pay (4 items)
  wtp_cost_today: number            // I1: biaya sesi hari ini
  wtp_increase_20: string           // I2: jika naik 20%
  wtp_package_interest: string      // I3: paket 4 sesi diskon 10%
  wtp_max_acceptable: string        // I4: biaya maksimal (Payment Card)
}

export const initialForm: FormData = {
  age_range: '', gender: '', education: '', occupation: '', occupation_other: '',
  income_range: '', patient_type: '', condition_type: '', condition_type_other: '',
  visit_count: '', referral_source: '',
  b1_t1_kebersihan: null, b1_t2_steril: null, b1_t3_berbaring: null, b1_t4_suasana: null, b1_t5_ibadah: null,
  b2_r1_tepat_waktu: null, b2_r2_hadir: null, b2_r3_terstandar: null, b2_r4_rekam_medis: null,
  b3_c1_tunggu: null, b3_c2_respons: null, b3_c3_jelas: null, b3_c4_efek_samping: null,
  b4_a1_kompetensi: null, b4_a2_diagnosis: null, b4_a3_aman: null, b4_a4_sertifikasi: null,
  b5_e1_personal: null, b5_e2_kekhawatiran: null, b5_e3_hormat: null, b5_e4_perkembangan: null,
  herbal_prescribed: '', c2_herb_explanation: null, c2_herb_usage_guide: null,
  c2_herb_safety_trust: null, c2_herb_availability: null, c2_herb_affordability: null, c2_herb_pharmacist: null,
  d1_clarity_role: null, d2_clarity_explanation: null, d3_clarity_comfortable: null, d4_clarity_specialist: null,
  pain_level_before: 5, pain_level_after: null, condition_change: '',
  // Barthel
  barthel_eat_first: null, barthel_eat_current: null,
  barthel_bath_first: null, barthel_bath_current: null,
  barthel_groom_first: null, barthel_groom_current: null,
  barthel_dress_first: null, barthel_dress_current: null,
  barthel_toilet_first: null, barthel_toilet_current: null,
  barthel_bowel_first: null, barthel_bowel_current: null,
  barthel_bladder_first: null, barthel_bladder_current: null,
  barthel_transfer_first: null, barthel_transfer_current: null,
  barthel_mobility_first: null, barthel_mobility_current: null,
  barthel_stairs_first: null, barthel_stairs_current: null,
  // ISI
  isi_1: null, isi_2: null, isi_3: null, isi_4: null, isi_5: null, isi_6: null, isi_7: null,
  // Wellness
  wellness_1: null, wellness_2: null, wellness_3: null,
  // Spiritual (9 items)
  f1_adab_islami: null, f2_gender_concordance: null, f3_prayer_accommodation: null,
  f4_halal_assurance: null, f5_tibb_nabawi: null, f6_spiritual_activation: null,
  f7_holistic_peace: null, f8_spiritual_communication: null, f9_reverse_coded: null,
  // NPS & Loyalty
  nps_score: 8, visit_plan: '', has_recommended: '', recommendation_count: '', wtp_price_increase: 5,
  // Feedback
  h1_liked: [], h1_liked_other: '', h2_suggested: [], h2_suggested_other: '', testimonial: '',
  // WTP (Bagian I)
  wtp_cost_today: 0, wtp_increase_20: '', wtp_package_interest: '', wtp_max_acceptable: '',
}

// ============================================================
// SERVQUAL Sections (Bagian B) — 21 items
// ============================================================

export const servqualSections = [
  {
    title: 'B1. Bukti Fisik (Tangibles)',
    questions: [
      { key: 'b1_t1_kebersihan' as const, text: 'Ruangan akupuntur bersih, nyaman, dan privasi terjaga' },
      { key: 'b1_t2_steril' as const, text: 'Peralatan akupuntur (jarum) terlihat steril dan higienis' },
      { key: 'b1_t3_berbaring' as const, text: 'Fasilitas tempat berbaring selama terapi memadai' },
      { key: 'b1_t4_suasana' as const, text: 'Suasana ruangan tenang dan mendukung relaksasi' },
      { key: 'b1_t5_ibadah' as const, text: 'Fasilitas ibadah (mushola/tempat wudhu) mudah diakses dan bersih' },
    ],
  },
  {
    title: 'B2. Keandalan (Reliability)',
    questions: [
      { key: 'b2_r1_tepat_waktu' as const, text: 'Sesi akupuntur dimulai tepat waktu sesuai jadwal' },
      { key: 'b2_r2_hadir' as const, text: 'Dokter akupuntur selalu hadir dan tersedia sesuai jadwal' },
      { key: 'b2_r3_terstandar' as const, text: 'Prosedur terapi dilakukan secara konsisten dan terstandar' },
      { key: 'b2_r4_rekam_medis' as const, text: 'Pencatatan / rekam medis terapi akupuntur dilakukan dengan tertib' },
    ],
  },
  {
    title: 'B3. Ketanggapan (Responsiveness)',
    questions: [
      { key: 'b3_c1_tunggu' as const, text: 'Waktu tunggu antrian sebelum terapi tidak terlalu lama' },
      { key: 'b3_c2_respons' as const, text: 'Petugas / dokter merespons keluhan saya dengan cepat' },
      { key: 'b3_c3_jelas' as const, text: 'Dokter bersedia menjelaskan prosedur dengan sabar dan jelas' },
      { key: 'b3_c4_efek_samping' as const, text: 'Jika ada efek samping / keluhan, langsung ditangani' },
    ],
  },
  {
    title: 'B4. Jaminan (Assurance)',
    questions: [
      { key: 'b4_a1_kompetensi' as const, text: 'Saya percaya pada kompetensi dan keahlian dokter akupuntur' },
      { key: 'b4_a2_diagnosis' as const, text: 'Dokter menjelaskan diagnosis dan rencana terapi dengan jelas' },
      { key: 'b4_a3_aman' as const, text: 'Saya merasa aman selama prosedur akupuntur berlangsung' },
      { key: 'b4_a4_sertifikasi' as const, text: 'Dokter memiliki sertifikasi / izin praktik yang resmi' },
    ],
  },
  {
    title: 'B5. Empati (Empathy)',
    questions: [
      { key: 'b5_e1_personal' as const, text: 'Dokter memberikan perhatian personal kepada saya' },
      { key: 'b5_e2_kekhawatiran' as const, text: 'Dokter memahami kekhawatiran saya tentang kondisi kesehatan' },
      { key: 'b5_e3_hormat' as const, text: 'Saya diperlakukan dengan hormat dan manusiawi' },
      { key: 'b5_e4_perkembangan' as const, text: 'Dokter menanyakan perkembangan kondisi saya di setiap kunjungan' },
    ],
  },
]

// ============================================================
// Herbal Questions (Bagian C) — 6 items
// ============================================================

export const herbalQuestions = [
  { key: 'c2_herb_explanation' as const, text: 'Dokter menjelaskan fungsi dan manfaat herbal yang diresepkan' },
  { key: 'c2_herb_usage_guide' as const, text: 'Dokter menjelaskan cara penggunaan herbal dengan jelas' },
  { key: 'c2_herb_safety_trust' as const, text: 'Saya percaya terhadap keamanan produk herbal yang diberikan' },
  { key: 'c2_herb_availability' as const, text: 'Produk herbal selalu tersedia di apotek RS (tidak kehabisan)' },
  { key: 'c2_herb_affordability' as const, text: 'Harga produk herbal terjangkau dan transparan' },
  { key: 'c2_herb_pharmacist' as const, text: 'Petugas apotek menjelaskan cara pakai herbal dengan baik' },
]

// ============================================================
// Therapeutic Clarity Questions (Bagian D) — 4 Likert items
// ============================================================

export const clarityQuestions = [
  { key: 'd1_clarity_role' as const, text: 'Saya memahami bahwa akupuntur/herbal di sini berperan sebagai PENDUKUNG, bukan pengganti pengobatan dokter spesialis' },
  { key: 'd2_clarity_explanation' as const, text: 'Saya merasa penjelasan dokter tentang peran terapi ini cukup jelas' },
  { key: 'd3_clarity_comfortable' as const, text: 'Saya merasa nyaman untuk bertanya kepada dokter tentang terapi ini' },
  { key: 'd4_clarity_specialist' as const, text: 'Saya memahami kapan saya harus kembali ke dokter spesialis (bukan hanya ke akupuntur)' },
]

// ============================================================
// Spiritual Questions (Bagian F) — 9 items (F9 reverse-coded)
// ============================================================

export interface SpiritualQuestion {
  key: keyof FormData
  text: string
  dimension: string
  reverseCoded?: boolean
}

export const spiritualQuestions: SpiritualQuestion[] = [
  { key: 'f1_adab_islami', text: 'Praktisi menunjukkan sikap hormat dan adab Islami dalam pelayanan', dimension: 'Adab & Etika Islami' },
  { key: 'f2_gender_concordance', text: 'Gender praktisi sesuai dengan preferensi saya', dimension: 'Gender Concordance' },
  { key: 'f3_prayer_accommodation', text: 'Jadwal terapi mempertimbangkan waktu shalat saya', dimension: 'Prayer-Time Accommodation' },
  { key: 'f4_halal_assurance', text: 'Saya percaya produk herbal yang diberikan halal dan baik (thayyib)', dimension: 'Halal Assurance' },
  { key: 'f5_tibb_nabawi', text: 'Saya merasa terapi ini sejalan dengan prinsip kesehatan Islam (tibb nabawi)', dimension: 'Tibb Nabawi Recognition' },
  { key: 'f6_spiritual_activation', text: 'Saya merasa lebih dekat dengan Allah selama proses pengobatan', dimension: 'Spiritual Activation' },
  { key: 'f7_holistic_peace', text: 'Aspek spiritual dalam terapi membuat saya merasa tenang dan sabar dalam menghadapi penyakit', dimension: 'Holistic Peace' },
  { key: 'f8_spiritual_communication', text: 'Saya nyaman berbicara tentang kekhawatiran spiritual dengan praktisi', dimension: 'Spiritual Communication' },
  { key: 'f9_reverse_coded', text: 'Saya merasa aspek keagamaan terlalu sering disebutkan dalam pelayanan', dimension: 'Reverse-Coded', reverseCoded: true },
]

// ============================================================
// Barthel Index Activities (Bagian E2 - Stroke)
// ============================================================

export interface BarthelActivity {
  id: string
  label: string
  sublabel?: string
  firstKey: keyof FormData
  currentKey: keyof FormData
  options: { label: string; score: number }[]
}

export const barthelActivities: BarthelActivity[] = [
  {
    id: 'eat', label: 'Makan',
    firstKey: 'barthel_eat_first', currentKey: 'barthel_eat_current',
    options: [
      { label: 'Mandiri (10)', score: 10 },
      { label: 'Butuh bantuan (5)', score: 5 },
      { label: 'Tergantung total (0)', score: 0 },
    ],
  },
  {
    id: 'bath', label: 'Mandi',
    firstKey: 'barthel_bath_first', currentKey: 'barthel_bath_current',
    options: [
      { label: 'Mandiri (5)', score: 5 },
      { label: 'Tergantung (0)', score: 0 },
    ],
  },
  {
    id: 'groom', label: 'Kebersihan diri', sublabel: 'cuci muka, sisir, sikat gigi',
    firstKey: 'barthel_groom_first', currentKey: 'barthel_groom_current',
    options: [
      { label: 'Mandiri (5)', score: 5 },
      { label: 'Tergantung (0)', score: 0 },
    ],
  },
  {
    id: 'dress', label: 'Berpakaian',
    firstKey: 'barthel_dress_first', currentKey: 'barthel_dress_current',
    options: [
      { label: 'Mandiri (10)', score: 10 },
      { label: 'Butuh bantuan (5)', score: 5 },
      { label: 'Tergantung total (0)', score: 0 },
    ],
  },
  {
    id: 'bowel', label: 'Buang air besar', sublabel: 'kontrol usus besar',
    firstKey: 'barthel_bowel_first', currentKey: 'barthel_bowel_current',
    options: [
      { label: 'Terkontrol penuh (10)', score: 10 },
      { label: 'Kadang tidak terkontrol (5)', score: 5 },
      { label: 'Tidak terkontrol (0)', score: 0 },
    ],
  },
  {
    id: 'bladder', label: 'Buang air kecil', sublabel: 'kontrol kandung kemih',
    firstKey: 'barthel_bladder_first', currentKey: 'barthel_bladder_current',
    options: [
      { label: 'Terkontrol penuh (10)', score: 10 },
      { label: 'Kadang mengompol (5)', score: 5 },
      { label: 'Tidak terkontrol (0)', score: 0 },
    ],
  },
  {
    id: 'toilet', label: 'Penggunaan toilet', sublabel: 'WC / kamar mandi',
    firstKey: 'barthel_toilet_first', currentKey: 'barthel_toilet_current',
    options: [
      { label: 'Mandiri (10)', score: 10 },
      { label: 'Butuh bantuan (5)', score: 5 },
      { label: 'Tergantung total (0)', score: 0 },
    ],
  },
  {
    id: 'transfer', label: 'Berpindah tempat', sublabel: 'dari kursi ke tempat tidur',
    firstKey: 'barthel_transfer_first', currentKey: 'barthel_transfer_current',
    options: [
      { label: 'Mandiri (15)', score: 15 },
      { label: 'Butuh sedikit bantuan (10)', score: 10 },
      { label: 'Butuh banyak bantuan (5)', score: 5 },
      { label: 'Tidak mampu (0)', score: 0 },
    ],
  },
  {
    id: 'mobility', label: 'Berjalan / mobilitas',
    firstKey: 'barthel_mobility_first', currentKey: 'barthel_mobility_current',
    options: [
      { label: 'Mandiri >45m (15)', score: 15 },
      { label: 'Butuh bantuan >45m (10)', score: 10 },
      { label: 'Pakai kursi roda mandiri (5)', score: 5 },
      { label: 'Tidak mampu (0)', score: 0 },
    ],
  },
  {
    id: 'stairs', label: 'Naik / turun tangga',
    firstKey: 'barthel_stairs_first', currentKey: 'barthel_stairs_current',
    options: [
      { label: 'Mandiri (10)', score: 10 },
      { label: 'Butuh bantuan (5)', score: 5 },
      { label: 'Tidak mampu (0)', score: 0 },
    ],
  },
]

// ============================================================
// ISI Questions (Bagian E3 - Insomnia)
// Scale: 0 = Tidak Ada, 1 = Ringan, 2 = Sedang, 3 = Berat, 4 = Sangat Berat
// ============================================================

export const isiQuestions = [
  { key: 'isi_1' as const, text: 'Kesulitan untuk mulai tidur' },
  { key: 'isi_2' as const, text: 'Sering terbangun di tengah malam' },
  { key: 'isi_3' as const, text: 'Terbangun terlalu pagi dan tidak bisa tidur lagi' },
  { key: 'isi_4' as const, text: 'Merasa TIDAK PUAS dengan kualitas tidur' },
  { key: 'isi_5' as const, text: 'Masalah tidur mengganggu aktivitas sehari-hari' },
  { key: 'isi_6' as const, text: 'Orang lain menyadari ada gangguan pada kualitas tidur Anda' },
  { key: 'isi_7' as const, text: 'Seberapa KHAWATIR Anda tentang masalah tidur saat ini?' },
]

export const ISI_LABELS = ['Tidak Ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat']

// ============================================================
// Wellness Questions (Bagian E4 - 3-item Self-Rated Health Scale)
// Scale: 1 = Sangat Buruk, 2 = Buruk, 3 = Cukup, 4 = Baik, 5 = Sangat Baik
// ============================================================

export const wellnessQuestions = [
  { key: 'wellness_1' as const, text: 'Seberapa baik kondisi kesehatan Anda secara umum SAAT INI?' },
  { key: 'wellness_2' as const, text: 'Seberapa besar energi yang Anda rasakan dalam aktivitas sehari-hari?' },
  { key: 'wellness_3' as const, text: 'Seberapa puas Anda dengan kondisi kesehatan Anda secara keseluruhan?' },
]

export const WELLNESS_LABELS = ['Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik']

// ============================================================
// WTP Payment Card Options (Bagian I4)
// ============================================================

export const WTP_PAYMENT_OPTIONS = [
  'Rp 150.000',
  'Rp 200.000',
  'Rp 250.000',
  'Rp 300.000',
  'Rp 350.000',
  'Rp 400.000',
  'Rp 450.000',
  'Rp 500.000',
  '> Rp 500.000',
  'Tidak tahu/Tidak bersedia membayar',
] as const