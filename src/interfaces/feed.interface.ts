import { UserInterface } from './user.interface';

export interface IMediaType {
  url: string;
  type: string;
}

export interface IPost {
  id: number;
  author: string;
  collector: string;
  owner: string;
  token_obj: { inner: string };
  content: string;
  created_at: string;
  metadata_uri: string;
  price: string;
  tip_count: number;
  media: IMediaType[];
  hashtag: string[];
  is_collectible: boolean;
  liked_by: string[];
  parent_id: string;
  comment_count: number;
  is_comment: boolean;
  downvotes: string[];
  upvotes: string[];
}

export interface IPostItem {
  post: IPost;
  creator: UserInterface;
  score?: number;
}

export interface INewPost {
  content: string;
  price: number;
  media_urls: Array<string>;
  media_mimetypes: Array<string>;
  metadata_uri: string;
  collection_obj: string;
  is_nft_post: boolean;
}

export interface IAddComment {
  post_id: number;
  comment: string;
}

export interface TrendingPost {
  post: IPostItem;
  score: number;
}
