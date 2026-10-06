import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { model, models, Schema } from 'mongoose'

import { DEFAULT_SALARY_DAY } from '@/config/constants/main'

import type { TUserSettings } from '../types'
import {
  categoriesSchema,
  categoryLimitsSchema,
  currencySchema,
  subscriptionsSchema,
} from './transaction.model'

const userSettingsSchema = new Schema<TUserSettings>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    categories: {
      type: [categoriesSchema],
      default: DEFAULT_CATEGORIES,
    },
    categoryLimits: { type: [categoryLimitsSchema] },
    subscriptions: { type: [subscriptionsSchema] },
    currency: { type: currencySchema },
    pushSubscriptions: { type: [Schema.Types.Mixed] },
    transactionLimit: { type: Number, default: null },
    salaryDay: {
      type: Number,
      default: DEFAULT_SALARY_DAY,
      min: 1,
      max: 31,
    },
  },
  { timestamps: true },
)

const UserSettingsModel =
  models.UserSettings ||
  model<TUserSettings>('UserSettings', userSettingsSchema)

export default UserSettingsModel
