export interface IAddBookmark {
  postId: string;
  address: string;
}

export interface IBookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}
