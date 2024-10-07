'use client';

import React from 'react';
import {
  ITransaction,
  ITransactionPayload,
} from '@/interfaces/transaction.interface';
import Moment from 'react-moment';
import TxAddr from './TxAddr';
import { extractFunctionName } from '@/utils/helpers';
import TransactionAmount from './TransactionAmount';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/config/query-keys';
import { useAccount } from '@/context/account.context';
import { aptosClient } from '@/utils/aptosClient';
import { APTCurrencyValue } from './CurrencyValue';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { EXPLORER, NETWORK } from '@/config/constants';

type Props = {
  tx: ITransaction;
  isAddrFull?: boolean;
};

function TxBodyItems({ tx, isAddrFull = false }: Props) {
  const { address, connected } = useAccount();
  const functionName = extractFunctionName(
    tx.user_transaction.entry_function_id_str
  );

  const { data } = useQuery({
    queryKey: [QueryKeys.Transactions, address, tx.transaction_version],
    queryFn: async () => {
      try {
        const resource = await aptosClient().getTransactionByVersion({
          ledgerVersion: tx.transaction_version,
        });
        return resource as unknown as ITransactionPayload;
      } catch (error) {
        return null;
      }
    },
    enabled: connected && !!address && !!tx.transaction_version,
  });

  return (
    <>
      <tr className="h-14 border-b border-light last-of-type:border-none">
        <td className="px-4">
          <Link
            href={`${EXPLORER}/txn/${tx.transaction_version}?network=${NETWORK}`}
            target="_blank"
            className="text-sm text-center text-primary"
          >
            {tx.transaction_version}
          </Link>
        </td>
        <td className="px-4">
          <TxAddr tx={tx} isFull={isAddrFull} />
        </td>
        <td className="px-4">
          <TxAddr
            tx={tx}
            isFull={isAddrFull}
            transactionData={data}
            isRecipient={true}
          />
        </td>
        <td className="px-4">
          {data && <TransactionAmount transaction={data} address={address} />}
        </td>
        <td className="px-4">
          {data && (
            <p className={cn('text-sm text-nowrap text-dark dark:text-white')}>
              <APTCurrencyValue
                amount={(
                  BigInt(data.gas_unit_price) * BigInt(data.gas_used)
                ).toString()}
              />
            </p>
          )}
        </td>
        <td className="px-4">
          <p className="text-sm text-dark inline-block rounded-full dark:text-white bg-primary/40 px-2">
            {functionName}
          </p>
        </td>
        <td className="px-4">
          <p className="text-sm flex text-nowrap dark:text-white">
            <Moment fromNow className="">
              {tx.user_transaction.timestamp}
            </Moment>
          </p>
        </td>
      </tr>
    </>
  );
}

export default TxBodyItems;
