'use server'

import { cache } from 'react'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import TransactionModel from '@/app/lib/models/transaction.model'
import { auth, signOut } from '@/auth'
import { SignOutError } from '@auth/core/errors'
import { Resend } from 'resend'

import { FEEDBACK } from '@/config/constants/cookies'
import { APP_NAME } from '@/config/constants/main'
import { DEFAULT_TRANSACTION_LIMIT } from '@/config/constants/navigation'
import { ROUTE } from '@/config/constants/routes'

import dbConnect from './mongodb'
import type {
  TBalance,
  TBalanceProjection,
  TCookie,
  TGetTransactions,
  TRawTransaction,
  TSession,
  TTransaction,
  TUserId,
} from './types'
import { capitalizeFirstLetter, getCategoryWithEmoji } from './utils'

export const getAuthSession = cache(async (): Promise<TSession> => {
  try {
    const session = await auth()
    return session
  } catch (err) {
    throw err
  }
})
export const getCachedAuthSession = cache(getAuthSession)

export async function signOutAccount(): Promise<void> {
  try {
    await signOut({ redirectTo: ROUTE.SIGNIN })
  } catch (err) {
    if (err instanceof SignOutError) {
      throw err.message
    }
    throw err
  }
}

export async function getBalance(
  userId: TUserId,
): Promise<TTransaction['balance']> {
  if (!userId) {
    throw new Error('User ID is required to fetch balance.')
  }
  try {
    await dbConnect()
    const transactions = await TransactionModel.find({ userId }, [
      'amount',
      'isIncome',
    ] as TBalanceProjection).lean<TBalance[]>({
      transform: (doc: TRawTransaction) => {
        delete doc._id
        return doc
      },
    })
    const balance = transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount)
      return transaction.isIncome ? acc + amount : acc - amount
    }, 0)
    return balance.toString()
  } catch (err) {
    throw err
  }
}
export const getCachedBalance = cache(getBalance)

export async function getTransactionLimit(
  userId: TUserId,
): Promise<TTransaction['transactionLimit']> {
  if (!userId) {
    throw new Error('User ID is required to fetch transaction limit.')
  }
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
export const getCachedTransactionLimit = cache(getTransactionLimit)

export async function getCurrency(
  userId: TUserId,
): Promise<TTransaction['currency']> {
  if (!userId) {
    throw new Error('User ID is required to fetch currency.')
  }
  try {
    await dbConnect()
    const transaction = await TransactionModel.findOne(
      { userId },
      { currency: 1, _id: 0 },
    ).lean<{ currency: TTransaction['currency'] }>()
    return transaction?.currency
  } catch (err) {
    throw err
  }
}
export const getCachedCurrency = cache(getCurrency)

export async function updateCurrency(
  userId: TUserId,
  currency: TTransaction['currency'],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to update currency.')
  }
  if (!currency) {
    throw new Error('Currency is required.')
  }
  try {
    await dbConnect()
    await TransactionModel.updateMany({ userId }, { currency })
    revalidatePath(ROUTE.HOME)
  } catch (err) {
    throw err
  }
}

export async function updateTransactionLimit(
  userId: TUserId,
  transactionLimit: TTransaction['transactionLimit'],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to update transactions limit.')
  }
  if (!transactionLimit) {
    throw new Error('Transactions limit value is required.')
  }
  try {
    await dbConnect()
    await TransactionModel.updateMany({ userId }, { transactionLimit })
    revalidatePath(ROUTE.HOME)
  } catch (err) {
    throw err
  }
}

export async function createTransaction(
  userId: TUserId,
  currency: TTransaction['currency'],
  formData: FormData,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to create a transaction.')
  }
  try {
    const newTransaction: Omit<
      TTransaction,
      'createdAt' | 'updatedAt' | 'transactionLimit'
    > = {
      id: crypto.randomUUID(),
      userId,
      description: capitalizeFirstLetter(
        formData.get('description') as TTransaction['description'],
      ),
      amount: formData.get('amount') as TTransaction['amount'],
      category: getCategoryWithEmoji(
        formData.get('category'),
      ) as TTransaction['category'],
      isIncome: !!formData.get('isIncome'),
      balance: '0' as TTransaction['balance'],
      currency,
    }
    newTransaction.amount = newTransaction.amount.replace(/\s/g, '')
    const amount = parseFloat(newTransaction.amount)
    let balance = 0
    if (newTransaction.isIncome) {
      balance += amount
    } else {
      balance -= amount
    }
    newTransaction.balance = balance.toString()
    await dbConnect()
    const session = await TransactionModel.startSession()
    try {
      session.startTransaction()
      await TransactionModel.create([newTransaction], { session })
      await session.commitTransaction()
      session.endSession()
      revalidatePath(ROUTE.HOME)
    } catch (err) {
      await session.abortTransaction()
      session.endSession()
      throw err
    }
  } catch (err) {
    throw err
  }
}

export async function setCookie(
  name: TCookie['NAME'],
  value: TCookie['VALUE'],
  maxAge: TCookie['MAX_AGE'],
) {
  cookies().set(name, value, {
    maxAge,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: ROUTE.HOME,
  })
}

export async function sendFeedback(formData: FormData) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const email = process.env.RESEND_EMAIL
  const isResendEnable = process.env.IS_RESEND_ENABLE
  const feedback = formData.get('feedback') as string
  try {
    if (email && isResendEnable === 'true') {
      await Promise.all([
        resend.emails.send({
          from: `${APP_NAME.FULL} <onboarding@resend.dev>`,
          to: email,
          subject: 'Feedback',
          html: `<h3>${feedback}</h3>`,
        }),
        setCookie(FEEDBACK.NAME, FEEDBACK.VALUE, FEEDBACK.MAX_AGE),
      ])
    }
  } catch (err) {
    throw err
  }
}

export async function getCountDocuments(
  userId: TUserId,
): Promise<TGetTransactions['totalEntries']> {
  if (!userId) {
    throw new Error('User ID is required to fetch count documents.')
  }
  try {
    await dbConnect()
    return await TransactionModel.countDocuments({ userId })
  } catch (err) {
    throw err
  }
}
export const getCachedCountDocuments = cache(getCountDocuments)

export async function getTransactions(
  userId: TUserId,
  offset: number = 0,
  limit: number = DEFAULT_TRANSACTION_LIMIT,
): Promise<TGetTransactions> {
  if (!userId) {
    throw new Error('User ID is required to fetch transactions.')
  }
  try {
    await dbConnect()
    const [transactions, totalEntries] = await Promise.all([
      TransactionModel.find({ userId })
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: 'desc' })
        .lean<TTransaction[]>({
          transform: (doc: TRawTransaction) => {
            delete doc._id
            delete doc.__v
            return doc
          },
        }),
      getCountDocuments(userId),
    ])
    const totalPages = Math.ceil(totalEntries / limit)
    return { transactions, totalEntries, totalPages }
  } catch (err) {
    throw err
  }
}
export const getCachedTransactions = cache(getTransactions)

export async function getAllTransactions(
  userId: TUserId,
): Promise<TTransaction[]> {
  if (!userId) {
    throw new Error('User ID is required to fetch all transactions.')
  }
  try {
    await dbConnect()
    return TransactionModel.find({ userId }).lean<TTransaction[]>({
      transform: (doc: TRawTransaction) => {
        delete doc._id
        delete doc.__v
        return doc
      },
    })
  } catch (err) {
    throw err
  }
}
export const getCachedAllTransactions = cache(getAllTransactions)

// export async function editTransaction(
//   id: TTransaction['id'],
//   updates: Partial<TTransaction>,
// ): Promise<void> {
//   if (!id) {
//     throw new Error('Transaction ID is required to edit a transaction.')
//   }
//   if (!updates || Object.keys(updates).length === 0) {
//     throw new Error('No updates provided.')
//   }
//   try {
//     await dbConnect()
//     await TransactionModel.updateOne({ id }, { $set: updates })
//     revalidatePath(ROUTE.HOME)
//   } catch (err) {
//     throw err
//   }
// }

export async function deleteTransaction(id: TTransaction['id']): Promise<void> {
  if (!id) {
    throw new Error('Transaction ID is required to delete a transaction.')
  }
  try {
    await dbConnect()
    await TransactionModel.deleteOne({ id })
    revalidatePath(ROUTE.HOME)
  } catch (err) {
    throw err
  }
}

export async function deleteAllTransactionsAndSignOut(
  userId: TUserId,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to delete all transactions.')
  }
  try {
    await dbConnect()
    await Promise.all([
      TransactionModel.deleteMany({ userId }),
      signOutAccount(),
    ])
  } catch (err) {
    throw err
  }
}
