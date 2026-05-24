'use client'
// components/admin/ToppingsClient.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface Topping { id: string; name: string; price: number; emoji: string | null; isActive: boolean }
interface ToppingForm { name: string; price: number; emoji: string; isActive: boolean }

const EMPTY: ToppingForm = { name: '', price: 2000, emoji: '✨', isActive: true }

export default function ToppingsClient({ initialToppings }: { initialToppings: Topping[] }) {
  const [toppings,  setToppings]  = useState<Topping[]>(initialToppings)
  const [form,      setForm]      = useState<ToppingForm>(EMPTY)
  const [editId,    setEditId]    = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving,    setSaving]    = useState(false)

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setModalOpen(true) }
  const openEdit = (t: Topping) => {
    setForm({ name: t.name, price: t.price, emoji: t.emoji || '✨', isActive: t.isActive })
    setEditId(t.id); setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error('Nama topping wajib diisi'); return }
    setSaving(true)
    try {
      const url    = editId ? `/api/toppings/${editId}` : '/api/toppings'
      const method = editId ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data   = await res.json()
      if (data.success) {
        if (editId) setToppings(prev => prev.map(t => t.id === editId ? data.data : t))
        else        setToppings(prev => [...prev, data.data])
        toast.success(editId ? 'Topping diupdate!' : 'Topping ditambahkan!')
        setModalOpen(false)
      } else toast.error(data.error || 'Gagal menyimpan')
    } catch { toast.error('Koneksi bermasalah') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus topping "${name}"?`)) return
    try {
      const res  = await fetch(`/api/toppings/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { setToppings(prev => prev.filter(t => t.id !== id)); toast.success('Topping dihapus!') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menghapus') }
  }

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-amber-brand text-xs font-semibold tracking-[0.2em] uppercase mb-1">Menu</div>
          <h1 className="font-serif text-2xl font-bold text-brown-700">Kelola Topping</h1>
          <p className="text-xs text-brown-400 mt-0.5">{toppings.length} topping terdaftar · Harga flat +Rp 2.000</p>
        </div>
        <button onClick={openAdd} className="btn-brown">+ Tambah Topping</button>
      </div>

      {/* Topping cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {toppings.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-cream-200 p-5 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-cream-100 flex items-center justify-center text-3xl flex-shrink-0">
              {t.emoji || '✨'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-brown-700 truncate">{t.name}</div>
              <div className="text-sm text-amber-brand font-medium">+{formatPrice(t.price)}</div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>{t.isActive ? 'Aktif' : 'Nonaktif'}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => openEdit(t)}
                className="px-3 py-1.5 bg-amber-brand text-white text-xs font-semibold rounded-lg hover:bg-amber-600">
                ✏️
              </button>
              <button onClick={() => handleDelete(t.id, t.name)}
                className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-amber-brand/10 border border-amber-brand/30 rounded-2xl p-4 text-sm text-brown-600">
        <strong>ℹ️ Info:</strong> Semua topping dikenakan harga flat <strong>+Rp 2.000</strong> untuk setiap varian menu. Topping yang nonaktif tidak akan muncul di halaman customer.
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="bg-cream-100 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-serif text-lg font-bold text-brown-700">{editId ? 'Edit Topping' : 'Tambah Topping'}</h2>
                <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-brown-500">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">Nama Topping *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" placeholder="e.g. Keju" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">Harga (IDR)</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} className="form-input" min={0} step={500} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">Emoji</label>
                    <input type="text" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="form-input" placeholder="🧀" maxLength={4} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-wa' : 'bg-cream-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm font-medium text-brown-600">{form.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-3 bg-green-wa text-white font-semibold rounded-xl hover:bg-green-wa-light disabled:opacity-60">
                    {saving ? 'Menyimpan...' : '✓ Simpan'}
                  </button>
                  <button onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 bg-brown-700 text-white font-semibold rounded-xl hover:bg-brown-600">
                    ✕ Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
