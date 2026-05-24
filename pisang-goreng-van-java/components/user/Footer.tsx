'use client'

import { useLanguage } from '@/context/LanguageContext'
import { useSettings } from '@/context/SettingsContext'
import Link from 'next/link'
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
)

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

export default function Footer() {
  const { t } = useLanguage()
  const { getSetting } = useSettings()
  const year = new Date().getFullYear()
  
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand area */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🍌</span>
              <div className="font-serif font-bold text-xl leading-tight">
                Pisang Goreng<br />
                <span className="text-secondary-container">Van Java</span>
              </div>
            </div>
            <p className="text-cream-50/70 text-sm leading-relaxed max-w-sm">
              {t('footer_tagline')}
            </p>
          </div>
 
          {/* Links area */}
          <div>
            <h4 className="text-secondary-container text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('footer_menu')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {['Kembung (Isi 15)', 'Lumpia (Isi 6)', 'Krispy (Isi 5)', 'Aneka Topping Premium'].map((item) => (
                <li key={item}>
                  <Link
                    href="/menu-spesial"
                    className="text-cream-50/75 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="text-secondary-container text-xs font-bold tracking-[0.2em] uppercase mt-8 mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="text-cream-50/75 hover:text-white transition-colors duration-200">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-cream-50/75 hover:text-white transition-colors duration-200">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
 
          {/* Contact / Social area */}
          <div>
            <h4 className="text-secondary-container text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('footer_follow')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'Instagram', href: getSetting('instagram', 'https://instagram.com/pisanggorengvanjava'), icon: <InstagramIcon /> },
                { name: 'TikTok', href: getSetting('tiktok', 'https://tiktok.com/@pisanggorengvanjava'), icon: <TikTokIcon /> },
                { name: 'WhatsApp', href: `https://wa.me/${getSetting('nomor_wa', '6281312167554')}`, icon: <WaIcon /> },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-cream-50/75 hover:text-white transition-colors duration-200"
                  >
                    <span className="text-secondary-container group-hover:text-amber-brand transition-colors duration-200">{item.icon}</span>
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
 
        </div>
 
        {/* Bottom copyright line */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-cream-50/50">
          <span>© {year} Pisang Goreng Van Java. {t('footer_rights')}</span>
          <Link href="/" className="font-sans font-medium tracking-wide hover:text-white transition-colors duration-200">
            PisangGorengVanJava.com
          </Link>
        </div>
      </div>
    </footer>
  )
}
