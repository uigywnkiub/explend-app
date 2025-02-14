import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { model, models, Schema } from 'mongoose'
import { mongooseEncryptionDecryption } from 'mongoose-encryption-decryption'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
} from '@/config/constants/main'

import type {
  TCategories,
  TCategoriesItem,
  TCategoryLimits,
  TSubscriptions,
  TTransaction,
} from '../types'

const itemSchema = new Schema<TCategoriesItem>(
  {
    emoji: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
)
const categoriesSchema = new Schema<TCategories>(
  {
    subject: { type: String, required: true },
    items: { type: [itemSchema], required: true },
  },
  { _id: false },
)

const currencySchema = new Schema<TTransaction['currency']>(
  {
    name: {
      type: String,
      required: true,
      default: DEFAULT_CURRENCY_NAME,
    },
    code: {
      type: String,
      required: true,
      default: DEFAULT_CURRENCY_CODE,
    },
    sign: {
      type: String,
      required: true,
      default: DEFAULT_CURRENCY_SIGN,
    },
  },
  { _id: false },
)

const categoryLimitsSchema = new Schema<TCategoryLimits>(
  {
    categoryName: { type: String, required: true },
    limitAmount: { type: String, required: true },
  },
  { _id: false },
)

const subscriptionsSchema = new Schema<TSubscriptions>({
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
})

const transactionSchema = new Schema<TTransaction>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    isIncome: {
      type: Boolean,
      required: true,
    },
    balance: {
      type: String,
      required: true,
    },
    currency: {
      type: currencySchema,
      default: {
        name: DEFAULT_CURRENCY_NAME,
        code: DEFAULT_CURRENCY_CODE,
        sign: DEFAULT_CURRENCY_SIGN,
      },
      required: true,
    },
    transactionLimit: {
      type: Number,
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: [categoriesSchema],
      default: DEFAULT_CATEGORIES,
    },
    categoryLimits: {
      type: [categoryLimitsSchema],
      default: [],
    },
    subscriptions: {
      type: [subscriptionsSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
).plugin(mongooseEncryptionDecryption, {
  encodedFields: ['amount', 'balance'],
  privateKey: process.env.ENCRYPTION_SECRET,
})

const TransactionModel =
  models.Transaction || model<TTransaction>('Transaction', transactionSchema)

export default TransactionModel
