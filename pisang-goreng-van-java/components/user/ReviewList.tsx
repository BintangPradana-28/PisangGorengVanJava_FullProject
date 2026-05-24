'use client'

// components/user/ReviewList.tsx
// Displays a list of review cards. Handles empty state gracefully.

import { useMemo } from 'react'

export interface ReviewItem {
  id:        string
  userId:    string
  userName:  string | null
  rating:    number
  comment:   string | null
  imageUrl:  string | null
  isVerifiedBuyer: boolean
  createdAt: string // ISO string
}

interface ReviewListProps {
  reviews:      ReviewItem[]
  averageRating?: number | null
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-neutral-300'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: ReviewItem }) {
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('id-ID', {
      day:   'numeric',
      month: 'long',
      year:  'numeric',
    }).format(new Date(review.createdAt))
  }, [review.createdAt])

  const initials = review.userName
    ? review.userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out space-y-3">
      {/* Header: Avatar + Name + Date */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-neutral-800 text-sm leading-tight">
                {review.userName ?? 'Pelanggan'}
              </p>
              {review.isVerifiedBuyer && (
                <span title="Pembeli Terverifikasi" className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  ✓ <span className="hidden sm:inline">Pembeli Terverifikasi</span>
                </span>
              )}
            </div>
            <StarDisplay rating={review.rating} />
          </div>
        </div>
        <time className="text-xs text-neutral-500 shrink-0">{formattedDate}</time>
      </div>

      {/* Comment body */}
      {review.comment && (
        <p className="text-sm text-neutral-600 leading-relaxed border-t border-orange-50 pt-3">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}

      {/* Image Gallery */}
      {review.imageUrl && (
        <div className="pt-2">
          <a href={review.imageUrl} target="_blank" rel="noopener noreferrer" className="block max-w-xs rounded-xl overflow-hidden border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={review.imageUrl} 
              alt="Ulasan dari pembeli" 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
            />
          </a>
        </div>
      )}
    </div>
  )
}

function AverageSummary({ average, total }: { average: number; total: number }) {
  const rounded = Math.round(average * 10) / 10
  return (
    <div className="bg-orange-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className="text-center">
        <p className="text-4xl font-semibold text-neutral-800 leading-none">{rounded.toFixed(1)}</p>
        <p className="text-xs text-neutral-500 mt-1">dari 5 bintang</p>
      </div>
      <div className="border-l border-amber-200 pl-4 space-y-1">
        <StarDisplay rating={Math.round(average)} />
        <p className="text-xs text-neutral-500">{total} ulasan</p>
      </div>
    </div>
  )
}

export default function ReviewList({ reviews, averageRating }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-orange-50 border border-amber-100 rounded-2xl p-10 text-center shadow-sm space-y-3">
        <div className="text-5xl">🍌</div>
        <p className="font-semibold text-neutral-800">Belum Ada Ulasan</p>
        <p className="text-sm text-neutral-500 max-w-xs mx-auto">
          Jadilah yang pertama mencicipi dan menilai menu ini! Ulasan Anda sangat berarti bagi warung kami.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-4" aria-label="Ulasan pelanggan">
      {/* Summary Card */}
      {averageRating != null && (
        <AverageSummary average={averageRating} total={reviews.length} />
      )}

      {/* Review Cards */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
