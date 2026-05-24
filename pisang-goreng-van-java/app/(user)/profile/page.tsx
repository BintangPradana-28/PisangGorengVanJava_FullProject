'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
  phone: z.string()
    .min(1, "Nomor WhatsApp tidak boleh kosong")
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Nomor WhatsApp tidak valid."),
  address: z.string()
    .min(1, "Alamat tidak boleh kosong")
    .max(500, "Alamat maksimal 500 karakter"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isSubmitting }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      address: ''
    }
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/member-login')
      return
    }

    if (status === 'authenticated') {
      // Hydration: Auto-fill from session initially
      if (session?.user?.name) {
        setValue('name', session.user.name, { shouldValidate: true })
      }

      // Fetch precise data from database
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            if (data.data.name) setValue('name', data.data.name, { shouldValidate: true })
            if (data.data.phone) setValue('phone', data.data.phone, { shouldValidate: true })
            if (data.data.address) setValue('address', data.data.address, { shouldValidate: true })
          }
        })
        .catch(() => toast.error('Gagal mengambil data profil'))
        .finally(() => setIsLoading(false))
    }
  }, [status, router, session, setValue])

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const resData = await res.json()

      if (res.ok && resData.success) {
        toast.success('Profil berhasil diperbarui!')
      } else {
        toast.error(resData.message || 'Gagal menyimpan profil')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan')
    }
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen pt-28 pb-10 flex items-center justify-center bg-surface-container-low dark:bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-4 border-[#D4802A] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-10 bg-surface-container-low dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-zinc-200/50 dark:border-zinc-800/80"
        >
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-[#D4802A]/10 text-[#D4802A] flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-100">Profil Saya</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{session?.user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full p-4 rounded-xl border bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 transition-all ${
                  errors.name 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-[#D4802A]/50'
                }`}
                placeholder="Masukkan nama lengkap Anda"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                {...register('phone')}
                className={`w-full p-4 rounded-xl border bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 transition-all ${
                  errors.phone 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-[#D4802A]/50'
                }`}
                placeholder="Contoh: +6281312167554"
              />
              {errors.phone ? (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phone.message}</p>
              ) : (
                <p className="text-xs text-zinc-500 mt-1.5">
                  Nomor ini akan otomatis mengisi form saat checkout keranjang belanja.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Alamat Pengiriman (Default)
              </label>
              <textarea
                {...register('address')}
                className={`w-full p-4 rounded-xl border bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 transition-all min-h-[100px] ${
                  errors.address 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:ring-[#D4802A]/50'
                }`}
                placeholder="Masukkan alamat pengiriman default Anda"
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.address.message}</p>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="bg-[#D4802A] hover:bg-[#b56d24] text-white font-bold py-3.5 px-8 rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Menyimpan...
                  </>
                ) : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
