'use client';

import React from 'react';
import { ITransactionPayload } from '@/interfaces/transaction.interface';
import { cn } from '@/lib/utils';
import {
  getCoinBalanceChangeForAccount,
  getTransactionAmount,
} from '@/utils/helpers';
import { convertAmountFromOnChainToHumanReadable } from '@aptos-labs/ts-sdk';
import { APTCurrencyValue } from './CurrencyValue';

type Props = {
  transaction?: ITransactionPayload;
  address?: string;
};
export default function TransactionAmount({ transaction, address }: Props) {
  const isAccountTransactionTable = typeof address === 'string';

  if (isAccountTransactionTable && transaction) {
    const amount = getCoinBalanceChangeForAccount(transaction, address);
    if (amount !== undefined) {
      let amountAbs = amount;
      if (amount > 0) {
      } else if (amount < 0) {
        amountAbs = -amount;
      }

      return (
        <p
          className={cn(
            'text-sm text-nowrap text-dark dark:text-white',
            amount > 0 && 'text-primary dark:text-primary',
            amount < 0 && 'text-danger dark:text-danger',
          )}
        >
          {amount > 0 && <>+</>}
          {amount < 0 && <>-</>}
          <APTCurrencyValue amount={amountAbs.toString()} />
          {/* {convertAmountFromOnChainToHumanReadable(Number(amountAbs), 8)} */}
        </p>
      );
    }
  } else {
    const amount = transaction ? getTransactionAmount(transaction) : 0;
    if (amount !== undefined) {
      return (
        <p
          className={cn(
            'text-sm text-nowrap text-dark dark:text-white',
            amount > 0 && 'text-primary dark:text-primary',
            amount < 0 && 'text-danger dark:text-danger'
          )}
        >
          {amount > 0 && <>+</>}
          {amount < 0 && <>-</>}
          <APTCurrencyValue amount={amount.toString()} />
          {/* {amount.toString()} */}
        </p>
      );
    }
  }

  return null;
}
