'use client'
// components/admin/AdminShell.tsx
// Wraps all admin pages — provides responsive sidebar + mobile hamburger
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/orders', icon: '📋', label: 'Order' },
  { href: '/manage-menu', icon: '🍌', label: 'Kelola Menu' },
  { href: '/toppings', icon: '✨', label: 'Topping' },
  { href: '/reports', icon: '📈', label: 'Laporan' },
  { href: '/settings', icon: '⚙️', label: 'Pengaturan' },

]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    toast.success('Berhasil logout')
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10 text-center flex-shrink-0">
        <div className="text-4xl mb-1.5">🍌</div>
        <div className="font-serif text-white text-sm font-bold">Van Java Admin</div>
        <div className="text-xs text-cream-200/50 font-sans mt-0.5">Panel Administrasi</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-amber-brand text-[10px] font-semibold tracking-[0.2em] uppercase px-3 mb-2">
          Navigasi
        </div>
        {navItems.map(({ href, icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <Link
          href="/"
          target="_blank"
          className="sidebar-item text-cream-200/50 hover:text-white mb-1"
          onClick={onNavigate}
        >
          <span className="text-lg">🌐</span>
          <span>Lihat Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-300 hover:text-red-100 hover:bg-red-900/30"
        >
          <span className="text-lg">🚪</span>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}

interface AdminShellProps {
  children: React.ReactNode
  adminName?: string
}

export default function AdminShell({ children, adminName }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const pageTitle = navItems.find(n => pathname.startsWith(n.href))?.label ?? 'Admin'

  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-brown-700 min-h-screen flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 h-full w-64 bg-brown-700 z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm"
              >
                ✕
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-brown-700 flex-shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg bg-white/10 flex flex-col items-center justify-center gap-1 text-white flex-shrink-0"
            aria-label="Open menu"
          >
            <span className="w-4 h-0.5 bg-white rounded" />
            <span className="w-4 h-0.5 bg-white rounded" />
            <span className="w-4 h-0.5 bg-white rounded" />
          </button>
          <span className="text-xl">🍌</span>
          <span className="font-serif text-white text-sm font-bold flex-1 truncate">{pageTitle}</span>
          {adminName && (
            <span className="text-cream-200/60 text-xs hidden sm:block">
              👤 {adminName}
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
