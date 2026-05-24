'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import QuickViewModal from '@/components/user/QuickViewModal'
import { useLanguage } from '@/context/LanguageContext'
import { useSession } from 'next-auth/react'
import { useSettings } from '@/context/SettingsContext'
import toast from 'react-hot-toast'
import { ProductType } from '@/src/features/menu/components/MenuCards'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

const getFallbackImage = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('cokelat') || n.includes('coklat'))
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj4eUVL4GCnyXWfJPOOd9fAAG9IxfaNxn7XlL0ezKjhPebxL4ZQuTq75Cyv8_DEpTEXWQ-wVbufB-cMwyGHieei2jGWIlLG2w8WLrne_pM3P3cZuTxOL5UfH0LeZuAK3jhuZU0DA4A6yJbLm4rGFnfHBlQRU81JrRhBI1Td1w-q4U0n5lau31RqJU7sH8hqx_96O56Q_ZdQNYi59sOZ3GahcZk33rHTp-CwMKrjQXohknO-GwV4axvtwl-4-Y9IdSElxWbmHxafFKU'
  if (n.includes('keju'))
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMWvSvKGrg2mmGKWECW2kybDnREQg3WBlizL5Q1m-7Oh1StWch03nIoEf4EB_leSfQarUhhHO2RbXfYcfV7UKG-3Jcvw-Yesby_DKL5dC_lzExI4yYbGqg-DELiSQld71ZqOIwqG8yK-IgUdR7AiAoxxbdV0AOAELOoktia4g4fXClFEA9R-CdFgKKfV1LOvIhQrGUWC5U3rP_fvFzja6kAhE2f5oGaH6uG0lt5BatUZNK92rZekDwOp5hEcbWRmBfaDCeqCL5riRF'
  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9LDm-0dz2bLyJgspWeoXpBM_q2p0viEQ3K2S2MhuSf5S5rdGQSfvR2RvTz_gWhe-LKgSzT0N8benG0sTrXkPwbOo_DqG8NeBu7XIPyms32RLdnWqUQ81MQxvOEsTPkzyTH8n45bhr0MIMG_Rv6S5w3Zo5nF-a590KXFVpcne08grJ0MH5PARTwrDYePvrFd7tzyhEw1Cx6_7K-kjmGj4TsXh9Xop3zMBCABCChMVbJzXOcm4BMRs0kWkzWEiEZ3-aXvEPFGT20x3B'
}

export default function MenuGrid({ products }: { products: ProductType[] }) {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getSetting } = useSettings()
  const isStoreOpen = getSetting('store_open', 'true') === 'true'
  const [selected, setSelected] = useState<ProductType | null>(null)
  
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (session?.user) {
      fetch('/api/favorites')
        .then(res => res.json())
        .then(data => {
          if (data.success) setFavorites(data.data)
        })
        .catch(err => console.error('Failed to fetch favorites', err))
    }
  }, [session])

  const toggleFavorite = async (e: React.MouseEvent, variantId: string) => {
    e.stopPropagation()
    if (!session?.user) {
      toast.error('Silakan login untuk menyimpan favorit')
      return
    }

    const isFav = favorites.includes(variantId)
    // Optimistic UI
    setFavorites(prev => isFav ? prev.filter(id => id !== variantId) : [...prev, variantId])

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success(isFav ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit', { id: `fav-${variantId}` })
    } catch (err) {
      // Revert optimistic UI
      setFavorites(prev => isFav ? [...prev, variantId] : prev.filter(id => id !== variantId))
      toast.error('Gagal memperbarui favorit', { id: `fav-err-${variantId}` })
    }
  }

  return (
    <section className="py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        {products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🍌</div>
            <p className="text-lg font-serif font-bold mb-2" style={{ color: 'var(--text-custom)' }}>
              {t('menu_empty_title')}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-custom)' }}>
              {t('menu_empty_desc')}
            </p>
            <button 
              onClick={() => router.push('?', { scroll: false })}
              className="mt-4 text-sm font-bold px-6 py-2.5 rounded-full transition-all"
              style={{ background: '#D4802A', color: 'white' }}
            >
              {t('menu_reset_btn')}
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, i) => {
                const img = product.imageUrl || getFallbackImage(product.flavorName)
                const available = product.isAvailable
                const isFav = favorites.includes(product.id)

                return (
                  <motion.div key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className={`relative rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 ${available ? 'hover:shadow-2xl hover:-translate-y-1' : 'opacity-80 grayscale-[50%]'}`}
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-custom)' }}
                  >
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(e, product.id)}
                      className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm hover:scale-110 active:scale-95 border border-zinc-200/50 dark:border-zinc-800"
                      aria-label="Toggle Favorite"
                    >
                      <svg
                        className={`w-5 h-5 transition-colors ${isFav ? 'text-red-500 fill-current' : 'text-zinc-500'}`}
                        fill={isFav ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={isFav ? 0 : 2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Image */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <Image src={img} alt={product.flavorName} fill sizes="(max-width:640px) 100vw, 360px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      {available ? (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm"
                          style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-custom)', border: '1px solid var(--border-custom)' }}>
                          {t('menu_fresh_badge')}
                        </div>
                      ) : (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm bg-red-600 text-white shadow-md">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col items-center text-center flex-grow">
                      <h3 className={`font-serif text-2xl font-bold mb-1 ${!available ? 'text-zinc-500' : ''}`} style={available ? { color: 'var(--text-custom)' } : {}}>
                        {product.flavorName}
                      </h3>
                      
                      {/* Rating UI */}
                      <Link href="/ulasan" className="flex items-center gap-1.5 mb-3 text-sm text-zinc-500 hover:text-[#D4802A] transition-colors cursor-pointer active:scale-95">
                        <span className="text-amber-400">⭐</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {product.rating ? product.rating : 'Baru'}
                        </span>
                        {product.reviewCount ? (
                          <span className="text-xs">({product.reviewCount}) &rarr;</span>
                        ) : null}
                      </Link>

                      <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: 'var(--text-custom)' }}>
                        {t('menu_default_desc')}
                      </p>
                      <div className="w-full border-t pt-4 flex flex-col items-center gap-3"
                        style={{ borderColor: 'var(--border-custom)' }}>
                        <div className="text-center">
                          <div className="text-[10px] uppercase tracking-wider font-semibold mb-0.5"
                            style={{ color: 'var(--text-custom)', opacity: 0.8 }}>
                            {(session?.user as any)?.role === 'RESELLER' ? 'Harga Grosir (Mulai)' : t('menu_price_label')}
                          </div>
                          <div className={`font-sans text-lg font-bold ${!available ? 'text-zinc-500' : ''}`} style={available ? { color: '#D4802A' } : {}}>
                            {(session?.user as any)?.role === 'RESELLER' && product.wholesaleKembung > 0 ? (
                              <div className="flex flex-col items-center leading-tight">
                                <span className="text-xs line-through text-zinc-400 font-normal">{formatPrice(product.priceKembung)}</span>
                                <span>{formatPrice(product.wholesaleKembung)}</span>
                              </div>
                            ) : (
                              formatPrice(product.priceKembung)
                            )}
                          </div>
                        </div>
                        <button onClick={() => available && isStoreOpen && setSelected(product)}
                          disabled={!available || !isStoreOpen}
                          className={(available && isStoreOpen) 
                            ? "font-bold text-sm px-8 py-3 rounded-full shadow-md transition-all duration-200 active:scale-95 hover:shadow-lg"
                            : "bg-zinc-300 text-zinc-500 cursor-not-allowed font-bold text-sm px-8 py-3 rounded-full flex items-center justify-center gap-1.5 opacity-70"
                          }
                          style={(available && isStoreOpen) ? { background: '#D4802A', color: 'white' } : {}}>
                          {!isStoreOpen ? 'Toko Tutup' : available ? t('menu_btn_order') : 'Habis Terjual'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      <QuickViewModal product={selected} allProducts={products} onClose={() => setSelected(null)} />
    </section>
  )
}
