'use client';

import React from 'react';
import { ICollection } from '@/interfaces/collection.interface';
import { QueryKeys } from '@/config/query-keys';
import { useQuery } from '@tanstack/react-query';
import { getCollectionMetadata } from '@/aptos/view/feeds.view';
import OptimizedImage from '../Posts/OptimizedImage';
import { formatCur } from '@/utils/helpers';
import { AptosIcon } from '../Icons/Icons';

type Props = {
  collection: ICollection;
};
export default function CollectionItem({ collection }: Props) {
  const { data } = useQuery({
    queryKey: [QueryKeys.Metadata, collection.collection_id],
    queryFn: async () => getCollectionMetadata(collection.collection_id),
  });

  return (
    <div className="bg-white dark:bg-dark rounded-xl p-3">
      {data?.banner_img && (
        <div className="relative">
          {data.is_default && (
            <div className="absolute z-50 bg-dark/40 px-2 rounded-tl-lg">
              <p className="text-sm text-white">Main</p>
            </div>
          )}
          <OptimizedImage
            src={data?.banner_img}
            alt={`Story ${data?.collection_id}`}
            height={400}
            width={600}
            className="object-cover w-full rounded-lg"
          />
        </div>
      )}

      <div className="py-3 flex items-center gap-3 border-b">
        {data?.logo_img && (
          <OptimizedImage
            src={data?.logo_img}
            height={400}
            width={400}
            alt="pfp"
            className="h-10 w-10 rounded-full"
            priority={true}
          />
        )}
        <p className="text-base font-medium text-dark dark:text-white">
          {collection.collection_name}
        </p>
      </div>
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-1">
          <div className="bg-white rounded-full p-1">
            <AptosIcon />
          </div>
          <p className="text-dark/70 dark:text-white text-sm">Aptos</p>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold dark:text-white">
            {collection.current_supply}/
            {formatCur(collection.max_supply, false, true)}
          </p>
          <p className="text-dark/70 dark:text-white/60 text-sm">Items</p>
        </div>
      </div>
    </div>
  );
}
