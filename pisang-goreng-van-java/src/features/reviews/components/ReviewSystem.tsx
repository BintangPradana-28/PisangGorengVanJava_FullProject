'use client'

import { useTransition, useOptimistic } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type ReviewData = {
  id: string
  userId: string
  userName: string
  variantName: string
  rating: number
  comment: string | null
  createdAt: string
}

type Aggregates = {
  average: number
  total: number
  starCounts: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

interface ReviewSystemProps {
  initialReviews: ReviewData[]
  initialAggregates: Aggregates
  currentFilter: string
}

export default function ReviewSystem({ initialReviews, initialAggregates, currentFilter }: ReviewSystemProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Use optimistic state for instant UI feedback on filter chips
  const [optimisticFilter, setOptimisticFilter] = useOptimistic(
    currentFilter,
    (state, newFilter: string) => newFilter
  )

  const handleFilterClick = (newFilter: string) => {
    startTransition(() => {
      setOptimisticFilter(newFilter)
      const params = new URLSearchParams(searchParams.toString())
      if (newFilter === 'Semua') {
        params.delete('filter')
      } else {
        params.set('filter', newFilter)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const FILTERS = ['Semua', '5', '4', '3', '2', '1', 'Dengan Komentar'] as const

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      
      <div className="max-w-[1200px] mx-auto px-6 mb-8 text-center">
        <div className="text-secondary text-xs font-bold tracking-[0.2em] uppercase mb-3">
          {t('review_subtitle')}
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-primary dark:text-zinc-100">
          {t('review_title')} <span className="text-secondary italic font-normal">{t('review_title_highlight')}</span>
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {t('review_desc')}
        </p>
      </div>

      {/* 1. AGGREGATE SUMMARY CARD */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <h2 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {t('review_card_title')}
        </h2>
        
        {initialAggregates ? (
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Big Score */}
            <div className="flex flex-col items-center justify-center flex-shrink-0">
              <div className="text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                {initialAggregates.average.toFixed(1)}
              </div>
              <div className="flex gap-1 text-amber-400 text-xl mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < Math.round(initialAggregates.average) ? '★' : '☆'}</span>
                ))}
              </div>
              <div className="text-sm text-zinc-500 font-medium">
                {initialAggregates.total.toLocaleString('id-ID')} {t('review_card_total')}
              </div>
            </div>

            {/* Star Distribution Bars */}
            <div className="flex-1 w-full space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = initialAggregates.starCounts[star as keyof typeof initialAggregates.starCounts] || 0
                const percentage = initialAggregates.total > 0 ? (count / initialAggregates.total) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-12 shrink-0 text-zinc-600 dark:text-zinc-400">
                      <span>{star}</span>
                      <span className="text-amber-400">★</span>
                    </div>
                    <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                    <div className="w-10 shrink-0 text-right text-zinc-500 text-xs font-medium">
                      {count > 999 ? '999+' : count}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="h-32 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-xl w-full" />
        )}
      </div>

      {/* 2. FILTER CHIPS SECTION */}
      <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-3 border-b border-zinc-200 dark:border-zinc-800">
        {FILTERS.map(f => {
          const isSelected = optimisticFilter === f
          
          let label: string = f
          if (f === 'Semua') label = t('review_filter_all')
          else if (f === 'Dengan Komentar') label = t('review_filter_comment')
          else label = `${f} ${t('review_filter_stars')}`

          return (
            <button
              key={f}
              onClick={() => handleFilterClick(f)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-[#D4802A] text-[#D4802A]'
                  : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* 3. REVIEW LIST COMPONENT */}
      <div className={`space-y-6 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {initialReviews.length === 0 ? (
          // Empty State
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {t('review_empty_title')}
            </h3>
            <p className="text-zinc-500 text-sm">
              {t('review_empty_desc')}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {initialReviews.map(review => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar Placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-amber-900 font-bold text-sm">
                      {review.userName[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-0.5">
                        {review.userName}
                      </div>
                      <div className="flex gap-0.5 text-amber-400 text-xs">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 font-medium">
                    {new Date(review.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                )}

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <span>{t('review_menu_liked')}</span>
                  <span className="text-[#D4802A] uppercase tracking-wider">{review.variantName}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

    </div>
  )
}
