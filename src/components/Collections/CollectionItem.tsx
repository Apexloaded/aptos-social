'use client';

import React, { useEffect } from 'react';
import useCollections from '@/hooks/collections.hook';
import { ICollection } from '@/interfaces/collection.interface';
import { QueryKeys } from '@/config/query-keys';
import { useQuery } from '@tanstack/react-query';
import { getCollectionMetadata } from '@/aptos/view/feeds.view';
import { useGetCollectionData } from '@/hooks/collection-data.hook';

type Props = {
  collection: ICollection;
};
export default function CollectionItem({ collection }: Props) {
  const { findMetadata } = useCollections();
  const { data: collRes } = useGetCollectionData(collection.collection_id);
  // const { data } = findMetadata(collection.collection_id);

  const { data } = useQuery({
    queryKey: [QueryKeys.Metadata, collection.collection_id],
    queryFn: async () => getCollectionMetadata(collection.collection_id),
  });

  useEffect(() => {
    if (collRes) {
      console.log(collRes);
    }
  }, [collRes]);

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  return (
    <div className="bg-white dark:bg-dark rounded-xl p-3 h-96">
      {collection.collection_name}
    </div>
  );
}
