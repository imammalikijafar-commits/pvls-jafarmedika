'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Table2,
  AlertTriangle,
  Download,
  LogOut,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/responses', label: 'Data Respons', icon: Table2 },
  { href: '/dashboard/extreme-patterns', label: 'Pola Ekstrem', icon: AlertTriangle },
  { href: '/dashboard/export', label: 'Export Data', icon: Download },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // fallback — still redirect
    }
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-emerald-900 text-white">
        <div className="p-5 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">PVLS Dashboard</h1>
              <p className="text-xs text-emerald-300">RSU Ja&apos;far Medika</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive(item.href)
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
              )}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-emerald-800">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-emerald-200 hover:bg-emerald-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-4.5 h-4.5" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Sidebar — Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-emerald-900 text-white flex flex-col">
            <div className="p-5 border-b border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight">PVLS Dashboard</h1>
                  <p className="text-xs text-emerald-300">RSU Ja&apos;far Medika</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-emerald-300" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive(item.href)
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                  )}
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-3 border-t border-emerald-800">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-emerald-200 hover:bg-emerald-800 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-4.5 h-4.5" />
                Keluar
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar — Mobile */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-sm font-bold text-emerald-800">PVLS Dashboard</h1>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
