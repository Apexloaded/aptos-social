'use client';

import useCollections from '@/hooks/collections.hook';
import CollectionItem from './CollectionItem';

export default function ListCollections() {
  const { collections } = useCollections();

  return (
    <div className="grid grid-cols-3 gap-5 w-full px-3">
      {collections.map((collection) => (
        <CollectionItem collection={collection} />
      ))}
    </div>
  );
}
