// ============================================================
// Shared Form Data Interface & Question Data
// Used by all section components and the main page
// Schema v2.2 — 9 Steps (A-I), SERVQUAL 5x5=25 items
// ============================================================

export interface FormData {
  // Bagian A - Demographics
  age_range: string
  gender: string
  education: string
  occupation: string
  occupation_other: string
  income_range: string
  payment_type: string
  payment_type_other: string
  gender_preference: string
  condition_type: string
  condition_type_other: string
  visit_count: string
  referral_source: string

  // Bagian B - SERVQUAL v2.2 (25 individual questions, 5 per dimension)
  // B1 Tangibles (5 items)
  b1_1_facility_condition: number | null; b1_2_equipment_modern: number | null; b1_3_staff_appearance: number | null; b1_4_facility_comfort: number | null; b1_5_islamic_facilities: number | null
  // B2 Reliability (5 items)
  b2_1_service_accuracy: number | null; b2_2_punctuality: number | null; b2_3_admin_accuracy: number | null; b2_4_consistency: number | null; b2_5_prayer_accommodation: number | null
  // B3 Responsiveness (5 items)
  b3_1_quick_response: number | null; b3_2_staff_willingness: number | null; b3_3_complaint_handling: number | null; b3_4_waiting_time: number | null; b3_5_information_clarity: number | null
  // B4 Assurance (5 items)
  b4_1_staff_competence: number | null; b4_2_patient_trust: number | null; b4_3_safety_feeling: number | null; b4_4_staff_courtesy: number | null; b4_5_knowledge: number | null
  // B5 Empathy (5 items)
  b5_1_individual_attention: number | null; b5_2_understanding_needs: number | null; b5_3_respectful_treatment: number | null; b5_4_followup_visits: number | null; b5_5_operating_hours: number | null

  // Bagian C - Herbal
  herbal_prescribed: string
  c2_herb_explanation: number | null; c2_herb_usage_guide: number | null
  c2_herb_safety_trust: number | null; c2_herb_availability: number | null
  c2_herb_affordability: number | null; c2_herb_pharmacist: number | null

  // Bagian D - Clarity (Persepsi Terapi) — 4 Likert items
  d1_clarity_role: number | null; d2_clarity_explanation: number | null
  d3_clarity_comfortable: number | null; d4_clarity_specialist: number | null

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

  // E4: Wellness (WHOQOL-BREF) - 3 items, scale 1-5
  wellness_1: number | null; wellness_2: number | null; wellness_3: number | null

  // Bagian F - Spiritual & Holistik (8 items)
  f1_halal_assurance: number | null
  f2_tibb_nabawi: number | null; f3_spiritual_activation: number | null
  f4_holistic_peace: number | null; f5_spiritual_communication: number | null
  f6_tawakkal: number | null; f7_ridha: number | null
  f8_reverse_coded: number | null

  // Bagian G - NPS & Loyalty
  nps_score: number
  visit_plan: string
  has_recommended: string
  recommendation_count: number | null

  // Bagian H - Feedback (v3: checkbox kategori + testimonial)
  h1_liked: string[]
  h1_liked_other: string
  h2_suggested: string[]
  h2_suggested_other: string
  testimonial: string

  // Bagian I - WTP (Willingness to Pay)
  wtp_cost_today: number | null
  wtp_increase_20: string
  wtp_package_interest: string
  wtp_max_acceptable: number | null
}

export const initialForm: FormData = {
  age_range: '', gender: '', education: '', occupation: '', occupation_other: '',
  income_range: '',
  payment_type: '', payment_type_other: '', gender_preference: '',
  condition_type: '', condition_type_other: '',
  visit_count: '', referral_source: '',
  // B1 Tangibles (5 items)
  b1_1_facility_condition: null, b1_2_equipment_modern: null, b1_3_staff_appearance: null, b1_4_facility_comfort: null, b1_5_islamic_facilities: null,
  // B2 Reliability (5 items)
  b2_1_service_accuracy: null, b2_2_punctuality: null, b2_3_admin_accuracy: null, b2_4_consistency: null, b2_5_prayer_accommodation: null,
  // B3 Responsiveness (5 items)
  b3_1_quick_response: null, b3_2_staff_willingness: null, b3_3_complaint_handling: null, b3_4_waiting_time: null, b3_5_information_clarity: null,
  // B4 Assurance (5 items)
  b4_1_staff_competence: null, b4_2_patient_trust: null, b4_3_safety_feeling: null, b4_4_staff_courtesy: null, b4_5_knowledge: null,
  // B5 Empathy (5 items)
  b5_1_individual_attention: null, b5_2_understanding_needs: null, b5_3_respectful_treatment: null, b5_4_followup_visits: null, b5_5_operating_hours: null,
  // Herbal
  herbal_prescribed: '', c2_herb_explanation: null, c2_herb_usage_guide: null,
  c2_herb_safety_trust: null, c2_herb_availability: null, c2_herb_affordability: null, c2_herb_pharmacist: null,
  // D - Clarity (4 items)
  d1_clarity_role: null, d2_clarity_explanation: null,
  d3_clarity_comfortable: null, d4_clarity_specialist: null,
  // Pain (VAS)
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
  // Spiritual (8 items)
  f1_halal_assurance: null, f2_tibb_nabawi: null,
  f3_spiritual_activation: null, f4_holistic_peace: null,
  f5_spiritual_communication: null, f6_tawakkal: null, f7_ridha: null,
  f8_reverse_coded: null,
  // NPS & Loyalty
  nps_score: 8, visit_plan: '', has_recommended: '',
  recommendation_count: null,
  // Feedback
  h1_liked: [], h1_liked_other: '', h2_suggested: [], h2_suggested_other: '', testimonial: '',
  // WTP
  wtp_cost_today: null, wtp_increase_20: '', wtp_package_interest: '', wtp_max_acceptable: null,
}

// ============================================================
// SERVQUAL Sections (Bagian B)
// ============================================================

export const servqualSections = [
  {
    title: 'B1. Bukti Fisik (Tangibles)',
    questions: [
      { key: 'b1_1_facility_condition' as const, text: 'Ruangan akupuntur bersih, nyaman, dan privasi terjaga' },
      { key: 'b1_2_equipment_modern' as const, text: 'Peralatan akupuntur (jarum) terlihat steril dan higienis' },
      { key: 'b1_3_staff_appearance' as const, text: 'Fasilitas tempat berbaring selama terapi memadai' },
      { key: 'b1_4_facility_comfort' as const, text: 'Suasana ruangan tenang dan mendukung relaksasi' },
      { key: 'b1_5_islamic_facilities' as const, text: 'Tersedia fasilitas ibadah (mushola/tempat wudhu) di area poli' },
    ],
  },
  {
    title: 'B2. Keandalan (Reliability)',
    questions: [
      { key: 'b2_1_service_accuracy' as const, text: 'Sesi akupuntur dimulai tepat waktu sesuai jadwal' },
      { key: 'b2_2_punctuality' as const, text: 'Dokter akupuntur selalu hadir dan tersedia sesuai jadwal' },
      { key: 'b2_3_admin_accuracy' as const, text: 'Prosedur terapi dilakukan secara konsisten dan terstandar' },
      { key: 'b2_4_consistency' as const, text: 'Pencatatan / rekam medis terapi akupuntur dilakukan dengan tertib' },
      { key: 'b2_5_prayer_accommodation' as const, text: 'Jadwal terapi mengakomodasi waktu ibadah (shalat)' },
    ],
  },
  {
    title: 'B3. Ketanggapan (Responsiveness)',
    questions: [
      { key: 'b3_1_quick_response' as const, text: 'Waktu tunggu antrian sebelum terapi tidak terlalu lama' },
      { key: 'b3_2_staff_willingness' as const, text: 'Petugas / dokter merespons keluhan saya dengan cepat' },
      { key: 'b3_3_complaint_handling' as const, text: 'Dokter bersedia menjelaskan prosedur dengan sabar dan jelas' },
      { key: 'b3_4_waiting_time' as const, text: 'Jika ada efek samping / keluhan, langsung ditangani' },
      { key: 'b3_5_information_clarity' as const, text: 'Informasi tentang jadwal, prosedur, dan biaya disampaikan dengan jelas' },
    ],
  },
  {
    title: 'B4. Jaminan (Assurance)',
    questions: [
      { key: 'b4_1_staff_competence' as const, text: 'Saya percaya pada kompetensi dan keahlian dokter akupuntur' },
      { key: 'b4_2_patient_trust' as const, text: 'Dokter menjelaskan diagnosis dan rencana terapi dengan jelas' },
      { key: 'b4_3_safety_feeling' as const, text: 'Saya merasa aman selama prosedur akupuntur berlangsung' },
      { key: 'b4_4_staff_courtesy' as const, text: 'Dokter memiliki sertifikasi / izin praktik yang resmi' },
      { key: 'b4_5_knowledge' as const, text: 'Saya yakin dokter memiliki pengetahuan mendalam tentang akupuntur dan herbal' },
    ],
  },
  {
    title: 'B5. Empati (Empathy)',
    questions: [
      { key: 'b5_1_individual_attention' as const, text: 'Dokter memberikan perhatian personal kepada saya' },
      { key: 'b5_2_understanding_needs' as const, text: 'Dokter memahami kekhawatiran saya tentang kondisi kesehatan' },
      { key: 'b5_3_respectful_treatment' as const, text: 'Saya diperlakukan dengan hormat dan manusiawi' },
      { key: 'b5_4_followup_visits' as const, text: 'Dokter menanyakan perkembangan kondisi saya di setiap kunjungan' },
      { key: 'b5_5_operating_hours' as const, text: 'Jam operasional poli nyaman dan sesuai kebutuhan pasien' },
    ],
  },
]

// ============================================================
// Herbal Questions (Bagian C2)
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
// Clarity Questions (Bagian D) — replaces old adjuvantQuestions
// ============================================================

export const clarityQuestions = [
  { key: 'd1_clarity_role' as const, text: 'Saya memahami bahwa akupuntur/herbal adalah terapi PENDUKUNG, bukan pengganti obat utama dari dokter spesialis' },
  { key: 'd2_clarity_explanation' as const, text: 'Dokter menjelaskan manfaat dan batasan terapi akupuntur/herbal secara jelas' },
  { key: 'd3_clarity_comfortable' as const, text: 'Saya merasa nyaman dan aman untuk bertanya tentang peran terapi ini dalam pengobatan saya' },
  { key: 'd4_clarity_specialist' as const, text: 'Saya yakin bahwa terapi akupuntur/herbal di sini dilakukan sesuai dengan rujukan dan koordinasi dokter spesialis' },
]

// ============================================================
// Spiritual Questions (Bagian F) — 8 items (F1-F8)
// F8 is reverse-coded
// ============================================================

export const spiritualQuestions = [
  { key: 'f1_halal_assurance' as const, text: 'Saya yakin bahwa herbal/obat yang diberikan halal dan tidak mengandung bahan haram' },
  { key: 'f2_tibb_nabawi' as const, text: 'Saya merasa terapi yang diberikan selaras dengan prinsip pengobatan Islami (thibbun nabawi)' },
  { key: 'f3_spiritual_activation' as const, text: 'Layanan di sini mendorong saya untuk lebih mendekatkan diri kepada Allah SWT' },
  { key: 'f4_holistic_peace' as const, text: 'Saya merasa ketenangan dan kedamaian spiritual setelah mendapat layanan di sini' },
  { key: 'f5_spiritual_communication' as const, text: 'Dokter/staf sesekali mengingatkan atau mendoakan kesembuhan saya' },
  { key: 'f6_tawakkal' as const, text: 'Saya menjalani terapi ini sebagai bagian dari ikhtiar yang saya niatkan karena Allah' },
  { key: 'f7_ridha' as const, text: 'Terapi ini membantu saya lebih ikhlas menerima kondisi kesehatan yang Allah berikan' },
  { key: 'f8_reverse_coded' as const, text: 'Saya merasa aspek keagamaan terlalu sering disebutkan dalam pelayanan', reverseCoded: true },
]

// ============================================================
// WTP Cost Options (Bagian I)
// ============================================================

export const WTP_COST_TODAY_OPTIONS = [
  { label: '< Rp 50.000', value: 50000 },
  { label: 'Rp 50.000 – Rp 100.000', value: 75000 },
  { label: 'Rp 100.000 – Rp 150.000', value: 125000 },
  { label: 'Rp 150.000 – Rp 200.000', value: 175000 },
  { label: 'Rp 200.000 – Rp 300.000', value: 250000 },
  { label: '> Rp 300.000', value: 350000 },
]

export const WTP_INCREASE_20_OPTIONS = ['Ya', 'Tidak'] as const

export const WTP_PACKAGE_INTEREST_OPTIONS = ['Ya', 'Tidak', 'Mungkin'] as const

export const WTP_MAX_ACCEPTABLE_OPTIONS = [
  { label: '< Rp 75.000', value: 75000 },
  { label: 'Rp 75.000 – Rp 150.000', value: 112500 },
  { label: 'Rp 150.000 – Rp 200.000', value: 175000 },
  { label: 'Rp 200.000 – Rp 300.000', value: 250000 },
  { label: 'Rp 300.000 – Rp 500.000', value: 400000 },
  { label: '> Rp 500.000', value: 600000 },
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
  { key: 'isi_1' as const, text: 'Kesulitan untuk mulai tidur (membutuhkan waktu lama untuk tidur)' },
  { key: 'isi_2' as const, text: 'Sering terbangun di tengah malam' },
  { key: 'isi_3' as const, text: 'Terbangun terlalu pagi dan tidak bisa tidur lagi' },
  { key: 'isi_4' as const, text: 'Merasa TIDAK PUAS dengan kualitas tidur Anda secara keseluruhan' },
  { key: 'isi_5' as const, text: 'Masalah tidur mengganggu aktivitas sehari-hari (konsentrasi, energi, suasana hati)' },
  { key: 'isi_6' as const, text: 'Orang lain menyadari ada gangguan pada kualitas tidur Anda' },
  { key: 'isi_7' as const, text: 'Seberapa KHAWATIR Anda tentang masalah tidur saat ini?' },
]

export const ISI_LABELS = ['Tidak Ada', 'Ringan', 'Sedang', 'Berat', 'Sangat Berat']

// ============================================================
// Wellness Questions (Bagian E4 - WHOQOL-BREF)
// Scale: 1 = Sangat Buruk, 2 = Buruk, 3 = Cukup, 4 = Baik, 5 = Sangat Baik
// ============================================================

export const wellnessQuestions = [
  { key: 'wellness_1' as const, text: 'Seberapa baik kondisi kesehatan Anda secara umum SAAT INI?' },
  { key: 'wellness_2' as const, text: 'Seberapa besar energi yang Anda rasakan dalam aktivitas sehari-hari?' },
  { key: 'wellness_3' as const, text: 'Seberapa puas Anda dengan kondisi kesehatan Anda secara keseluruhan?' },
]

export const WELLNESS_LABELS = ['Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik']