'use client'

// components/user/StarRating.tsx
// Interactive 5-star rating input with optimistic feedback and server action support.

import { useState, useTransition } from 'react'

interface StarRatingProps {
  variantId: string
  existingRating?: number | null
  /** Called after the user submits a rating. Return an error string to show it, or null on success. */
  onSubmit: (variantId: string, rating: number, comment: string, imageUrl?: string) => Promise<string | null>
}

const LABELS: Record<number, string> = {
  1: 'Tidak Suka',
  2: 'Cukup',
  3: 'Lumayan',
  4: 'Enak Banget!',
  5: 'Luar Biasa! ⭐',
}

function StarIcon({ filled, hovered }: { filled: boolean; hovered: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-8 h-8 transition-all duration-200 ease-in-out transform ${
        hovered ? 'scale-110' : 'scale-100'
      } ${filled ? 'text-amber-400' : 'text-neutral-300'}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export default function StarRating({ variantId, existingRating, onSubmit }: StarRatingProps) {
  const [hovered, setHovered]   = useState<number>(0)
  const [selected, setSelected] = useState<number>(existingRating ?? 0)
  const [comment, setComment]   = useState('')
  const [photo, setPhoto]       = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [isPending, startTransition] = useTransition()

  const displayRating = hovered || selected

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5MB')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleSubmit = async () => {
    if (selected === 0) {
      setError('Pilih jumlah bintang terlebih dahulu.')
      return
    }
    setError(null)
    
    let uploadedImageUrl = ''

    if (photo) {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', photo)
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadRes.json()
        if (uploadData.success) {
          uploadedImageUrl = uploadData.data.url
        } else {
          setError(uploadData.error || 'Gagal mengunggah foto.')
          setIsUploading(false)
          return
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengunggah foto.')
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    startTransition(async () => {
      const errorMsg = await onSubmit(variantId, selected, comment, uploadedImageUrl)
      if (errorMsg) {
        setError(errorMsg)
      } else {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <div className="bg-orange-50 border border-amber-100 rounded-2xl p-6 text-center shadow-sm">
        <div className="text-4xl mb-2">🌟</div>
        <p className="font-semibold text-neutral-800">Terima kasih atas ulasan Anda!</p>
        <p className="text-sm text-neutral-500 mt-1">Penilaian Anda sangat berarti bagi kami.</p>
      </div>
    )
  }

  return (
    <div className="bg-orange-50 border border-amber-100 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-neutral-800 text-base">
        {existingRating ? '✏️ Perbarui Ulasan Anda' : '⭐ Tulis Ulasan'}
      </h3>

      {/* Star Selector */}
      <div className="flex items-center gap-1" role="group" aria-label="Rating bintang">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Beri ${star} bintang`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => {
              setSelected(star)
              setError(null)
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-sm"
          >
            <StarIcon filled={star <= displayRating} hovered={star <= hovered} />
          </button>
        ))}
        {displayRating > 0 && (
          <span className="ml-2 text-sm font-medium text-amber-600 transition-all duration-200 ease-in-out">
            {LABELS[displayRating]}
          </span>
        )}
      </div>

      {/* Comment Textarea */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Ceritakan pengalaman Anda mencicipi menu ini... (opsional)"
        rows={3}
        className="w-full rounded-xl border border-amber-100 bg-white px-4 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all duration-200 ease-in-out resize-none shadow-sm"
      />

      {/* Photo Upload */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer border border-dashed border-amber-300 rounded-xl p-3 hover:bg-amber-100/50 transition-colors text-sm text-amber-700 font-medium w-max">
          <span>📸</span>
          <span>{photo ? 'Ganti Foto' : 'Unggah Foto (Opsional)'}</span>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp"
            className="hidden" 
            onChange={handlePhotoChange}
          />
        </label>
        {photoPreview && (
          <div className="mt-3 relative w-max">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-amber-200 shadow-sm" />
            <button 
              onClick={() => { setPhoto(null); setPhotoPreview(null) }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 transition-all duration-200 ease-in-out">
          ⚠️ {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || isUploading}
        className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-neutral-200 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ease-in-out active:scale-95"
      >
        {isUploading ? 'Mengunggah Foto...' : isPending ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </div>
  )
}
