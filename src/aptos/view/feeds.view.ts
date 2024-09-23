import { aptosClient } from '@/utils/aptosClient';
import {
  get_creators_collections,
  get_metadata,
  list_all_posts,
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
      function: list_all_posts,
      functionArguments: [],
    },
  });
  return response[0];
};
