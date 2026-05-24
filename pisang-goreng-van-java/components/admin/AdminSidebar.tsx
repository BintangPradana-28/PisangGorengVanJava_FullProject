'use client'
// components/admin/AdminSidebar.tsx
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard',   icon: '📊', label: 'Dashboard'   },
  { href: '/orders',      icon: '📋', label: 'Order'        },
  { href: '/manage-menu', icon: '🍌', label: 'Kelola Menu'  },
  { href: '/toppings',    icon: '✨', label: 'Topping'      },
  { href: '/manage-users',icon: '👥', label: 'Pengguna & Reseller' },
  { href: '/manage-vouchers',icon: '🎟️', label: 'Manajemen Voucher' },
  { href: '/reports',     icon: '📈', label: 'Laporan'      },
  { href: '/settings',    icon: '⚙️', label: 'Pengaturan'   },
  { href: '/banners',     icon: '🖼️', label: 'Banner & Promo'},
  { href: '/kontak-leads',icon: '📞', label: 'Prospek Kontak'},
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Tutup sidebar saat rute berubah di versi mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    toast.success('Berhasil logout')
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      {/* Penyesuaian padding khusus mobile agar tidak terhalang top bar */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          main {
            padding-top: 5.5rem !important;
          }
        }
      `}} />

      {/* Top Bar Khusus Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brown-700 flex items-center justify-between px-4 z-40 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-serif text-white font-bold text-lg tracking-wide">Van Java Admin</div>
        </div>
        <div className="text-2xl">🍌</div>
      </div>

      {/* Backdrop Gelap untuk Mobile Drawer */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-60 bg-brown-700 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out shadow-2xl
        md:relative md:translate-x-0 md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b border-white/10 text-center relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-4 right-4 text-white/50 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-4xl mb-2">🍌</div>
          <div className="font-serif text-white text-sm font-bold">Van Java Admin</div>
          <div className="text-xs text-cream-200/50 font-sans mt-0.5">Panel Administrasi</div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-amber-brand text-[10px] font-semibold tracking-[0.2em] uppercase px-3 mb-2">Navigasi</div>
          {navItems.map(({ href, icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10 shrink-0">
          <Link href="/" target="_blank" className="sidebar-item text-cream-200/50 hover:text-white mb-1">
            <span className="text-lg">🌐</span><span>Lihat Website</span>
          </Link>
          <button onClick={handleLogout} className="sidebar-item w-full text-red-300 hover:text-red-100 hover:bg-red-900/30">
            <span className="text-lg">🚪</span><span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
