'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import {
  getAllCollections,
  getCollectionMetadata,
} from '@/aptos/view/feeds.view';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptosClient } from '@/utils/aptosClient';
import { AccountAddress, GetCollectionDataResponse } from '@aptos-labs/ts-sdk';
import { ICollection } from '@/interfaces/collection.interface';
import { useAccount } from '@/context/account.context';

export default function useCollections() {
  const [collections, setCollections] = useState<Array<ICollection>>([]);
  const { account, connected, address } = useAccount();

  const isReady = connected && address !== undefined;

  const { data } = useQuery({
    queryKey: [QueryKeys.Collections, address],
    queryFn: async () => getAllCollections(`${address}`),
    enabled: isReady,
  });

  useEffect(() => {
    const init = async () => {
      if (data) {
        const objects = await getObjects(data);
        const collections = await getCollections(objects);
        setCollections(collections);
      }
    };
    init();
  }, [data]);

  const findMetadata = (collectionAddress: string) => {
    return useQuery({
      queryKey: [QueryKeys.Metadata, collectionAddress],
      queryFn: async () => getCollectionMetadata(collectionAddress),
      enabled: connected,
    });
  };

  const getObjects = async (registry: [{ inner: string }]) => {
    const objects = await Promise.all(
      registry.map(async (register: { inner: string }) => {
        const formattedRegistry = AccountAddress.from(
          register.inner
        ).toString();
        const object = await aptosClient().getObjectDataByObjectAddress({
          objectAddress: formattedRegistry,
        });

        return object.owner_address;
      })
    );
    return objects;
  };

  const getCollections = async (objects: Array<string>) => {
    const collections = await Promise.all(
      objects.map(async (object: string) => {
        const formattedObjectAddress = AccountAddress.from(object).toString();

        const collection =
          await aptosClient().getCollectionDataByCreatorAddress({
            creatorAddress: formattedObjectAddress,
          });

        return collection as ICollection;
      })
    );
    return collections;
  };

  return { collections, findMetadata };
}
