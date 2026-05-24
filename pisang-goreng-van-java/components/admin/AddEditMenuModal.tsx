'use client'
// components/admin/AddEditMenuModal.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MenuVariant, MenuVariantFormData } from '@/data/types'

interface Props {
  open:       boolean
  editItem:   MenuVariant | null
  onClose:    () => void
  onSaved:    (variant: MenuVariant) => void
}

const EMPTY_FORM: MenuVariantFormData = {
  flavorName:   '',
  priceKembung: 10000,
  priceLumpia:  10000,
  priceKrispy:  10000,
  description:  '',
  imageUrl:     '',
  isActive:     true,
  isAvailable:  true,
  sortOrder:    0,
}

export default function AddEditMenuModal({ open, editItem, onClose, onSaved }: Props) {
  const [form,    setForm]    = useState<MenuVariantFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editItem) {
      setForm({
        flavorName:   editItem.flavorName,
        priceKembung: editItem.prices.kembung,
        priceLumpia:  editItem.prices.lumpia,
        priceKrispy:  editItem.prices.krispy,
        description:  editItem.description  ?? '',
        imageUrl:     editItem.imageUrl     ?? '',
        isActive:     editItem.isActive,
        isAvailable:  true, // Default to true or if editItem has it. Wait, editItem is MenuVariant which might not have isAvailable yet?
        sortOrder:    editItem.sortOrder,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editItem, open])

  const set = <K extends keyof MenuVariantFormData>(key: K, val: MenuVariantFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.flavorName) { toast.error('Nama varian wajib diisi'); return }
    if (!form.priceKembung || !form.priceLumpia || !form.priceKrispy) {
      toast.error('Semua harga wajib diisi'); return
    }

    setLoading(true)
    try {
      const url    = editItem ? `/api/menu/${editItem.id}` : '/api/menu'
      const method = editItem ? 'PUT' : 'POST'

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flavorName:   form.flavorName,
          priceKembung: Number(form.priceKembung),
          priceLumpia:  Number(form.priceLumpia),
          priceKrispy:  Number(form.priceKrispy),
          description:  form.description  || null,
          imageUrl:     form.imageUrl     || null,
          isActive:     form.isActive,
          sortOrder:    Number(form.sortOrder),
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(editItem ? 'Menu berhasil diupdate!' : 'Menu baru ditambahkan!')
        // Map DB shape → MenuVariant
        const raw = data.data
        const saved: MenuVariant = {
          id:          raw.id,
          flavorName:  raw.flavorName,
          prices: {
            kembung: raw.priceKembung,
            lumpia:  raw.priceLumpia,
            krispy:  raw.priceKrispy,
          },
          imageUrl:    raw.imageUrl,
          description: raw.description,
          isActive:    raw.isActive,
          isAvailable: raw.isAvailable,
          sortOrder:   raw.sortOrder,
        }
        onSaved(saved)
        onClose()
      } else {
        toast.error(data.error || 'Gagal menyimpan')
      }
    } catch {
      toast.error('Koneksi bermasalah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-cream-100 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-brown-700">
                {editItem ? '✏️ Edit Menu' : '➕ Tambah Menu Baru'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-cream-200 hover:bg-cream-300 flex items-center justify-center
                           text-brown-500 text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Flavor Name */}
              <div>
                <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">
                  Nama Varian Rasa *
                </label>
                <input
                  type="text"
                  value={form.flavorName}
                  onChange={(e) => set('flavorName', e.target.value)}
                  placeholder="e.g. Matcha Milky"
                  className="form-input"
                  required
                />
              </div>

              {/* Prices */}
              <div>
                <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-2">
                  Harga per Tipe (IDR) *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'priceKembung', label: 'Kembung (Isi 15)' },
                    { key: 'priceLumpia',  label: 'Lumpia (Isi 6)'   },
                    { key: 'priceKrispy',  label: 'Krispy (Isi 5)'   },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs text-brown-400 mb-1">{label}</label>
                      <input
                        type="number"
                        value={form[key as keyof MenuVariantFormData] as number}
                        onChange={(e) => setForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                        min={5000}
                        step={1000}
                        className="form-input"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">
                  Deskripsi Topping
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Deskripsi singkat menu..."
                  rows={3}
                  className="form-input resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">
                  URL Gambar
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                  placeholder="https://example.com/gambar.jpg"
                  className="form-input"
                />
                {/* Upload placeholder box */}
                <div className="mt-2 w-full h-24 border-2 border-dashed border-cream-200 rounded-xl
                                flex flex-col items-center justify-center text-brown-300 cursor-pointer
                                hover:border-amber-brand hover:text-amber-brand transition-colors text-sm">
                  <span className="text-2xl mb-1">📷</span>
                  <span>Upload Gambar (coming soon)</span>
                </div>
              </div>

              {/* Active toggle + Sort order */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => set('isActive', !form.isActive)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      form.isActive ? 'bg-green-wa' : 'bg-cream-200'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow ${
                      form.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="text-sm font-medium text-brown-600">
                    {form.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-brown-400 uppercase tracking-wider">Urutan</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => set('sortOrder', Number(e.target.value))}
                    min={0}
                    className="form-input w-20"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-green-wa text-white font-semibold rounded-xl
                             hover:bg-green-wa-light transition-colors active:scale-95
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Menyimpan...' : '✓ Simpan'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-brown-700 text-cream-100 font-semibold rounded-xl
                             hover:bg-brown-600 transition-colors active:scale-95"
                >
                  ✕ Batal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
