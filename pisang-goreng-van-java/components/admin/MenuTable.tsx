'use client'
// components/admin/MenuTable.tsx
import { useState } from 'react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { MenuVariant } from '@/data/types'
import { formatPriceShort } from '@/lib/utils'
import AddEditMenuModal from './AddEditMenuModal'

interface Props {
  initialVariants: MenuVariant[]
}

export default function MenuTable({ initialVariants }: Props) {
  const [variants,   setVariants]   = useState<MenuVariant[]>(initialVariants)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState<MenuVariant | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search,     setSearch]     = useState('')

  const filtered = variants.filter((v) =>
    v.flavorName.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd  = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (v: MenuVariant) => { setEditItem(v); setModalOpen(true) }

  const handleSaved = (saved: MenuVariant) => {
    setVariants((prev) => {
      const idx = prev.findIndex((v) => v.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus menu "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return
    setDeletingId(id)
    try {
      const res  = await fetch(`/api/menu/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setVariants((prev) => prev.filter((v) => v.id !== id))
        toast.success('Menu berhasil dihapus!')
      } else {
        toast.error(data.error || 'Gagal menghapus')
      }
    } catch {
      toast.error('Koneksi bermasalah')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (v: MenuVariant) => {
    try {
      const res  = await fetch(`/api/menu/${v.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flavorName:   v.flavorName,
          priceKembung: v.prices.kembung,
          priceLumpia:  v.prices.lumpia,
          priceKrispy:  v.prices.krispy,
          isActive:     !v.isActive,
          sortOrder:    v.sortOrder,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setVariants((prev) => prev.map((item) =>
          item.id === v.id ? { ...item, isActive: !item.isActive } : item
        ))
        toast.success(`Menu ${!v.isActive ? 'diaktifkan' : 'dinonaktifkan'}`)
      }
    } catch {
      toast.error('Gagal mengubah status')
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-5">
        <div>
          <h2 className="font-serif text-xl font-bold text-brown-700">Kelola Menu Pisang Goreng</h2>
          <p className="text-xs text-brown-400 mt-0.5">{variants.length} varian rasa terdaftar</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Cari varian..."
            className="form-input flex-1 sm:w-48"
          />
          <button
            onClick={openAdd}
            className="btn-brown whitespace-nowrap"
          >
            + Tambah Menu
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brown-700 text-white">
                <th className="text-left px-4 py-3 font-semibold w-10">No</th>
                <th className="text-left px-4 py-3 font-semibold w-14">Gambar</th>
                <th className="text-left px-4 py-3 font-semibold">Nama Varian</th>
                <th className="text-center px-4 py-3 font-semibold">Kembung</th>
                <th className="text-center px-4 py-3 font-semibold">Lumpia</th>
                <th className="text-center px-4 py-3 font-semibold">Krispy</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
                <th className="text-center px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-brown-300">
                    <div className="text-4xl mb-2">🍌</div>
                    <div className="font-medium">Tidak ada menu ditemukan</div>
                  </td>
                </tr>
              ) : (
                filtered.map((v, i) => (
                  <tr key={v.id} className="border-t border-cream-200 hover:bg-cream-100 transition-colors">
                    <td className="px-4 py-3 text-brown-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      {v.imageUrl ? (
                        <Image src={v.imageUrl} alt={v.flavorName} width={40} height={40}
                             className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-brown-400
                                        flex items-center justify-center text-xl">
                          🍌
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brown-700">{v.flavorName}</td>
                    <td className="px-4 py-3 text-center text-brown-500">{formatPriceShort(v.prices.kembung)}</td>
                    <td className="px-4 py-3 text-center text-brown-500">{formatPriceShort(v.prices.lumpia)}</td>
                    <td className="px-4 py-3 text-center text-brown-500">{formatPriceShort(v.prices.krispy)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(v)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                          v.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {v.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="px-3 py-1.5 bg-amber-brand text-white text-xs font-semibold
                                     rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.flavorName)}
                          disabled={deletingId === v.id}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold
                                     rounded-lg hover:bg-red-600 transition-colors
                                     disabled:opacity-50"
                        >
                          {deletingId === v.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditMenuModal
        open={modalOpen}
        editItem={editItem}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </>
  )
}
