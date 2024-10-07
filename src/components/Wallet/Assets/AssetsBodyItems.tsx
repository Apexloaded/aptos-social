'use client';

import React from 'react';
import { ICoins } from '@/interfaces/transaction.interface';
import { convertAmountFromOnChainToHumanReadable } from '@aptos-labs/ts-sdk';
import OptimizedImage from '@/components/Posts/OptimizedImage';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectHideBalance } from '@/slices/account/hide-balance.slice';
import { Button } from '@/components/ui/button';

type Props = {
  coins: ICoins;
};

function AssetsBodyItems({ coins }: Props) {
  const isHidden = useAppSelector(selectHideBalance);
  const { name, amount, decimals, symbol, assetType, icon_uri, assetVersion } =
    coins;

  let friendlyType = assetType;
  // switch (assetType) {
  //   case 'v1':
  //     friendlyType = 'Coin';
  //     break;
  //   case 'v2':
  //     friendlyType = 'Fungible Asset';
  //     break;
  // }
  return (
    <>
      <tr className="h-14 border-b border-light last-of-type:border-none">
        <td className="px-4">
          <p className="text-sm text-center text-nowrap text-dark dark:text-white">
            {name}
          </p>
        </td>
        <td className="px-4">
          <p className="text-sm text-center text-nowrap text-dark dark:text-white">
            <span>
              {isHidden
                ? '*********'
                : convertAmountFromOnChainToHumanReadable(
                    amount,
                    decimals
                  )}{' '}
            </span>
            <span className="text-dark/50 dark:text-white/70 pl-2">
              {symbol}
            </span>
          </p>
        </td>
        <td className="px-4">
          <p className="text-sm text-center text-dark dark:text-white">
            {assetVersion}
          </p>
        </td>
        <td className="px-4 text-center">
          <p className="text-sm text-dark inline-block rounded-full dark:text-white bg-primary/40 px-2 text-center">
            {friendlyType}
          </p>
        </td>
        <td className="px-4">
          <div className="flex items-center">
            <Button
              size={'sm'}
              variant={'outline'}
              className="text-primary font-bold border-none"
            >
              Transfer
            </Button>
            <Button
              size={'sm'}
              variant={'outline'}
              className="text-primary font-bold border-none"
            >
              Withdraw
            </Button>
          </div>
        </td>
      </tr>
    </>
  );
}

export default AssetsBodyItems;
