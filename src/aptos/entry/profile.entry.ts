import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import {
  follow,
  pay,
  register_creator,
  unfollow,
  update_creator,
} from '../aptos.function';
import { INewUser, UserInterface } from '@/interfaces/user.interface';

export const registerCreator = (args: INewUser): InputTransactionData => {
  const { name, username, email, pfp } = args;
  return {
    data: {
      function: register_creator,
      typeArguments: [],
      functionArguments: [name, username, email, pfp],
    },
  };
};

export const updateCreator = (
  args: Partial<UserInterface>
): InputTransactionData => {
  const { name, username, email, pfp, banner, bio, website } = args;
  return {
    data: {
      function: update_creator,
      typeArguments: [],
      functionArguments: [name, username, email, pfp, banner, bio, website],
    },
  };
};

export const followUser = (address: string): InputTransactionData => {
  return {
    data: {
      function: follow,
      typeArguments: [],
      functionArguments: [address],
    },
  };
};

export const unfollowUser = (address: string): InputTransactionData => {
  return {
    data: {
      function: unfollow,
      typeArguments: [],
      functionArguments: [address],
    },
  };
};

export const payUser = (
  username: string,
  amount: number,
  coinType: string
): InputTransactionData => {
  return {
    data: {
      function: pay,
      typeArguments: [coinType],
      functionArguments: [username, amount],
    },
  };
};
