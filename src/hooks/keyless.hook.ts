'use client';

import { useEffect, useState } from 'react';
import {
  Account,
  EphemeralKeyPair,
  KeylessAccount,
  PendingTransactionResponse,
} from '@aptos-labs/ts-sdk';
import { aptosClient } from '@/utils/aptosClient';
import useStorage from './storage.hook';
import { StorageKeys } from '@/config/session.enum';
import { decodeKeylessAccount, encodeKeylessAccount } from '@/lib/keyless';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import useEphemeral from './ephemeral.hook';

export default function useKeylessAccount() {
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
  }, []);

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

  return {
    createAccount,
    account,
    signAndSubmitTransaction,
    connected,
    disconnect,
    address,
  };
}
