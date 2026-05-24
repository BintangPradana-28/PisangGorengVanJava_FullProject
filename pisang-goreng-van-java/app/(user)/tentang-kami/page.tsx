'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useSettings } from '@/context/SettingsContext'
import Footer from '@/components/user/Footer'

export default function TentangKamiPage() {
  const { t } = useLanguage()
  const { getSetting } = useSettings()

  const values = [
    { icon: '🌿', title: getSetting('about_val1_title', t('about_val1_title')), desc: getSetting('about_val1_desc', t('about_val1_desc')) },
    { icon: '🔥', title: getSetting('about_val2_title', t('about_val2_title')), desc: getSetting('about_val2_desc', t('about_val2_desc')) },
    { icon: '✨', title: getSetting('about_val3_title', t('about_val3_title')), desc: getSetting('about_val3_desc', t('about_val3_desc')) },
    { icon: '❤️', title: getSetting('about_val4_title', t('about_val4_title')), desc: getSetting('about_val4_desc', t('about_val4_desc')) },
  ]

  const milestones = [
    { year: '2018', event: getSetting('about_mile1_event', t('about_mile1_event')) },
    { year: '2019', event: getSetting('about_mile2_event', t('about_mile2_event')) },
    { year: '2021', event: getSetting('about_mile3_event', t('about_mile3_event')) },
    { year: '2023', event: getSetting('about_mile4_event', t('about_mile4_event')) },
    { year: '2024', event: getSetting('about_mile5_event', t('about_mile5_event')) },
    { year: '2026', event: getSetting('about_mile6_event', 'Ekspansi B2B & Modernisasi Dapur Pusat dengan standar Enterprise F&B.') },
  ]

  const team = [
    // Replaced Emojis with high-quality AI images representation (Using placeholders for demo but properly styled)
    { name: getSetting('about_team1_name', t('about_team1_name')), role: getSetting('about_team1_role', t('about_team1_role')), image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR1fdcxKbWFydWHbeLUdTplGwYff0W_EkWxDeDQO9gO9NgZeCKJiSH3oKGWd9Kd0S3MlYErY2lazlzkcNMM1eRSBHewjL8fot_lG2NgcnR64PJmbF8WH6yfyzcKg4AMkZhri91WuXNC2Kkw6ZKvxoYnnN__1ZRRLxsRVT_JYxNLkoWKt85Ui2pUOxKx7SDx1rGtj1PelXxJPprXrtgdzG-TXF1xpytXqHYKhqaVxj7QK7JtWJHTSkGQvqw5kHQG1K5Jbmi42-a_BXl', desc: getSetting('about_team1_desc', t('about_team1_desc')) },
    { name: getSetting('about_team2_name', t('about_team2_name')), role: getSetting('about_team2_role', t('about_team2_role')), image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj4eUVL4GCnyXWfJPOOd9fAAG9IxfaNxn7XlL0ezKjhPebxL4ZQuTq75Cyv8_DEpTEXWQ-wVbufB-cMwyGHieei2jGWIlLG2w8WLrne_pM3P3cZuTxOL5UfH0LeZuAK3jhuZU0DA4A6yJbLm4rGFnfHBlQRU81JrRhBI1Td1w-q4U0n5lau31RqJU7sH8hqx_96O56Q_ZdQNYi59sOZ3GahcZk33rHTp-CwMKrjQXohknO-GwV4axvtwl-4-Y9IdSElxWbmHxafFKU', desc: getSetting('about_team2_desc', t('about_team2_desc')) },
    { name: getSetting('about_team3_name', t('about_team3_name')), role: getSetting('about_team3_role', t('about_team3_role')), image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuoAcWHG4QUqFwzpuBNIiaBkLcJz1LV9m6p9PxV2_qn2WSGWrEBvMDt8FRrqMy_OoFbvbxPhWt-rkUfOJb6etQcez1ASToorW3mXf5JS_xl10v3v70igMCcIrAMpBGGaEu04I3Of3ciTtE2-7xONBem-5vFcik2fJR33PPVUjV0FJFGjlkjfzgQPrhIoCaiuE8cwWt7W1RSkuSY1Z9FKR9sgdyodxJg59Nruc3CsWtal9atky3HkE_WCrMJk7WkLsMqPddUVASBgtH', desc: getSetting('about_team3_desc', t('about_team3_desc')) },
  ]

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }
  const item    = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }

  // Fallbacks using Settings Context
  const heroTitle = getSetting('about_hero_title', t('about_hero_title'))
  const heroSubtitle = getSetting('about_hero_subtitle', t('about_hero_subtitle'))
  const desc1 = getSetting('about_desc1', t('about_desc1'))
  const desc2 = getSetting('about_desc2', t('about_desc2'))
  const storyTitle = getSetting('about_story_title', t('about_story_title'))
  const storySubtitle = getSetting('about_story_subtitle', t('about_story_subtitle'))

  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-zinc-950 text-primary dark:text-zinc-100">

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-12 overflow-hidden bg-cream-50 dark:bg-zinc-900 border-b border-outline-variant/20 dark:border-zinc-800">
        <div className="absolute inset-0 opacity-40 pointer-events-none" />
        {/* Decorative blobs - Tailwind purely */}
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full opacity-10 pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-amber-600 to-transparent" />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.div
            variants={stagger} initial="hidden" animate="visible"
            className="max-w-3xl"
          >
            <motion.div variants={item}>
              <span className="inline-block text-xs font-bold tracking-[0.22em] uppercase px-4 py-1.5 rounded-full mb-5 bg-amber-600/10 text-amber-700 dark:text-amber-500">
                {t('about_hero_badge')}
              </span>
            </motion.div>
            <motion.h1 variants={item} className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-4 text-brown-900 dark:text-zinc-100">
              {heroTitle}<br />
              <span className="text-amber-700 dark:text-amber-500 italic font-normal">{heroSubtitle}</span>
            </motion.h1>
            <motion.p variants={item} className="text-base leading-relaxed max-w-xl text-brown-600 dark:text-zinc-400">
              {desc1}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Story Section ── */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-cream-200 dark:border-zinc-800"
            >
              <Image
                src="/kitchen.png"
                alt="Dapur Premium Pisang Goreng Van Java"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
              <div className="absolute bottom-6 right-6 rounded-2xl p-5 shadow-2xl bg-brown-900 text-white">
                <div className="font-serif text-xl font-bold text-amber-500">{t('about_since')}</div>
                <div className="text-xs mt-0.5 opacity-70 text-cream-50">{t('about_quality')}</div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            >
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6 text-brown-900 dark:text-zinc-100">
                {storyTitle}<br />
                <span className="italic font-normal text-amber-700 dark:text-amber-500">{storySubtitle}</span>
              </h2>
              <p className="text-base leading-relaxed mb-4 text-brown-600 dark:text-zinc-400">
                {desc1}
              </p>
              <p className="text-base leading-relaxed mb-8 text-brown-600 dark:text-zinc-400">
                {desc2}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 bg-cream-50 dark:bg-zinc-950 border-y border-outline-variant/20 dark:border-zinc-900">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="text-xs font-bold tracking-[0.22em] uppercase mb-3 text-amber-700 dark:text-amber-500">
              {t('about_value_badge')}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brown-900 dark:text-zinc-100">
              {t('about_value_title')} <span className="italic font-normal text-amber-700 dark:text-amber-500">{t('about_value_subtitle')}</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-zinc-900 border border-cream-200 dark:border-zinc-800">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-serif text-lg font-bold mb-2 text-brown-900 dark:text-zinc-100">{title}</h3>
                <p className="text-sm leading-relaxed text-brown-600 dark:text-zinc-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-[800px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="text-xs font-bold tracking-[0.22em] uppercase mb-3 text-amber-700 dark:text-amber-500">
              {t('about_timeline_badge')}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brown-900 dark:text-zinc-100">
              {t('about_timeline_title')} <span className="italic font-normal text-amber-700 dark:text-amber-500">{t('about_timeline_subtitle')}</span>
            </h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-[28px] top-2 bottom-2 w-0.5 rounded-full bg-cream-200 dark:bg-zinc-800" />
            <div className="space-y-8">
              {milestones.map(({ year, event }, i) => (
                <motion.div key={year}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-xs font-bold z-10 bg-amber-600 text-white shadow-md">
                    {year}
                  </div>
                  <div className="rounded-2xl p-5 flex-1 bg-cream-50 dark:bg-zinc-900 border border-cream-200 dark:border-zinc-800">
                    <p className="text-sm leading-relaxed text-brown-800 dark:text-zinc-300">{event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 bg-cream-50 dark:bg-zinc-950 border-t border-cream-200 dark:border-zinc-900">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14">
            <div className="text-xs font-bold tracking-[0.22em] uppercase mb-3 text-amber-700 dark:text-amber-500">{t('about_team_badge')}</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brown-900 dark:text-zinc-100">
              {t('about_team_title')} <span className="italic font-normal text-amber-700 dark:text-amber-500">{t('about_team_subtitle')}</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-8">
            {team.map(({ name, role, image, desc }, i) => (
              <motion.div key={name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-zinc-900 border border-cream-200 dark:border-zinc-800 group">
                <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-cream-100 dark:border-zinc-800 group-hover:border-amber-500 transition-colors">
                   <Image src={image} alt={name} fill className="object-cover" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-1 text-brown-900 dark:text-zinc-100">{name}</h3>
                <div className="text-xs font-bold tracking-wider uppercase mb-3 text-amber-700 dark:text-amber-500">{role}</div>
                <p className="text-sm leading-relaxed text-brown-600 dark:text-zinc-400">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 text-white text-center bg-gradient-to-br from-brown-800 to-brown-950 dark:from-zinc-900 dark:to-black">
        <div className="max-w-xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-4xl mb-5">🍌</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Tertarik Bermitra Bersama Kami?</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Kami melayani pesanan katering berskala besar untuk acara korporasi, pernikahan, maupun pengajuan kerjasama waralaba B2B.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`https://wa.me/${getSetting('nomor_wa', '6281312167554')}`}
                className="px-8 py-3.5 rounded-full font-bold text-sm transition-all active:scale-95 bg-amber-600 hover:bg-amber-500 text-white shadow-lg">
                💼 Hubungi Kami untuk Kemitraan
              </a>
              <Link href="/lokasi-kontak"
                className="px-8 py-3.5 rounded-full font-bold text-sm transition-all active:scale-95 border border-white/30 hover:bg-white/10">
                📍 {t('about_cta_find')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
