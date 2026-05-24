'use client'

// app/error.tsx
// Global Error Boundary. Catches unexpected runtime errors in any route segment.
// MUST be a Client Component per Next.js 14 spec.

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to a monitoring service (e.g. Sentry) in production
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--background-custom, #FFF9F0)' }}
    >
      <div className="w-full max-w-md text-center space-y-6">
        {/* Warning Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 mx-auto">
          <svg
            className="w-10 h-10 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-amber-900 dark:text-amber-200">
            Ada Sedikit Masalah
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Dapur kami sedang sedikit kesulitan. Mohon maaf atas ketidaknyamanannya!
          </p>
          {/* Technical detail — only in dev or with a digest */}
          {(process.env.NODE_ENV === 'development' || error.digest) && (
            <p className="text-xs text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg inline-block mt-2">
              {error.digest ? `digest: ${error.digest}` : error.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border border-amber-200 dark:border-zinc-700 text-amber-900 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-95"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
