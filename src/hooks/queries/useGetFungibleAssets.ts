import { QueryKeys } from '@/config/query-keys';
import { ICoins } from '@/interfaces/transaction.interface';
import { aptosClient } from '@/utils/aptosClient';
import { useQuery } from '@tanstack/react-query';

const ITEMS_PER_PAGE: number = 25;

interface IGetFungibleAssets {
  address?: string;
  currentPage?: number;
  itemsPerPage?: number;
  withPagination?: boolean;
  enabled?: boolean;
}

export interface IGetFungibleAssetsData {
  coins: ICoins[];
  totalCount: number;
}

interface IndexerQueryData {
  current_fungible_asset_balances: {
    amount: number;
    asset_type: string;
    metadata: {
      name: string;
      decimals: number;
      symbol: string;
      token_standard: string;
      icon_uri: string;
    };
  }[];
  current_fungible_asset_balances_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

const QUERY = `
  query CoinsData($owner_address: String, $limit: Int, $offset: Int) {
    current_fungible_asset_balances(
      where: {owner_address: {_eq: $owner_address}}
      limit: $limit
      offset: $offset
    ) {
      amount
      asset_type
      metadata {
        name
        decimals
        symbol
        token_standard
        icon_uri
        project_uri
      }
    }
    current_fungible_asset_balances_aggregate(where: {owner_address: {_eq: $owner_address}}) {
      aggregate {
        count
      }
    }
  }
`;

const processQueryResults = (
  data: IndexerQueryData
): IGetFungibleAssetsData => ({
  coins: data.current_fungible_asset_balances
    .filter((coin) => Boolean(coin.metadata))
    .map(
      (coin) =>
        ({
          name: coin.metadata.name,
          amount: coin.amount,
          decimals: coin.metadata.decimals,
          symbol: coin.metadata.symbol,
          assetType: coin.asset_type,
          assetVersion: coin.metadata.token_standard,
          icon_uri: coin.metadata.icon_uri,
        } as ICoins)
    ),
  totalCount: data.current_fungible_asset_balances_aggregate.aggregate.count,
});

export function useGetFungibleAssets({
  address,
  currentPage = 1,
  itemsPerPage = ITEMS_PER_PAGE,
  withPagination = true,
  enabled = false,
}: IGetFungibleAssets) {
  return useQuery({
    queryKey: withPagination
      ? [QueryKeys.FungibleAssets, address, currentPage]
      : [QueryKeys.FungibleAssets, address],
    queryFn: async () => {
      const variables: Record<string, any> = { owner_address: address };
      if (withPagination) {
        variables.offset = (currentPage - 1) * itemsPerPage;
        variables.limit = itemsPerPage;
      }

      const data = await aptosClient().queryIndexer<IndexerQueryData>({
        query: {
          variables,
          query: QUERY,
        },
      });

      return processQueryResults(data);
    },
    enabled,
  });
}
