import { INewCommunity } from '@/interfaces/community.interface';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { create_community } from '../aptos.function';

export const createCommunity = (args: INewCommunity): InputTransactionData => {
  const {
    name,
    communityHash,
    description,
    entry_fee,
    is_paid,
    is_messageable,
    logo,
    banner,
  } = args;
  return {
    data: {
      function: create_community,
      typeArguments: [],
      functionArguments: [
        communityHash,
        name,
        description,
        entry_fee,
        is_messageable,
        is_paid,
        logo,
        banner,
      ],
    },
  };
};
