import { getCommunity } from '@/aptos/view/community.view';
import { QueryKeys } from '@/config/query-keys';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Skeleton } from '../ui/skeleton';
import OptimizedImage from '../Posts/OptimizedImage';
import { formatCur } from '@/utils/helpers';
import Link from 'next/link';
import { routes } from '@/routes';

type Props = {
  address: string;
};
export function ListCommunitySkeleton() {
  return (
    <div className="flex justify-start space-x-5">
      <div>
        <Skeleton className="h-28 w-28 rounded-lg" />
      </div>
      <div className="flex-1 flex flex-col justify-between py-2">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((el, i) => (
            <Skeleton
              key={i}
              className={`w-10 h-10 rounded-full ${
                i !== 0 ? '-ml-3' : ''
              } hover:z-10 transition-transform hover:scale-110`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ListCommunity({ address }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.Community, address],
    queryFn: () => getCommunity(address),
    enabled: !!address,
  });

  return isLoading ? (
    <div className="px-5">
      <ListCommunitySkeleton />
    </div>
  ) : (
    <Link
      href={routes.app.community.view(address)}
      prefetch={true}
      className="flex px-5 py-3 justify-start space-x-5 hover:bg-secondary dark:hover:bg-dark-light"
    >
      <div>
        {data?.logo && (
          <OptimizedImage
            src={data?.logo}
            alt={data.name}
            height={400}
            width={400}
            className="h-28 w-28 rounded-xl"
          />
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex-1">
          <p className="font-semibold dark:text-white">{data?.name}</p>
          <p className="text-dark/70 dark:text-white/70">{data?.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* {[...Array(5)].map((el, i) => (
            <Skeleton
              key={i}
              className={`w-10 h-10 rounded-full ${
                i !== 0 ? '-ml-3' : ''
              } hover:z-10 transition-transform hover:scale-110`}
            />
          ))} */}
          </div>
          <p className="text-dark/70 dark:text-white/70">
            <span className="mr-1 font-semibold">
              {formatCur(`${data?.members.length}`, false, true)}
            </span>
            Members
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ListCommunity;
