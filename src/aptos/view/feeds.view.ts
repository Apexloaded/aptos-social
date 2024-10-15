import { aptosClient } from '@/utils/aptosClient';
import {
  get_comments,
  get_creators_collections,
  get_metadata,
  get_post_by_id,
  get_feeds,
  get_posts_by_hashtag,
  get_owned_posts,
  get_trending_posts,
} from '../aptos.function';
import { ICollection } from '@/interfaces/collection.interface';
import {
  IPaginatedData,
  IPost,
  IPostItem,
  TrendingPost,
} from '@/interfaces/feed.interface';

export const getAllCollections = async (
  address: string
): Promise<
  [
    {
      inner: string;
    }
  ]
> => {
  const response = await aptosClient().view<[[{ inner: string }]]>({
    payload: {
      function: get_creators_collections,
      functionArguments: [address],
    },
  });
  return response[0];
};

export const getCollectionMetadata = async (
  collection_address: string
): Promise<ICollection> => {
  const response = await aptosClient().view<[ICollection]>({
    payload: {
      function: get_metadata,
      functionArguments: [collection_address],
    },
  });
  return response[0];
};

export const getAllPosts = async (
  page: number,
  itemsPerPage: number
): Promise<IPaginatedData<IPostItem>> => {
  const response = await aptosClient().view<[IPaginatedData<IPostItem>]>({
    payload: {
      function: get_feeds,
      functionArguments: [page, itemsPerPage],
    },
  });
  return response[0];
};

export const getTrendingPosts = async (): Promise<TrendingPost[]> => {
  const response = await aptosClient().view<[Array<TrendingPost>]>({
    payload: {
      function: get_trending_posts,
      functionArguments: [],
    },
  });
  return response[0];
};

export const getPostById = async (postId: number): Promise<IPostItem> => {
  const response = await aptosClient().view<[IPostItem]>({
    payload: {
      function: get_post_by_id,
      functionArguments: [postId],
    },
  });
  return response[0];
};

export const getPostComments = async (postId: number): Promise<IPostItem[]> => {
  const response = await aptosClient().view<[Array<IPostItem>]>({
    payload: {
      function: get_comments,
      functionArguments: [postId],
    },
  });
  return response[0];
};

export const getPostByHashtag = async (
  hashtag: string
): Promise<IPostItem[]> => {
  const response = await aptosClient().view<[Array<IPostItem>]>({
    payload: {
      function: get_posts_by_hashtag,
      functionArguments: [hashtag],
    },
  });
  return response[0];
};

export const getOwnedPosts = async (username: string): Promise<IPostItem[]> => {
  const response = await aptosClient().view<[Array<IPostItem>]>({
    payload: {
      function: get_owned_posts,
      functionArguments: [username],
    },
  });
  return response[0];
};
