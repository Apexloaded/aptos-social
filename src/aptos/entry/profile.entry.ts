import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { register_creator } from '../aptos.function';
import { INewUser } from '@/interfaces/user.interface';

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
