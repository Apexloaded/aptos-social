import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import {
  add_comment,
  create_collection,
  like,
  mint_post,
  unlike,
} from '../aptos.function';
import { INewCollection } from '@/interfaces/collection.interface';
import { IAddComment, INewPost } from '@/interfaces/feed.interface';

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
  const {
    content,
    price,
    media_urls,
    media_mimetypes,
    metadata_uri,
    collection_obj,
  } = args;
  return {
    data: {
      function: mint_post,
      typeArguments: [],
      functionArguments: [
        content,
        price,
        media_urls,
        media_mimetypes,
        metadata_uri,
        collection_obj,
      ],
    },
  };
};

export const addComment = (args: IAddComment): InputTransactionData => {
  const { post_id, comment } = args;
  return {
    data: {
      function: add_comment,
      typeArguments: [],
      functionArguments: [post_id, comment],
    },
  };
};

export const likePost = (post_id: number): InputTransactionData => {
  return {
    data: {
      function: like,
      typeArguments: [],
      functionArguments: [post_id],
    },
  };
};

export const unlikePost = (post_id: number): InputTransactionData => {
  return {
    data: {
      function: unlike,
      typeArguments: [],
      functionArguments: [post_id],
    },
  };
};
