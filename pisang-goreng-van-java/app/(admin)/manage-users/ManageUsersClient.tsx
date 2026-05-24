'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface UserType {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

export default function ManageUsersClient() {
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const json = await res.json()
      if (json.success) {
        setUsers(json.data)
      } else {
        toast.error(json.message)
      }
    } catch (err) {
      toast.error('Gagal memuat pengguna')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const toastId = toast.loading('Mengubah peran...')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.message || 'Gagal mengubah peran')
      
      toast.success(json.message, { id: toastId })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    }
  }

  if (isLoading) return <div className="text-center py-10">Memuat data...</div>

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-cream-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brown-700 text-cream-100 uppercase text-xs tracking-wider">
              <th className="p-4 font-semibold">Nama</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200 text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-cream-50 transition-colors">
                <td className="p-4 font-medium text-brown-800">{user.name || 'User Baru'}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    user.role === 'RESELLER' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {user.role !== 'ADMIN' && (
                    <select
                      className="border border-cream-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brown-500"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="CUSTOMER">Customer (Regular)</option>
                      <option value="RESELLER">Reseller (Grosir)</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada pengguna terdaftar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
