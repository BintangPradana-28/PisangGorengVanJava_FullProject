// app/(admin)/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin Panel', template: '%s | Admin Van Java' },
  robots: { index: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100 font-sans">
      {children}
    </div>
  )
}
