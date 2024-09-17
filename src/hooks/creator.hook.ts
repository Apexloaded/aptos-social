'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { getUserByName, getUserProfile } from '@/aptos/aptos.view';
import { useQuery } from '@tanstack/react-query';
import { UserInterface } from '@/interfaces/user.interface';
import { QueryKeys } from '@/config/query-keys';
import { initSignOut } from '@/actions/auth.action';

function useCreator() {
  const [user, setUser] = useState<UserInterface>();
  const { account, connected, disconnect } = useWallet();
  const { data } = useQuery({
    queryKey: [QueryKeys.Profile],
    queryFn: async () => getUserProfile(`${account?.address}`),
    enabled: connected,
  });

  useEffect(() => {
    if (data) setUser(data);
    console.log(data);
  }, [data]);

  const logout = async () => {
    disconnect();
    await initSignOut();
  };

  const findCreator = (username: string) =>
    useQuery({
      queryKey: [QueryKeys.Profile, username],
      queryFn: async () => getUserByName(username),
    });

  return { user, logout, findCreator };
}

export default useCreator;
