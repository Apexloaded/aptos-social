'use client';

import React, { useMemo } from 'react';
import useClipBoard from '@/hooks/clipboard.hook';
import { CheckCheck, CopyIcon } from 'lucide-react';
import {
  formatWalletAddress,
  getTransactionCounterparty,
} from '@/utils/helpers';
import {
  ITransaction,
  ITransactionPayload,
} from '@/interfaces/transaction.interface';

type Props = {
  tx: ITransaction;
  isFull?: boolean;
  isRecipient?: boolean;
  transactionData?: ITransactionPayload | null;
};

function TxAddr({
  isFull = false,
  tx,
  isRecipient = false,
  transactionData,
}: Props) {
  const { isCopied, copy } = useClipBoard();

  const wallet = useMemo(() => {
    if (isRecipient && transactionData) {
      const recipient = getTransactionCounterparty(transactionData);
      return recipient ? recipient.address : '';
    }
    return isRecipient ? '' : tx.user_transaction.sender;
  }, [isRecipient, transactionData, tx.user_transaction.sender]);

  const formattedWallet = useMemo(() => {
    return isFull
      ? formatWalletAddress(wallet, '...', 20, 20)
      : formatWalletAddress(wallet, '...', 10, 10);
  }, [wallet, isFull]);

  return (
    <div className="flex items-center gap-x-1">
      <p className="text-sm text-dark dark:text-white">{formattedWallet}</p>
      {isCopied ? (
        <CheckCheck size={16} className="text-primary" />
      ) : (
        <CopyIcon
          size={16}
          className="cursor-pointer text-dark dark:text-secondary"
          onClick={() => copy(wallet)}
        />
      )}
    </div>
  );
}

export default React.memo(TxAddr);
