import mongoose from 'mongoose';

export interface IBookmark {
  postId: string;
  address: string;
}

const BookmarkSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      lowercase: true,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Bookmark =
  mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);
export default Bookmark;
