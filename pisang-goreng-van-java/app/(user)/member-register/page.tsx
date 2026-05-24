'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/src/features/auth/schemas'
import { z } from 'zod'
import { registerUser } from '@/src/features/auth/actions'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'

type RegisterFormData = z.infer<typeof registerSchema>

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function MemberRegisterPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', whatsapp: '', password: '', consent: false }
  })

  const passwordValue = watch('password') || ''

  const getPasswordStrength = () => {
    let score = 0
    if (passwordValue.length >= 8) score += 1
    if (/[A-Z]/.test(passwordValue)) score += 1
    if (/[0-9]/.test(passwordValue)) score += 1
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1
    return score
  }
  const strengthScore = getPasswordStrength()

  const onSubmit = async (data: RegisterFormData) => {
    const tid = toast.loading(t('register_toast_creating'))
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('whatsapp', data.whatsapp)
      formData.append('password', data.password)
      
      const result = await registerUser(formData)
      
      toast.dismiss(tid)
      
      if (!result.success) {
        toast.error(result.error || 'Terjadi kesalahan')
        return
      }

      toast.success(t('register_toast_success'))
      setTimeout(() => router.push('/member-login'), 1500)
    } catch {
      toast.dismiss(tid)
      toast.error(t('register_toast_error'))
    }
  }

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }

  const inputCls = `w-full px-4 py-3 text-sm rounded-xl outline-none transition-all
    bg-[var(--surface-custom)] border border-zinc-400 dark:border-zinc-600
    text-[var(--text-custom)] placeholder:text-[var(--on-surface-variant)]
    focus:ring-2 focus:ring-amber-brand/40 focus:border-amber-brand`

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-[var(--background-custom)] transition-colors duration-300">
      <Toaster position="top-center" toastOptions={{ className: '!bg-[var(--card-bg)] !text-[var(--text-custom)] !border !border-[var(--border-custom)] !shadow-lg' }} />
      <div className="pointer-events-none fixed inset-0 bg-hero-pattern opacity-40" />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-[420px]">
          <div className="rounded-2xl px-8 py-10 sm:px-10 shadow-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-custom)' }}>
            <motion.div variants={stagger} initial="hidden" animate="visible">

              {/* Brand */}
              <motion.div variants={item} className="flex flex-col items-center gap-1 mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-1 shadow-md" style={{ background: 'var(--primary-custom)' }}>🍌</div>
                <p className="font-serif text-xl font-bold leading-none tracking-tight" style={{ color: 'var(--text-custom)' }}>Pisang Goreng</p>
                <p className="font-serif text-lg font-bold" style={{ color: '#D4802A' }}>Van Java</p>
                <p className="text-[9px] font-bold tracking-[0.35em] uppercase mt-0.5" style={{ color: 'var(--on-surface-variant, #504440)' }}>{t('login_brand_subtitle')}</p>
              </motion.div>

              {/* Heading */}
              <motion.div variants={item} className="text-center mb-8">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--text-custom)' }}>{t('register_title')}</h1>
                <p className="text-sm" style={{ color: 'var(--on-surface-variant, #504440)' }}>{t('register_subtitle')}</p>
              </motion.div>

              {/* Form */}
              <motion.form variants={stagger} onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <motion.div variants={item}>
                  <label className="block text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#D4802A' }}>{t('register_name_label')}</label>
                  <input type="text" placeholder={t('register_name_placeholder')} autoComplete="name" className={inputCls} {...register('name')} />
                  {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
                </motion.div>

                <motion.div variants={item}>
                  <label className="block text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#D4802A' }}>{t('register_email_label')}</label>
                  <input type="email" placeholder={t('register_email_placeholder')} autoComplete="email" className={inputCls} {...register('email')} />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                </motion.div>

                <motion.div variants={item}>
                  <label className="block text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#D4802A' }}>Nomor WhatsApp</label>
                  <input type="tel" placeholder="Contoh: 08123456789" autoComplete="tel" className={inputCls} {...register('whatsapp')} />
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-1 font-medium">{errors.whatsapp.message}</p>}
                </motion.div>

                <motion.div variants={item}>
                  <label className="block text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#D4802A' }}>{t('register_password_label')}</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} placeholder={t('register_password_placeholder')} autoComplete="new-password" className={inputCls + ' pr-11'} {...register('password')} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-[var(--on-surface-variant)] hover:text-amber-brand">
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
                  
                  {/* Password Strength Meter */}
                  {passwordValue.length > 0 && (
                    <div className="flex gap-1 mt-2 h-1.5">
                      <div className={`flex-1 rounded-full ${strengthScore >= 1 ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                      <div className={`flex-1 rounded-full ${strengthScore >= 2 ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                      <div className={`flex-1 rounded-full ${strengthScore >= 3 ? 'bg-yellow-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                      <div className={`flex-1 rounded-full ${strengthScore >= 4 ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                    </div>
                  )}
                </motion.div>

                <motion.div variants={item} className="flex items-start gap-2 pt-1">
                  <input type="checkbox" id="consent" className="mt-1 w-4 h-4 accent-amber-brand shrink-0" {...register('consent')} />
                  <label htmlFor="consent" className="text-[10px] text-[var(--on-surface-variant)] cursor-pointer leading-tight">
                    Dengan mendaftar, saya menyetujui <a href="#" className="text-amber-brand hover:underline">Syarat & Ketentuan</a> serta <a href="#" className="text-amber-brand hover:underline">Kebijakan Privasi</a> yang berlaku.
                  </label>
                </motion.div>
                {errors.consent && (
                  <motion.p variants={item} className="text-red-500 text-xs mt-1 font-medium -mt-2">
                    {errors.consent.message}
                  </motion.p>
                )}

                <motion.div variants={item} className="pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 bg-secondary hover:bg-amber-brand text-white shadow-md">
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        {t('register_submitting')}
                      </>
                    ) : t('register_submit_btn')}
                  </button>
                </motion.div>

                <motion.div variants={item} className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-[var(--border-custom)]" />
                  <span className="text-xs font-medium" style={{ color: 'var(--on-surface-variant, #504440)' }}>{t('login_or_divider')}</span>
                  <div className="flex-1 h-px bg-[var(--border-custom)]" />
                </motion.div>

                <motion.div variants={item}>
                  <GoogleAuthButton label={t('register_google_btn')} />
                </motion.div>
              </motion.form>

              {/* Footer */}
              <motion.div variants={item} className="mt-7 text-center space-y-2.5">
                <p className="text-sm" style={{ color: 'var(--on-surface-variant, #504440)' }}>
                  {t('register_has_account')} <Link href="/member-login" className="font-bold text-amber-brand hover:underline">{t('register_login_now')}</Link>
                </p>
                <Link href="/" className="block text-xs font-medium transition-colors" style={{ color: 'var(--on-surface-variant, #504440)' }}>
                  {t('login_back_to_web')}
                </Link>
              </motion.div>

            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
