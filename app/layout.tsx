import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { CUSTOM_DARK_COLOR } from '@/tailwind.config'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import {
  APP_NAME,
  APP_URL,
  AUTHOR,
  DEFAULT_DIR,
  DEFAULT_LANG,
  IS_PROD,
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
      name: AUTHOR.NAME,
      url: AUTHOR.URL,
    },
  ],
}

export const viewport: Viewport = {
  themeColor: CUSTOM_DARK_COLOR,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={DEFAULT_LANG} dir={DEFAULT_DIR} data-scroll-behavior='smooth'>
      <head>
        <meta name='mobile-web-app-capable' content='yes' />
        <link rel='icon' href='/favicon.ico' sizes='48x48' />
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
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_17_Pro_Max__iPhone_16_Pro_Max_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_Air_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/iPhone_11__iPhone_XR_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)'
          href='/images/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/13__iPad_Pro_M4_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/12.9__iPad_Pro_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/11__iPad_Pro_M4_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/11__iPad_Pro__10.5__iPad_Pro_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/10.9__iPad_Air_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/10.5__iPad_Air_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/10.2__iPad_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)'
          href='/images/8.3__iPad_Mini_landscape.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_17_Pro_Max__iPhone_16_Pro_Max_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_Air_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/iPhone_11__iPhone_XR_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
          href='/images/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/13__iPad_Pro_M4_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/12.9__iPad_Pro_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 834px) and (device-height: 1210px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/11__iPad_Pro_M4_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/11__iPad_Pro__10.5__iPad_Pro_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/10.9__iPad_Air_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/10.5__iPad_Air_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/10.2__iPad_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png'
        />
        <link
          rel='apple-touch-startup-image'
          media='screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)'
          href='/images/8.3__iPad_Mini_portrait.png'
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${fracktif.className} ${fracktif.variable} ${inter.variable} bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        {IS_PROD && (
          <>
            <SpeedInsights />
            <Analytics />
            <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID} />
          </>
        )}
      </body>
    </html>
  )
}
