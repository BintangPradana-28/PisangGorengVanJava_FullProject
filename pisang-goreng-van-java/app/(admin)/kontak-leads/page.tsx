// app/(admin)/kontak-leads/page.tsx
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/features/auth/authOptions"
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Prospek Kontak | Admin' }

export default async function KontakLeadsPage() {
  // 1. THE IRON GATE (Auth Verification)
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login')
  }

  // 2. FETCH LEADS (Secure Prisma Query)
  const leads = await prisma.contactLead.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      message: true,
      ipAddress: true,
      userAgent: true,
      isConsent: true,
      createdAt: true
    }
  })

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-cream-100">
        <h1 className="font-serif text-3xl font-bold text-brown-800 mb-2">PROSPEK KONTAK</h1>
        <p className="text-sm text-brown-600 mb-8">Daftar pesan pelanggan dari halaman Lokasi & Kontak (Terenkripsi & Compliant PDP).</p>

        <div className="bg-white rounded-2xl shadow-sm border border-brown-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-brown-700">
              <thead className="bg-brown-50 border-b border-brown-200 text-brown-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Nama Prospek</th>
                  <th className="px-6 py-4 font-semibold">Pesan</th>
                  <th className="px-6 py-4 font-semibold">IP Address / OS</th>
                  <th className="px-6 py-4 font-semibold">Status Consent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-brown-400 italic">
                      Belum ada prospek kontak masuk.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-brown-800">
                          {lead.createdAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-brown-500">
                          {lead.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-brown-900">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={lead.message}>
                        {lead.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-brown-600">{lead.ipAddress || 'Unknown IP'}</div>
                        <div className="text-[10px] text-brown-400 max-w-[120px] truncate" title={lead.userAgent || ''}>
                          {lead.userAgent || 'Unknown OS'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.isConsent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Disetujui
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
