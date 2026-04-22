import { model, models, Schema } from 'mongoose'

const pushSubscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    subscription: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

const PushSubscriptionModel =
  models.PushSubscription || model('PushSubscription', pushSubscriptionSchema)

export default PushSubscriptionModel
