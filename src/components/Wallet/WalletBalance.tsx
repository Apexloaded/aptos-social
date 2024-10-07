'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { useAccount } from '@/context/account.context';
import { getAccountAPTBalance } from '@/aptos/view/getAccountAPTBalance';
import {
  AccountAddress,
  convertAmountFromHumanReadableToOnChain,
  convertAmountFromOnChainToHumanReadable,
} from '@aptos-labs/ts-sdk';
import useConverter from '@/hooks/converter.hook';
import { UserBalance } from '@/interfaces/wallet.interface';
import { formatCur } from '@/utils/helpers';
import { Button } from '../ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import {
  selectHideBalance,
  setHideBalance,
} from '@/slices/account/hide-balance.slice';
import Radio from '../ui/Radio';
import useToast from '@/hooks/toast.hook';
import { aptosClient } from '@/utils/aptosClient';
import DepositModal from './DepostModal';
import WithdrawModal from './WithdrawModal';
import PayModal from './PayModal';

export default function WalletBalance() {
  const isHidden = useAppSelector(selectHideBalance);
  const dispatch = useAppDispatch();
  const { loading, success, error } = useToast();
  const { address, connected, account } = useAccount();
  //const { usdRate } = useConverter();
  const usdRate = { apt: 8.5 };
  const { data } = useQuery({
    queryKey: [QueryKeys.AccountBalance, address],
    queryFn: async () => {
      const balance = await getAccountAPTBalance({
        accountAddress: `${address}`,
      });
      const tokenBalance = convertAmountFromOnChainToHumanReadable(balance, 8);
      const usdEquiv = usdRate['apt'] * tokenBalance;
      return {
        name: 'Aptos',
        symbol: 'APT',
        usdValue: usdEquiv,
        aptValue: tokenBalance,
      } as UserBalance;
    },
    enabled: connected && !!address,
  });

  const balance = useMemo(() => data, [data]);

  // useEffect(() => {
  //   const init = async () => {
  //     if (!data) return;
  //     if (Object.keys(usdRate).length > 0) {
  //       const tokenBalance = convertAmountFromOnChainToHumanReadable(data, 8);
  //       const usdEquiv = usdRate['apt'] * tokenBalance;
  //       const payload: UserBalance = {
  //         name: 'Aptos',
  //         symbol: 'APT',
  //         usdValue: usdEquiv,
  //         aptValue: tokenBalance,
  //       };
  //       setBalance(payload);
  //     }
  //   };
  //   init();
  // }, [data, usdRate]);

  const toggleHide = () => {
    const value = !isHidden;
    // setItem(StorageTypes.DEXA_HIDE_BAL, value);
    dispatch(setHideBalance(value));
  };

  const onTransfer = async () => {
    try {
      if (!account) return;
      loading({ msg: 'Initiating transfer...' });
      const transferTransaction = await aptosClient().transferCoinTransaction({
        sender: account.accountAddress,
        recipient:
          '0xbce2c6d810bec29f75f394605d0ce0e9b14b6f64bcc4a375804b70d70798dc71' as unknown as AccountAddress,
        amount: convertAmountFromHumanReadableToOnChain(2, 8),
      });
      const committedTxn = await aptosClient().signAndSubmitTransaction({
        signer: account,
        transaction: transferTransaction,
      });
      const pendingTxn = await aptosClient().waitForTransaction({
        transactionHash: committedTxn.hash,
      });
      if (pendingTxn.success) {
        success({ msg: '1 APT Transferred' });
      }
    } catch (err: any) {
      error({ msg: err.message || 'Error initiating transfer' });
    }
  };

  return (
    <div className="px-3">
      <p className="text-sm dark:text-white">Total Balance</p>
      <div className="flex items-end">
        {balance?.aptValue && (
          <div className="flex items-end">
            {isHidden ? (
              <p className="font-semibold text-lg dark:text-white -mb-1">
                *******
              </p>
            ) : (
              <p className="font-semibold text-lg -mb-1 dark:text-white">
                {Number(balance?.aptValue) > 0 ? balance?.aptValue : '0.00'}
              </p>
            )}
            <p className="text-xs text-dark/60 dark:text-white/60 pl-1 font-semibold">
              {balance.symbol}
            </p>
          </div>
        )}

        {Number(balance?.usdValue) > 0 ? (
          balance?.usdValue && (
            <div className="flex items-end">
              {isHidden ? (
                <p className="text-xs text-dark/60 dark:text-white/60 pl-2 font-semibold">
                  ******
                </p>
              ) : (
                <p className="text-xs text-dark/60 dark:text-white/60 pl-2 font-semibold">
                  = {formatCur(balance?.usdValue)} USD
                </p>
              )}
            </div>
          )
        ) : (
          <></>
        )}
      </div>
      <div className="flex items-center gap-x-5 pt-2 max-w-xl">
        <div className="flex items-center gap-x-2">
          <Radio type="checkbox" checked={isHidden} onChange={toggleHide} />
          <p className="text-sm dark:text-white">Hide balance</p>
        </div>
      </div>
      <div className="flex items-center gap-x-5 pt-5">
        <DepositModal />
        <WithdrawModal />
        <PayModal />
      </div>
    </div>
  );
}
