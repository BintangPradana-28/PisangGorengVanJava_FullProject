// app/layout.tsx
import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Newsreader } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['600', '700'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: {
    default: 'Pisang Goreng Van Java',
    template: '%s | Pisang Goreng Van Java',
  },
  description:
    'Pisang Goreng premium dengan resep autentik Jawa. 12+ varian rasa, 3 tipe — Kembung, Lumpia, Krispy. Pesan via WhatsApp!',
  keywords: ['pisang goreng', 'van java', 'jajanan', 'sleman', 'yogyakarta', 'street food'],
  openGraph: {
    title: 'Pisang Goreng Van Java',
    description: 'Premium banana fritters with authentic Javanese recipes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${beVietnamPro.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var system = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (system ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
        
        {/* LocalBusiness JSON-LD Schema Markup for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FoodEstablishment",
              "name": "Pisang Goreng Van Java",
              "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCuoAcWHG4QUqFwzpuBNIiaBkLcJz1LV9m6p9PxV2_qn2WSGWrEBvMDt8FRrqMy_OoFbvbxPhWt-rkUfOJb6etQcez1ASToorW3mXf5JS_xl10v3v70igMCcIrAMpBGGaEu04I3Of3ciTtE2-7xONBem-5vFcik2fJR33PPVUjV0FJFGjlkjfzgQPrhIoCaiuE8cwWt7W1RSkuSY1Z9FKR9sgdyodxJg59Nruc3CsWtal9atky3HkE_WCrMJk7WkLsMqPddUVASBgtH",
              "@id": "",
              "url": "https://pisanggorengvanjava.com",
              "telephone": "+6281312167554",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Jl. Raya Cilangkap l Rt.2/Rw.5, Cilangkap",
                "addressLocality": "Jakarta Timur",
                "addressRegion": "DKI Jakarta",
                "postalCode": "13870",
                "addressCountry": "ID"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -7.7289873,
                "longitude": 110.2958252
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "10:00",
                "closes": "21:00"
              },
              "servesCuisine": "Indonesian Fritters, Snacks",
              "priceRange": "$"
            })
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
