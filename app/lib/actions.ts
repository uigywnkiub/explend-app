'use server'

import { cache } from 'react'

import { revalidatePath, updateTag } from 'next/cache'
import { cookies } from 'next/headers'

import { signOut } from '@/auth'
import { SignOutError } from '@auth/core/errors'
import { Resend } from 'resend'

import { COOKIE_FEEDBACK } from '@/config/constants/cookies'
import {
  APP_NAME,
  DEFAULT_CATEGORY,
  DEFAULT_CATEGORY_EMOJI,
  RESEND_API_KEY,
  RESEND_EMAIL,
} from '@/config/constants/main'
import { ROUTE } from '@/config/constants/routes'

import TransactionModel from '@/app/lib/models/transaction.model'

import {
  CompletionAIModel,
  ExpenseTipsAIModel,
  UploadReceiptAIModel,
} from './ai'
import {
  capitalizeFirstLetter,
  getCacheTagByUserId,
  getCategoryItemNames,
  getCategoryWithEmoji,
} from './helpers'
import dbConnect from './mongodb'
import {
  getAllTransactions as _getAllTransactions,
  getAuthSession as _getAuthSession,
  getCategoryLimits as _getCategoryLimits,
} from './queries'
import type {
  TCategories,
  TCategoryLimits,
  TCookie,
  TCurrency,
  TSession,
  TSubscriptions,
  TTransaction,
  TUserId,
} from './types'

// Server action wrappers for client components calling cached query functions.
// These delegate to 'use cache' functions in queries.ts.
export async function getAuthSession(): Promise<TSession> {
  return _getAuthSession()
}
export const getCachedAuthSession = cache(getAuthSession)

export async function getAllTransactions(
  userId: TUserId,
): Promise<TTransaction[]> {
  return _getAllTransactions(userId)
}
export const getCachedAllTransactions = cache(getAllTransactions)

export async function getCategoryLimits(
  userId: TUserId,
): Promise<TTransaction['categoryLimits']> {
  return _getCategoryLimits(userId)
}

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
    updateTag(getCacheTagByUserId(userId))
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
    updateTag(getCacheTagByUserId(userId))
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
  if (!salaryDay || salaryDay < 1 || salaryDay > 31) {
    throw new Error('Salary day must be a valid number between 1 and 31.')
  }
  try {
    await dbConnect()
    await TransactionModel.updateMany({ userId }, { salaryDay })
    updateTag(getCacheTagByUserId(userId))
    revalidatePath(ROUTE.HOME)
  } catch (err) {
    throw err
  }
}

export async function createTransaction(
  userId: TUserId,
  currency: TTransaction['currency'],
  userCategories: TTransaction['categories'],
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
      category:
        getCategoryWithEmoji(formData.get('category'), userCategories) ||
        (`${DEFAULT_CATEGORY_EMOJI} ${DEFAULT_CATEGORY}` as TTransaction['category']),
      isIncome: (formData.get('isIncome') ===
        'true') as TTransaction['isIncome'],
      isSubscription: (formData.get('isSubscription') ===
        'true') as TTransaction['isSubscription'],
      isTest: (formData.get('isTest') === 'true') as TTransaction['isTest'],
      balance: '0' as TTransaction['balance'],
      currency,
      categories: userCategories,
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
    await dbConnect()
    const session = await TransactionModel.startSession()
    try {
      session.startTransaction()
      await TransactionModel.create([newTransaction], { session })
      await session.commitTransaction()
      session.endSession()
      updateTag(getCacheTagByUserId(userId))
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

export async function editTransactionById(
  id: TTransaction['id'],
  newTransactionData: Partial<TTransaction>,
): Promise<void> {
  if (!id) {
    throw new Error('Transaction ID is required to update a transaction.')
  }
  try {
    await dbConnect()
    const existingDoc = await TransactionModel.findOne(
      { id },
      { userId: 1 },
    ).lean<{ userId: TTransaction['userId'] }>()
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
      if (newTransactionData.images) {
        updateFields.images = newTransactionData.images
      }
      await TransactionModel.updateOne({ id }, updateFields, { session })
      await session.commitTransaction()
      session.endSession()
      if (existingDoc?.userId) {
        updateTag(`user-${existingDoc.userId}`)
        updateTag(`transaction-${id}`)
      }
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
    // If the category's items are empty, delete the category.
    if (updatedCategories.items && updatedCategories.items.length === 0) {
      await TransactionModel.updateMany(
        { userId },
        { $pull: { categories: { subject: subjectName } } },
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
      await TransactionModel.updateMany(
        { userId, 'categories.subject': subjectName },
        { $set: { 'categories.$': newCategories } },
      )
    }
    updateTag(getCacheTagByUserId(userId))
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
    if (withPathRevalidate) {
      updateTag(getCacheTagByUserId(userId))
      revalidatePath(ROUTE.CATEGORIES)
    }
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
    const transaction = await TransactionModel.findOne(
      { id },
      { userId: 1 },
    ).lean<{ userId: TTransaction['userId'] }>()
    await TransactionModel.deleteOne({ id })
    if (transaction?.userId) {
      updateTag(`user-${transaction.userId}`)
    }
    updateTag(`transaction-${id}`)
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
    updateTag(getCacheTagByUserId(userId))
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
    await TransactionModel.deleteMany({ userId })
    updateTag(getCacheTagByUserId(userId))
    await signOutAccount()
  } catch (err) {
    throw err
  }
}

export async function addLimit(
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
    updateTag(getCacheTagByUserId(userId))
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
    updateTag(getCacheTagByUserId(userId))
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
    updateTag(getCacheTagByUserId(userId))
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
    updateTag(getCacheTagByUserId(userId))
    revalidatePath(ROUTE.SUBSCRIPTIONS)
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
          'subscriptions.$.note': note,
        },
      },
    )
    updateTag(getCacheTagByUserId(userId))
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
    updateTag(getCacheTagByUserId(userId))
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
    updateTag(getCacheTagByUserId(userId))
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
  currency: TTransaction['currency'],
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
