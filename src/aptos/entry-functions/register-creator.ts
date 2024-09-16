import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { register_creator } from '../aptos.function';

export type RegisterCreatorType = {
  display_name: string;
  username: string;
  email_address: string;
  profile_url: string;
};

export const registerCreator = (
  args: RegisterCreatorType
): InputTransactionData => {
  const { display_name, username, email_address, profile_url } = args;
  return {
    data: {
      function: register_creator,
      typeArguments: [],
      functionArguments: [display_name, username, email_address, profile_url],
    },
  };
};
