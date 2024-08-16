import type { Metadata } from 'next'

import { APP_DESCRIPTION, APP_NAME, APP_TITLE, APP_URL } from './constants/main'

// export type TSiteMeta = typeof siteMeta

const _TITLE = `${APP_NAME.SHORT} - ${APP_TITLE}`
const _DESCRIPTION = APP_DESCRIPTION
const _IMAGE = `${APP_URL}/api/og`

type TSiteMeta = {
  title: Metadata['title']
  description: Metadata['description']
  openGraph: Metadata['openGraph']
  twitter: Metadata['twitter']
  keywords: Metadata['keywords']
}

export const siteMeta: TSiteMeta = {
  title: _TITLE,
  description: _DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: APP_NAME.SHORT,
    description: _DESCRIPTION,
    images: [
      {
        url: _IMAGE,
        width: 1200,
        height: 630,
        alt: APP_NAME.FULL,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: _TITLE,
    description: _DESCRIPTION,
    // @ts-ignore
    image: _IMAGE,
    creator: '@woldemar_g',
  },
  keywords: [
    'React',
    'Next.js',
    'Server Actions',
    'Server Components',
    'Tailwind CSS',
    'NextUI',
    'Recharts',
    'Explend',
    'Finance',
    'Money',
    'Budget',
    'Tracker',
    'Income Tracking',
    'Expense Tracking',
    'Manage Finances',
    'Control Spending',
    'Save Money Tracker',
    'Financial Wellness',
    'Financial Journey',
    'Personal Finance',
    'Expense Manager',
    'Savings Planner',
    'Financial Goals',
    'Transaction Log',
    'Financial Insights',
    'Spending Tracker',
    'Budget Planner',
    'Money Management',
    'Income Planner',
    'Financial Dashboard',
    'Wealth Management',
  ],
}
