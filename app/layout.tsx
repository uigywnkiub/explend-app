import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { APP_NAME } from '@/config/constants/main'

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

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME.FULL}`,
    default: APP_NAME.FULL,
  },
  description: 'Stop wondering where your money goes. Track Income & Expense.',
  applicationName: APP_NAME.FULL,
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
  },
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
    <html lang='en'>
      <body
        suppressHydrationWarning
        className={`${fracktif.className} ${inter.variable} bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
