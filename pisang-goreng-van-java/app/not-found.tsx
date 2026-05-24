// app/not-found.tsx
// Premium 404 page aligned with the "Heritage Culinary" aesthetic.
// Server Component — no 'use client' directive needed here.

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-amber-950">
      {/* Ambient blob — decorative only */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #D4802A 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg text-center space-y-8">

        {/* Animated Banana */}
        <div
          className="text-8xl select-none"
          style={{ animation: 'gentleBounce 2.4s ease-in-out infinite' }}
          aria-hidden="true"
        >
          🍌
        </div>

        {/* 404 number */}
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold tracking-[0.35em] uppercase text-amber-400/70">
            Halaman Tidak Ditemukan
          </p>
          <h1 className="font-serif text-8xl sm:text-9xl font-black text-white/10 select-none leading-none">
            404
          </h1>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white -mt-4">
            Pisangnya Sudah Habis 🙁
          </h2>
          <p className="text-amber-200/60 text-sm max-w-xs mx-auto leading-relaxed">
            Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau memang tidak pernah ada. Tapi jangan khawatir, masih banyak pisang goreng lezat yang menunggumu!
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/menu-spesial"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-amber-500/30 hover:shadow-xl transition-all duration-200 active:scale-95"
          >
            🍌 Kembali ke Menu Utama
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm border border-white/20 text-white/80 hover:bg-white/10 transition-all duration-200 active:scale-95"
          >
            ← Beranda
          </Link>
        </div>

        {/* Subtle breadcrumb hint */}
        <p className="text-amber-200/30 text-xs">
          Kamu mencoba mengakses halaman yang tidak terdaftar.
        </p>
      </div>

      {/* Keyframe animation injected inline — avoids extra CSS file */}
      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  )
}
