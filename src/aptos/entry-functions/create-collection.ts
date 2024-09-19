import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { create_collection } from '../aptos.function';

export type INewCollection = {
  name: string;
  description: string;
  uri: string;
  max_supply: number;
  custom_name: string;
  royalty_percentage?: number;
  logo_img?: string;
  banner_img?: string;
  featured_img?: string;
};

export const createCollection = (
  args: INewCollection
): InputTransactionData => {
  const {
    name,
    description,
    uri,
    max_supply,
    custom_name,
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
        uri,
        max_supply,
        custom_name,
        royalty_percentage,
        logo_img,
        banner_img,
        featured_img,
      ],
    },
  };
};
