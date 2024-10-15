'use client';

import Section from '@/components/Layouts/Section';
import Header from '@/components/ui/header';
import { QueryKeys } from '@/config/query-keys';
import { useAccount } from '@/context/account.context';
import useNFT from '@/hooks/nft.hook';
import { routes } from '@/routes';
import { aptosClient } from '@/utils/aptosClient';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect } from 'react';

export default function NFTs() {
  const { address, connected } = useAccount();
  const { listNFTs } = useNFT();

  const { data } = useQuery({
    queryKey: [QueryKeys.NFTs, address],
    queryFn: async () => {
      try {
        return await aptosClient().queryIndexer({
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
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    enabled: connected,
  });

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);
  //const { data } = listNFTs(`${address}`);

  //console.log(data);
  return (
    <div className="flex space-x-5">
      <Section
        isFull={true}
        className="bg-muted dark:bg-dark-light w-full px-1"
      >
        <div className="bg-muted/80 backdrop-blur-2xl pr-3 dark:bg-dark-light/80 mx-auto flex items-center justify-between w-full sticky top-0 z-10">
          <Header title="Collections" />
          <Link
            className="bg-primary text-white px-4 py-1 rounded-sm hover:bg-primary/90"
            href={routes.app.collections.create}
          >
            Add Collection
          </Link>
        </div>
      </Section>
    </div>
  );
}
