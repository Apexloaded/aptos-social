'use client';

import { QueryKeys } from '@/config/query-keys';
import { useAccount } from '@/context/account.context';
import { aptosClient } from '@/utils/aptosClient';
import {
  AccountAddress,
  GetAccountOwnedTokensQueryResponse,
  GetCurrentTokenOwnershipResponse,
  GetOwnedTokensResponse,
} from '@aptos-labs/ts-sdk';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import OptimizedImage from '../../Posts/OptimizedImage';
import { Button } from '../../ui/button';
import NFTItem from './NFTItem';

export default function NFTs() {
  const { address, connected, account, signAndSubmitTransaction } =
    useAccount();
  const { data } = useQuery({
    queryKey: [QueryKeys.NFTs, address],
    queryFn: async () => {
      try {
        const token = await aptosClient().queryIndexer<{
          current_token_ownerships_v2: GetOwnedTokensResponse;
        }>({
          query: {
            variables: {
              address,
            },
            query: `
                query GetAccountNfts($address: String) {
                    current_token_ownerships_v2(
                        where: {owner_address: {_eq: $address}, amount: {_gt: "0"}}
                    ) {
                        current_token_data {
                        collection_id
                        largest_property_version_v1
                        current_collection {
                            collection_id
                            collection_name
                            description
                            creator_address
                            uri
                            __typename
                        }
                        description
                        token_name
                        token_data_id
                        token_standard
                        token_uri
                        __typename
                        }
                        owner_address
                        amount
                        __typename
                    }
                }
            `,
          },
        });
        return token.current_token_ownerships_v2 as GetOwnedTokensResponse;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    enabled: connected,
  });

  const nfts = useMemo(() => data, [data]);

  return (
    <div className="border-t pt-3">
      <div className="grid grid-cols-3 gap-4">
        {nfts?.map((nft) => (
          <NFTItem nft={nft} key={nft.current_token_data?.token_data_id} />
        ))}
      </div>
    </div>
  );
}
