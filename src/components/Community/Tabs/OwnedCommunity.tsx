'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { routes } from '@/routes';
import { useQuery } from '@tanstack/react-query';
import { getOwnedCommunity } from '@/aptos/view/community.view';
import { useAuth } from '@/context/auth.context';
import { useAccount } from '@/context/account.context';
import { QueryKeys } from '@/config/query-keys';
import ListCommunity, { ListCommunitySkeleton } from '../ListCommunity';

function OwnedCommunity() {
  const router = useRouter();
  const { address, connected } = useAccount();

  useEffect(() => {
    router.prefetch(routes.app.community.create);
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.Community, address],
    queryFn: () => getOwnedCommunity(`${address}`),
    enabled: connected && !!address,
  });

  const navigateTo = () => router.push(routes.app.community.create);

  return (
    <div className="">
      <div className="px-5">
        <Button
          onClick={navigateTo}
          className="border-dotted border-2 mt-5 text-primary w-full border-primary"
          variant={'ghost'}
        >
          Create a new community
        </Button>

        {data && data?.length < 1 && (
          <div className="bg-secondary p-5 mt-5 rounded-2xl">
            <div>
              <p className="text-2xl font-semibold text-dark max-w-lg">
                Empowering Decentralized Communities for Collective Innovation
              </p>
            </div>

            <p className="text-dark/70 mt-2">
              Build your own Guild and lead the next wave of decentralized
              innovation. Whether you're creating, collaborating, or innovating,
              your Guild is the foundation for powerful change.
            </p>

            <div className="mt-3">
              <Button onClick={navigateTo}>Get Started</Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col">
        {isLoading ? (
          <div className='px-5 flex flex-col gap-y-3'>
            {[...Array(10)].map((_, index) => (
              <ListCommunitySkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            {data?.map((community) => (
              <ListCommunity key={community} address={community} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default OwnedCommunity;
