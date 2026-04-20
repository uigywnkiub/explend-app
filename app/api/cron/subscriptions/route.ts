// app/api/cron/subscriptions/route.ts
// Vercel cron — runs daily at 08:00 UTC (configure in vercel.json)
// Finds every subscription with autoRenew=true where renewDay === today's date,
// then creates a transaction for each one.
import { NextResponse } from 'next/server'

import { createTransaction } from '@/app/lib/actions'
import { createFormData } from '@/app/lib/helpers'
import TransactionModel from '@/app/lib/models/transaction.model'
import dbConnect from '@/app/lib/mongodb'
import { TSubscriptions } from '@/app/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // seconds

export async function POST(request: Request) {
  // Verify this is a legitimate Vercel cron call (or your own secret header)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()

  const todayDay = new Date().getDate() // 1–31
  // console.log(todayDay)

  // Fetch all user documents that have at least one matching subscription
  const users = await TransactionModel.find(
    { 'subscriptions.autoRenew': true },
    { userId: 1, currency: 1, categories: 1, salaryDay: 1, subscriptions: 1 },
  ).lean()
  // console.log(users)

  const results: { userId: string; processed: number; errors: string[] }[] = []

  for (const user of users) {
    const processed: number[] = []
    const errors: string[] = []

    const eligibleSubs = (user.subscriptions ?? []).filter(
      (s: TSubscriptions) =>
        s.autoRenew === true && Number(s.renewDay) === todayDay,
    )

    for (const sub of eligibleSubs) {
      try {
        const formData = createFormData({
          category: sub.category,
          description: sub.description,
          amount: sub.amount,
          note: sub.note,
          isSubscription: true,
        })

        await createTransaction(
          user.userId,
          user.currency,
          user.categories,
          user.salaryDay,
          formData,
        )

        processed.push(sub._id)
      } catch (err: unknown) {
        let message = 'unknown error'

        if (err instanceof Error) {
          message = err.message
        } else if (typeof err === 'string') {
          message = err
        }

        errors.push(`sub ${sub._id}: ${message}`)
      }
    }

    results.push({ userId: user.userId, processed: processed.length, errors })
  }
  // console.log(results)

  return NextResponse.json({
    ok: true,
    date: new Date().toISOString(),
    results,
  })
}
