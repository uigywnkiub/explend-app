import { model, models, Schema } from 'mongoose'

const pushSubscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    subscriptions: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
)

const PushSubscriptionModel =
  models.PushSubscription || model('PushSubscription', pushSubscriptionSchema)

export default PushSubscriptionModel
