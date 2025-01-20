import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://main.d1ugma8atmy23b.amplifyapp.com/'),
  title: {
    default: 'BizNameAI - Modern Business Name Generator',
    template: '%s | BizNameAI'
  },
  description: 'Generate unique, catchy, and trendy business names using AI. Perfect for startups, brands, and companies looking for modern, memorable names.',
  keywords: ['business name generator', 'AI name generator', 'startup name', 'brand name', 'company name', 'business naming tool', 'AI branding'],
  authors: [{ name: 'BizNameAI Team' }],
  creator: 'BizNameAI Team',
  publisher: 'BizNameAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BizNameAI - Modern Business Name Generator',
    description: 'Generate unique, catchy, and trendy business names using AI',
    url: 'https://main.d1ugma8atmy23b.amplifyapp.com/',
    siteName: 'BizNameAI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BizNameAI - Modern Business Name Generator',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizNameAI - Modern Business Name Generator',
    description: 'Generate unique, catchy, and trendy business names using AI',
    images: ['/og-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={inter.className}>{children}</body>
      <SpeedInsights/>
      <Analytics/>
    </html>
  )
}
