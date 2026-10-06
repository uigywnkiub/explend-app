import { type NextRequest, NextResponse } from 'next/server'

import { auth } from '@/auth'

import UserSettingsModel from '@/app/lib/models/user-settings.model'
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

  const existsInSettings = await UserSettingsModel.findOne({
    userId: session.user.email,
    'pushSubscriptions.endpoint': subscription.endpoint,
  })

  if (!existsInSettings) {
    await UserSettingsModel.updateOne(
      { userId: session.user.email },
      { $push: { pushSubscriptions: subscription } },
      { upsert: true, setDefaultsOnInsert: false },
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

  await UserSettingsModel.updateOne(
    { userId: session.user.email },
    { $pull: { pushSubscriptions: { endpoint } } },
  )

  return NextResponse.json({ ok: true })
}
