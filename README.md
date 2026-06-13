# PVLS Ja'far Medika — File Transformasi

Panduan penempatan file-file hasil transformasi dari DPEMS ke PVLS Ja'far Medika.

## Cara Menggunakan

1. Clone repo asli: `git clone https://github.com/imammalikijafar-commits/pvls-jafarmedika.git`
2. Ekstrak zip ini di atas repo yang sudah di-clone (overwrite file yang ada)
3. Jalankan `npm install` untuk memastikan dependency terpasang
4. Siapkan file `.env.local` dengan kredensial Supabase
5. Jalankan `npm run dev` untuk preview

## Struktur File (39 file)

### Core Library (7 file — BARU)
```
src/lib/questions.ts          — 24 item survei (PV1-PV12, TR1-TR4, SAT1-SAT4, LOY1-LOY4)
src/lib/scoring.ts            — Kalkulasi skor mean & pola ekstrem
src/lib/validators.ts         — Zod schema validasi (screening, consent, demografi, survei)
src/lib/types.ts              — TypeScript interfaces (SurveyResponse, DemographicsData, dll)
src/lib/export.ts             — Export CSV & XLSX (format SmartPLS)
src/lib/survey-storage.ts     — localStorage helpers (SSR-safe)
src/lib/hooks/use-survey-answers.ts — Custom hooks untuk jawaban survei
```

### Survey Components (4 file — BARU)
```
src/components/survey/LikertScale.tsx     — Skala Likert 1-5 dengan emoji
src/components/survey/QuestionCard.tsx    — Kartu pertanyaan + LikertScale
src/components/survey/SurveyProgress.tsx  — Progress bar "Langkah X dari Y"
src/components/survey/SurveyNavigation.tsx — Tombol Kembali/Lanjut
```

### Survey Pages (9 file — BARU)
```
src/app/survey/page.tsx               — Intro survei + "Mulai Survei"
src/app/survey/consent/page.tsx       — Informed consent
src/app/survey/screening/page.tsx     — 3 kriteria inklusi
src/app/survey/demographic/page.tsx   — 9 field demografi
src/app/survey/pv/page.tsx            — 12 item Perceived Value
src/app/survey/trust/page.tsx         — 4 item Trust
src/app/survey/satisfaction/page.tsx   — 4 item Satisfaction
src/app/survey/loyalty/page.tsx       — 4 item Loyalty
src/app/survey/submit/page.tsx        — Konfirmasi & submit ke API
```

### Dashboard (9 file — BARU/MODIFIKASI)
```
src/app/dashboard/layout.tsx                — Sidebar PVLS + navigasi
src/app/dashboard/page.tsx                  — Summary cards + bar chart
src/app/dashboard/responses/page.tsx        — Tabel respons + paginasi
src/app/dashboard/extreme-patterns/page.tsx — Tabel pola ekstrem
src/app/dashboard/export/page.tsx           — Export CSV/XLSX
src/components/dashboard/SummaryCards.tsx    — 7 KPI cards
src/components/dashboard/ResponseTable.tsx   — Tabel respons paginasi
src/components/dashboard/ExportButton.tsx    — Tombol export
src/components/dashboard/ExtremePatternTable.tsx — Tab pola ekstrem
```

### API Routes (4 file — BARU)
```
src/app/api/survey/submit/route.ts          — POST submit survei
src/app/api/dashboard/summary/route.ts      — GET dashboard summary
src/app/api/dashboard/responses/route.ts    — GET respons paginasi
src/app/api/export/route.ts                 — GET export CSV/XLSX
```

### File yang Dimodifikasi (5 file)
```
src/app/page.tsx                 — Landing page PVLS
src/app/layout.tsx               — Metadata PVLS
src/app/login/LoginPageClient.tsx — Login page PVLS
src/app/api/surveys/route.ts     — Import fix fullSurveySubmissionSchema
package.json                     — name: "pvls-jafarmedika"
```

### Migration SQL (1 file — BARU)
```
supabase/migration_pvls.sql — CREATE TABLE survey_responses + RLS
```

## Konstruk Survei

| Konstruk | Kode | Jumlah Item | Dimensi |
|----------|------|-------------|---------|
| Perceived Value | PV1-PV12 | 12 | Quality, Emotional, Price, Social |
| Trust | TR1-TR4 | 4 | - |
| Satisfaction | SAT1-SAT4 | 4 | - |
| Loyalty | LOY1-LOY4 | 4 | - |

## Environment Variables

Buat file `.env.local` di root project:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
