'use client';

import React, { useState } from 'react';
import { getCommunity } from '@/aptos/view/community.view';
import { QueryKeys } from '@/config/query-keys';
import { useQuery } from '@tanstack/react-query';
import BackButton from '@/components/ui/back';
import { APT_DECIMALS, getFirstLetters } from '@/utils/helpers';
import OptimizedImage from '@/components/Posts/OptimizedImage';
import { BellIcon, Camera, ShareIcon } from 'lucide-react';
import { useAuth } from '@/context/auth.context';
import { Button } from '@/components/ui/button';
import { convertAmountFromOnChainToHumanReadable } from '@aptos-labs/ts-sdk';

type Props = {
  address: string;
};
function CommunityView({ address }: Props) {
  const { user } = useAuth();
  const [editModal, setEditModal] = useState<boolean>(false);

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.Community, address],
    queryFn: () => getCommunity(address),
    enabled: !!address,
  });

  const isOwner = data?.owner?.toLowerCase() == user?.wallet?.toLowerCase();
  const isJoined =
    user && data ? data?.members?.includes(`${user?.wallet}`) : false;

  return (
    <>
      <div className="py-3 px-2 xl:bg-white/95 dark:bg-dark sticky z-10 top-0">
        <div className="flex items-center justify-start space-x-2">
          <BackButton />
          <div>
            <p className="text-xl font-semibold text-dark dark:text-white">
              {data?.name}
            </p>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="mx-auto">
          <div className={`h-48 md:h-52 relative w-full`}>
            <div className="h-full w-full overflow-hidden bg-secondary">
              {data?.banner && (
                <OptimizedImage
                  src={data.banner}
                  height={2500}
                  width={3000}
                  alt={'Banner'}
                  className={`w-full h-full m-0 flex object-cover`}
                />
              )}
              <div
                className={`h-32 w-32 overflow-hidden rounded-full hover:bg-medium/25 hover:cursor-pointer flex items-center justify-center border-4 border-white absolute -bottom-16 left-4 bg-medium/20`}
              >
                {data?.logo ? (
                  <OptimizedImage
                    src={data.logo}
                    height={400}
                    width={400}
                    alt={'PFP'}
                    className=""
                  />
                ) : isOwner ? (
                  <div
                    role="button"
                    onClick={() => setEditModal(true)}
                    className="h-14 w-14 cursor-pointer bg-white/90 border border-primary rounded-full flex justify-center items-center"
                  >
                    <Camera className="text-primary" />
                  </div>
                ) : (
                  <div className="h-14 w-14 bg-white/90 border border-primary rounded-full flex justify-center items-center">
                    <p className="text-2xl font-semibold text-primary">
                      {getFirstLetters(`${data?.name}`)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {isOwner ? (
            <div className="flex justify-end py-3 px-5 gap-x-2">
              <Button
                type="button"
                onClick={() => setEditModal(true)}
                className="border border-medium text-sm rounded-3xl"
              >
                Edit Guild
              </Button>
            </div>
          ) : (
            <div className="flex justify-end py-3 px-5 gap-x-2">
              <Button
                type="button"
                size={'icon'}
                className="border border-medium text-sm"
              >
                <ShareIcon size={18} />
              </Button>
              {!isJoined ? (
                <Button type="button" className="text-sm rounded-full">
                  <div className="flex items-center font-bold gap-x-2">
                    <p>Join</p>
                  </div>
                </Button>
              ) : (
                <Button type="button" className="text-sm">
                  <div className="flex items-center font-bold gap-x-2">
                    <p>Leave</p>
                  </div>
                </Button>
              )}
            </div>
          )}
          <div className="md:flex px-5 items-center justify-between">
            <div className="">
              <div>
                <div className="flex items-center space-x-1">
                  <div className="max-w-sm truncate">
                    <p className="font-bold text-xl text-dark dark:text-white">
                      {data?.name}
                      {data?.is_paid && (
                        <span className="bg-primary text-xs/5 text-white px-1 rounded-sm">
                          PAID
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              {data?.description && (
                <div className="mt-1">{data?.description}</div>
              )}
              <div className="flex items-center mt-3 gap-x-4">
                {data?.is_paid && (
                  <div className="flex items-center space-x-1">
                    <p className="font-extrabold text-sm text-dark dark:text-white">
                      {convertAmountFromOnChainToHumanReadable(
                        Number(data.entry_fee),
                        APT_DECIMALS
                      )}{' '}
                      APT
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <p className="font-extrabold text-sm text-dark dark:text-white">
                    {data?.members?.length}
                  </p>
                  <p className="text-dark/70 dark:text-white/80 text-sm">
                    Member{data && data?.members?.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommunityView;
