import { UserInterface } from './user.interface';

export interface IMediaType {
  url: string;
  type: string;
}

export interface IPost {
  id: string;
  author: string;
  tokenId: string;
  creator: UserInterface;
  content: string;
  createdAt: string;
  updatedAt: string;
  remintPrice: string;
  remintCount: string;
  tipCount: string;
  remintToken: string;
  media: IMediaType[];
  isReminted: boolean;
  remintedPost: string;
  remintedBy: string[];
  likedBy: string[];
  parentId: number;
  commentCount: number;
  isMintable: boolean;
}

export interface IPostItem {
  post: IPost;
}

export interface INewPost {
  content: string;
  price: number;
  media_urls: Array<string>;
  media_mimetypes: Array<string>;
  metadata_uri: string;
  collection_obj: string;
}
