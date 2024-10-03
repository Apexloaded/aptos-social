'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from '@/context/account.context';
import { useQuery } from '@tanstack/react-query';
import { getUsersToFollow } from '@/aptos/view/profile.view';
import { QueryKeys } from '@/config/query-keys';
import { UserInterface } from '@/interfaces/user.interface';
import ListUsersToFollow from './ListUsersToFollow';

export default function UsersToFollow() {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const { address, connected } = useAccount();
  const { data } = useQuery({
    queryKey: [QueryKeys.UsersToFollow, address],
    queryFn: () => getUsersToFollow(`${address}`),
    enabled: connected && !!address,
  });

  useEffect(() => {
    if (data) {
      setUsers(data);
    }
  }, [data]);

  if (users.length < 1) {
    return;
  }

  return (
    <div>
      <p className="text-dark px-4 dark:text-white text-xl font-semibold">
        Who to follow
      </p>
      {users.map((user) => (
        <ListUsersToFollow key={user.wallet} user={user} />
      ))}
    </div>
  );
}
