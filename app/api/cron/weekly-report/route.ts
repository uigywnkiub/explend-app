import { NextRequest, NextResponse } from 'next/server'

import * as Sentry from '@sentry/nextjs'
import webpush from 'web-push'

import { ROUTE } from '@/config/constants/routes'

import {
  formatWeeklyReportAI,
  getAllTransactions,
  getCurrency,
  getUserPushSubscriptions,
} from '@/app/lib/actions'
import { buildWeeklyReport } from '@/app/lib/data'
import PushSubscriptionModel from '@/app/lib/models/push-subscription.model'
import UserSettingsModel from '@/app/lib/models/user-settings.model'
import dbConnect from '@/app/lib/mongodb'
import { TTransaction } from '@/app/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Secs.

webpush.setVapidDetails(
  `mailto:${process.env.RESEND_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()

  const [settingsUserIds, legacyUserIds] = await Promise.all([
    UserSettingsModel.distinct('userId', {
      'pushSubscriptions.0': { $exists: true },
    }),
    PushSubscriptionModel.distinct('userId', {
      'subscriptions.0': { $exists: true },
    }),
  ])
  const userIds = [...new Set([...settingsUserIds, ...legacyUserIds])]

  if (!userIds.length) {
    return NextResponse.json({ ok: true, notified: false })
  }

  const results: {
    userId: TTransaction['userId']
    notified: boolean
    error?: string
  }[] = []

  for (const userId of userIds) {
    try {
      const [transactions, currency, pushSubscriptions] = await Promise.all([
        getAllTransactions(userId),
        getCurrency(userId),
        getUserPushSubscriptions(userId),
      ])
      const currencySign = currency.sign
      const {
        totalIncome,
        totalExpense,
        expenseReportData,
        transactionCount,
        biggestExpense,
      } = buildWeeklyReport(transactions, currencySign)

      const aiBody = await formatWeeklyReportAI({
        totalIncome,
        totalExpense,
        transactionCount,
        expenseReportData,
        biggestExpense,
        currencySign,
      })

      const payload = JSON.stringify({
        title: 'Weekly Report',
        body: aiBody,
        icon: '/icon.png',
        url: ROUTE.MONTHLY_REPORT,
      })

      for (const pushSub of pushSubscriptions) {
        try {
          await webpush.sendNotification(pushSub, payload)
        } catch (err) {
          if (
            typeof err === 'object' &&
            err !== null &&
            'statusCode' in err &&
            (err.statusCode === 410 || err.statusCode === 404)
          ) {
            await UserSettingsModel.updateOne(
              { userId },
              {
                $pull: {
                  pushSubscriptions: { endpoint: pushSub.endpoint },
                },
              },
            )
            await PushSubscriptionModel.updateOne(
              { userId },
              { $pull: { subscriptions: { endpoint: pushSub.endpoint } } },
            )
          } else {
            Sentry.captureException(err, { extra: { userId } })
          }
        }
      }

      results.push({ userId, notified: true })
    } catch (err) {
      Sentry.captureException(err, { extra: { userId } })
      results.push({
        userId,
        notified: false,
        error: err instanceof Error ? err.message : 'unknown error',
      })
    }
  }

  return NextResponse.json({
    ok: true,
    date: new Date().toISOString(),
    results,
  })
}
