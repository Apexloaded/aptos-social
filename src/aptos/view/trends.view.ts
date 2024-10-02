import { aptosClient } from '@/utils/aptosClient';
import { get_trending_hashtags } from '../aptos.function';
import { ITrends } from '@/interfaces/trends.interface';

export const getTrendingHashtags = async (): Promise<ITrends[]> => {
  const response = await aptosClient().view<[Array<ITrends>]>({
    payload: {
      function: get_trending_hashtags,
      functionArguments: [],
    },
  });
  return response[0];
};
