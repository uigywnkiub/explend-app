import { NextResponse } from 'next/server'

import { APP_NAME, IS_PROD } from '@/config/constants/main'
import { NAV_TITLE } from '@/config/constants/navigation'
import { ROUTE } from '@/config/constants/routes'

import { TNavLink, TSocialLink } from '../lib/types'

const BASE_URL = IS_PROD ? process.env.APP_URL : process.env.APP_LOCALHOST_URL
const REPO_URL = 'https://github.com/uigywnkiub/explend-app'

type TNote = { note: string }
type TPageLink = Pick<TNavLink, 'title' | 'url'> & TNote
type TExternalLink = Pick<TSocialLink, 'title' | 'url'> & TNote
type TSection = { title: string; links: (TPageLink | TExternalLink)[] }

const NAME = APP_NAME.FULL
const SUMMARY =
  'Stop wondering where your money goes. Personal finance tracker for income and expenses, with AI-powered smart entry, receipt scanning, monthly reports, and forecasting.'
const DETAILS =
  'Explend is a PWA with encrypted (AES) transaction data. It supports bank imports from Monobank (CSV) and Privat24 (XLSX), custom categories, and light/dark/system themes. App pages require sign-in.'

const SECTIONS: TSection[] = [
  {
    title: 'Pages',
    links: [
      {
        title: NAV_TITLE.HOME,
        url: ROUTE.HOME,
        note: 'Track your expenses and income with Explend. Get insights, manage budgets, and achieve your financial goals.',
      },
      {
        title: NAV_TITLE.MONTHLY_REPORT,
        url: ROUTE.MONTHLY_REPORT,
        note: 'AI-assisted spending analysis, trends, and forecasts (exponential smoothing, trend analysis, outlier handling).',
      },
      {
        title: NAV_TITLE.CHART,
        url: ROUTE.CHART,
        note: 'Radar chart of income and expenses by category.',
      },
      {
        title: NAV_TITLE.TABLE,
        url: ROUTE.TABLE,
        note: 'Sortable, searchable transactions with edit/delete, real-time totals, and data dump export/import.',
      },
      {
        title: NAV_TITLE.LIMITS,
        url: ROUTE.LIMITS,
        note: 'Monthly spending limits per category.',
      },
      {
        title: NAV_TITLE.SUBSCRIPTIONS,
        url: ROUTE.SUBSCRIPTIONS,
        note: 'Recurring charges that auto-renew as expenses, with push notifications.',
      },
      {
        title: NAV_TITLE.CATEGORIES,
        url: ROUTE.CATEGORIES,
        note: 'Add or edit custom categories.',
      },
      {
        title: NAV_TITLE.SETTINGS,
        url: ROUTE.SETTINGS,
        note: 'Theme and app preferences.',
      },
    ],
  },
  {
    title: 'Project',
    links: [
      {
        title: 'Repository',
        url: REPO_URL,
        note: 'Source code and project history.',
      },
      {
        title: 'README',
        url: `${REPO_URL}#readme`,
        note: 'Feature overview and contribution notes.',
      },
      {
        title: 'Demo video',
        url: 'https://www.youtube.com/watch?v=v_tLuYTPoSI',
        note: 'Walkthrough of the app.',
      },
    ],
  },
  {
    title: 'Optional',
    links: [
      {
        title: 'Open issues',
        url: `${REPO_URL}/issues`,
        note: 'Bugs, feature requests, and roadmap.',
      },
      {
        title: 'License',
        url: `${REPO_URL}/blob/main/LICENSE`,
        note: 'MIT license.',
      },
    ],
  },
]

// ROUTE values are relative paths, external links are already absolute.
const toAbsoluteUrl = (url: string) =>
  url.startsWith('/') ? `${BASE_URL}${url}` : url

const buildLlmsText = () =>
  `${[
    `# ${NAME}`,
    `> ${SUMMARY}`,
    DETAILS,
    ...SECTIONS.map(
      ({ title, links }) =>
        `## ${title}\n${links
          .map(
            ({ title, url, note }) =>
              `- [${title}](${toAbsoluteUrl(url)}): ${note}`,
          )
          .join('\n')}`,
    ),
  ].join('\n\n')}\n`

const llmsText = buildLlmsText()

export async function GET() {
  return new NextResponse(llmsText, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
