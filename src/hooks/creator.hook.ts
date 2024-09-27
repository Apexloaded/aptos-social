'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { getUserByName, getUserProfile } from '@/aptos/view/profile.view';
import { useQuery } from '@tanstack/react-query';
import { UserInterface } from '@/interfaces/user.interface';
import { QueryKeys } from '@/config/query-keys';
import { initSignOut, isAuthenticated } from '@/actions/auth.action';
import { useAccount } from '@/context/account.context';
import { useAppDispatch } from './redux.hook';
import { setAuth } from '@/slices/account/auth.slice';

function useCreator() {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<UserInterface>();
  const { account, connected, disconnect, address } = useAccount();
  const { data } = useQuery({
    queryKey: [QueryKeys.Profile],
    queryFn: async () =>
      getUserProfile(`${account?.accountAddress.toString()}`),
    enabled: connected,
  });

  useEffect(() => {
    console.log(address);
  }, [address]);

  useEffect(() => {
    const initAuthState = async () => {
      const state = await isAuthenticated();
      dispatch(setAuth(state));
    };
    initAuthState();
  }, []);

  useEffect(() => {
    if (data) setUser(data);
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
