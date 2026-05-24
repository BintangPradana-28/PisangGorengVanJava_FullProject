'use client'

import { useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production, 
    // but avoid spamming the console with raw DB errors.
    console.error("Admin Boundary Error:", error.message)
  }, [error])

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 bg-cream-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-serif text-2xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
          <p className="text-zinc-600 text-sm mb-6">
            Gagal memuat halaman admin ini. Silakan coba lagi.
          </p>
          <button
            onClick={() => reset()}
            className="bg-red-50 text-red-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-red-100 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </main>
    </div>
  )
}
