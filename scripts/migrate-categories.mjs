/* global process */
import mongoose from 'mongoose'

const { MONGODB_URI, MONGODB_DB } = process.env

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined')
if (!MONGODB_DB) throw new Error('MONGODB_DB not defined')

await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB}`)

try {
  const db = mongoose.connection.db
  const userSettings = db.collection('usersettings')
  const transactions = db.collection('transactions')
  const pushSubscriptions = db.collection('pushsubscriptions')
  const settingsBefore = await userSettings.countDocuments()
  const transactionUsers = await transactions.distinct('userId')
  const pushSubscriptionUsers = await pushSubscriptions.distinct('userId')

  await userSettings.createIndex({ userId: 1 }, { unique: true })
  await transactions
    .aggregate([
      {
        $match: {
          $or: [
            { 'categories.0': { $exists: true } },
            { 'categoryLimits.0': { $exists: true } },
            { 'subscriptions.0': { $exists: true } },
            { currency: { $exists: true } },
          ],
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: '$userId',
          userId: { $first: '$userId' },
          categories: { $first: '$categories' },
          categoryLimits: { $first: '$categoryLimits' },
          subscriptions: { $first: '$subscriptions' },
          currency: { $first: '$currency' },
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          categories: 1,
          categoryLimits: 1,
          subscriptions: 1,
          currency: 1,
          createdAt: '$$NOW',
          updatedAt: '$$NOW',
          __v: { $literal: 0 },
        },
      },
      {
        $merge: {
          into: 'usersettings',
          on: 'userId',
          whenMatched: [
            {
              $set: {
                categories: { $ifNull: ['$categories', '$$new.categories'] },
                categoryLimits: {
                  $ifNull: ['$categoryLimits', '$$new.categoryLimits'],
                },
                subscriptions: {
                  $ifNull: ['$subscriptions', '$$new.subscriptions'],
                },
                currency: { $ifNull: ['$currency', '$$new.currency'] },
              },
            },
          ],
          whenNotMatched: 'insert',
        },
      },
    ])
    .toArray()

  await transactions
    .aggregate([
      { $group: { _id: '$userId', userId: { $first: '$userId' } } },
      {
        $project: {
          _id: 0,
          userId: 1,
          createdAt: '$$NOW',
          updatedAt: '$$NOW',
          __v: { $literal: 0 },
        },
      },
      {
        $merge: {
          into: 'usersettings',
          on: 'userId',
          whenMatched: 'keepExisting',
          whenNotMatched: 'insert',
        },
      },
    ])
    .toArray()

  await pushSubscriptions
    .aggregate([
      { $match: { 'subscriptions.0': { $exists: true } } },
      {
        $project: {
          _id: 0,
          userId: 1,
          pushSubscriptions: '$subscriptions',
          createdAt: '$$NOW',
          updatedAt: '$$NOW',
          __v: { $literal: 0 },
        },
      },
      {
        $merge: {
          into: 'usersettings',
          on: 'userId',
          whenMatched: [
            {
              $set: {
                pushSubscriptions: {
                  $setUnion: [
                    { $ifNull: ['$pushSubscriptions', []] },
                    '$$new.pushSubscriptions',
                  ],
                },
              },
            },
          ],
          whenNotMatched: 'insert',
        },
      },
    ])
    .toArray()

  const settingsAfter = await userSettings.countDocuments()
  process.stdout.write(
    `UserSettings docs created: ${settingsAfter - settingsBefore}\n`,
  )
  process.stdout.write(
    `Distinct transaction users: ${transactionUsers.length}\n`,
  )
  process.stdout.write(
    `Distinct push subscription users: ${pushSubscriptionUsers.length}\n`,
  )
} finally {
  await mongoose.disconnect()
}
