'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { CartProvider } from '@/context/CartContext'
import { SettingsProvider } from '@/context/SettingsContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <CartProvider>
              {children}
              <Toaster position="top-center" reverseOrder={false} />
            </CartProvider>
          </SettingsProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
