import { UserInterface } from './user.interface';

export interface IMediaType {
  url: string;
  type: string;
}

export interface IPost {
  id: number;
  author: string;
  collector: string;
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
  down_votes: string[];
  up_votes: string[];
}

export interface IPostItem {
  post: IPost;
  creator: UserInterface;
}

export interface INewPost {
  content: string;
  price: number;
  media_urls: Array<string>;
  media_mimetypes: Array<string>;
  metadata_uri: string;
  collection_obj: string;
}

export interface IAddComment {
  post_id: number;
  comment: string;
}
