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
  is_community_post: boolean;
  community: string;
}

export interface IPaginatedData<T> {
  data: Array<T>;
  total_items: number;
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

export interface NFTMetadata {
  description: string;
  external_url: string;
  image: string;
  name: string;
  attributes: any[];
}

export interface INFT {
  token_standard: string;
  token_properties_mutated_v1?: any | null;
  token_data_id: string;
  table_type_v1?: string | null;
  storage_id: string;
  property_version_v1: any;
  owner_address: string;
  last_transaction_version: any;
  last_transaction_timestamp: any;
  is_soulbound_v2?: boolean | null;
  is_fungible_v2?: boolean | null;
  amount: any;
  current_token_data?: {
    collection_id: string;
    description: string;
    is_fungible_v2?: boolean | null;
    largest_property_version_v1?: any | null;
    last_transaction_timestamp: any;
    last_transaction_version: any;
    maximum?: any | null;
    supply?: any | null;
    token_data_id: string;
    token_name: string;
    token_properties: any;
    token_standard: string;
    token_uri: string;
    decimals?: any | null;
    current_collection?: {
      collection_id: string;
      collection_name: string;
      creator_address: string;
      current_supply: any;
      description: string;
      last_transaction_timestamp: any;
      last_transaction_version: any;
      max_supply?: any | null;
      mutable_description?: boolean | null;
      mutable_uri?: boolean | null;
      table_handle_v1?: string | null;
      token_standard: string;
      total_minted_v2?: any | null;
      uri: string;
    } | null;
  } | null;
}
