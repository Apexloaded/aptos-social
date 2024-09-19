'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function useCollections() {
  const [collections, setCollections] = useState();

  const findCollection = (collectionAddress: string) => {};

  return { collections, findCollection };
}
