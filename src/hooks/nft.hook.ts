import { QueryKeys } from '@/config/query-keys';
import { aptosClient } from '@/utils/aptosClient';
import { useQuery } from '@tanstack/react-query';

function useNFT() {
  const listNFTs = (account: string) =>
    useQuery({
      queryKey: [QueryKeys.NFTs, account],
      queryFn: async () => {
        try {
          return await aptosClient().queryIndexer({
            query: {
              variables: {
                address: account,
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
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    });

  return { listNFTs };
}

export default useNFT;
