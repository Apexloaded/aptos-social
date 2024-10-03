'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useAccount } from '@/context/account.context';
import { PendingTransactionResponse } from '@aptos-labs/ts-sdk';
import { followUser, unfollowUser } from '@/aptos/entry/profile.entry';
import { aptosClient } from '@/utils/aptosClient';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';

type Props = {
  to: string;
  isFollowing: boolean;
  className?: string;
};

function FollowButton({ to, isFollowing, className }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { signAndSubmitTransaction, address } = useAccount();

  const initFollow = async () => {
    try {
      if (isLoading) return;

      console.log('Here');

      setIsLoading(true);
      let txResponse: PendingTransactionResponse | undefined;

      if (isFollowing) {
        // Unfollow the user
        txResponse = await signAndSubmitTransaction(unfollowUser(to));
      } else {
        // Follow the user
        txResponse = await signAndSubmitTransaction(followUser(to));
      }

      if (txResponse) {
        const committedTransactionResponse =
          await aptosClient().waitForTransaction({
            transactionHash: txResponse.hash,
          });

        if (committedTransactionResponse.success) {
          queryClient.invalidateQueries({
            queryKey: [QueryKeys.UsersToFollow, address],
          });
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  return (
    <Button
      type="button"
      className={cn('text-sm', className, isLoading && 'cursor-wait')}
      onClick={initFollow}
      // disabled={isLoading}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}

export default FollowButton;
