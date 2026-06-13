// ============================================================
// Supabase Server Client
// Menggunakan @supabase/ssr untuk cookie-based auth
// Anon key — untuk normal server operations
// ============================================================
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — ignore setAll
          }
        },
      },
    }
  )
}

// ============================================================
// Auth Check — memastikan user sudah login DAN terdaftar di
// tabel admin_users dengan role admin/researcher dan is_active
// ============================================================
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient()

  // Step 1: Cek apakah user sudah login via Supabase Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  // Step 2: Cek apakah user terdaftar di admin_users dengan role yang valid
  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('id, role, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .in('role', ['admin', 'researcher'])
    .maybeSingle()

  if (adminError || !admin) {
    return null
  }

  return user
}

// ============================================================
// Admin Client (Service Role)
// BYPASS RLS — gunakan HATI-HATI hanya untuk admin/dashboard
// WAJIB panggil requireAdmin() dulu sebelum createAdminClient()
// ============================================================
export function createAdminClient() {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op untuk admin client
        },
      },
    }
  )
}