import { type NextRequest, NextResponse } from 'next/server'

import { createTransaction } from '@/app/lib/actions'
import { createFormData } from '@/app/lib/helpers'
import TransactionModel from '@/app/lib/models/transaction.model'
import dbConnect from '@/app/lib/mongodb'
import { TSubscriptions, TTransaction } from '@/app/lib/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Secs.

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()

  const todayDay = new Date().getDate()

  const users = await TransactionModel.aggregate([
    { $match: { 'subscriptions.autoRenew': true } },
    {
      $group: {
        _id: '$userId',
        userId: { $first: '$userId' },
        currency: { $first: '$currency' },
        categories: { $first: '$categories' },
        salaryDay: { $first: '$salaryDay' },
        subscriptions: { $first: '$subscriptions' },
      },
    },
  ])

  const results: {
    userId: TTransaction['userId']
    processed: string
    errors: string[]
  }[] = []

  for (const user of users) {
    const processed: string[] = []
    const errors: string[] = []

    const eligibleSubs: TTransaction['subscriptions'] = (
      user.subscriptions || []
    ).filter((s: TSubscriptions) => {
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

        await createTransaction(
          user.userId,
          user.currency,
          user.categories,
          user.salaryDay,
          formData,
        )

        processed.push(sub._id)
      } catch (err: unknown) {
        let msg = 'unknown error'
        if (err instanceof Error) {
          msg = err.message
        } else if (typeof err === 'string') {
          msg = err
        }

        errors.push(`sub ${sub._id}: ${msg}`)
      }
    }

    results.push({
      userId: user.userId,
      processed: processed.length.toString(),
      errors,
    })
  }

  return NextResponse.json({
    ok: true,
    date: new Date().toISOString(),
    results,
  })
}
