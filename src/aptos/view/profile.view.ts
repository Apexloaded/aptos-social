import { aptosClient } from '@/utils/aptosClient';
import {
  find_creator,
  find_creator_by_name,
  is_name_take,
} from '../aptos.function';
import { UserInterface } from '@/interfaces/user.interface';

export const isNameTaken = async (username: string): Promise<boolean> => {
  const response = await aptosClient().view<[boolean]>({
    payload: {
      function: is_name_take,
      functionArguments: [username],
    },
  });
  return response[0] as boolean;
};

export const getUserProfile = async (
  address: string
): Promise<UserInterface> => {
  const response = await aptosClient().view<[UserInterface]>({
    payload: {
      function: find_creator,
      functionArguments: [address],
    },
  });
  return response[0] as UserInterface;
};

export const getUserByName = async (name: string): Promise<UserInterface> => {
  const response = await aptosClient().view<[UserInterface]>({
    payload: {
      function: find_creator_by_name,
      functionArguments: [name],
    },
  });
  return response[0] as UserInterface;
};
