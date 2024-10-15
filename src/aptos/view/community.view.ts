import { aptosClient } from '@/utils/aptosClient';
import {
  get_community,
  get_community_posts,
  get_community_public_posts,
  get_owned_community,
} from '../aptos.function';
import {
  ICommunity,
  IGetCommunityPosts,
} from '@/interfaces/community.interface';
import { IPaginatedData, IPostItem } from '@/interfaces/feed.interface';

export const getCommunity = async (address: string): Promise<ICommunity> => {
  const response = await aptosClient().view<[ICommunity]>({
    payload: {
      function: get_community,
      functionArguments: [address],
    },
  });
  return response[0] as ICommunity;
};

export const getPublicCommunityPosts = async (
  page: number,
  itemsPerPage: number
): Promise<IPaginatedData<IPostItem>> => {
  const response = await aptosClient().view<[IPaginatedData<IPostItem>]>({
    payload: {
      function: get_community_public_posts,
      functionArguments: [page, itemsPerPage],
    },
  });
  return response[0];
};

export const getCommunityPosts = async (
  args: IGetCommunityPosts
): Promise<IPaginatedData<IPostItem>> => {
  const { address, user, page, sig, itemsPerPage, pub_key } = args;
  console.log(args);
  const response = await aptosClient().view<[IPaginatedData<IPostItem>]>({
    payload: {
      function: get_community_posts,
      functionArguments: [address, user, pub_key, sig, page, itemsPerPage],
    },
  });
  console.log(response);
  return response[0];
};

export const getOwnedCommunity = async (address: string): Promise<string[]> => {
  const response = await aptosClient().view<[Array<string>]>({
    payload: {
      function: get_owned_community,
      functionArguments: [address],
    },
  });
  return response[0];
};
