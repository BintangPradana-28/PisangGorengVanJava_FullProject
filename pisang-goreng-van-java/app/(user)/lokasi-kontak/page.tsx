'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Footer from '@/components/user/Footer'
import { useLanguage } from '@/context/LanguageContext'
import { useSettings } from '@/context/SettingsContext'
import toast, { Toaster } from 'react-hot-toast'

// ── SVG Brand Icons ──────────────────────────────────────────────────────────
const InstagramIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const TikTokIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

const WhatsAppIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const GoFoodIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path fill="white" d="M8 12.5c0-2.2 1.8-4 4-4s4 1.8 4 4v.5h-2.5v-.5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v3c0 .8.7 1.5 1.5 1.5h1.5v-1.5H12v-1.5h3.5v3c0 .8-.7 1.5-1.5 1.5H12c-2.2 0-4-1.8-4-4v-2.5z" />
  </svg>
)

// ── Data ─────────────────────────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────────────────────
export default function LokasiKontakPage() {
  const { t } = useLanguage()
  const { getSetting } = useSettings()
  const [form, setForm] = useState({ nama: '', pesan: '' })
  const [sending, setSend] = useState(false)
  const [consent, setConsent] = useState(false)
  const [openFaq, setFaq] = useState<number | null>(null)

  const faqs = [
    { q: t('faq_q1'), a: t('faq_a1') },
    { q: t('faq_q2'), a: t('faq_a2') },
    { q: t('faq_q3'), a: t('faq_a3') },
    { q: t('faq_q4'), a: t('faq_a4') },
  ]

  const socials = [
    {
      label: 'Instagram',
      handle: getSetting('instagram', 'https://instagram.com/pisanggorengvanjava').split('/').pop() || '@pisanggorengvanjava',
      href: getSetting('instagram', 'https://instagram.com/pisanggorengvanjava'),
      icon: InstagramIcon,
      color: '#E1306C',
      bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
      soon: false,
    },
    {
      label: 'TikTok',
      handle: getSetting('tiktok', 'https://tiktok.com/@pisanggorengvanjava').split('/').pop() || '@vanjava.official',
      href: getSetting('tiktok', 'https://tiktok.com/@pisanggorengvanjava'),
      icon: TikTokIcon,
      color: '#000000',
      bg: '#010101',
      soon: false,
    },
    {
      label: 'WhatsApp',
      handle: `Hubungi Admin`,
      href: `#`,
      icon: WhatsAppIcon,
      color: '#25D366',
      bg: '#25D366',
      soon: false,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('contact-name')?.focus();
      }
    },
  ]

  const infoCards = [
    {
      id: 'alamat',
      label: t('location_address_label'),
      val: getSetting('alamat', t('location_address_val')),
      soon: false,
      svgPath: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      iconColor: '#D4802A',
    },
    {
      id: 'jam',
      label: t('location_hours_label'),
      val: getSetting('jam_operasional', t('location_hours_val')),
      soon: false,
      svgPath: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
      iconColor: '#D4802A',
    },
    {
      id: 'antar',
      label: t('location_delivery_label'),
      val: t('location_delivery_val'),
      soon: false,
      svgPath: 'M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z M20 15h-1v-4h1m1 4h-3m1-5v5',
      iconColor: '#D4802A',
    },
  ]

  const handleWA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama.trim() || !form.pesan.trim()) {
      toast.error(t('kontak_toast_error'))
      return
    }
    if (!consent) {
      toast.error(t('kontak_consent_label') || 'Anda harus menyetujui Kebijakan Privasi')
      return
    }
    setSend(true)
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: form.nama, pesan: form.pesan, consent })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses formulir')
      }

      window.open(data.redirectUrl, '_blank')
      setForm({ nama: '', pesan: '' })
      setConsent(false)
      toast.success(t('kontak_toast_success'))
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSend(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-custom)', color: 'var(--text-custom)' }}>
      <Toaster
        position="top-center"
        toastOptions={{ className: '!rounded-xl !text-sm !font-medium !shadow-xl' }}
      />

      {/* ── Hero — compact ──────────────────────────────────────────────── */}
      <section className="pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-40 pointer-events-none" />
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#D4802A,transparent)' }} />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#D4802A,transparent)' }} />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
          >
            <div>
              <span
                className="inline-block text-xs font-bold tracking-[0.22em] uppercase px-4 py-1.5 rounded-full mb-5"
                style={{ background: 'rgba(212,128,42,0.12)', color: '#D4802A' }}
              >
                {t('kontak_title_section')}
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1]"
                style={{ color: 'var(--text-custom)' }}>
                {t('kontak_hero_title')}<br />
                <span className="italic font-normal" style={{ color: '#D4802A' }}>{t('kontak_hero_subtitle')}</span>
              </h1>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ── Contact Form + Map ───────────────────────────────────────────── */}
      <section className="py-16" style={{ background: 'var(--card-bg)' }}>
        <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Left: Form + Socials ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            {/* Form */}
            <div className="rounded-3xl p-8" style={{ background: 'var(--surface-custom)', border: '1px solid var(--border-custom)' }}>
              <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: 'var(--text-custom)' }}>
                {t('kontak_send_message')}
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-custom)' }}>
                {t('kontak_send_message_desc')}
              </p>

              <form onSubmit={handleWA} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#D4802A' }}>
                    {t('kontak_label_name')}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.nama}
                    onChange={e => setForm(p => ({ ...p, nama: e.target.value }))}
                    placeholder={t('kontak_placeholder_name')}
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: 'var(--background-custom)',
                      border: '1px solid var(--border-custom)',
                      color: 'var(--text-custom)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-widest uppercase mb-1.5" style={{ color: '#D4802A' }}>
                    {t('kontak_label_message')}
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={form.pesan}
                    onChange={e => setForm(p => ({ ...p, pesan: e.target.value }))}
                    placeholder={t('kontak_placeholder_message')}
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all resize-none"
                    style={{
                      background: 'var(--background-custom)',
                      border: '1px solid var(--border-custom)',
                      color: 'var(--text-custom)',
                    }}
                  />
                </div>
                
                <div className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 shrink-0 accent-[#D4802A] w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs cursor-pointer select-none" style={{ color: 'var(--text-custom)', opacity: 0.8 }}>
                    {t('kontak_consent_label')}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#D4802A', color: 'white', boxShadow: '0 8px 24px rgba(212,128,42,0.25)' }}
                >
                  {sending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('kontak_btn_submitting')}
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon className="w-4 h-4" />
                      {t('kontak_btn_submit')}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Social links */}
            <div className="mt-6">
              <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: '#D4802A' }}>
                {t('kontak_follow_us')}
              </p>
              <div className="flex flex-wrap gap-3">
                {socials.map(({ label, handle, icon: Icon, href, bg, color, soon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href === '#' ? undefined : '_blank'}
                    rel={href === '#' ? undefined : 'noopener noreferrer'}
                    onClick={(e) => {
                      if (soon) {
                        e.preventDefault();
                        toast(t('kontak_toast_soon'), { icon: '⏳' });
                      } else if (label === 'WhatsApp') {
                        e.preventDefault();
                        document.getElementById('contact-name')?.focus();
                        toast.success('Silakan isi formulir terlebih dahulu untuk keamanan', { icon: '🛡️' });
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all group ${soon ? 'cursor-default opacity-70' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                    style={{ background: 'var(--surface-custom)', border: '1px solid var(--border-custom)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-custom)' }}>
                      {label} {soon && '(Soon)'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Right: Map + Info Cards ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Map */}
            <div className="rounded-3xl overflow-hidden shadow-xl h-[300px]"
              style={{ border: '1px solid var(--border-custom)' }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(getSetting('alamat', 'Jl. Raya Cilangkap l Rt.2/Rw.5, Cilangkap, Kec. Cipayung, Kota Jakarta Timur'))}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi Van Java"
              />
            </div>

            {/* Info Cards */}
            {infoCards.map(({ id, label, val, svgPath, iconColor, soon }) => (
              <div key={id}
                className="flex gap-4 items-start p-4 rounded-2xl transition-all hover:shadow-sm"
                style={{ background: 'var(--surface-custom)', border: '1px solid var(--border-custom)' }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(212,128,42,0.1)' }}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={iconColor} aria-hidden="true">
                    <path d={svgPath} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#D4802A' }}>
                      {label}
                    </span>
                    {soon && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(212,128,42,0.12)', color: '#D4802A' }}>
                        {t('kontak_soon')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-custom)', opacity: soon ? 0.6 : 1 }}>
                    {val}
                  </p>
                </div>
              </div>
            ))}

          </motion.div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--background-custom)' }}>
        <div className="max-w-[760px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="text-xs font-bold tracking-[0.22em] uppercase mb-3" style={{ color: '#D4802A' }}>{t('faq_subtitle')}</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-custom)' }}>
              {t('faq_title')}
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border-custom)' }}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-sm transition-colors"
                  style={{ color: 'var(--text-custom)' }}
                  onClick={() => setFaq(openFaq === i ? null : i)}
                >
                  <span className="pr-4">{q}</span>
                  <span
                    className="text-xl shrink-0 font-light transition-transform duration-300"
                    style={{
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      color: '#D4802A',
                    }}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-6 pb-5 pt-1 text-sm leading-relaxed border-t"
                        style={{ color: 'var(--text-custom)', borderColor: 'var(--border-custom)' }}>
                        {a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ───────────────────────────────────────────────────── */}
      <section className="py-16 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #3D1C02 0%, #5a2e0a 100%)' }}>
        <div className="max-w-xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-4xl mb-4">🍌</div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">{t('kontak_cta_ready')}</h2>
            <p className="text-white/70 mb-6">{t('kontak_cta_desc')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  document.getElementById('contact-name')?.focus();
                  window.scrollTo({ top: document.getElementById('contact-name')?.offsetTop! - 200, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all active:scale-95 hover:shadow-lg"
                style={{ background: '#25D366', color: 'white' }}
              >
                <WhatsAppIcon className="w-4 h-4" /> {t('kontak_chat_now')}
              </button>
              <Link
                href="/menu-spesial"
                className="px-8 py-3.5 rounded-full font-bold text-sm transition-all active:scale-95 border border-white/30 hover:bg-white/10"
              >
                🍌 {t('hero_menu_btn')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
