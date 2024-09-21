import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { create_collection, mint_post } from '../aptos.function';
import { INewCollection } from '@/interfaces/collection.interface';
import { INewPost } from '@/interfaces/feed.interface';

export const createCollection = (
  args: INewCollection
): InputTransactionData => {
  const {
    name,
    description,
    max_supply,
    custom_id,
    royalty_percentage,
    logo_img,
    banner_img,
    featured_img,
  } = args;
  return {
    data: {
      function: create_collection,
      typeArguments: [],
      functionArguments: [
        name,
        description,
        max_supply,
        custom_id,
        royalty_percentage,
        logo_img,
        banner_img,
        featured_img,
      ],
    },
  };
};

export const mintPost = (args: INewPost): InputTransactionData => {
  const {} = args;
  return {
    data: {
      function: mint_post,
      typeArguments: [],
      functionArguments: [],
    },
  };
};
