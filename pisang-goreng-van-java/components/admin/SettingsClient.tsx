'use client'
// components/admin/SettingsClient.tsx
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Setting { id: string; key: string; value: string; label: string | null; group: string }
interface Props { settings: Setting[]; adminName: string }

const GROUP_ICONS: Record<string, string> = {
  general: '🏪', contact: '📞', social: '📱', content: '📝', about: '🌟', home: '🏠'
}
const GROUP_LABELS: Record<string, string> = {
  general: 'Informasi Toko', contact: 'Kontak & Alamat', social: 'Media Sosial', content: 'Konten Website', about: 'Tentang Kami', home: 'Beranda (Home)'
}

export default function SettingsClient({ settings, adminName }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map(s => [s.key, s.value]))
  )
  const [saving,    setSaving]    = useState(false)
  const [pwForm,    setPwForm]    = useState({ current: '', newPw: '', confirm: '' })
  const [savingPw,  setSavingPw]  = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const groups = [...new Set([...settings.map(s => s.group), 'home', 'about', 'contact'])]

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeTab === 'about' || activeTab === 'home' || activeTab === 'contact' || activeTab === 'store') {
        const payload = Object.fromEntries(
          Object.entries(values).filter(([key]) => key.startsWith(activeTab + '_') || (activeTab === 'contact' && key.startsWith('kontak_')))
        )
        const res = await fetch('/api/admin/settings/bulk-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group: activeTab, payload }),
        })
        const data = await res.json()
        if (res.ok) toast.success(`Data ${GROUP_LABELS[activeTab]} berhasil disimpan!`)
        else toast.error(data.error || 'Gagal menyimpan data')
      } else {
        const res  = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: Object.entries(values).filter(([key]) => settings.find(s => s.key === key)?.group === activeTab).map(([key, value]) => ({ key, value })) }),
        })
        const data = await res.json()
        if (data.success) toast.success('Pengaturan berhasil disimpan!')
        else toast.error(data.error || 'Gagal menyimpan')
      }
    } catch { toast.error('Koneksi bermasalah') }
    finally { setSaving(false) }
  }

  const handlePasswordChange = async () => {
    if (!pwForm.current || !pwForm.newPw) { toast.error('Isi semua field password'); return }
    if (pwForm.newPw !== pwForm.confirm)  { toast.error('Konfirmasi password tidak cocok'); return }
    if (pwForm.newPw.length < 6)          { toast.error('Password minimal 6 karakter'); return }
    setSavingPw(true)
    try {
      const res  = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      })
      const data = await res.json()
      if (data.success) { toast.success('Password berhasil diubah!'); setPwForm({ current: '', newPw: '', confirm: '' }) }
      else toast.error(data.error || 'Gagal mengubah password')
    } catch { toast.error('Koneksi bermasalah') }
    finally { setSavingPw(false) }
  }

  const groupSettings = settings.filter(s => s.group === activeTab)

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-amber-brand text-xs font-semibold tracking-[0.2em] uppercase mb-1">Admin</div>
          <h1 className="font-serif text-2xl font-bold text-brown-700">⚙️ Pengaturan</h1>
          <p className="text-sm text-brown-400 mt-0.5">Kelola konfigurasi website dan akun admin</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-brown disabled:opacity-60">
          {saving ? 'Menyimpan...' : '💾 Simpan Semua'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar tabs */}
        <div className="space-y-1">
          {groups.map(g => (
            <button key={g} onClick={() => setActiveTab(g)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === g ? 'bg-brown-700 text-white' : 'text-brown-600 hover:bg-cream-200'
              }`}>
              <span>{GROUP_ICONS[g] || '⚙️'}</span>
              <span>{GROUP_LABELS[g] || g}</span>
            </button>
          ))}
          <button onClick={() => setActiveTab('password')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'password' ? 'bg-brown-700 text-white' : 'text-brown-600 hover:bg-cream-200'
            }`}>
            <span>🔐</span><span>Ubah Password</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
          {activeTab === 'password' ? (
            <>
              <h2 className="font-serif text-lg font-bold text-brown-700 mb-1">🔐 Ubah Password Admin</h2>
              <p className="text-xs text-brown-400 mb-5">Akun: <strong>{adminName}</strong></p>
              <div className="space-y-4 max-w-sm">
                {[
                  { label: 'Password Lama', key: 'current', placeholder: '••••••••' },
                  { label: 'Password Baru', key: 'newPw',   placeholder: 'Minimal 6 karakter' },
                  { label: 'Konfirmasi',    key: 'confirm', placeholder: 'Ulangi password baru' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">{label}</label>
                    <input type="password" value={pwForm[key as keyof typeof pwForm]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder} className="form-input" />
                  </div>
                ))}
                <button onClick={handlePasswordChange} disabled={savingPw}
                  className="w-full py-3 bg-brown-700 text-white font-semibold rounded-xl hover:bg-brown-600 transition-colors disabled:opacity-60">
                  {savingPw ? 'Menyimpan...' : '🔐 Ubah Password'}
                </button>
              </div>
            </>
          ) : activeTab === 'about' ? (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-brown-700 mb-1">🌟 Pengaturan Tentang Kami</h2>
              <p className="text-sm text-brown-400 mb-6 border-b border-cream-200 pb-4">
                Atur narasi dan cerita di halaman Tentang Kami.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Hero Title</label>
                  <input type="text"
                    value={values['about_hero_title'] || ''}
                    onChange={e => setValues({ ...values, ['about_hero_title']: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all"
                    placeholder="Contoh: Pisang Goreng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Hero Subtitle</label>
                  <input type="text"
                    value={values['about_hero_subtitle'] || ''}
                    onChange={e => setValues({ ...values, ['about_hero_subtitle']: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all"
                    placeholder="Contoh: Van Java"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Deskripsi Utama 1</label>
                  <textarea
                    value={values['about_desc1'] || ''}
                    onChange={e => setValues({ ...values, ['about_desc1']: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Deskripsi Utama 2</label>
                  <textarea
                    value={values['about_desc2'] || ''}
                    onChange={e => setValues({ ...values, ['about_desc2']: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Story Title</label>
                  <input type="text"
                    value={values['about_story_title'] || ''}
                    onChange={e => setValues({ ...values, ['about_story_title']: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Story Subtitle</label>
                  <input type="text"
                    value={values['about_story_subtitle'] || ''}
                    onChange={e => setValues({ ...values, ['about_story_subtitle']: e.target.value })}
                    className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'home' ? (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-brown-700 mb-1">🏠 Pengaturan Beranda (Home)</h2>
              <p className="text-sm text-brown-400 mb-6 border-b border-cream-200 pb-4">
                Atur narasi utama di halaman beranda.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Hero Title</label>
                  <input type="text" value={values['home_hero_title'] || ''} onChange={e => setValues({ ...values, ['home_hero_title']: e.target.value })} className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Hero Subtitle</label>
                  <input type="text" value={values['home_hero_subtitle'] || ''} onChange={e => setValues({ ...values, ['home_hero_subtitle']: e.target.value })} className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all" />
                </div>
              </div>
            </div>
          ) : activeTab === 'contact' ? (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-brown-700 mb-1">📞 Pengaturan Kontak & Lokasi</h2>
              <p className="text-sm text-brown-400 mb-6 border-b border-cream-200 pb-4">
                Kelola informasi kontak dan URL Map.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">WhatsApp CS</label>
                  <input type="text" value={values['kontak_whatsapp'] || ''} onChange={e => setValues({ ...values, ['kontak_whatsapp']: e.target.value })} className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all" placeholder="628123456789" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Alamat Lengkap</label>
                  <textarea value={values['kontak_alamat'] || ''} onChange={e => setValues({ ...values, ['kontak_alamat']: e.target.value })} className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all" rows={3} />
                </div>
              </div>
            </div>
          ) : activeTab === 'store' ? (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-brown-700 mb-1">🏪 Pengaturan Toko</h2>
              <p className="text-sm text-brown-400 mb-6 border-b border-cream-200 pb-4">
                Kelola biaya dan pengaturan operasional.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brown-700 mb-1">Biaya Pengiriman / Delivery Fee (Flat Rate)</label>
                  <input type="number" value={values['store_delivery_fee'] || '0'} onChange={e => setValues({ ...values, ['store_delivery_fee']: e.target.value })} className="w-full bg-cream-50 border border-cream-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand/50 transition-all" placeholder="Contoh: 10000" />
                  <div className="text-xs text-brown-400 mt-1">Akan otomatis ditambahkan ke total belanja ketika pelanggan memilih metode "Pesan Antar (Delivery)".</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="font-serif text-lg font-bold text-brown-700 mb-1">{GROUP_ICONS[activeTab]} {GROUP_LABELS[activeTab] || activeTab}</h2>
              <p className="text-sm text-brown-400 mb-6 border-b border-cream-200 pb-4">
                Atur nilai pengaturan untuk kategori ini.
              </p>
              <div className="space-y-4">
                {groupSettings.map(s => {
                  const isBoolean = values[s.key] === 'true' || values[s.key] === 'false' || s.value === 'true' || s.value === 'false';
                  return (
                  <div key={s.key}>
                    <label className="block text-xs font-semibold text-brown-400 uppercase tracking-wider mb-1.5">
                      {s.label || s.key}
                    </label>
                    {isBoolean ? (
                      <button
                        onClick={() => setValues(v => ({ ...v, [s.key]: v[s.key] === 'true' ? 'false' : 'true' }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          values[s.key] === 'true' ? 'bg-secondary' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            values[s.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (values[s.key] || '').length > 80 ? (
                      <textarea value={values[s.key] || ''} onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                        rows={3} className="form-input resize-none" />
                    ) : (
                      <input type="text" value={values[s.key] || ''} onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                        className="form-input" />
                    )}
                    <div className="text-xs text-brown-300 mt-1 font-mono">{s.key}</div>
                  </div>
                )})}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
