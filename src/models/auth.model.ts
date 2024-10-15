import mongoose from 'mongoose';

export interface IAuth {
  email: string;
  isEmailVerified?: boolean;
  isOnboardingCompleted?: boolean;
  address?: string;
}

const AuthSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isOnboardingCompleted: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Auth = mongoose.models.Auth || mongoose.model('Auth', AuthSchema);
export default Auth;
