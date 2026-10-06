/* global process */
import mongoose from 'mongoose'

if (process.env.CONFIRM_CLEANUP !== '1') {
  throw new Error('Set CONFIRM_CLEANUP=1 to remove transaction categories.')
}

const { MONGODB_URI, MONGODB_DB } = process.env

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined')
if (!MONGODB_DB) throw new Error('MONGODB_DB not defined')

await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB}`)

try {
  const db = mongoose.connection.db
  const settingsCount = await db.collection('usersettings').countDocuments()
  const transactionUsers = await db
    .collection('transactions')
    .distinct('userId')

  if (settingsCount < transactionUsers.length) {
    throw new Error(
      `Cleanup refused: ${settingsCount} UserSettings docs for ${transactionUsers.length} transaction users.`,
    )
  }

  const result = await db
    .collection('transactions')
    .updateMany({}, { $unset: { categories: '' } })

  process.stdout.write(`Transactions updated: ${result.modifiedCount}\n`)
} finally {
  await mongoose.disconnect()
}
