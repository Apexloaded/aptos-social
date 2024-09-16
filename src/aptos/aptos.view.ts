import { aptosClient } from '@/utils/aptosClient';
import { is_name_take } from './aptos.function';

export const isNameTaken = async (username: string): Promise<boolean> => {
  const response = await aptosClient().view<[[{ inner: string }]]>({
    payload: {
      function: is_name_take,
      functionArguments: [username],
    },
  });
  return response[0] as unknown as boolean;
};
