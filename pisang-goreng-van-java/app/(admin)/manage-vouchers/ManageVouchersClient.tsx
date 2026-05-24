'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface Voucher {
  id: string
  code: string
  discountType: string
  discountValue: number
  minPurchase: number
  maxDiscount: number | null
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  applicableTo: string
}

export default function ManageVouchersClient() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchase: '0',
    maxDiscount: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    usageLimit: '0',
    applicableTo: 'ALL',
    isActive: true
  })

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/admin/vouchers')
      const data = await res.json()
      if (data.success) {
        setVouchers(data.data)
      }
    } catch (err) {
      toast.error('Gagal mengambil data voucher')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher ini?')) return
    try {
      const res = await fetch(`/api/admin/vouchers?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Voucher dihapus')
        fetchVouchers()
      } else {
        toast.error('Gagal menghapus voucher')
      }
    } catch (err) {
      toast.error('Gagal menghapus voucher')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      })
      if (res.ok) {
        toast.success('Status diubah')
        fetchVouchers()
      } else {
        toast.error('Gagal mengubah status')
      }
    } catch (err) {
      toast.error('Gagal mengubah status')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          minPurchase: parseFloat(formData.minPurchase),
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          usageLimit: parseInt(formData.usageLimit),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Voucher berhasil ditambahkan')
        setIsModalOpen(false)
        fetchVouchers()
        // Reset form
        setFormData({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: '',
          minPurchase: '0',
          maxDiscount: '',
          startDate: new Date().toISOString().slice(0, 16),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          usageLimit: '0',
          applicableTo: 'ALL',
          isActive: true
        })
      } else {
        toast.error(data.error || 'Gagal menambahkan voucher')
      }
    } catch (err) {
      toast.error('Gagal menambahkan voucher')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-serif text-brown">Manajemen Voucher</h1>
          <p className="text-zinc-500 text-sm mt-1">Kelola kupon diskon untuk pelanggan dan reseller.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#2E7D32] hover:bg-[#236026] text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span>+</span> Tambah Voucher
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown"></div>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 text-center">
          <p className="text-zinc-500 mb-4">Belum ada voucher yang dibuat.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl text-sm font-semibold transition-colors"
          >
            Buat Voucher Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kode & Tipe</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Diskon</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Syarat & Target</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Masa Berlaku</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Terpakai</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/50">
                  <td className="p-4">
                    <div className="font-mono font-bold text-sm text-brown mb-1">{v.code}</div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800">
                      {v.discountType === 'PERCENTAGE' ? 'Persentase' : 'Nominal'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium">
                    {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : `Rp ${v.discountValue.toLocaleString('id-ID')}`}
                    {v.maxDiscount && (
                      <div className="text-xs text-zinc-500 font-normal mt-1">
                        Max: Rp {v.maxDiscount.toLocaleString('id-ID')}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-xs mb-1">
                      <span className="text-zinc-500">Min. Trx:</span> Rp {v.minPurchase.toLocaleString('id-ID')}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      v.applicableTo === 'ALL' ? 'bg-blue-100 text-blue-800' :
                      v.applicableTo === 'RESELLER' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Target: {v.applicableTo}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-xs mb-1"><span className="text-zinc-500">Mulai:</span> {new Date(v.startDate).toLocaleDateString('id-ID')}</div>
                    <div className="text-xs"><span className="text-zinc-500">Akhir:</span> {new Date(v.endDate).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium">
                      {v.usedCount} <span className="text-zinc-400 font-normal">/ {v.usageLimit === 0 ? '?' : v.usageLimit}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(v.id, v.isActive)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        v.isActive ? 'bg-[#2E7D32]' : 'bg-zinc-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          v.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah Voucher */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white z-20">
                <h3 className="text-lg font-bold font-serif text-brown">Buat Voucher Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Kode Voucher</label>
                  <input
                    type="text" required value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="Contoh: PROMO50"
                    className="w-full p-3 border border-zinc-200 rounded-xl font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Tipe Diskon</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="w-full p-3 border border-zinc-200 rounded-xl"
                    >
                      <option value="PERCENTAGE">Persentase (%)</option>
                      <option value="FIXED">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Nilai Diskon</label>
                    <input
                      type="number" required min="1" value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                      placeholder={formData.discountType === 'PERCENTAGE' ? "Contoh: 10" : "Contoh: 15000"}
                      className="w-full p-3 border border-zinc-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Minimal Transaksi (Rp)</label>
                    <input
                      type="number" min="0" value={formData.minPurchase}
                      onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                      className="w-full p-3 border border-zinc-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Maksimal Diskon (Rp)</label>
                    <input
                      type="number" min="0" value={formData.maxDiscount}
                      onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                      placeholder="Kosongkan jika tak terbatas"
                      className="w-full p-3 border border-zinc-200 rounded-xl"
                      disabled={formData.discountType === 'FIXED'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Berlaku Dari</label>
                    <input
                      type="datetime-local" required value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-3 border border-zinc-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Berlaku Sampai</label>
                    <input
                      type="datetime-local" required value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full p-3 border border-zinc-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Limit Pemakaian</label>
                    <input
                      type="number" min="0" value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      placeholder="0 = Tak terbatas"
                      className="w-full p-3 border border-zinc-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Target Pengguna</label>
                    <select
                      value={formData.applicableTo}
                      onChange={(e) => setFormData({...formData, applicableTo: e.target.value})}
                      className="w-full p-3 border border-zinc-200 rounded-xl"
                    >
                      <option value="ALL">Semua Pelanggan</option>
                      <option value="CUSTOMER">Customer Biasa Saja</option>
                      <option value="RESELLER">Reseller Saja</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-zinc-600 font-medium hover:bg-zinc-100 rounded-xl transition-colors">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-brown text-white font-medium hover:bg-brown/90 rounded-xl transition-colors">
                    Simpan Voucher
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
