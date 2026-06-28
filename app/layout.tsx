import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})
const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Aurelia — Luxury Skincare, Reimagined',
  description:
    'Aurelia crafts elevated skincare rituals with gold-infused serums, botanical oils, and dermatologist-formulated essentials for radiant, luminous skin.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`light bg-background ${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${jost.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
