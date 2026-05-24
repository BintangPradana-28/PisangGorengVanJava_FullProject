import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/features/auth/authOptions";
import AdminSidebar from '@/components/admin/AdminSidebar'
import ManageUsersClient from './ManageUsersClient';

export default async function ManageUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-cream-100">
        <h1 className="font-serif text-3xl font-bold text-brown-800 mb-6">PENGGUNA & RESELLER</h1>
        <ManageUsersClient />
      </main>
    </div>
  )
}
