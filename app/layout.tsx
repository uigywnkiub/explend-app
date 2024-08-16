import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/config/constants/main'

import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fracktif = localFont({
  src: [
    {
      path: './fonts/FracktifMedium/font.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/FracktifSemiBold/font.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  display: 'swap',
})

const _APP_NAME = APP_NAME.FULL
const APP_DEFAULT_TITLE = APP_NAME.FULL
const APP_TITLE_TEMPLATE = `%s | ${APP_NAME.FULL}`

export const metadata: Metadata = {
  applicationName: _APP_NAME,
  title: {
    template: APP_TITLE_TEMPLATE,
    default: APP_NAME.FULL,
  },
  description: APP_DESCRIPTION,
  keywords:
    'explend, finance, money, budget, tracker, income tracking, expense tracking, manage finances, control spending, save money tracker, financial wellness.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME.FULL,
    startupImage: {
      url: '/icons/apple-touch-icon.png',
    },
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    siteName: _APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
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
    <html lang='en' dir='ltr'>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
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
        className={`${fracktif.className} ${inter.variable} bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <SpeedInsights debug={false} />
        <Analytics debug={false} />
        <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  )
}
