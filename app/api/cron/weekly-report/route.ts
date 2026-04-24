import { NextRequest, NextResponse } from 'next/server'

import * as Sentry from '@sentry/nextjs'
import webpush from 'web-push'

import { ROUTE } from '@/config/constants/routes'

import { formatWeeklyReportAI, getAllTransactions } from '@/app/lib/actions'
import { buildWeeklyReport } from '@/app/lib/data'
import PushSubscriptionModel from '@/app/lib/models/push-subscription.model'
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

  const pushDocs = await PushSubscriptionModel.find({
    'subscriptions.0': { $exists: true },
  }).lean<{ userId: string; subscriptions: webpush.PushSubscription[] }[]>()

  if (!pushDocs.length) {
    return NextResponse.json({ ok: true, notified: false })
  }

  const results: {
    userId: TTransaction['userId']
    notified: boolean
    error?: string
  }[] = []

  for (const { userId, subscriptions } of pushDocs) {
    try {
      const transactions = await getAllTransactions(userId)
      const {
        totalIncome,
        totalExpense,
        expenseReportData,
        transactionCount,
        biggestExpense,
      } = buildWeeklyReport(transactions)

      const currencySign = transactions[0]?.currency.sign ?? ''

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

      for (const pushSub of subscriptions) {
        try {
          await webpush.sendNotification(pushSub, payload)
        } catch (err) {
          if (
            typeof err === 'object' &&
            err !== null &&
            'statusCode' in err &&
            (err.statusCode === 410 || err.statusCode === 404)
          ) {
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
