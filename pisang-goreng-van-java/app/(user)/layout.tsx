// app/(user)/layout.tsx
import type { Metadata } from 'next'
import Navbar from '@/components/user/Navbar'

export const metadata: Metadata = {
  title: 'Pisang Goreng Van Java',
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
