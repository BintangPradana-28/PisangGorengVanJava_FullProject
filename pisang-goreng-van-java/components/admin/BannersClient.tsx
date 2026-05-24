'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { Banner } from '@prisma/client'

export default function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(false)

  const emptyForm = { title: '', subtitle: '', badge: '', imageUrl: '', isActive: false, linkUrl: '' }
  const [form, setForm] = useState(emptyForm)

  const handleOpenModal = (b?: Banner) => {
    if (b) {
      setEditingBanner(b)
      setForm({
        title: b.title,
        subtitle: b.subtitle || '',
        badge: b.badge || '',
        imageUrl: b.imageUrl || '',
        isActive: b.isActive,
        linkUrl: b.linkUrl || ''
      })
    } else {
      setEditingBanner(null)
      setForm(emptyForm)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners'
      const method = editingBanner ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingBanner ? 'Banner diperbarui' : 'Banner ditambahkan')
        if (data.data.isActive) {
          // deactivate others
          setBanners(prev => prev.map(b => b.id === data.data.id ? data.data : { ...b, isActive: false }))
        } else {
          setBanners(prev => {
            const exists = prev.find(b => b.id === data.data.id)
            if (exists) return prev.map(b => b.id === data.data.id ? data.data : b)
            return [data.data, ...prev]
          })
        }
        setShowModal(false)
      } else {
        toast.error('Gagal menyimpan banner')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus banner ini?')) return
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Banner dihapus')
        setBanners(prev => prev.filter(b => b.id !== id))
      }
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.data.isActive ? 'Banner diaktifkan' : 'Banner dinonaktifkan')
        if (data.data.isActive) {
          setBanners(prev => prev.map(b => b.id === data.data.id ? data.data : { ...b, isActive: false }))
        } else {
          setBanners(prev => prev.map(b => b.id === data.data.id ? data.data : b))
        }
      }
    } catch {
      toast.error('Gagal mengubah status')
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-cream-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-brown-700">Manajemen Banner</h2>
          <p className="text-sm text-brown-400">Atur hero banner dan promo halaman utama</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-amber-brand text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-amber-600 transition">
          + Tambah Banner
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream-100 text-brown-500 text-xs uppercase tracking-wider">
              <th className="p-4 rounded-l-xl">Preview</th>
              <th className="p-4">Teks Promo</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 rounded-r-xl text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {banners.map(b => (
              <tr key={b.id} className="border-b border-cream-100 last:border-0 hover:bg-cream-50 transition">
                <td className="p-4">
                  {b.imageUrl ? (
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-cream-200">
                      <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded-lg bg-cream-200 flex items-center justify-center text-xs text-brown-400">No Image</div>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-xs font-bold text-amber-brand mb-1">{b.badge || '-'}</div>
                  <div className="font-serif font-bold text-brown-700">{b.title}</div>
                  <div className="text-xs text-brown-400 max-w-xs truncate">{b.subtitle || '-'}</div>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => toggleActive(b)} className={`px-3 py-1 text-xs font-bold rounded-full transition ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {b.isActive ? 'Aktif (Ditampilkan)' : 'Nonaktif'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenModal(b)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg mr-2">✏️</button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">🗑️</button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-brown-400">Belum ada banner promo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="font-serif font-bold text-xl mb-4">{editingBanner ? 'Edit Banner' : 'Tambah Banner'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-brown-500 font-semibold mb-1">Badge (Opsional)</label>
                <input value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} placeholder="PROMO SPESIAL" className="w-full p-2 rounded-xl border border-cream-200" />
              </div>
              <div>
                <label className="block text-brown-500 font-semibold mb-1">Judul Utama *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full p-2 rounded-xl border border-cream-200" />
              </div>
              <div>
                <label className="block text-brown-500 font-semibold mb-1">Sub Judul (Opsional)</label>
                <textarea value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full p-2 rounded-xl border border-cream-200 resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-brown-500 font-semibold mb-1">URL Gambar</label>
                <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." type="url" className="w-full p-2 rounded-xl border border-cream-200" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-green-wa text-white font-bold py-3 rounded-xl">{loading ? '...' : 'Simpan'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-cream-200 text-brown-600 font-bold py-3 rounded-xl">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
