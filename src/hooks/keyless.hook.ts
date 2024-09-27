'use client';

import { useEffect, useState } from 'react';
import {
  Account,
  EphemeralKeyPair,
  ExecutionFinishEventData,
  InputGenerateTransactionPayloadData,
  KeylessAccount,
  PendingTransactionResponse,
  TransactionWorkerEventsEnum,
} from '@aptos-labs/ts-sdk';
import { aptosClient } from '@/utils/aptosClient';
import useStorage from './storage.hook';
import { StorageKeys } from '@/config/session.enum';
import { decodeKeylessAccount, encodeKeylessAccount } from '@/lib/keyless';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import useEphemeral from './ephemeral.hook';
import { useAppSelector } from './redux.hook';
import { selectAuth } from '@/slices/account/auth.slice';
import { queryClient } from '@/providers/ReactQueryProvider';
import { QueryKeys } from '@/config/query-keys';

export default function useKeylessAccount() {
  const authState = useAppSelector(selectAuth);
  const [account, setAccount] = useState<KeylessAccount>();
  const [address, setAddress] = useState<`0x${string}`>();
  const [connected, setConnected] = useState<boolean>(false);
  const { removeAllPairs } = useEphemeral();

  useEffect(() => {
    const init = () => {
      const keylessAccount = getKeylessAccount();
      if (keylessAccount) {
        setAccount(keylessAccount);
        setAddress(keylessAccount?.accountAddress.toString());
        setConnected(true);
      }
    };
    init();
  }, [authState]);

  const disconnect = () => {
    setAccount(undefined);
    setConnected(false);
    removeAllPairs();
    localStorage.removeItem(StorageKeys.AptosAccount);
  };

  const createAccount = async (
    jwt: string,
    ephemeralKeyPair: EphemeralKeyPair
  ): Promise<KeylessAccount> => {
    const aptos = aptosClient();
    const keylessAccount = await aptos.deriveKeylessAccount({
      jwt,
      ephemeralKeyPair,
    });
    const accountCoinsData = await aptos.getAccountCoinsData({
      accountAddress: keylessAccount?.accountAddress.toString(),
    });

    if (accountCoinsData.length === 0) {
      try {
        await aptos.fundAccount({
          accountAddress: keylessAccount.accountAddress,
          amount: 20000000000, // faucet 200 APT to create the account
        });
      } catch (error) {
        console.log('Error funding account: ', error);
      }
    }

    setAccount(keylessAccount);
    storeKeylessAccount(keylessAccount);
    queryClient.invalidateQueries({ queryKey: [QueryKeys.Profile] });
    return keylessAccount;
  };

  const storeKeylessAccount = (account: KeylessAccount): void => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      StorageKeys.AptosAccount,
      encodeKeylessAccount(account)
    );
  };

  const getKeylessAccount = (): KeylessAccount | undefined => {
    try {
      if (typeof localStorage === 'undefined') return;
      const encodedAccount = localStorage.getItem(StorageKeys.AptosAccount);
      return encodedAccount ? decodeKeylessAccount(encodedAccount) : undefined;
    } catch (error) {
      console.warn('Failed to decode account from localStorage', error);
      return undefined;
    }
  };

  const signAndSubmitTransaction = async (
    payload: InputTransactionData
  ): Promise<PendingTransactionResponse | undefined> => {
    if (account) {
      const aptos = aptosClient();
      const tx = await aptos.transaction.build.simple({
        sender: account.accountAddress.toString(),
        data: payload.data,
      });
      const signedTx = aptos.transaction.sign({
        signer: account,
        transaction: tx,
      });
      return await aptos.transaction.submit.simple({
        transaction: tx,
        senderAuthenticator: signedTx,
      });
    }
  };

  const signAndSubmitBatchTransaction = async (
    transactions: InputGenerateTransactionPayloadData[]
  ): Promise<ExecutionFinishEventData | unknown> => {
    if (account) {
      const aptos = aptosClient();
      const totalTx = transactions.length;
      const sequence_number = `${(totalTx * 1) / 2}`;

      aptos.transaction.batch.forSingleAccount({
        sender: account,
        data: transactions,
      });
      return new Promise((resolve, reject) => {
        aptos.transaction.batch.on(
          TransactionWorkerEventsEnum.ExecutionFinish,
          async (data) => {
            const accountData = await aptos.getAccountInfo({
              accountAddress: account.accountAddress.toString(),
            });
            if ((accountData.sequence_number = sequence_number)) {
              resolve(data);
            } else {
              reject();
            }
            aptos.transaction.batch.removeAllListeners();
          }
        );
      });
    }
  };

  return {
    createAccount,
    account,
    signAndSubmitTransaction,
    connected,
    disconnect,
    address,
    signAndSubmitBatchTransaction,
  };
}
