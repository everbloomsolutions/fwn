import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderStatusLog extends Document {
  orderId: mongoose.Types.ObjectId;
  status: string;
  paymentStatus: string;
  actorId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const orderStatusLogSchema = new Schema<IOrderStatusLog>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    status: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const OrderStatusLog = mongoose.model<IOrderStatusLog>('OrderStatusLog', orderStatusLogSchema);
