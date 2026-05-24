'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useLanguage } from '@/context/LanguageContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema } from '@/src/features/auth/schemas'
import { z } from 'zod'
import { generateResetToken } from '@/src/features/auth/actions'

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export default function MemberForgotPasswordPage() {
  const { t, locale } = useLanguage()
  const [sent, setSent] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  })

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [countdown])

  const onSubmit = async (data: ForgotPasswordData) => {
    if (countdown > 0) {
      toast.error(`Harap tunggu ${countdown} detik sebelum mencoba lagi.`)
      return
    }

    const tid = toast.loading(t('forgot_toast_sending'))
    try {
      const formData = new FormData()
      formData.append('email', data.email)

      const result = await generateResetToken(formData)
      toast.dismiss(tid)

      if (!result.success) {
        toast.error(result.error || 'Terjadi kesalahan')
        return
      }

      toast.success(t('forgot_toast_success'))
      setSent(true)
      setCountdown(60) // Start 60 second timer
    } catch {
      toast.dismiss(tid)
      toast.error(t('forgot_toast_error'))
    }
  }

  const handleResend = () => {
    if (countdown > 0) return
    const data = getValues()
    if (data.email) {
      onSubmit(data)
    }
  }

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
  const item    = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }

  const inputCls = `w-full px-4 py-3 text-sm rounded-xl outline-none transition-all
                    bg-[var(--surface-custom)] border border-[var(--border-custom)]
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
                {sent ? (
                  <>
                    <div className="text-5xl mb-4">📬</div>
                    <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: 'var(--text-custom)' }}>{t('forgot_email_sent_title')}</h1>
                    <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--on-surface-variant, #504440)' }}>
                      Jika {getValues('email')} terdaftar di sistem kami, kami telah mengirimkan tautan reset password.
                    </p>
                    {countdown > 0 ? (
                      <p className="text-xs text-amber-brand font-medium">Tunggu {countdown} detik untuk mengirim ulang.</p>
                    ) : (
                      <button onClick={handleResend} disabled={isSubmitting} className="text-xs font-bold text-amber-brand hover:underline">
                        Kirim Ulang Email
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--text-custom)' }}>{t('forgot_title')}</h1>
                    <p className="text-sm" style={{ color: 'var(--on-surface-variant, #504440)' }}>{t('forgot_subtitle')}</p>
                  </>
                )}
              </motion.div>

              {/* Form */}
              {!sent ? (
                <motion.form variants={stagger} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <motion.div variants={item}>
                    <label className="block text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#D4802A' }}>{t('forgot_email_label')}</label>
                    <input type="email" placeholder={t('forgot_email_placeholder')} autoComplete="email" className={inputCls} {...register('email')} />
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                  </motion.div>

                  <motion.div variants={item}>
                    <button type="submit" disabled={isSubmitting || countdown > 0} className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 bg-secondary hover:bg-amber-brand text-white shadow-md">
                      {isSubmitting ? (
                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{t('forgot_submitting')}</>
                      ) : t('forgot_submit_btn')}
                    </button>
                  </motion.div>
                </motion.form>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Link href="/member-login" className="block w-full py-3.5 mt-2 rounded-xl text-sm font-bold tracking-wide text-center transition-all bg-secondary hover:bg-amber-brand text-white shadow-md">
                    {t('forgot_back_to_login')}
                  </Link>
                </motion.div>
              )}

              {/* Footer */}
              <motion.div variants={item} className="mt-7 text-center space-y-2.5">
                {!sent && (
                  <Link href="/member-login" className="block text-sm font-semibold text-amber-brand hover:underline">
                    {t('forgot_back_to_login')}
                  </Link>
                )}
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
