import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import {
  APP_NAME,
  APP_URL,
  AUTHOR_NAME,
  AUTHOR_URL,
  DEFAULT_DIR,
  DEFAULT_LANG,
} from '@/config/constants/main'
import { siteMeta } from '@/config/site-meta'

import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fracktif = localFont({
  src: [
    {
      path: './fonts/FracktifMedium/fracktif-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/FracktifSemiBold/fracktif-semibold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-fracktif',
})

export const metadata: Metadata = {
  title: {
    default: siteMeta.title as string,
    template: `%s | ${siteMeta.title}`,
  },
  description: siteMeta.description,
  keywords: siteMeta.keywords,
  manifest: '/manifest.json',
  openGraph: siteMeta.openGraph,
  twitter: siteMeta.twitter,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME.SHORT,
    startupImage: {
      url: '/icons/apple-touch-icon.png',
    },
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
  alternates: {
    canonical: APP_URL,
  },
  authors: [
    {
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
  ],
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={DEFAULT_LANG} dir={DEFAULT_DIR}>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='32x32' />
        <link
          rel='icon'
          href='/icon?<generated>'
          type='image/<generated>'
          sizes='<generated>'
        />
        <link
          rel='apple-touch-icon'
          href='/apple-icon?<generated>'
          type='image/<generated>'
          sizes='<generated>'
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${fracktif.className} ${fracktif.variable} ${inter.variable} bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <SpeedInsights debug={false} />
        <Analytics debug={false} />
        <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  )
}
