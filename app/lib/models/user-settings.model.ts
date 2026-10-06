import DEFAULT_CATEGORIES from '@/public/data/default-categories.json'
import { model, models, Schema } from 'mongoose'

import type { TUserSettings } from '../types'
import { categoriesSchema } from './transaction.model'

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
  },
  { timestamps: true },
)

const UserSettingsModel =
  models.UserSettings ||
  model<TUserSettings>('UserSettings', userSettingsSchema)

export default UserSettingsModel
