'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function About() {
  const { t } = useLanguage()
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const pillars = [
    { title: t('about_pillar_1_title'), desc: t('about_pillar_1_desc'), icon: '🌿' },
    { title: t('about_pillar_2_title'), desc: t('about_pillar_2_desc'), icon: '🏆' },
    { title: t('about_pillar_3_title'), desc: t('about_pillar_3_desc'), icon: '✨' },
  ]

  return (
    <section
      id="tentang"
      ref={ref}
      className="py-24 bg-surface-container-lowest border-y border-outline-variant/20 dark:bg-zinc-950/20"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Image visual wrapper */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-outline-variant/30 bg-surface-container dark:border-zinc-800"
          >
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR1fdcxKbWFydWHbeLUdTplGwYff0W_EkWxDeDQO9gO9NgZeCKJiSH3oKGWd9Kd0S3MlYErY2lazlzkcNMM1eRSBHewjL8fot_lG2NgcnR64PJmbF8WH6yfyzcKg4AMkZhri91WuXNC2Kkw6ZKvxoYnnN__1ZRRLxsRVT_JYxNLkoWKt85Ui2pUOxKx7SDx1rGtj1PelXxJPprXrtgdzG-TXF1xpytXqHYKhqaVxj7QK7JtWJHTSkGQvqw5kHQG1K5Jbmi42-a_BXl"
              alt="Konsep Kedai Modern Tradisional Pisang Goreng Van Java"
              fill
              sizes="(max-width: 1024px) 100vw, 550px"
              loading="lazy"
              className="object-cover"
            />
            {/* Decal badge */}
            <div className="absolute bottom-6 right-6 bg-primary dark:bg-zinc-900 text-white rounded-2xl p-5 shadow-2xl border border-white/10 dark:border-zinc-800">
              <div className="font-serif text-lg font-bold text-secondary-container">{t('about_since')}</div>
              <div className="text-xs text-cream-50/70 mt-0.5">{t('about_quality')}</div>
            </div>
          </motion.div>

          {/* Text Area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="inline-block bg-secondary/10 text-secondary text-xs font-bold tracking-[0.2em] uppercase px-4 py-1 rounded-full mb-4">
              {t('about_badge')}
            </div>
            
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary dark:text-zinc-100 mb-6 leading-[1.15]">
              {t('about_title').split(',')[0]},<br />
              <span className="text-secondary italic font-normal">{t('about_title').split(',')[1]}</span>
            </h2>
            
            <p className="text-on-surface-variant dark:text-zinc-400 text-base leading-relaxed mb-6 font-sans">
              {t('about_desc1')}
            </p>
            
            <p className="text-on-surface-variant dark:text-zinc-400 text-base leading-relaxed mb-8 font-sans">
              {t('about_desc2')}
            </p>

            {/* 3 Pillars */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {pillars.map(({ title, desc, icon }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={visible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="bg-surface-container-low dark:bg-zinc-900 border border-outline-variant/20 dark:border-zinc-850 rounded-2xl p-4.5 hover:shadow-md transition-all duration-200"
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="font-serif text-lg font-bold text-primary dark:text-zinc-200 leading-tight mb-1">{title}</div>
                  <div className="text-sm text-on-surface-variant dark:text-zinc-450 leading-relaxed">{desc}</div>
                </motion.div>
              ))}
            </div>

            {/* Read More */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Link
                href="/tentang-kami"
                className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: '#D4802A', color: 'white', boxShadow: '0 4px 14px rgba(212,128,42,0.25)' }}
              >
                {t('about_read_more')} →
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
