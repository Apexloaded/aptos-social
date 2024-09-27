import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { register_creator, update_creator } from '../aptos.function';
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
