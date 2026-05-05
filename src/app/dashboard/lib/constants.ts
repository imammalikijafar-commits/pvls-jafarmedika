export const TEAL = '#0D9488'
export const TEAL_LIGHT = 'rgba(13,148,136,0.15)'
export const AMBER = '#D97706'
export const RED = '#DC2626'
export const BLUE = '#2563EB'
export const VIOLET = '#7C3AED'
export const EMERALD = '#059669'
export const NPS_COLORS = ['#059669', '#d97706', '#dc2626']

export const CONDITION_TYPES = [
  'Stroke/Pasca Stroke',
  'Nyeri Sendi (Rematik/OA)',
  'Nyeri Punggung/Saraf Kejepit',
  'Migrain/Sakit Kepala Kronis',
  'Gangguan Tidur (Insomnia)',
  'Kondisi Neurologis Lainnya',
  'Wellness/Pemeliharaan Kesehatan',
  'Lainnya',
]

export const KPI_COLOR_MAP: Record<string, { bg: string; iconBg: string; trendUp: string; trendDown: string }> = {
  teal:   { bg: 'bg-teal-50',   iconBg: 'bg-teal-600',   trendUp: 'text-teal-600',   trendDown: 'text-red-500' },
  blue:   { bg: 'bg-blue-50',   iconBg: 'bg-blue-600',   trendUp: 'text-teal-600',   trendDown: 'text-red-500' },
  amber:  { bg: 'bg-amber-50',  iconBg: 'bg-amber-500',  trendUp: 'text-teal-600',   trendDown: 'text-red-500' },
  rose:   { bg: 'bg-rose-50',   iconBg: 'bg-rose-500',   trendUp: 'text-teal-600',   trendDown: 'text-red-500' },
}
