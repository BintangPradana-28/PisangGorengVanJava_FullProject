import { Metadata } from 'next'
import ManageVouchersClient from './ManageVouchersClient'

export const metadata: Metadata = {
  title: 'Manajemen Voucher - Admin Panel',
  description: 'Kelola kode promo dan diskon untuk pelanggan dan reseller',
}

export default function ManageVouchersPage() {
  return <ManageVouchersClient />
}
