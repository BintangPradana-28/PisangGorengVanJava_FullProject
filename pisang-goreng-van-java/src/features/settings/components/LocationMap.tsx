'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useSettings } from '@/context/SettingsContext'

export default function LocationMap() {
  const { t } = useLanguage()
  const { getSetting } = useSettings()
  
  return (
    <section id="lokasi" className="py-24 bg-surface dark:bg-zinc-950/20 border-b border-outline-variant/20 dark:border-zinc-800/40">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-secondary text-xs font-bold tracking-[0.2em] uppercase mb-3">
            {t('location_badge')}
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary dark:text-zinc-100">
            {t('location_title').split(' ')[0]} <span className="text-secondary italic font-normal">{t('location_title').split(' ').slice(1).join(' ')}</span>
          </h2>
        </motion.div>

        {/* Map & Address Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Address & Operational Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 bg-surface-container-low dark:bg-zinc-900 border border-outline-variant/30 dark:border-zinc-850 rounded-3xl p-8 flex flex-col justify-between"
          >
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary dark:text-zinc-100 mb-6">
                {t('location_branch')}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider font-semibold mb-1">{t('location_address_label')}</div>
                  <p className="text-primary dark:text-zinc-300 font-medium text-sm sm:text-base leading-relaxed">
                    {getSetting('alamat', t('location_address_val'))}
                  </p>
                </div>
                
                <div>
                  <div className="text-xs text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider font-semibold mb-1">{t('location_hours_label')}</div>
                  <p className="text-primary dark:text-zinc-300 font-medium text-sm sm:text-base leading-relaxed">
                    {getSetting('jam_operasional', t('location_hours_val'))}
                  </p>
                </div>

                <div>
                  <div className="text-xs text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider font-semibold mb-1">{t('location_delivery_label')}</div>
                  <p className="text-primary dark:text-zinc-300 font-medium text-sm sm:text-base leading-relaxed">
                    {t('location_delivery_val')}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-outline-variant/20 dark:border-zinc-800 mt-8">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(getSetting('alamat', 'Jakarta Timur'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-secondary dark:text-emerald-450 font-bold text-sm hover:underline"
              >
                <span>{t('location_maps_btn')}</span>
                <span>→</span>
              </a>
            </div>
          </motion.div>

          {/* Interactive Maps Iframe Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 h-[450px] lg:h-auto rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 dark:border-zinc-800 bg-surface-container-high dark:bg-zinc-900/60"
          >
            {/* Google Maps Iframe with high reliability Location */}
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(getSetting('alamat', 'Jl. Raya Cilangkap l Rt.2/Rw.5, Cilangkap, Kec. Cipayung, Kota Jakarta Timur'))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta Lokasi Resmi Warung Pisang Goreng Van Java"
            ></iframe>
          </motion.div>

        </div>

        {/* Read More — Lihat Detail Lokasi */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Link
            href="/lokasi-kontak"
            className="inline-flex items-center gap-2 font-bold text-sm px-8 py-3.5 rounded-full transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: '#D4802A', color: 'white', boxShadow: '0 4px 18px rgba(212,128,42,0.28)' }}
          >
            📍 {t('location_btn_detail')} →
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
