import { model, models, Schema } from 'mongoose'
import { mongooseEncryptionDecryption } from 'mongoose-encryption-decryption'

import { DEFAULT_SALARY_DAY } from '@/config/constants/main'

import type {
  TCategories,
  TCategoriesItem,
  TCategoryLimits,
  TCurrency,
  TSubscriptions,
  TTransaction,
} from '../types'

export const itemSchema = new Schema<TCategoriesItem>(
  {
    emoji: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false },
)
export const categoriesSchema = new Schema<TCategories>(
  {
    subject: { type: String, required: true },
    items: { type: [itemSchema], required: true },
  },
  { _id: false },
)

export const currencySchema = new Schema<TCurrency>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    sign: { type: String, required: true },
  },
  { _id: false },
)

export const categoryLimitsSchema = new Schema<TCategoryLimits>(
  {
    categoryName: { type: String, required: true },
    limitAmount: { type: String, required: true },
  },
  { _id: false },
)

export const subscriptionsSchema = new Schema<TSubscriptions>({
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
  note: { type: String, default: '' },
  autoRenew: { type: Boolean, default: false },
  renewDay: { type: Number, default: null, min: 1, max: 28 },
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
    transactionLimit: {
      type: Number,
      default: null,
    },
    salaryDay: {
      type: Number,
      default: DEFAULT_SALARY_DAY,
      min: 1,
      max: 31,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    isTest: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
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

transactionSchema.index({ userId: 1, createdAt: -1 })

const TransactionModel =
  models.Transaction || model<TTransaction>('Transaction', transactionSchema)

export default TransactionModel
