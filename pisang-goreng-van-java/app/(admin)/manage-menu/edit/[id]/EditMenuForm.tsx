'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'
import { MenuVariantFormData } from '@/data/types'

interface EditMenuFormProps {
  id: string;
  initialData: MenuVariantFormData;
}

export default function EditMenuForm({ id, initialData }: EditMenuFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>(initialData.imageUrl || '')
  const [form, setForm] = useState<MenuVariantFormData>(initialData)

  const set = (key: keyof MenuVariantFormData, val: any) => setForm((p) => ({ ...p, [key]: val }))

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        set('imageUrl', data.data.url)
        setPreviewUrl(data.data.url)
        toast.success('Gambar berhasil diupload!')
      } else {
        toast.error(data.error || 'Upload gagal')
      }
    } catch { 
      toast.error('Upload gagal') 
    } finally { 
      setUploading(false) 
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.flavorName) { 
      toast.error('Nama varian wajib diisi'); 
      return 
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          priceKembung: Number(form.priceKembung),
          priceLumpia:  Number(form.priceLumpia),
          priceKrispy:  Number(form.priceKrispy),
          sortOrder:    Number(form.sortOrder),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Menu berhasil diupdate!')
        setTimeout(() => router.push('/manage-menu'), 800)
      } else { 
        toast.error(data.error || 'Gagal menyimpan') 
      }
    } catch { 
      toast.error('Koneksi bermasalah') 
    } finally { 
      setSaving(false) 
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Flavor name */}
        <div>
          <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">Nama Varian Rasa *</label>
          <input type="text" value={form.flavorName} onChange={(e) => set('flavorName', e.target.value)}
            className="form-input" placeholder="e.g. Matcha Milky" required />
        </div>

        {/* Prices */}
        <div>
          <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-2">Harga per Tipe (IDR) *</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'priceKembung', label: 'Kembung (Isi 15)' },
              { key: 'priceLumpia',  label: 'Lumpia (Isi 6)'   },
              { key: 'priceKrispy',  label: 'Krispy (Isi 5)'   },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-brown-400 mb-1">{label}</label>
                <input type="number" value={form[key as keyof typeof form] as number}
                  onChange={(e) => set(key as keyof MenuVariantFormData, e.target.value)} min={5000} step={1000}
                  className="form-input" required />
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">Deskripsi</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
            rows={3} className="form-input resize-none" placeholder="Deskripsi singkat menu..." />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-2">Gambar Menu</label>
          {previewUrl && (
            <div className="mb-3 relative w-40 h-40 rounded-xl overflow-hidden border border-cream-200">
              <Image src={previewUrl} alt="preview" fill className="object-cover" />
              <button type="button" onClick={() => { setPreviewUrl(''); set('imageUrl', '') }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                ✕
              </button>
            </div>
          )}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}
            className="w-full h-28 border-2 border-dashed border-cream-200 rounded-xl flex flex-col items-center
                        justify-center cursor-pointer hover:border-amber-brand hover:bg-cream-100 transition-all gap-1"
          >
            {uploading
              ? <><div className="text-2xl animate-spin">⏳</div><span className="text-sm text-brown-400">Mengupload...</span></>
              : <><div className="text-3xl">📷</div><span className="text-sm text-brown-400">Klik atau seret gambar ke sini</span><span className="text-xs text-brown-300">JPG, PNG, WEBP — maks 5 MB</span></>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }} />
          <div className="mt-2">
            <label className="block text-xs text-brown-400 mb-1">atau masukkan URL gambar</label>
            <input type="url" value={form.imageUrl || ''} onChange={(e) => { set('imageUrl', e.target.value); setPreviewUrl(e.target.value) }}
              className="form-input" placeholder="https://example.com/gambar.jpg" />
          </div>
        </div>

        {/* Status + Sort */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => set('isActive', !form.isActive)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-wa' : 'bg-cream-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-medium text-brown-600">{form.isActive ? 'Aktif' : 'Nonaktif'}</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-brown-400 uppercase tracking-wider">Urutan</label>
            <input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} min={0} className="form-input w-20" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 py-3 bg-green-wa text-white font-semibold rounded-xl hover:bg-green-wa-light transition-colors disabled:opacity-60">
            {saving ? 'Menyimpan...' : '✓ Simpan Perubahan'}
          </button>
          <Link href="/manage-menu"
            className="flex-1 py-3 bg-brown-700 text-cream-100 font-semibold rounded-xl hover:bg-brown-600 transition-colors text-center">
            ✕ Batal
          </Link>
        </div>
      </form>
    </>
  )
}
