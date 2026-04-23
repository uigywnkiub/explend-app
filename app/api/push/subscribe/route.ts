import { type NextRequest, NextResponse } from 'next/server'

import { auth } from '@/auth'

import PushSubscriptionModel from '@/app/lib/models/push-subscription.model'
import dbConnect from '@/app/lib/mongodb'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await req.json()
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  await dbConnect()

  const exists = await PushSubscriptionModel.findOne({
    userId: session.user.email,
    'subscriptions.endpoint': subscription.endpoint,
  })

  if (!exists) {
    await PushSubscriptionModel.updateOne(
      { userId: session.user.email },
      { $push: { subscriptions: subscription } },
      { upsert: true },
    )
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { endpoint } = await req.json()
  if (!endpoint) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 })
  }

  await dbConnect()

  await PushSubscriptionModel.updateOne(
    { userId: session.user.email },
    { $pull: { subscriptions: { endpoint } } },
  )

  return NextResponse.json({ ok: true })
}
