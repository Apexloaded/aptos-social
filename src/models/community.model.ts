import mongoose from 'mongoose';

export interface ICommunity {
  communityHash: string;
  publicKey: String;
  privateKey: String;
}

const CommunitySchema = new mongoose.Schema(
  {
    communityHash: {
      type: String,
      required: true,
      unique: true,
    },
    publicKey: {
      type: String,
      required: true,
      unique: true,
    },
    privateKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Community =
  mongoose.models.Community || mongoose.model('Community', CommunitySchema);

export default Community;
