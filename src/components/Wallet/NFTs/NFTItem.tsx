'use client';

import { useEffect, useMemo, useState } from 'react';
import OptimizedImage from '../../Posts/OptimizedImage';
import { Button } from '../../ui/button';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { INFT, NFTMetadata } from '@/interfaces/feed.interface';
import { AptosIcon } from '../../Icons/Icons';
import { EllipsisIcon } from 'lucide-react';
import NFTActionButton from './ActionButtons/NFTActionButton';

type Props = {
  nft: INFT;
};

async function getNFTMetadata(url: string) {
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error('Failed to fetch NFT metadata');
  }

  return res.json();
}

export default function NFTItem({ nft }: Props) {
  const [imageUrl, setImageUrl] = useState<string>();
  const { data } = useQuery({
    queryKey: [QueryKeys.NFTMetadata, nft.current_token_data?.token_data_id],
    queryFn: async () => {
      const metadata = await getNFTMetadata(
        `${nft.current_token_data?.token_uri}`
      );
      return metadata as NFTMetadata;
    },
  });

  const metadata = useMemo(() => data, [data]);

  return (
    <div className="relative rounded-2xl overflow-hidden h-64 border">
      {!nft.current_token_data?.token_name.includes('.apt') && metadata ? (
        <>
          <OptimizedImage
            src={`${metadata.image}`}
            height={400}
            width={600}
            alt="pfp"
            className="object-cover w-full h-full"
            priority={true}
          />
          <div className="absolute z-10 top-0 flex w-full justify-between p-3 items-center">
            <p className="font-semibold">
              #{nft.current_token_data?.token_name}
            </p>
            <NFTActionButton nft={nft} />
          </div>
        </>
      ) : (
        <div className="w-full bg-secondary dark:bg-dark h-full min-h-52 p-2 flex flex-col items-end justify-end">
          <div className="bg-white inline-block rounded-full">
            <AptosIcon />
          </div>
          <p className="text-2xl font-semibold text-dark dark:text-white">
            {nft.current_token_data?.token_name}
          </p>
        </div>
      )}
    </div>
  );
}
