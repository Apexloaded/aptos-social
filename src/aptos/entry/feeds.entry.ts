import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import {
  add_comment,
  collect_post,
  create_collection,
  downvote_post,
  like,
  mint_post,
  unlike,
  upvote_post,
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
    is_nft_post,
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
        is_nft_post,
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

export const upVotePost = (post_id: number): InputTransactionData => {
  return {
    data: {
      function: upvote_post,
      typeArguments: [],
      functionArguments: [post_id],
    },
  };
};

export const downVotePost = (post_id: number): InputTransactionData => {
  console.log('post id:', post_id);
  return {
    data: {
      function: downvote_post,
      typeArguments: [],
      functionArguments: [post_id],
    },
  };
};

export const collectPost = (post_id: number): InputTransactionData => {
  return {
    data: {
      function: collect_post,
      typeArguments: ['0x1::aptos_coin::AptosCoin'],
      functionArguments: [post_id],
    },
  };
};
