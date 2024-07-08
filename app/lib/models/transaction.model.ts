import { model, models, Schema } from 'mongoose'
import { mongooseEncryptionDecryption } from 'mongoose-encryption-decryption'

import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_CURRENCY_SIGN,
} from '@/config/constants/main'

import { TTransaction } from '../types'

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
    transactionLimit: {
      type: Number,
      default: null,
    },
    isEdited: {
      type: Boolean,
      default: false,
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
