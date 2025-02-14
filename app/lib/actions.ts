'use server'

import { cache } from 'react'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { auth, signOut } from '@/auth'
import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { SignOutError } from '@auth/core/errors'
import { isObjectIdOrHexString } from 'mongoose'
import { Resend } from 'resend'

import { FEEDBACK } from '@/config/constants/cookies'
import { APP_NAME, CURRENCY_CODE } from '@/config/constants/main'
import { DEFAULT_TRANSACTION_LIMIT } from '@/config/constants/navigation'
import { ROUTE } from '@/config/constants/routes'

import TransactionModel from '@/app/lib/models/transaction.model'

import {
  CompletionAIModel,
  ExpenseTipsAIModel,
  UploadReceiptAIModel,
} from './ai'
import {
  capitalizeFirstLetter,
  formatObjectIdToString,
  getCategoryItemNames,
  getCategoryWithEmoji,
} from './helpers'
import dbConnect from './mongodb'
import type {
  TBalance,
  TBalanceProjection,
  TCategories,
  TCategoryLimits,
  TCookie,
  TGetTransactions,
  TRawTransaction,
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
      transform: (doc: TRawTransaction) => {
        delete doc?._id

        return doc
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
  userCategories: TTransaction['categories'],
  formData: FormData,
  withPathRevalidate: boolean = true,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to create a transaction.')
  }
  try {
    const newTransaction: Omit<
      TTransaction,
      | 'createdAt'
      | 'updatedAt'
      | 'transactionLimit'
      | 'isEdited'
      | 'categoryLimits'
      | 'subscriptions'
    > = {
      id: crypto.randomUUID(),
      userId,
      description: capitalizeFirstLetter(
        formData.get('description') as TTransaction['description'],
      ).trim(),
      amount: formData.get('amount') as TTransaction['amount'],
      category: getCategoryWithEmoji(
        formData.get('category'),
        userCategories || DEFAULT_CATEGORIES,
      ) as TTransaction['category'],
      isIncome: Boolean(formData.get('isIncome')),
      isSubscription: Boolean(formData.get('isSubscription')),
      balance: '0' as TTransaction['balance'],
      currency,
      categories: userCategories,
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
      if (withPathRevalidate) revalidatePath(ROUTE.HOME)
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
            delete doc?._id
            delete doc?.__v

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
        delete doc?._id
        delete doc?.__v

        return doc
      },
    })
  } catch (err) {
    throw err
  }
}
export const getCachedAllTransactions = cache(getAllTransactions)

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
      if (newTransactionData.currency) {
        updateFields.currency = newTransactionData.currency
      }
      if (newTransactionData.isIncome !== undefined) {
        updateFields.isIncome = newTransactionData.isIncome
      }
      if (newTransactionData.isEdited) {
        updateFields.isEdited = newTransactionData.isEdited
      }
      await TransactionModel.updateOne({ id }, updateFields, { session })
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
    const newCategories: Partial<TCategories> = {}
    if (updatedCategories.subject) {
      newCategories.subject = updatedCategories.subject
    }
    if (updatedCategories.items) {
      newCategories.items = updatedCategories.items
    }
    await TransactionModel.updateMany(
      { userId, 'categories.subject': subjectName },
      { $set: { 'categories.$': newCategories } },
    )
    revalidatePath(ROUTE.CATEGORIES)
  } catch (err) {
    throw err
  }
}

export async function resetCategories(
  userId: TUserId,
  categories: TTransaction['categories'],
  withPathRevalidate: boolean = true,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to update categories.')
  }
  try {
    await dbConnect()
    await TransactionModel.updateMany({ userId }, { categories })
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
      transform: (doc: TRawTransaction) => {
        delete doc?._id
        delete doc?.__v

        return doc
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

export async function getCategoryLimits(
  userId: TUserId,
): Promise<TTransaction['categoryLimits']> {
  if (!userId) {
    throw new Error('User ID is required to get category limits.')
  }
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

export async function addCategoryLimit(
  userId: TUserId,
  categoryLimits: TTransaction['categoryLimits'],
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to add category limits.')
  }
  if (!categoryLimits) {
    throw new Error('Category limits are required.')
  }
  try {
    await dbConnect()
    await TransactionModel.updateMany({ userId }, { categoryLimits })
    revalidatePath(ROUTE.LIMITS)
  } catch (err) {
    throw err
  }
}

export async function deleteCategoryLimit(
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
    const transaction = await TransactionModel.findOne({ userId })
    if (!transaction) {
      throw new Error('Transaction data not found for the user.')
    }
    const updatedCategoryLimits = transaction.categoryLimits.filter(
      (limit: TCategoryLimits) => limit.categoryName !== categoryName,
    )
    await TransactionModel.updateMany(
      { userId },
      { categoryLimits: updatedCategoryLimits },
    )
    revalidatePath(ROUTE.LIMITS)
  } catch (err) {
    throw err
  }
}

export async function editCategoryLimit(
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
    const transaction = await TransactionModel.findOne({ userId })
    if (!transaction) {
      throw new Error('Transaction data not found for the user.')
    }
    const updatedCategoryLimits = transaction.categoryLimits.map(
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
    await TransactionModel.updateMany(
      { userId },
      { categoryLimits: updatedCategoryLimits },
    )
    revalidatePath(ROUTE.LIMITS)
  } catch (err) {
    throw err
  }
}

export async function addSubscription(
  userId: TUserId,
  subscription: Omit<TSubscriptions, '_id'>,
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to add subscription.')
  }
  if (!subscription) {
    throw new Error('Subscription is required.')
  }
  try {
    await dbConnect()
    await TransactionModel.updateMany(
      { userId },
      { $push: { subscriptions: subscription } },
    )
    revalidatePath(ROUTE.SUBSCRIPTIONS)
  } catch (err) {
    throw err
  }
}

export async function getSubscriptions(
  userId: TUserId,
): Promise<TTransaction['subscriptions']> {
  if (!userId) {
    throw new Error('User ID is required to get subscriptions.')
  }
  try {
    await dbConnect()
    const transaction = await TransactionModel.findOne(
      { userId },
      { subscriptions: 1, _id: 1 },
    ).lean<{ subscriptions: TTransaction['subscriptions'] }>({
      transform: (doc: TRawTransaction) => {
        if (doc._id && isObjectIdOrHexString(doc._id)) {
          // @ts-expect-error: doc._id is ObjectId and it has toString method. To avoid undefined we use to boolean checking.
          doc._id = formatObjectIdToString(doc._id)
        }

        return doc
      },
    })

    return transaction?.subscriptions || []
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
    await TransactionModel.updateMany(
      { userId, 'subscriptions._id': _id },
      {
        $set: {
          'subscriptions.$.category': category,
          'subscriptions.$.description': description,
          'subscriptions.$.amount': amount,
        },
      },
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
    await TransactionModel.updateMany(
      { userId },
      { $pull: { subscriptions: { _id } } },
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
    await TransactionModel.updateMany(
      { userId },
      { $set: { subscriptions: [] } },
    )
    revalidatePath(ROUTE.SUBSCRIPTIONS)
  } catch (err) {
    throw err
  }
}

export async function getCategoryItemNameAI(
  categories: TTransaction['categories'],
  userPrompt: string,
): Promise<string> {
  if (!categories || !userPrompt) {
    throw new Error('Categories or user prompt are required.')
  }

  try {
    const categoriesStr = getCategoryItemNames(categories).join(', ')

    const prompt = `Given the list of categories: ${categoriesStr} — choose the most relevant category for the prompt '${userPrompt}' in one word.`

    const content = await CompletionAIModel.generateContent(prompt)
    const text = content.response.text().trim()

    return text
  } catch (err) {
    throw err
  }
}
export const getCachedCategoryItemAI = cache(getCategoryItemNameAI)

export async function getAmountAI(
  currency: CURRENCY_CODE | string,
  userPrompt: string,
): Promise<string> {
  if (!currency || !userPrompt) {
    throw new Error('Currency or user prompt is required.')
  }

  try {
    const prompt = `${userPrompt}. Provide a numerical estimate of the cost in ${currency}, disregarding real-time price fluctuations. Omit any decimal points, commas, or other symbols.`

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

export async function getExpenseTipsAI(categories: string[]): Promise<string> {
  if (!categories) {
    throw new Error('Categories are required.')
  }

  try {
    const categoriesStr = categories.join(', ')

    const prompt = `Provide actionable tips on decreasing expenses for the following categories: ${categoriesStr}. Include practical strategies, potential savings opportunities, and any recommendations that could help manage and reduce costs within these categories. The output category field must be with an emoji. Advice must be one per category.`

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
