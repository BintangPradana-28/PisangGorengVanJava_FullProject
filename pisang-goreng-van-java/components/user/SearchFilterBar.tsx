'use client'

// components/user/SearchFilterBar.tsx
// Upgraded: Debounced search + Sticky swipeable category tabs (mobile-first)
// Uses URL search params as the single source of truth — no hydration mismatch.

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

// ── Tipe Adonan (Base Type) — shown as primary sticky tabs ──────────────────
const BASE_TABS = [
  { key: 'all',    label: '🍌 Semua',    emoji: '' },
  { key: 'Kembung', label: '🥟 Kembung', emoji: '🥟' },
  { key: 'Lumpia',  label: '🌯 Lumpia',  emoji: '🌯' },
  { key: 'Krispy',  label: '🥨 Krispy',  emoji: '🥨' },
]

// ── Kategori Rasa — shown as secondary swipeable chips ───────────────────────
const FLAVOR_CHIPS = [
  { key: 'all',      label: 'Semua Rasa' },
  { key: 'Cokelat',  label: '🍫 Cokelat'   },
  { key: 'Matcha',   label: '🍵 Matcha'    },
  { key: 'Tiramisu', label: '☕ Tiramisu'  },
  { key: 'Strawberry',label: '🍓 Strawberry'},
  { key: 'Blueberry',label: '🫐 Blueberry' },
  { key: 'Milky',    label: '🥛 Milky'     },
  { key: 'Taro',     label: '🟣 Taro'      },
  { key: 'Original', label: '✨ Original'  },
]

interface SearchFilterBarProps {
  totalItems: number
}

export default function SearchFilterBar({ totalItems }: SearchFilterBarProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { t }        = useLanguage()
  const chipRowRef   = useRef<HTMLDivElement>(null)

  const [search,      setSearch]      = useState(searchParams.get('q')      ?? '')
  const [baseFilter,  setBaseFilter]  = useState(searchParams.get('filter') ?? 'all')
  const [flavorFilter, setFlavorFilter] = useState(searchParams.get('flavor') ?? 'all')
  const [isDragging,  setIsDragging]  = useState(false)
  const dragStart = useRef<{ x: number; scrollLeft: number }>({ x: 0, scrollLeft: 0 })

  // ── Debounced URL sync ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (search)                  params.set('q',      search)
      if (baseFilter  !== 'all')   params.set('filter', baseFilter)
      if (flavorFilter !== 'all')  params.set('flavor', flavorFilter)
      router.push(`?${params.toString()}`, { scroll: false })
    }, 400)
    return () => clearTimeout(timer)
  }, [search, baseFilter, flavorFilter, router])

  // ── Mouse drag-to-scroll for flavor chip row (desktop UX) ───────────────────
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = chipRowRef.current
    if (!el) return
    setIsDragging(true)
    dragStart.current = { x: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft }
    el.style.cursor = 'grabbing'
  }
  const onMouseLeave = () => { setIsDragging(false); if (chipRowRef.current) chipRowRef.current.style.cursor = 'grab' }
  const onMouseUp    = () => { setIsDragging(false); if (chipRowRef.current) chipRowRef.current.style.cursor = 'grab' }
  const onMouseMove  = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !chipRowRef.current) return
    e.preventDefault()
    const x    = e.pageX - chipRowRef.current.offsetLeft
    const walk = (x - dragStart.current.x) * 1.4
    chipRowRef.current.scrollLeft = dragStart.current.scrollLeft - walk
  }

  return (
    <div
      className="sticky top-16 z-30 shadow-sm"
      style={{ background: 'var(--background-custom)', borderBottom: '1px solid var(--border-custom)' }}
    >
      {/* ── Row 1: Search + item count ──────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 pb-3 flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
            style={{ color: 'var(--text-custom)', opacity: 0.5 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('menu_search_placeholder')}
            aria-label="Cari varian menu"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{
              background: 'var(--surface-custom)',
              border:     '1px solid var(--border-custom)',
              color:      'var(--text-custom)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              aria-label="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        <span className="text-xs shrink-0 font-medium tabular-nums" style={{ color: 'var(--text-custom)', opacity: 0.55 }}>
          {totalItems} {t('menu_count_suffix')}
        </span>
      </div>

      {/* ── Row 2: Base Type Tabs (Sticky, pill-style) ──────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {BASE_TABS.map((tab) => {
          const active = baseFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setBaseFilter(tab.key)}
              aria-pressed={active}
              className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-400"
              style={
                active
                  ? { background: '#D4802A', color: 'white', boxShadow: '0 4px 14px rgba(212,128,42,0.35)' }
                  : { background: 'var(--surface-custom)', border: '1px solid var(--border-custom)', color: 'var(--text-custom)' }
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Row 3: Flavor Family Chips (drag-scrollable) ────────────────────── */}
      <div
        ref={chipRowRef}
        className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-none select-none"
        style={{ cursor: 'grab' }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        role="group"
        aria-label="Filter berdasarkan rasa"
      >
        {FLAVOR_CHIPS.map((chip) => {
          const active = flavorFilter === chip.key
          return (
            <button
              key={chip.key}
              onClick={() => !isDragging && setFlavorFilter(chip.key)}
              aria-pressed={active}
              className="flex-shrink-0 text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              style={
                active
                  ? { background: 'rgba(212,128,42,0.15)', border: '1.5px solid #D4802A', color: '#D4802A' }
                  : { background: 'var(--surface-custom)', border: '1px solid var(--border-custom)', color: 'var(--text-custom)', opacity: 0.75 }
              }
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
