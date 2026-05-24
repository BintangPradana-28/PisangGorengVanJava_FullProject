'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { useMemo } from 'react'

export default function HeroBanner() {
  const { t } = useLanguage()

  const menuTitleParts = useMemo(() => {
    const title = t('menu_title')
    const parts = title.split('Van Java')
    return {
      before: parts[0] || '',
      after: parts[1] || ''
    }
  }, [t])

  return (
    <section className="pt-28 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-40 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#D4802A,transparent)' }} />
      <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block text-xs font-bold tracking-[0.22em] uppercase px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(212,128,42,0.12)', color: '#D4802A' }}>
            {t('nav_menu')}
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold leading-[1.1] mb-3"
            style={{ color: 'var(--text-custom)' }}>
            {menuTitleParts.before}
            <span className="italic font-normal" style={{ color: '#D4802A' }}>Van Java</span>
            {menuTitleParts.after}
          </h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto"
            style={{ color: 'var(--text-custom)' }}>
            {t('menu_desc')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
