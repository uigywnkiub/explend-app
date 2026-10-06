/* global process */
import mongoose from 'mongoose'

if (process.env.CONFIRM_CLEANUP !== '1') {
  throw new Error(
    'Set CONFIRM_CLEANUP=1 to remove migrated user settings data.',
  )
}

const { MONGODB_URI, MONGODB_DB } = process.env

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined')
if (!MONGODB_DB) throw new Error('MONGODB_DB not defined')

await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB}`)

try {
  const db = mongoose.connection.db
  const userSettings = db.collection('usersettings')
  const settingsCount = await userSettings.countDocuments()
  const transactionUsers = await db
    .collection('transactions')
    .distinct('userId')
  const pushSubscriptionUsers = await db
    .collection('pushsubscriptions')
    .distinct('userId', { 'subscriptions.0': { $exists: true } })
  const settingsUsers = new Set(await userSettings.distinct('userId'))
  const missingUsers = [
    ...new Set([...transactionUsers, ...pushSubscriptionUsers]),
  ].filter((userId) => !settingsUsers.has(userId))
  const missingFields = []

  for (const field of [
    'categories',
    'categoryLimits',
    'subscriptions',
    'currency',
  ]) {
    const sourceUsers = await db
      .collection('transactions')
      .distinct('userId', { [field]: { $exists: true, $ne: null } })
    const settingsFieldUsers = new Set(
      await userSettings.distinct('userId', {
        [field]: { $exists: true, $ne: null },
      }),
    )
    missingFields.push(
      ...sourceUsers
        .filter((userId) => !settingsFieldUsers.has(userId))
        .map((userId) => `${field}:${userId}`),
    )
  }
  const settingsPushUsers = new Set(
    await userSettings.distinct('userId', {
      'pushSubscriptions.0': { $exists: true },
    }),
  )
  missingFields.push(
    ...pushSubscriptionUsers
      .filter((userId) => !settingsPushUsers.has(userId))
      .map((userId) => `pushSubscriptions:${userId}`),
  )

  if (
    settingsCount < transactionUsers.length ||
    missingUsers.length > 0 ||
    missingFields.length > 0
  ) {
    throw new Error(
      `Cleanup refused: ${settingsCount} UserSettings docs for ${transactionUsers.length} transaction users; ${missingUsers.length} source users have no UserSettings document; ${missingFields.length} user settings fields were not migrated.`,
    )
  }

  const result = await db.collection('transactions').updateMany(
    {},
    {
      $unset: {
        categories: '',
        categoryLimits: '',
        subscriptions: '',
        currency: '',
      },
    },
  )
  const pushSubscriptionsResult = await db
    .collection('pushsubscriptions')
    .deleteMany({})

  process.stdout.write(
    `Transactions updated: ${result.modifiedCount}; push subscription documents removed: ${pushSubscriptionsResult.deletedCount}\n`,
  )
} finally {
  await mongoose.disconnect()
}
