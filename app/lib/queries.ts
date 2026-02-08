import { cache } from 'react'

import { cacheLife, cacheTag } from 'next/cache'

import { auth } from '@/auth'
import { isObjectIdOrHexString } from 'mongoose'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
} from '@/config/constants/main'
import { DEFAULT_TRANSACTION_LIMIT } from '@/config/constants/navigation'

import TransactionModel from '@/app/lib/models/transaction.model'

import { formatObjectIdToString, getCacheTagByUserId } from './helpers'
import dbConnect from './mongodb'
import type {
  TBalance,
  TBalanceProjection,
  TGetTransactions,
  TRawTransaction,
  TSession,
  TTransaction,
  TUserId,
} from './types'

// Cannot use 'use cache' because it reads cookies via auth().
// Uses React.cache() for request-level deduplication only.
export const getAuthSession = async (): Promise<TSession> => {
  try {
    const session = await auth()

    return session
  } catch (err) {
    throw err
  }
}
export const getCachedAuthSession = cache(getAuthSession)

export async function getBalance(
  userId: TUserId,
): Promise<TTransaction['balance']> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to fetch balance.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('minutes')
  try {
    await dbConnect()
    const transactions = await TransactionModel.find({ userId }, [
      'amount',
      'isIncome',
    ] as TBalanceProjection).lean<TBalance[]>({
      transform: (doc) => {
        if (doc) delete doc._id
      },
    })
    const balance = transactions.reduce((acc, t) => {
      const amount = parseFloat(t.amount)

      return t.isIncome ? acc + amount : acc - amount
    }, 0)

    return balance.toString()
  } catch (err) {
    throw err
  }
}
export { getBalance as getCachedBalance }

export async function getTransactionLimit(
  userId: TUserId,
): Promise<TTransaction['transactionLimit']> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to fetch transaction limit.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('weeks')
  try {
    await dbConnect()
    const transaction = await TransactionModel.findOne(
      { userId },
      { transactionLimit: 1, _id: 0 },
    ).lean<{ transactionLimit: TTransaction['transactionLimit'] }>()

    return transaction?.transactionLimit
  } catch (err) {
    throw err
  }
}
export { getTransactionLimit as getCachedTransactionLimit }

export async function getCurrency(
  userId: TUserId,
): Promise<TTransaction['currency']> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to fetch currency.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('hours')
  try {
    await dbConnect()
    const transaction = await TransactionModel.findOne(
      { userId },
      { currency: 1, _id: 0 },
    ).lean<{ currency: TTransaction['currency'] }>()

    return (
      transaction?.currency || {
        name: DEFAULT_CURRENCY_NAME,
        code: DEFAULT_CURRENCY_CODE,
        sign: DEFAULT_CURRENCY_SIGN,
      }
    )
  } catch (err) {
    throw err
  }
}
export { getCurrency as getCachedCurrency }

export async function getCountDocuments(
  userId: TUserId,
): Promise<TGetTransactions['totalEntries']> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to fetch count documents.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('minutes')
  try {
    await dbConnect()

    return await TransactionModel.countDocuments({ userId })
  } catch (err) {
    throw err
  }
}
export { getCountDocuments as getCachedCountDocuments }

export async function getTransactions(
  userId: TUserId,
  offset: number = 0,
  limit: number = DEFAULT_TRANSACTION_LIMIT,
): Promise<TGetTransactions> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to get transactions.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('minutes')
  try {
    await dbConnect()
    const [transactions, totalEntries] = await Promise.all([
      TransactionModel.find({ userId })
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: 'desc' })
        .lean<TTransaction[]>({
          transform: (doc) => {
            if (!doc) return
            delete doc._id
            delete doc.__v
          },
        }),
      TransactionModel.countDocuments({ userId }),
    ])
    const totalPages = Math.ceil(totalEntries / limit)

    return { transactions, totalEntries, totalPages }
  } catch (err) {
    throw err
  }
}
export { getTransactions as getCachedTransactions }

export async function getAllTransactions(
  userId: TUserId,
): Promise<TTransaction[]> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to get all transactions.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('minutes')
  try {
    await dbConnect()

    return TransactionModel.find({ userId }).lean<TTransaction[]>({
      transform: (doc) => {
        if (!doc) return
        delete doc._id
        delete doc.__v
      },
    })
  } catch (err) {
    throw err
  }
}
export { getAllTransactions as getCachedAllTransactions }

export async function findTransactionById(
  id: TTransaction['id'],
): Promise<TTransaction | null> {
  'use cache'
  if (!id) {
    throw new Error(
      'Transaction ID and User ID are required to find a transaction.',
    )
  }
  cacheTag(`transaction-${id}`)
  cacheLife('days')
  try {
    await dbConnect()
    const transaction = await TransactionModel.findOne({
      id,
    }).lean<TTransaction>({
      transform: (doc) => {
        if (!doc) return
        delete doc._id
        delete doc.__v
      },
    })

    return transaction
  } catch (err) {
    throw err
  }
}

export async function getCategoryLimits(
  userId: TUserId,
): Promise<TTransaction['categoryLimits']> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to get category limits.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('hours')
  try {
    await dbConnect()
    const transaction = await TransactionModel.findOne(
      { userId },
      { categoryLimits: 1, _id: 0 },
    ).lean<{ categoryLimits: TTransaction['categoryLimits'] }>()

    return transaction?.categoryLimits
  } catch (err) {
    throw err
  }
}

export async function getSalaryDay(
  userId: TUserId,
): Promise<TTransaction['salaryDay']> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to get salary day.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('weeks')
  try {
    await dbConnect()
    const transaction = await TransactionModel.findOne(
      { userId },
      { salaryDay: 1, _id: 0 },
    ).lean<{ salaryDay: TTransaction['salaryDay'] }>()

    return transaction?.salaryDay
  } catch (err) {
    throw err
  }
}
export { getSalaryDay as getCachedSalaryDay }

export async function getSubscriptions(
  userId: TUserId,
): Promise<TTransaction['subscriptions']> {
  'use cache'
  if (!userId) {
    throw new Error('User ID is required to get subscriptions.')
  }
  cacheTag(getCacheTagByUserId(userId))
  cacheLife('hours')
  try {
    await dbConnect()
    const transaction = await TransactionModel.findOne(
      { userId },
      { subscriptions: 1, _id: 1 },
    ).lean<{ subscriptions: TTransaction['subscriptions'] }>({
      transform: (doc) => {
        if (!doc) return
        if (doc._id && isObjectIdOrHexString(doc._id)) {
          doc._id = formatObjectIdToString(
            doc._id as NonNullable<TRawTransaction['_id']>,
          )
        }
      },
    })

    return transaction?.subscriptions || []
  } catch (err) {
    throw err
  }
}
