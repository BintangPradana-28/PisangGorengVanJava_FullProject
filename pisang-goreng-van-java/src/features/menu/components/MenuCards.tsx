'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import QuickViewModal from '@/components/user/QuickViewModal'
import { useLanguage } from '@/context/LanguageContext'
import { useSession } from 'next-auth/react'

export interface ProductType {
  id: string
  flavorName: string
  priceKembung: number
  priceLumpia: number
  priceKrispy: number
  wholesaleKembung: number
  wholesaleLumpia: number
  wholesaleKrispy: number
  imageUrl: string | null
  isAvailable: boolean
  tags: string[]
  deskripsi_topping?: string | null
  rating?: number
  reviewCount?: number
}

interface Props {
  products: ProductType[]
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)
}

const getFallbackImageUrl = (name: string): string => {
  const lowercaseName = name.toLowerCase()
  if (lowercaseName.includes('matcha')) {
    return '/images/flavors/matcha.png'
  }
  if (lowercaseName.includes('strawberry') || lowercaseName.includes('stroberi')) {
    return '/images/flavors/strawberry.png'
  }
  if (lowercaseName.includes('blueberry') || lowercaseName.includes('bluberi')) {
    return '/images/flavors/blueberry.png'
  }
  if (lowercaseName.includes('taro')) {
    return '/images/flavors/taro.png'
  }
  if (lowercaseName.includes('cokelat') || lowercaseName.includes('coklat')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj4eUVL4GCnyXWfJPOOd9fAAG9IxfaNxn7XlL0ezKjhPebxL4ZQuTq75Cyv8_DEpTEXWQ-wVbufB-cMwyGHieei2jGWIlLG2w8WLrne_pM3P3cZuTxOL5UfH0LeZuAK3jhuZU0DA4A6yJbLm4rGFnfHBlQRU81JrRhBI1Td1w-q4U0n5lau31RqJU7sH8hqx_96O56Q_ZdQNYi59sOZ3GahcZk33rHTp-CwMKrjQXohknO-GwV4axvtwl-4-Y9IdSElxWbmHxafFKU'
  }
  if (lowercaseName.includes('keju')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMWvSvKGrg2mmGKWECW2kybDnREQg3WBlizL5Q1m-7Oh1StWch03nIoEf4EB_leSfQarUhhHO2RbXfYcfV7UKG-3Jcvw-Yesby_DKL5dC_lzExI4yYbGqg-DELiSQld71ZqOIwqG8yK-IgUdR7AiAoxxbdV0AOAELOoktia4g4fXClFEA9R-CdFgKKfV1LOvIhQrGUWC5U3rP_fvFzja6kAhE2f5oGaH6uG0lt5BatUZNK92rZekDwOp5hEcbWRmBfaDCeqCL5riRF'
  }
  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9LDm-0dz2bLyJgspWeoXpBM_q2p0viEQ3K2S2MhuSf5S5rdGQSfvR2RvTz_gWhe-LKgSzT0N8benG0sTrXkPwbOo_DqG8NeBu7XIPyms32RLdnWqUQ81MQxvOEsTPkzyTH8n45bhr0MIMG_Rv6S5w3Zo5nF-a590KXFVpcne08grJ0MH5PARTwrDYePvrFd7tzyhEw1Cx6_7K-kjmGj4TsXh9Xop3zMBCABCChMVbJzXOcm4BMRs0kWkzWEiEZ3-aXvEPFGT20x3B'
}

const getSalesMagnetTag = (flavorName: string): string => {
  const lower = flavorName.toLowerCase();
  if (lower.includes('original') || lower.includes('cokelat') || lower.includes('coklat')) {
    return '🔥 Terlaris';
  }
  if (lower.includes('matcha') || lower.includes('tiramisu')) {
    return '👑 Rekomendasi Chef';
  }
  return '⭐ Baru';
}

export default function MenuCards({ products }: Props) {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const isReseller = (session?.user as { role?: string })?.role === 'RESELLER'
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [activeTag, setActiveTag] = useState<string>(t('menu_filter_all'))

  const allTags = [t('menu_filter_all'), ...Array.from(new Set(products.flatMap(p => p.tags || [])))].filter(Boolean)
  const filteredProducts = activeTag === t('menu_filter_all') 
    ? products 
    : products.filter(p => p.tags?.includes(activeTag))

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="menu" className="py-24 bg-surface-container-low border-b border-outline-variant/20 dark:bg-zinc-900/40">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="text-secondary text-xs font-bold tracking-[0.2em] uppercase mb-3">
            {t('menu_badge')}
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary dark:text-zinc-100">
            {t('menu_title').split('Van Java')[0]}
            <span className="text-secondary italic font-normal">Van Java</span>
            {t('menu_title').split('Van Java')[1]}
          </h2>
        </motion.div>

        {/* Filter Chips */}
        {allTags.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTag === tag 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* Product Cards Grid / Skeleton Loader */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {!isMounted || products.length === 0 ? (
            // Skeleton Loading State
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[440px]"
              >
                {/* Image Shimmer */}
                <div className="w-full aspect-[4/3] skeleton-shimmer" />
                {/* Content Shimmer */}
                <div className="p-6.5 flex flex-col items-center flex-grow space-y-4 text-center">
                  <div className="h-6 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
                  <div className="space-y-2 flex-grow w-full flex flex-col items-center">
                    <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
                    <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
                  </div>
                  <div className="flex flex-col items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-auto w-full">
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-2 w-8 rounded bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
                      <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
                    </div>
                    <div className="h-10 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800 skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-500">
              {t('menu_empty_tag')} "{activeTag}"
            </div>
          ) : (
            filteredProducts.map((product, i) => {
              const image = product.imageUrl || getFallbackImageUrl(product.flavorName)
              const available = product.isAvailable;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-outline-variant/30 dark:border-zinc-800/60 hover:border-secondary/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group ${!available ? 'opacity-80 grayscale-[50%]' : ''}`}
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                    <Image
                      src={image}
                      alt={product.flavorName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {available ? (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800 rounded-full px-3 py-1 text-xs font-bold text-primary dark:text-zinc-300">
                        Freshly Fried
                      </div>
                    ) : (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm border border-red-700 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md">
                        Sold Out
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6.5 flex flex-col items-center text-center flex-grow">
                    <h3 className={`font-serif text-2xl font-bold text-primary dark:text-zinc-100 mb-1 w-full text-center ${!available ? 'text-zinc-500' : ''}`}>
                      {product.flavorName}
                    </h3>
                    
                    {/* Rating UI / Sales Magnet */}
                    <Link href="/ulasan" className="flex items-center gap-1.5 mb-3 text-sm text-zinc-500 hover:text-[#D4802A] transition-colors cursor-pointer active:scale-95">
                      {product.rating ? (
                        <>
                          <span className="text-amber-400">⭐</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {product.rating}
                          </span>
                          {product.reviewCount ? (
                            <span className="text-xs">({product.reviewCount}) &rarr;</span>
                          ) : null}
                        </>
                      ) : (
                        <span className="font-bold text-[#D4802A] bg-[#D4802A]/10 px-2 py-0.5 rounded-full text-xs">
                          {getSalesMagnetTag(product.flavorName)}
                        </span>
                      )}
                    </Link>

                    <p className="text-on-surface-variant dark:text-zinc-400 text-sm leading-relaxed mb-6 flex-grow font-sans w-full text-center">
                      {product.deskripsi_topping || t('menu_default_desc')}
                    </p>
                    
                    {/* Action row */}
                    <div className="flex flex-col items-center gap-3 pt-4 border-t border-outline-variant/20 dark:border-zinc-800 mt-auto w-full">
                      <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5">
                          {isReseller ? 'Harga Grosir (Mulai)' : t('menu_price')}
                        </div>
                        <div className={`font-sans text-lg font-bold text-primary dark:text-amber-400 ${!available ? 'text-zinc-500' : ''}`}>
                          {isReseller && product.wholesaleKembung > 0 ? (
                            <div className="flex flex-col items-center leading-tight">
                              <span className="text-xs line-through text-zinc-400 font-normal">{formatPrice(product.priceKembung)}</span>
                              <span className="text-[#D4802A]">{formatPrice(product.wholesaleKembung)}</span>
                            </div>
                          ) : (
                            formatPrice(product.priceKembung)
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => available && setSelectedProduct(product)}
                        disabled={!available}
                        className={available 
                          ? "bg-secondary hover:bg-secondary/95 text-white font-bold text-sm px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none flex items-center justify-center gap-1.5 active:scale-95" 
                          : "bg-zinc-300 text-zinc-500 cursor-not-allowed font-bold text-sm px-8 py-3 rounded-full flex items-center justify-center gap-1.5 opacity-70"
                        }
                      >
                        <span>{available ? t('menu_btn_order') : 'Habis Terjual'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Read More — Lihat Semua Menu */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Link
            href="/menu-spesial"
            className="inline-flex items-center gap-2 font-bold text-sm px-8 py-3.5 rounded-full transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: '#D4802A', color: 'white', boxShadow: '0 4px 18px rgba(212,128,42,0.28)' }}
          >
            🍌 Lihat Semua Menu &amp; Varian →
          </Link>
        </motion.div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        allProducts={products}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  )
}
