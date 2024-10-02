import mongoose from 'mongoose';

export interface INotification {
  wallet: string;
  type: 'mention' | 'newPost' | 'nftCollection';
  content: string;
  relatedUserId?: string;
  relatedPostId?: string;
  relatedNftId?: string;
  read: boolean;
}

const NotificationSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      lowercase: true,
      required: true,
    },
    type: {
      type: String,
      enum: ['mention', 'newPost', 'nftCollection'],
      required: true,
    },
    content: { type: String, required: true },
    relatedUserId: { type: String },
    relatedPostId: { type: String },
    relatedNftId: { type: String },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);
