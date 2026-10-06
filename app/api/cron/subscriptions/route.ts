import { type NextRequest, NextResponse } from 'next/server'

import * as Sentry from '@sentry/nextjs'
import webpush from 'web-push'

import { ROUTE } from '@/config/constants/routes'

import {
  createTransaction,
  getCurrency,
  getSalaryDay,
  getSubscriptions,
  getUserPushSubscriptions,
  getUserSettingsCategories,
} from '@/app/lib/actions'
import { createFormData, getEmojiFromCategory } from '@/app/lib/helpers'
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

  const todayDay = new Date().getDate()

  const userIds = await UserSettingsModel.distinct('userId', {
    'subscriptions.autoRenew': true,
  })

  const results: {
    userId: TTransaction['userId']
    processed: string
    errors: string[]
    notified: boolean
  }[] = []

  for (const userId of userIds) {
    const processed: string[] = []
    const errors: string[] = []
    let notified = false

    const [subscriptions, userCategories, userSalaryDay, currency, pushSubs] =
      await Promise.all([
        getSubscriptions(userId),
        getUserSettingsCategories(userId),
        getSalaryDay(userId),
        getCurrency(userId),
        getUserPushSubscriptions(userId),
      ])
    const eligibleSubs = subscriptions.filter((s) => {
      return s.autoRenew === true && Number(s.renewDay) === todayDay
    })

    for (const sub of eligibleSubs) {
      try {
        const formData = createFormData({
          category: sub.category,
          description: sub.description,
          amount: sub.amount,
          note: sub.note,
          isSubscription: true,
        })

        await createTransaction(userId, userCategories, userSalaryDay, formData)

        processed.push(sub._id)
      } catch (err) {
        let msg = 'unknown error'
        if (err instanceof Error) {
          msg = err.message
        } else if (typeof err === 'string') {
          msg = err
        }

        errors.push(`sub ${sub._id}: ${msg}`)
      }
    }

    if (processed.length > 0) {
      if (pushSubs.length) {
        const processedSubs = eligibleSubs.filter((s) =>
          processed.includes(s._id),
        )

        for (const sub of processedSubs) {
          for (const pushSub of pushSubs) {
            try {
              await webpush.sendNotification(
                pushSub,
                JSON.stringify({
                  title: `Subscription Renewal`,
                  body: `${getEmojiFromCategory(sub.category)} ${sub.description} — ${sub.amount} ${currency.sign}`,
                  icon: '/icon.png',
                  url: ROUTE.SUBSCRIPTIONS,
                }),
              )
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
              } else {
                Sentry.captureException(err, { extra: { userId } })
              }
            }
          }
        }

        notified = true
      }
    }

    results.push({
      userId,
      processed: processed.length.toString(),
      errors,
      notified,
    })
  }

  return NextResponse.json({
    ok: true,
    date: new Date().toISOString(),
    results,
  })
}
