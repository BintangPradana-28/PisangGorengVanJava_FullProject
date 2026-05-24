'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { Star, Clock, ChevronRight } from 'lucide-react'

const ShoppingBagIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
)

export default function Hero({ banner, averageRating = 0, totalReviews = 0 }: { banner?: { imageUrl?: string | null; linkUrl?: string | null } | null, averageRating?: number, totalReviews?: number }) {
  const { t } = useLanguage()

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  // Force using translation to respect the language toggle
  const title = t('hero_title')
  const subtitle = t('hero_desc')
  const badge = t('hero_badge')
  const bgImage = banner?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCuoAcWHG4QUqFwzpuBNIiaBkLcJz1LV9m6p9PxV2_qn2WSGWrEBvMDt8FRrqMy_OoFbvbxPhWt-rkUfOJb6etQcez1ASToorW3mXf5JS_xl10v3v70igMCcIrAMpBGGaEu04I3Of3ciTtE2-7xONBem-5vFcik2fJR33PPVUjV0FJFGjlkjfzgQPrhIoCaiuE8cwWt7W1RSkuSY1Z9FKR9sgdyodxJg59Nruc3CsWtal9atky3HkE_WCrMJk7WkLsMqPddUVASBgtH"
  const ctaLink = banner?.linkUrl || "/menu-spesial"

  // Since original title has "Van Java" explicitly colored, let's just render the string as is 
  // or highlight "Van Java" if it exists in the dynamic string
  const renderTitle = () => {
    if (title.includes('Van Java')) {
      const parts = title.split('Van Java')
      return (
        <>
          {parts[0]} <br className="hidden sm:block" />
          <span className="text-secondary-container italic font-normal">Van Java</span>
          {parts[1]}
        </>
      )
    }
    return title
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Banner Promosi Van Java"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1200px] w-full mx-auto px-6 py-24 md:py-32 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Area */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-left"
        >
          {badge && (
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6">
              <span className="bg-secondary/20 border border-secondary-container/40 text-secondary-container text-xs font-semibold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full">
                {badge}
              </span>
            </motion.div>
          )}

          <motion.h1
            variants={itemVariants}
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-4"
          >
            {renderTitle()}
          </motion.h1>

          {/* ShopeeFood Style Rating Indicator */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 mb-6">
            {totalReviews >= 5 && (
              <>
                <Link href="/ulasan" className="group">
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:bg-amber-500/20">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-amber-400/30'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-amber-400 ml-1">{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-cream-50/60 font-medium">({totalReviews > 1000 ? `${(totalReviews/1000).toFixed(1)}RB` : totalReviews} Penilaian)</span>
                    <ChevronRight className="w-4 h-4 text-cream-50/40 ml-1 group-hover:text-amber-400 transition-colors" />
                  </div>
                </Link>
                <span className="text-cream-50/40 text-lg leading-none">•</span>
              </>
            )}
            
            <div className="flex items-center gap-1.5 text-cream-50/80 text-sm font-medium">
              <Clock className="w-4 h-4 opacity-70" />
              <span>10.00 - 21.00 WIB</span>
            </div>
            
            <span className="text-cream-50/40 text-lg leading-none hidden sm:block">•</span>
            
            <div className="hidden sm:flex items-center gap-1 text-cream-50/80 text-sm font-medium">
              <span>{t('hero_location')}</span>
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-cream-50/80 text-lg leading-relaxed max-w-lg mb-8 font-sans"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4 items-center"
          >
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-3 bg-[#D4802A] hover:bg-[#b56d24] text-white font-bold text-base px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#D4802A]/40"
            >
              <ShoppingBagIcon />
              <span>{t('hero_order_btn')}</span>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 max-w-sm mt-12 pt-8 border-t border-white/10"
          >
            {[
              { num: '12+', label: t('hero_stat_topping') },
              { num: '3', label: t('hero_stat_type') },
              { num: '100%', label: t('hero_stat_local') },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="font-serif text-3xl font-bold text-secondary-container">{num}</div>
                <div className="text-xs text-cream-50/60 tracking-wider uppercase mt-1 font-medium">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Visual Element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden lg:flex justify-end"
        >
          <div className="relative w-full max-w-[450px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white-container bg-surface-container">
            <Image
              src={banner?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBj4eUVL4GCnyXWfJPOOd9fAAG9IxfaNxn7XlL0ezKjhPebxL4ZQuTq75Cyv8_DEpTEXWQ-wVbufB-cMwyGHieei2jGWIlLG2w8WLrne_pM3P3cZuTxOL5UfH0LeZuAK3jhuZU0DA4A6yJbLm4rGFnfHBlQRU81JrRhBI1Td1w-q4U0n5lau31RqJU7sH8hqx_96O56Q_ZdQNYi59sOZ3GahcZk33rHTp-CwMKrjQXohknO-GwV4axvtwl-4-Y9IdSElxWbmHxafFKU"}
              alt="Visual Promosi"
              fill
              sizes="(max-width: 1024px) 100vw, 450px"
              className="object-cover"
            />
            {badge && (
              <div className="absolute top-5 right-5 bg-secondary text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
                {badge}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 cursor-pointer"
        >
          <span className="text-xs text-cream-50/50 uppercase tracking-widest font-medium">Scroll Down</span>
          <span className="text-secondary-container text-sm">↓</span>
        </motion.div>
      </div>
    </section>
  )
}
