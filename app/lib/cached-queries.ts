import { cacheLife, cacheTag } from 'next/cache'

import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
  DEFAULT_SALARY_DAY,
} from '@/config/constants/main'
import { DEFAULT_TRANSACTION_LIMIT } from '@/config/constants/navigation'

import TransactionModel from '@/app/lib/models/transaction.model'
import UserSettingsModel from '@/app/lib/models/user-settings.model'

import dbConnect from './mongodb'
import type {
  TBalance,
  TBalanceProjection,
  TCategories,
  TCategoryLimits,
  TCurrency,
  TGetTransactions,
  TSubscriptions,
  TTableTransaction,
  TTransaction,
  TUserId,
  TUserSettings,
} from './types'

export const getUserSettingsCacheTag = (userId: TUserId) =>
  `user-settings-${userId}`

export const getUserTransactionsCacheTag = (userId: TUserId) =>
  `user-transactions-${userId}`

export async function getCachedBalanceData(
  userId: TUserId,
): Promise<TTransaction['balance']> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to fetch balance.')

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
}

export async function getCachedBalanceCardData(userId: TUserId): Promise<{
  total: { income: number; expense: number }
  weeklyTransactions: Pick<TTransaction, 'amount' | 'isIncome' | 'createdAt'>[]
}> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to get balance card data.')

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
}

export async function getCachedTransactionLimitData(
  userId: TUserId,
): Promise<TUserSettings['transactionLimit']> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserSettingsCacheTag(userId))

  if (!userId)
    throw new Error('User ID is required to fetch transaction limit.')

  await dbConnect()
  const userSettings = await UserSettingsModel.findOne({ userId })
    .select('transactionLimit -_id')
    .lean<{ transactionLimit: TUserSettings['transactionLimit'] }>()

  return userSettings?.transactionLimit
}

export async function getCachedCurrencyData(
  userId: TUserId,
): Promise<TCurrency> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserSettingsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to fetch currency.')

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
}

export async function getCachedCountDocumentsData(
  userId: TUserId,
): Promise<TGetTransactions['totalEntries']> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to fetch count documents.')

  await dbConnect()

  return TransactionModel.countDocuments({ userId })
}

export async function getCachedUserCategoriesData(
  userId: TUserId,
): Promise<TCategories[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserSettingsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to fetch user categories.')

  await dbConnect()
  const userSettings = await UserSettingsModel.findOne({ userId })
    .select('categories -_id')
    .lean<{ categories: TCategories[] }>()

  return userSettings?.categories || DEFAULT_CATEGORIES
}

export async function getCachedTransactionsData(
  userId: TUserId,
  offset: number = 0,
  limit: number = DEFAULT_TRANSACTION_LIMIT,
  isSearch: boolean = false,
): Promise<TGetTransactions> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to get transactions.')

  await dbConnect()
  const transactionsQuery = TransactionModel.find({ userId })
  if (isSearch) {
    transactionsQuery.select(
      'id userId category images description amount isIncome isEdited isSubscription isTest createdAt -_id',
    )
  }
  const [transactions, totalEntries] = await Promise.all([
    transactionsQuery
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
    getCachedCountDocumentsData(userId),
  ])

  return {
    transactions,
    totalEntries,
    totalPages: Math.ceil(totalEntries / limit),
  }
}

export async function getCachedTableTransactionsData(
  userId: TUserId,
): Promise<TTableTransaction[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to get table transactions.')

  await dbConnect()

  return TransactionModel.aggregate<TTableTransaction>([
    { $match: { userId } },
    {
      $project: {
        _id: 0,
        id: 1,
        category: 1,
        description: 1,
        amount: 1,
        isIncome: 1,
        createdAt: 1,
        imagesCount: { $size: { $ifNull: ['$images', []] } },
      },
    },
  ])
}

export async function getCachedChartTransactionsData(
  userId: TUserId,
): Promise<TTransaction[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to get chart transactions.')

  await dbConnect()

  return TransactionModel.find({ userId })
    .select('category amount isIncome createdAt -_id')
    .lean<TTransaction[]>({
      transform: (doc) => {
        if (!doc) return
        delete doc.__v
      },
    })
}

export async function getCachedMonthlyReportTransactionsData(
  userId: TUserId,
): Promise<TTransaction[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) {
    throw new Error('User ID is required to get monthly report transactions.')
  }

  await dbConnect()

  return TransactionModel.find({ userId })
    .select('amount isIncome category createdAt -_id')
    .lean<TTransaction[]>()
}

export async function getCachedSubscriptionTransactionsData(
  userId: TUserId,
): Promise<TTransaction[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) {
    throw new Error('User ID is required to get subscription transactions.')
  }

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
}

export async function getCachedRecentTransactionsForLimitsData(
  userId: TUserId,
): Promise<TTransaction[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) {
    throw new Error('User ID is required to get transactions for limits.')
  }

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
  })
    .select('amount isIncome category createdAt -_id')
    .lean<TTransaction[]>()
}

export async function getCachedCategoryLimitsData(
  userId: TUserId,
): Promise<TCategoryLimits[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserSettingsCacheTag(userId))

  if (!userId) {
    throw new Error('User ID is required to get category limits.')
  }

  await dbConnect()
  const userSettings = await UserSettingsModel.findOne({ userId })
    .select('categoryLimits -_id')
    .lean<{ categoryLimits: TCategoryLimits[] }>()

  return userSettings?.categoryLimits || []
}

export async function getCachedSalaryDayData(
  userId: TUserId,
): Promise<TUserSettings['salaryDay']> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserSettingsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to get salary day.')

  await dbConnect()
  const userSettings = await UserSettingsModel.findOne({ userId })
    .select('salaryDay -_id')
    .lean<{ salaryDay: TUserSettings['salaryDay'] }>()

  return userSettings ? userSettings.salaryDay : DEFAULT_SALARY_DAY
}

export async function getCachedSubscriptionsData(
  userId: TUserId,
): Promise<TSubscriptions[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserSettingsCacheTag(userId))

  if (!userId) throw new Error('User ID is required to get subscriptions.')

  await dbConnect()
  const userSettings = await UserSettingsModel.findOne({ userId })
    .select('subscriptions -_id')
    .lean<{ subscriptions: TSubscriptions[] }>()

  return (userSettings?.subscriptions || []).map((subscription) => ({
    ...subscription,
    _id: subscription._id.toString(),
  }))
}

export async function getCachedTransactionsWithChangedCategoryIdsData(
  userId: TUserId,
  categories: TCategories[],
): Promise<TTransaction['id'][]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(getUserTransactionsCacheTag(userId))

  if (!userId) {
    throw new Error(
      'User ID is required to get transactions with changed categories.',
    )
  }

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
}
