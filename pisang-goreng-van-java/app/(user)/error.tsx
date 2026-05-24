'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Public Boundary Error:", error.message)
  }, [error])

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-cream-200">
        <div className="text-6xl mb-6">🍌💥</div>
        <h2 className="font-serif text-3xl font-bold text-brown-700 mb-3">
          Waduh, ada yang salah!
        </h2>
        <p className="text-zinc-500 mb-8 font-sans leading-relaxed">
          Maaf, terjadi kesalahan saat memuat halaman ini. Tim kami sedang berusaha memperbaikinya.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-amber-brand text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
          >
            Coba Muat Ulang
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-cream-100 text-brown-700 font-bold rounded-xl hover:bg-cream-200 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
