import mongoose, { Mongoose } from 'mongoose'

import { IS_PROD } from '@/config/constants/main'

/* eslint-disable no-var */
declare global {
  // This must be a `var` and not a `let / const`
  var mongoose: {
    promise: Promise<Mongoose> | null
    conn: Mongoose | null
  }
}

const { MONGODB_URI, MONGODB_DB } = process.env

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined')
if (!MONGODB_DB) throw new Error('MONGODB_DB not defined')

// Global is used here to maintain a cache across hot reloads in a development environment.
// In a serverless environment, it helps avoid creating multiple connections.
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${MONGODB_URI}/${MONGODB_DB}`, {
        // Disable Mongoose buffering. In serverless functions, buffering can lead to memory leaks because the function might end before the buffered commands are executed.
        bufferCommands: !IS_PROD,
      })
      .then((mongoose) => mongoose)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}
