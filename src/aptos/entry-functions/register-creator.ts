import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { register_creator } from '../aptos.function';

export type RegisterCreatorType = {
  name: string;
  username: string;
  email: string;
  pfp: string;
};

export const registerCreator = (
  args: RegisterCreatorType
): InputTransactionData => {
  const { name, username, email, pfp } = args;
  return {
    data: {
      function: register_creator,
      typeArguments: [],
      functionArguments: [name, username, email, pfp],
    },
  };
};
