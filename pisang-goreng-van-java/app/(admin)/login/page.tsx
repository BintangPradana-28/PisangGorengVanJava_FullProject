'use client'
// app/(admin)/login/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { signIn } from 'next-auth/react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Username dan password wajib diisi')
      return
    }

    setLoading(true)
    toast.loading('Memeriksa kredensial...', { id: 'login-toast' })
    try {
      // Menggunakan fungsi signIn dari NextAuth (Credentials Provider)
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      })
      toast.dismiss('login-toast')

      if (res?.error) {
        toast.error('Username atau password salah')
      } else if (res?.ok) {
        toast.success('Selamat datang!')
        // Menggunakan hard redirect agar cookie NextAuth terbaca segar di Server Component
        setTimeout(() => {
          window.location.href = '/manage-menu'
        }, 800)
      }
    } catch (err: any) {
      toast.dismiss('login-toast')
      toast.error('Koneksi bermasalah. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brown-700 via-brown-600 to-brown-800
                    flex items-center justify-center p-4">
      <Toaster position="top-center" />

      <div
        className="w-full max-w-sm bg-cream-100 rounded-3xl p-8 shadow-2xl text-center"
      >
        {/* Logo */}
        <div className="w-20 h-20 bg-brown-700 rounded-full mx-auto flex items-center justify-center text-4xl mb-4 shadow-lg">
          🍌
        </div>
        <h1 className="font-serif text-lg font-bold text-brown-700 mb-1">Pisang Goreng Van Java</h1>
        <p className="text-xs text-brown-400 mb-6">Panel Administrasi</p>

        <div className="h-px bg-cream-200 mb-6" />
        <div className="text-xs font-bold text-brown-700 tracking-[0.2em] uppercase mb-6">LOGIN ADMIN</div>

        <form className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-300">👤</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="form-input pl-9"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-300">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input pl-9"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-brown-700 text-cream-100 font-serif font-bold text-base
                       rounded-xl hover:bg-brown-600 transition-all active:scale-95 mt-2
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'LOGIN'}
          </button>
        </form>

      </div>
    </div>
  )
}
