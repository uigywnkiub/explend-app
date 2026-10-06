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
  const settingsBefore = await userSettings.countDocuments()
  const transactionUsers = await transactions.distinct('userId')

  await userSettings.createIndex({ userId: 1 }, { unique: true })
  await transactions
    .aggregate([
      { $match: { 'categories.0': { $exists: true } } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: '$userId',
          userId: { $first: '$userId' },
          categories: { $first: '$categories' },
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          categories: 1,
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

  const settingsAfter = await userSettings.countDocuments()
  process.stdout.write(
    `UserSettings docs created: ${settingsAfter - settingsBefore}\n`,
  )
  process.stdout.write(
    `Distinct transaction users: ${transactionUsers.length}\n`,
  )
} finally {
  await mongoose.disconnect()
}
