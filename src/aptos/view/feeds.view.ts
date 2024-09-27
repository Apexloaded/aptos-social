import { aptosClient } from '@/utils/aptosClient';
import {
  get_comments,
  get_creators_collections,
  get_metadata,
  get_post_by_id,
  get_feeds,
  get_posts_by_hashtag,
} from '../aptos.function';
import { ICollection } from '@/interfaces/collection.interface';
import { IPost, IPostItem } from '@/interfaces/feed.interface';

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

export const getAllPosts = async (): Promise<IPostItem[]> => {
  const response = await aptosClient().view<[Array<IPostItem>]>({
    payload: {
      function: get_feeds,
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
