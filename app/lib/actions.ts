'use server'

import { cache } from 'react'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { auth, signOut } from '@/auth'
import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { SignOutError } from '@auth/core/errors'
import { Resend } from 'resend'

import { COOKIE_FEEDBACK } from '@/config/constants/cookies'
import {
  APP_NAME,
  DEFAULT_CATEGORY,
  DEFAULT_CATEGORY_EMOJI,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
  RESEND_API_KEY,
  RESEND_EMAIL,
} from '@/config/constants/main'
import { DEFAULT_TRANSACTION_LIMIT } from '@/config/constants/navigation'
import { ROUTE } from '@/config/constants/routes'

import TransactionModel from '@/app/lib/models/transaction.model'
import UserSettingsModel from '@/app/lib/models/user-settings.model'

import {
  CompletionAIModel,
  ExpenseTipsAIModel,
  TextAIModel,
  UploadReceiptAIModel,
} from './ai'
import { parseMonobankCsv, parsePrivat24Xlsx } from './data'
import {
  capitalizeFirstLetter,
  getCategoryItemNames,
  getCategoryWithEmoji,
  resolveImportedCategory,
} from './helpers'
import dbConnect from './mongodb'
import type {
  TBalance,
  TBalanceProjection,
  TBank,
  TCategories,
  TCategoryLimits,
  TCookie,
  TCurrency,
  TExpenseReport,
  TForecastData,
  TGetChangelog,
  TGetTransactions,
  TImportTransactions,
  TPushSubscription,
  TSession,
  TSubscriptions,
  TTransaction,
  TUserId,
} from './types'

export const getAuthSession = async (): Promise<TSession> => {
  try {
    const session = await auth()

    return session
  } catch (err) {
    throw err
  }
}
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
export const getCachedBalance = cache(getBalance)

export async function getBalanceCardData(userId: TUserId): Promise<{
  total: { income: number; expense: number }
  weeklyTransactions: Pick<TTransaction, 'amount' | 'isIncome' | 'createdAt'>[]
}> {
  if (!userId) {
    throw new Error('User ID is required to get balance card data.')
  }
  try {
    await dbConnect()
    const now = new Date()
    const utcWeekStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    )
    const daysSinceMonday = (utcWeekStart.getUTCDay() + 6) % 7
    utcWeekStart.setUTCDate(utcWeekStart.getUTCDate() - daysSinceMonday)
    const startDate = new Date(utcWeekStart)
    startDate.setUTCDate(startDate.getUTCDate() - 9)
    const endDate = new Date(utcWeekStart)
    endDate.setUTCDate(endDate.getUTCDate() + 8)

    const [totalTransactions, weeklyTransactions] = await Promise.all([
      TransactionModel.find({ userId })
        .select('amount isIncome -_id')
        .lean<Pick<TTransaction, 'amount' | 'isIncome'>[]>(),
      TransactionModel.find({
        userId,
        createdAt: { $gte: startDate, $lt: endDate },
      })
        .select('amount isIncome createdAt -_id')
        .lean<Pick<TTransaction, 'amount' | 'isIncome' | 'createdAt'>[]>(),
    ])
    const total = totalTransactions.reduce(
      (totals, transaction) => {
        const amount = parseFloat(transaction.amount)
        if (transaction.isIncome) totals.income += amount
        else totals.expense += amount

        return totals
      },
      { income: 0, expense: 0 },
    )

    return { total, weeklyTransactions }
  } catch (err) {
    throw err
  }
}

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

export async function getCurrency(userId: TUserId): Promise<TCurrency> {
  if (!userId) {
    throw new Error('User ID is required to fetch currency.')
  }
  try {
    await dbConnect()
    const userSettings = await UserSettingsModel.findOne({ userId })
      .select('currency -_id')
      .lean<{ currency: TCurrency }>()

    return (
      userSettings?.currency || {
        name: DEFAULT_CURRENCY_NAME,
        code: DEFAULT_CURRENCY_CODE,
        sign: DEFAULT_CURRENCY_SIGN,
      }
    )
  } catch (err) {
    throw err
  }
}
export const getCachedCurrency = cache(getCurrency)

export async function updateCurrency(
  userId: TUserId,
  currency: TCurrency,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to update currency.')
  }
  if (!currency) {
    throw new Error('Currency is required.')
  }
  try {
    await dbConnect()
    await UserSettingsModel.updateOne(
      { userId },
      { $set: { currency } },
      { upsert: true, setDefaultsOnInsert: false },
    )
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

export async function updateSalaryDay(
  userId: TUserId,
  salaryDay: TTransaction['salaryDay'],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to update salary day.')
  }
  if (
    salaryDay !== null &&
    salaryDay !== undefined &&
    (salaryDay < 1 || salaryDay > 31)
  ) {
    throw new Error('Salary day must be a valid number between 1 and 31.')
  }
  try {
    await dbConnect()
    await TransactionModel.updateMany({ userId }, { salaryDay })
    revalidatePath(ROUTE.HOME)
  } catch (err) {
    throw err
  }
}

export async function createTransaction(
  userId: TUserId,
  userCategories: TCategories[],
  userSalaryDay: TTransaction['salaryDay'],
  formData: FormData,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to create a transaction.')
  }
  if (!userCategories || userCategories.length === 0) {
    throw new Error(
      'At least one category is required to create a transaction.',
    )
  }
  try {
    const newTransaction: Omit<
      TTransaction,
      'createdAt' | 'updatedAt' | 'transactionLimit' | 'isEdited'
    > = {
      id: crypto.randomUUID(),
      userId,
      description: capitalizeFirstLetter(
        formData.get('description') as TTransaction['description'],
      ).trim(),
      amount: formData.get('amount') as TTransaction['amount'],
      category:
        getCategoryWithEmoji(formData.get('category'), userCategories) ||
        (`${DEFAULT_CATEGORY_EMOJI} ${DEFAULT_CATEGORY}` as TTransaction['category']),
      isIncome: (formData.get('isIncome') ===
        'true') as TTransaction['isIncome'],
      isSubscription: (formData.get('isSubscription') ===
        'true') as TTransaction['isSubscription'],
      isTest: (formData.get('isTest') === 'true') as TTransaction['isTest'],
      balance: '0' as TTransaction['balance'],
      salaryDay: userSalaryDay,
      images: JSON.parse(
        formData.get('images')?.toString() || '[]',
      ) as TTransaction['images'],
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

    const dateStr = formData.get('date')?.toString()
    const customDate = dateStr ? new Date(dateStr) : null
    const createPayload =
      customDate && !isNaN(customDate.getTime())
        ? { ...newTransaction, createdAt: customDate }
        : newTransaction

    await dbConnect()
    const session = await TransactionModel.startSession()
    try {
      session.startTransaction()
      await TransactionModel.create([createPayload], { session })
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
  const cookieStore = await cookies()
  cookieStore.set(name, value, {
    maxAge,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: ROUTE.HOME,
  })
}

export async function sendFeedback(formData: FormData) {
  const RESEND = new Resend(RESEND_API_KEY)
  const feedback = formData.get('feedback')?.toString().trim()
  if (!feedback) {
    throw new Error('Feedback is required.')
  }
  try {
    await Promise.all([
      RESEND.emails.send({
        from: `${APP_NAME.FULL} <onboarding@resend.dev>`,
        to: RESEND_EMAIL,
        subject: 'Feedback',
        html: `<h3>${feedback}</h3>`,
      }),
      setCookie(
        COOKIE_FEEDBACK.NAME,
        COOKIE_FEEDBACK.VALUE,
        COOKIE_FEEDBACK.MAX_AGE,
      ),
    ])
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

export async function getUserSettingsCategories(
  userId: TUserId,
): Promise<TCategories[]> {
  if (!userId) {
    throw new Error('User ID is required to fetch user categories.')
  }
  try {
    await dbConnect()
    const userSettings = await UserSettingsModel.findOne({ userId })
      .select('categories -_id')
      .lean<{ categories: TCategories[] }>()

    return userSettings?.categories || DEFAULT_CATEGORIES
  } catch (err) {
    throw err
  }
}
export const getCachedUserCategories = cache(getUserSettingsCategories)

export async function getUserPushSubscriptions(
  userId: TUserId,
): Promise<TPushSubscription[]> {
  if (!userId) {
    throw new Error('User ID is required to fetch push subscriptions.')
  }
  try {
    await dbConnect()
    const userSettings = await UserSettingsModel.findOne({ userId })
      .select('pushSubscriptions -_id')
      .lean<{ pushSubscriptions: TPushSubscription[] }>()

    return userSettings?.pushSubscriptions || []
  } catch (err) {
    throw err
  }
}

export async function updateUserCategories(
  userId: TUserId,
  categories: TCategories[],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to update categories.')
  }
  try {
    await dbConnect()
    await UserSettingsModel.updateOne(
      { userId },
      { $set: { categories } },
      { upsert: true },
    )
  } catch (err) {
    throw err
  }
}

export async function getTransactions(
  userId: TUserId,
  offset: number = 0,
  limit: number = DEFAULT_TRANSACTION_LIMIT,
): Promise<TGetTransactions> {
  if (!userId) {
    throw new Error('User ID is required to get transactions.')
  }
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
    throw new Error('User ID is required to get all transactions.')
  }
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
export const getCachedAllTransactions = cache(getAllTransactions)

export async function getMonthlyReportTransactions(
  userId: TUserId,
): Promise<TTransaction[]> {
  if (!userId) {
    throw new Error('User ID is required to get monthly report transactions.')
  }
  try {
    await dbConnect()

    return TransactionModel.find({ userId })
      .select('amount isIncome category createdAt -_id')
      .lean<TTransaction[]>()
  } catch (err) {
    throw err
  }
}

export async function getTransactionsWithChangedCategoryIds(
  userId: TUserId,
  categories: TCategories[],
): Promise<TTransaction['id'][]> {
  if (!userId) {
    throw new Error(
      'User ID is required to get transactions with changed categories.',
    )
  }
  try {
    await dbConnect()
    const categoryNames = categories.flatMap((category) =>
      category.items.map((item) => `${item.emoji} ${item.name}`),
    )
    const transactions = await TransactionModel.find({
      userId,
      category: { $nin: categoryNames },
    })
      .select('id -_id')
      .lean<{ id: TTransaction['id'] }[]>()

    return transactions.map((transaction) => transaction.id)
  } catch (err) {
    throw err
  }
}

export async function getSubscriptionTransactions(
  userId: TUserId,
): Promise<TTransaction[]> {
  if (!userId) {
    throw new Error('User ID is required to get subscription transactions.')
  }
  try {
    await dbConnect()

    return TransactionModel.find({ userId, isSubscription: true }).lean<
      TTransaction[]
    >({
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

export async function getRecentTransactionsForLimits(
  userId: TUserId,
): Promise<TTransaction[]> {
  if (!userId) {
    throw new Error('User ID is required to get transactions for limits.')
  }
  try {
    await dbConnect()
    const now = new Date()
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    )
    const startDate = new Date(monthStart)
    startDate.setUTCMonth(startDate.getUTCMonth() - 2)
    startDate.setUTCDate(startDate.getUTCDate() - 2)
    const endDate = new Date(monthStart)
    endDate.setUTCMonth(endDate.getUTCMonth() + 1)
    endDate.setUTCDate(endDate.getUTCDate() + 2)

    return TransactionModel.find({
      userId,
      createdAt: { $gte: startDate, $lt: endDate },
    }).lean<TTransaction[]>({
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

export async function importTransactions(
  userId: TUserId,
  transactions: Partial<TTransaction>[],
): Promise<TImportTransactions> {
  if (!userId) {
    throw new Error('User ID is required to get all transactions.')
  }
  try {
    await dbConnect()

    const ids = transactions.map((t) => t.id)
    // Find which IDs already exist.
    const existing = await TransactionModel.find({ userId, id: { $in: ids } })
      .lean()
      .select('id')
    const existingIds = new Set(existing.map((t) => t.id))

    const newTransactions = transactions.filter((t) => !existingIds.has(t.id))
    const skipped = transactions.length - newTransactions.length

    if (!newTransactions.length) {
      return { count: 0, skipped }
    }

    const result = await TransactionModel.insertMany(
      newTransactions.map((transaction) => ({ ...transaction, userId })),
      { ordered: false },
    )

    return { count: result.length, skipped }
  } catch (err) {
    throw err
  }
}

export async function importBankTransactions(
  userId: TUserId,
  userCategories: TCategories[],
  userSalaryDay: TTransaction['salaryDay'],
  bank: TBank,
  payload: string, // csvText for Monobank, base64 for Privat24.
): Promise<TImportTransactions> {
  if (!userId) {
    throw new Error('User ID is required to create a transaction.')
  }
  if (!userCategories || userCategories.length === 0) {
    throw new Error(
      'At least one category is required to create a transaction.',
    )
  }

  const { rows: validRows, skipped: parseSkipped } =
    bank === 'monobank'
      ? parseMonobankCsv(payload)
      : await parsePrivat24Xlsx(payload)

  let skipped = parseSkipped

  const resolvedCategories = await Promise.all(
    validRows.map(({ description, mcc }) =>
      resolveImportedCategory(userCategories, description, mcc),
    ),
  )

  const transactions: Omit<TTransaction, 'isEdited' | 'transactionLimit'>[] =
    validRows.map(({ rawAmount, description, createdAt }, i) => ({
      id: crypto.randomUUID(),
      userId,
      description,
      amount: Math.round(Math.abs(rawAmount)).toString().replace(/\s/g, ''),
      category: resolvedCategories[i],
      isIncome: rawAmount > 0,
      isSubscription: false,
      isTest: false,
      balance: rawAmount.toString(),
      salaryDay: userSalaryDay,
      images: [],
      createdAt,
      updatedAt: createdAt,
    }))

  await dbConnect()

  const existingDates = await TransactionModel.find(
    { userId, createdAt: { $in: transactions.map((t) => t.createdAt) } },
    { description: 1, createdAt: 1, _id: 0 },
  ).lean()
  const existingSet = new Set(
    existingDates.map((t) => `${t.description}__${t.createdAt.getTime()}`),
  )
  const newTransactions = transactions.filter(
    (t) => !existingSet.has(`${t.description}__${t.createdAt.getTime()}`),
  )

  skipped += transactions.length - newTransactions.length

  if (!newTransactions.length) return { count: 0, skipped }

  const session = await TransactionModel.startSession()
  try {
    session.startTransaction()
    await TransactionModel.insertMany(newTransactions, { session })
    await session.commitTransaction()
    session.endSession()

    return { count: newTransactions.length, skipped }
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    throw err
  }
}

export async function editTransactionById(
  id: TTransaction['id'],
  newTransactionData: Partial<TTransaction>,
): Promise<void> {
  if (!id) {
    throw new Error('Transaction ID is required to update a transaction.')
  }
  try {
    await dbConnect()
    const session = await TransactionModel.startSession()
    try {
      session.startTransaction()
      const updateFields: Partial<TTransaction> = {}
      if (newTransactionData.description) {
        updateFields.description = newTransactionData.description.trim()
      }
      if (newTransactionData.amount) {
        updateFields.amount = newTransactionData.amount.replace(/\s/g, '')
        const amount = parseFloat(updateFields.amount)
        let balance = 0
        if (newTransactionData.isIncome) {
          balance += amount
        } else {
          balance -= amount
        }
        updateFields.balance = balance.toString()
      }
      if (newTransactionData.category) {
        updateFields.category = newTransactionData.category
      }
      if (newTransactionData.isIncome !== undefined) {
        updateFields.isIncome = newTransactionData.isIncome
      }
      if (newTransactionData.isEdited) {
        updateFields.isEdited = newTransactionData.isEdited
      }
      if (newTransactionData.images) {
        updateFields.images = newTransactionData.images
      }
      const newCreatedAt = newTransactionData.createdAt
        ? new Date(newTransactionData.createdAt)
        : null
      await TransactionModel.updateOne({ id }, updateFields, { session })
      if (newCreatedAt) {
        await TransactionModel.collection.updateOne(
          { id },
          { $set: { createdAt: newCreatedAt } },
          { session },
        )
      }
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

export async function updateCategories(
  userId: TUserId,
  subjectName: TCategories['subject'],
  updatedCategories: Partial<TCategories>,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to update categories.')
  }
  if (!subjectName) {
    throw new Error('Category subject name is required.')
  }
  if (!updatedCategories) {
    throw new Error('Updated categories are required.')
  }

  try {
    await dbConnect()
    const userCategories = await getUserSettingsCategories(userId)
    // If the category's items are empty, delete the category.
    if (updatedCategories.items && updatedCategories.items.length === 0) {
      await updateUserCategories(
        userId,
        userCategories.filter((category) => category.subject !== subjectName),
      )
    } else {
      // Otherwise, update the subject and/or items
      const newCategories: Partial<TCategories> = {}
      if (updatedCategories.subject) {
        newCategories.subject = updatedCategories.subject
      }
      if (updatedCategories.items) {
        newCategories.items = updatedCategories.items
      }
      await updateUserCategories(
        userId,
        userCategories.map((category) =>
          category.subject === subjectName
            ? { ...category, ...newCategories }
            : category,
        ),
      )
    }
    revalidatePath(ROUTE.CATEGORIES)
  } catch (err) {
    throw err
  }
}

export async function resetCategories(
  userId: TUserId,
  categories: TCategories[],
  withPathRevalidate: boolean = true,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to update categories.')
  }
  try {
    await dbConnect()
    await updateUserCategories(userId, categories)
    if (withPathRevalidate) revalidatePath(ROUTE.CATEGORIES)
  } catch (err) {
    throw err
  }
}

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

export async function deleteTestTransactions(userId: TUserId): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to delete test transactions.')
  }
  try {
    await dbConnect()
    await TransactionModel.deleteMany({ userId, isTest: true })
    revalidatePath(ROUTE.HOME)
  } catch (err) {
    throw err
  }
}

export async function findTransactionById(
  id: TTransaction['id'],
): Promise<TTransaction | null> {
  if (!id) {
    throw new Error(
      'Transaction ID and User ID are required to find a transaction.',
    )
  }
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

export async function deleteAllTransactionsAndSignOut(
  userId: TUserId,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to delete all transactions.')
  }

  await dbConnect()
  await Promise.all([
    TransactionModel.deleteMany({ userId }),
    UserSettingsModel.deleteOne({ userId }),
  ])
  await signOutAccount()
}

export async function getCategoryLimits(
  userId: TUserId,
): Promise<TCategoryLimits[]> {
  if (!userId) {
    throw new Error('User ID is required to get category limits.')
  }
  try {
    await dbConnect()
    const userSettings = await UserSettingsModel.findOne({ userId })
      .select('categoryLimits -_id')
      .lean<{ categoryLimits: TCategoryLimits[] }>()

    return userSettings?.categoryLimits || []
  } catch (err) {
    throw err
  }
}

export async function getSalaryDay(
  userId: TUserId,
): Promise<TTransaction['salaryDay']> {
  if (!userId) {
    throw new Error('User ID is required to get salary day.')
  }
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
export const getCachedSalaryDay = cache(getSalaryDay)

export async function addLimit(
  userId: TUserId,
  categoryLimits: TCategoryLimits[],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to add category limits.')
  }
  if (!categoryLimits) {
    throw new Error('Category limits are required.')
  }
  try {
    await dbConnect()
    await UserSettingsModel.updateOne(
      { userId },
      { $set: { categoryLimits } },
      { upsert: true, setDefaultsOnInsert: false },
    )
    revalidatePath(ROUTE.LIMITS)
  } catch (err) {
    throw err
  }
}

export async function deleteLimit(
  userId: TUserId,
  categoryName: TCategoryLimits['categoryName'],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to delete a category limit.')
  }
  if (!categoryName) {
    throw new Error('Category name is required.')
  }
  try {
    await dbConnect()
    const categoryLimits = await getCategoryLimits(userId)
    const updatedCategoryLimits = categoryLimits.filter(
      (limit: TCategoryLimits) => limit.categoryName !== categoryName,
    )
    await UserSettingsModel.updateOne(
      { userId },
      { $set: { categoryLimits: updatedCategoryLimits } },
      { upsert: true, setDefaultsOnInsert: false },
    )
    revalidatePath(ROUTE.LIMITS)
  } catch (err) {
    throw err
  }
}

export async function editLimit(
  userId: TUserId,
  categoryName: TCategoryLimits['categoryName'],
  newLimitAmount: TCategoryLimits['limitAmount'],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to edit a category limit.')
  }
  if (!categoryName) {
    throw new Error('Category name is required.')
  }
  if (!newLimitAmount) {
    throw new Error('New limit amount is required.')
  }
  try {
    await dbConnect()
    const categoryLimits = await getCategoryLimits(userId)
    const updatedCategoryLimits = categoryLimits.map(
      (limit: TCategoryLimits) => {
        if (limit.categoryName === categoryName) {
          return {
            categoryName,
            limitAmount: newLimitAmount,
          }
        }

        return limit
      },
    )
    await UserSettingsModel.updateOne(
      { userId },
      { $set: { categoryLimits: updatedCategoryLimits } },
      { upsert: true, setDefaultsOnInsert: false },
    )
    revalidatePath(ROUTE.LIMITS)
  } catch (err) {
    throw err
  }
}

export async function addSubscription(
  userId: TUserId,
  subscriptions: Omit<TSubscriptions, '_id'>[],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to add subscription.')
  }
  if (!subscriptions) {
    throw new Error('Subscriptions are required.')
  }
  try {
    await dbConnect()
    await UserSettingsModel.updateOne(
      { userId },
      { $set: { subscriptions } },
      { upsert: true, setDefaultsOnInsert: false },
    )
    revalidatePath(ROUTE.SUBSCRIPTIONS)
  } catch (err) {
    throw err
  }
}

export async function getSubscriptions(
  userId: TUserId,
): Promise<TSubscriptions[]> {
  if (!userId) {
    throw new Error('User ID is required to get subscriptions.')
  }
  try {
    await dbConnect()
    const userSettings = await UserSettingsModel.findOne({ userId })
      .select('subscriptions -_id')
      .lean<{ subscriptions: TSubscriptions[] }>()
    const subscriptions = userSettings?.subscriptions || []

    return subscriptions.map((subscription) => ({
      ...subscription,
      _id: String(subscription._id),
    }))
  } catch (err) {
    throw err
  }
}

export async function editSubscription(
  userId: TUserId,
  _id: TTransaction['id'],
  category: TSubscriptions['category'],
  description: TSubscriptions['description'],
  amount: TSubscriptions['amount'],
  note: TSubscriptions['note'],
  autoRenew: TSubscriptions['autoRenew'],
  renewDay: TSubscriptions['renewDay'],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to edit subscriptions.')
  }
  if (!_id) {
    throw new Error('_id is required to edit subscription.')
  }
  if (!category) {
    throw new Error('Category is required to edit subscription.')
  }
  if (!description) {
    throw new Error('Description is required to edit subscription.')
  }
  if (!amount) {
    throw new Error('Amount is required to edit subscription.')
  }
  try {
    await dbConnect()
    const subscriptions = await getSubscriptions(userId)
    await UserSettingsModel.updateOne(
      { userId },
      {
        $set: {
          subscriptions: subscriptions.map((subscription) =>
            subscription._id === _id
              ? {
                  ...subscription,
                  category,
                  description,
                  amount,
                  note,
                  autoRenew,
                  renewDay,
                }
              : subscription,
          ),
        },
      },
      { upsert: true, setDefaultsOnInsert: false },
    )
    revalidatePath(ROUTE.SUBSCRIPTIONS)
  } catch (err) {
    throw err
  }
}

export async function deleteSubscription(
  userId: TUserId,
  _id: TTransaction['id'],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to delete subscription.')
  }
  if (!_id) {
    throw new Error('_id is required to delete subscription.')
  }
  try {
    await dbConnect()
    const subscriptions = await getSubscriptions(userId)
    await UserSettingsModel.updateOne(
      { userId },
      {
        $set: {
          subscriptions: subscriptions.filter(
            (subscription) => subscription._id !== _id,
          ),
        },
      },
      { upsert: true, setDefaultsOnInsert: false },
    )
    revalidatePath(ROUTE.SUBSCRIPTIONS)
  } catch (err) {
    throw err
  }
}

export async function resetAllSubscriptions(userId: TUserId): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to remove all subscriptions.')
  }
  try {
    await dbConnect()
    await UserSettingsModel.updateOne(
      { userId },
      { $set: { subscriptions: [] } },
      { upsert: true, setDefaultsOnInsert: false },
    )
    revalidatePath(ROUTE.SUBSCRIPTIONS)
  } catch (err) {
    throw err
  }
}

export async function getCategoryItemNameAI(
  categories: TCategories[],
  userPrompt: string,
): Promise<string> {
  if (!categories || !userPrompt) {
    throw new Error('Categories or user prompt are required.')
  }

  try {
    const categoriesStr = getCategoryItemNames(categories).join(', ')

    const prompt = `Given the list of categories: ${categoriesStr} - choose the most relevant category for the prompt '${userPrompt}' in one word.`

    const content = await CompletionAIModel.generateContent(prompt)
    const text = content.response.text().trim()

    return text
  } catch (err) {
    throw err
  }
}
export const getCachedCategoryItemAI = cache(getCategoryItemNameAI)

export async function getAmountAI(
  currencyCode: TCurrency['code'],
  userPrompt: string,
): Promise<string> {
  if (!currencyCode || !userPrompt) {
    throw new Error('Currency or user prompt is required.')
  }

  try {
    const prompt = `${userPrompt}. Provide a numerical estimate of the cost in ${currencyCode}, disregarding real-time price fluctuations. Omit any decimal points, commas, or other symbols.`

    const content = await CompletionAIModel.generateContent(prompt)
    const text = content.response.text().trim()

    return text
  } catch (err) {
    throw err
  }
}
export const getCachedAmountAI = cache(getAmountAI)

export async function getTransactionTypeAI(
  userPrompt: string,
): Promise<string> {
  if (!userPrompt) {
    throw new Error('User prompt is required.')
  }

  try {
    const prompt = `Analyze the following transaction description and determine if it is an income or expense. The output must be in one word, 'true' for income and 'false' for expense. Description: '${userPrompt}'`

    const content = await CompletionAIModel.generateContent(prompt)
    const text = content.response.text().trim()

    return text
  } catch (err) {
    throw err
  }
}
export const getCachedTransactionTypeAI = cache(getTransactionTypeAI)

export async function getExpenseTipsAI(
  categories: string[],
  currency: TCurrency,
): Promise<string> {
  if (!categories) {
    throw new Error('Categories are required.')
  }
  if (!currency) {
    throw new Error('Currency is required.')
  }

  try {
    const categoriesStr = categories.join(', ')

    const prompt = `
You are a personal finance assistant.

For each of the following categories: ${categoriesStr}, generate one practical and realistic tip for reducing expenses.

Requirements:
- Use each category name exactly as listed: ${categoriesStr}
- Begin each category with a relevant emoji
- Provide a realistic savings estimate using the format like: "Up to X ${currency.code} per month."
- The X should use spaces as thousand separators (e.g., 2 000, 20 000, 200 000, 2 000 000).
- Output exactly one tip per category
`

    const content = await ExpenseTipsAIModel.generateContent(prompt)
    const text = content.response.text().trim()

    return text
  } catch (err) {
    throw err
  }
}
export const getCachedExpenseTipsAI = cache(getExpenseTipsAI)

export async function getAnalyzedReceiptAI(file: Blob): Promise<string> {
  if (!file) {
    throw new Error('File blob is required.')
  }

  const prompt =
    'Analyze the provided receipt image. Extract and return structured information for each valid product, including details such as product description and amount, while excluding items with negative amounts or irrelevant entries (e.g., cashier names, cash register details, or non-product-related text). Do not include general summaries, totals, or subtotals. If the input is not a receipt image or contains invalid data, return an empty array.'

  try {
    const imageParts = [
      {
        inlineData: {
          data: Buffer.from(await file.arrayBuffer()).toString('base64'),
          mimeType: file.type,
        },
      },
    ]

    const content = await UploadReceiptAIModel.generateContent([
      prompt,
      ...imageParts,
    ])
    const text = content.response.text().trim()

    return text
  } catch (err) {
    throw err
  }
}

export async function formatChangelogMessageAI(
  commitMsg: string,
): Promise<string> {
  if (!commitMsg) {
    throw new Error('Commit message is required.')
  }

  try {
    const prompt = `Rewrite this git commit message into a clean, user-facing changelog entry (1-3 short sentences). No quotes, no conventional commit prefixes (e.g. "feat:", "refactor:"). Focus on what changed for the user.\n\nCommit: "${commitMsg}"`

    const content = await TextAIModel.generateContent(prompt)
    const text = content.response.text().trim()

    return text
  } catch (err) {
    throw err
  }
}

export async function getChangelog(): Promise<TGetChangelog> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/uigywnkiub/explend-app/commits?sha=main&per_page=1',
      {
        headers: {
          Authorization: `Bearer ${process.env.EXPLEND_APP_GITHUB_TOKEN}`,
        },
      },
    )
    if (!res.ok) {
      throw new Error('Failed to fetch changelog data.')
    }
    const data = await res.json()

    return {
      sha: data[0]?.sha?.slice(0, 7) || '',
      msg: (await formatChangelogMessageAI(data[0]?.commit?.message)) || '',
    }
  } catch (err) {
    throw err
  }
}

export async function formatWeeklyReportAI(data: {
  totalIncome: TForecastData['totalIncome']
  totalExpense: TForecastData['totalExpense']
  transactionCount: number
  expenseReportData: TExpenseReport[]
  biggestExpense: TTransaction | null
  currencySign: TCurrency['sign']
}): Promise<string> {
  const {
    totalIncome,
    totalExpense,
    transactionCount,
    expenseReportData,
    biggestExpense,
    currencySign,
  } = data

  const topCategories = expenseReportData
    .slice(0, 3)
    .map((e) => `${e.category} (${e.percentage}%)`)
    .join(', ')

  const prompt = `Write a short, friendly weekly financial summary (2-3 sentences) for the PREVIOUS week based on this data:
- Total income: ${totalIncome} ${currencySign}
- Total expenses: ${totalExpense} ${currencySign}
- Transactions: ${transactionCount}
- Top expense categories: ${topCategories}
${biggestExpense ? `- Biggest single expense: ${biggestExpense.category} — ${biggestExpense.amount} ${currencySign}` : ''}

Start with "Last week". No bullet points. No markdown. Just plain text. Be concise and human. Format amounts with space as thousands separator (e.g. 1 000).`

  const content = await TextAIModel.generateContent(prompt)

  return content.response.text().trim()
}
