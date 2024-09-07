"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import {
  PersistQueryClientProvider,
  Persister,
} from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});
export function ReactQueryProvider({ children }: PropsWithChildren) {
  const [persister, setPersister] = useState<Persister>(
    createSyncStoragePersister({
      serialize: JSON.stringify,
      storage: typeof window !== "undefined" ? window.localStorage : null,
      deserialize: JSON.parse,
    })
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const syncPersister = createSyncStoragePersister({
        serialize: JSON.stringify,
        storage: window.localStorage,
        deserialize: JSON.parse,
      });
      setPersister(syncPersister);
    }
  }, []);

  return (
    <PersistQueryClientProvider
      persistOptions={{ persister }}
      client={queryClient}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
