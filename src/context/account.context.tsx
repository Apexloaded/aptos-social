'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  Account,
  EphemeralKeyPair,
  ExecutionFinishEventData,
  InputGenerateTransactionPayloadData,
  KeylessAccount,
  PendingTransactionResponse,
} from '@aptos-labs/ts-sdk';
import useKeylessAccount from '@/hooks/keyless.hook';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-react';

interface AccountContextType {
  createAccount: (
    jwt: string,
    ekp: EphemeralKeyPair
  ) => Promise<KeylessAccount>;
  account?: KeylessAccount;
  signAndSubmitTransaction: (
    payload: InputTransactionData
  ) => Promise<PendingTransactionResponse | undefined>;
  connected: boolean;
  disconnect: () => void;
  address?: `0x${string}`;
  signAndSubmitBatchTransaction: (
    transactions: InputGenerateTransactionPayloadData[]
  ) => Promise<ExecutionFinishEventData | unknown>;
  chainId?: number;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const value = useKeylessAccount();
  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within a AccountProvider');
  }
  return context;
};
