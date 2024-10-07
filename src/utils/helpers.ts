import {
  Event,
  Payload,
  TransactionCounterparty,
  ITransactionPayload,
  ITransactionPayloadChange,
  ChangeData,
} from '@/interfaces/transaction.interface';
import { aptosClient } from './aptosClient';
import ShortUniqueId from 'short-unique-id';

export const APT_DECIMALS = 8;
const uid = new ShortUniqueId({
  dictionary: 'hex',
});

export const amountToApt = (value: number, decimal: number) => {
  return value * Math.pow(10, decimal);
};

export const aptToAmount = (value: number, decimal: number) => {
  return value / Math.pow(10, decimal);
};

export const getFirstLetters = (fullName: string) => {
  const words = fullName.split(' ');
  let initials = '';
  for (const word of words) {
    const firstLetter = word[0]?.toUpperCase();
    if (firstLetter) {
      initials += firstLetter;
    }
  }
  return initials;
};

export const countWords = (sentence: string) => {
  const trimmedSentence = sentence.trim();
  const wordsArray = trimmedSentence.split(/\s+/);
  const nonEmptyWordsArray = wordsArray.filter((word) => word !== '');
  const length = trimmedSentence === '' ? 0 : nonEmptyWordsArray.length;
  return length;
};

export const walletToLowercase = (wallet: string) => {
  return wallet.toLowerCase();
};

export function formatWalletAddress(
  walletAddress: string,
  separator?: string,
  startAt?: number,
  endAt?: number
) {
  if (typeof walletAddress !== 'string') {
    return 'Invalid wallet address';
  }

  const prefix = startAt
    ? walletAddress.substring(0, startAt)
    : walletAddress.substring(0, 5);
  const suffix = endAt
    ? walletAddress.substring(walletAddress.length - endAt)
    : walletAddress.substring(walletAddress.length - 4);
  const div = separator ? separator : '...';

  return `${prefix}${div}${suffix}`;
}

export const isValidAptosAddress = (address: string) => {
  const hexRegex = /^[0-9a-fA-F]{64}$/;
  return typeof address === 'string' && hexRegex.test(address);
};

export const renameFile = (file: File, name?: string) => {
  const extension = file.name.split('.').pop();
  const filename = name ? name : uid.stamp(32);
  const newName = `${filename}.${extension}`;
  return new File([file], newName, { type: file.type });
};

export const timestampToDate = (time: string | number) => {
  const date = new Date(Number(time) * 1000);
  return date;
};

export const validateImage = (file: File) => {
  if (!file) {
    return 'Image is required';
  }
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'Image size should be less than 5MB';
  }
  return true;
};

export function formatCur(
  value: string | number,
  includeSymbol: boolean = true,
  shorten: boolean = false
) {
  const cleanInp = value.toString().replace(/(,)/g, '');
  const numValue = Number(cleanInp);

  // Shorten value to 'k', 'M', etc., if needed
  let formattedValue = '';

  if (shorten) {
    if (numValue >= 1e6) {
      formattedValue = (numValue / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; // Format as 'M'
    } else if (numValue >= 1e3) {
      formattedValue = (numValue / 1e3).toFixed(1).replace(/\.0$/, '') + 'k'; // Format as 'k'
    } else {
      formattedValue = numValue.toString(); // Small values remain as they are
    }
  } else {
    const cur = Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumSignificantDigits: 10,
      currencySign: 'accounting',
    });
    formattedValue = cur.format(numValue);
  }

  // Conditionally remove the dollar sign if 'includeSymbol' is false
  if (!includeSymbol && !shorten) {
    formattedValue = formattedValue.replace(/[\$]/g, '').trim();
  }

  return formattedValue;
}

export function extractFunctionName(input: string) {
  // Split the input string by '::'
  const parts = input.split('::');
  // Return the last two parts joined as 'profile::register_creator'
  return `${parts[1]}::${parts[2]}`;
}

export function getTransactionCounterparty(
  transaction: ITransactionPayload
): TransactionCounterparty | undefined {
  if (transaction.type !== 'user_transaction') {
    return undefined;
  }

  if (!('payload' in transaction)) {
    return undefined;
  }

  if (transaction.payload.type !== 'entry_function_payload') {
    return undefined;
  }

  // there are two scenarios that this transaction is an APT coin transfer:
  // 1. coins are transferred from account1 to account2:
  //    payload function is "0x1::coin::transfer" or "0x1::aptos_account::transfer_coins" and the first item in type_arguments is "0x1::aptos_coin::AptosCoin"
  // 2. coins are transferred from account1 to account2, and account2 is created upon transaction:
  //    payload function is "0x1::aptos_account::transfer" or "0x1::aptos_account::transfer_coins"
  // In both scenarios, the first item in arguments is the receiver's address, and the second item is the amount.

  const payload = transaction.payload as Payload;
  const typeArgument =
    payload.type_arguments.length > 0 ? payload.type_arguments[0] : undefined;
  const isAptCoinTransfer =
    (payload.function === '0x1::coin::transfer' ||
      payload.function === '0x1::aptos_account::transfer_coins') &&
    typeArgument === '0x1::aptos_coin::AptosCoin';
  const isAptCoinInitialTransfer =
    payload.function === '0x1::aptos_account::transfer' ||
    payload.function === '0x1::aptos_account::transfer_coins';

  if (
    (isAptCoinTransfer || isAptCoinInitialTransfer) &&
    payload.arguments.length === 2
  ) {
    return {
      address: payload.arguments[0],
      role: 'receiver',
    };
  } else {
    const smartContractAddr = payload.function.split('::')[0];
    return {
      address: smartContractAddr,
      role: 'smartContract',
    };
  }
}

export function getCoinBalanceChangeForAccount(
  transaction: ITransactionPayload,
  address: string
): bigint {
  const accountToBalance = getBalanceMap(transaction);

  if (!accountToBalance.hasOwnProperty(address)) {
    return BigInt(0);
  }

  const accountBalance = accountToBalance[address];
  return accountBalance.amount;
}

export function getBalanceMap(transaction: ITransactionPayload) {
  const events: Event[] = 'events' in transaction ? transaction.events : [];

  const accountToBalance = events.reduce(
    (
      balanceMap: {
        [key: string]: {
          amountAfter: string;
          amount: bigint;
        };
      },
      event: Event
    ) => {
      const addr = normalizeAddress(event.guid.account_address);

      if (
        event.type === '0x1::coin::DepositEvent' ||
        event.type === '0x1::coin::WithdrawEvent'
      ) {
        // deposit and withdraw events could be other coins
        // here we only care about APT events
        if (isAptEvent(event, transaction)) {
          if (!balanceMap[addr]) {
            balanceMap[addr] = { amount: BigInt(0), amountAfter: '' };
          }

          const amount = BigInt(event.data.amount);

          if (event.type === '0x1::coin::DepositEvent') {
            balanceMap[addr].amount += amount;
          } else {
            balanceMap[addr].amount -= amount;
          }
        }
      }

      return balanceMap;
    },
    {}
  );

  return accountToBalance;
}

function isAptEvent(event: Event, transaction: ITransactionPayload) {
  const changes: ITransactionPayloadChange[] =
    'changes' in transaction ? transaction.changes : [];

  const aptEventChange = changes.filter((change) => {
    if ('address' in change && change.address === event.guid.account_address) {
      const data = getAptChangeData(change);
      if (data !== undefined) {
        const eventCreationNum = event.guid.creation_number;
        let changeCreationNum;
        if (event.type === '0x1::coin::DepositEvent') {
          changeCreationNum = data.deposit_events.guid.id.creation_num;
        } else if (event.type === '0x1::coin::WithdrawEvent') {
          changeCreationNum = data.withdraw_events.guid.id.creation_num;
        }
        if (eventCreationNum === changeCreationNum) {
          return change;
        }
      }
    }
  });

  return aptEventChange.length > 0;
}

function getAptChangeData(
  change: ITransactionPayloadChange
): ChangeData | undefined {
  if (
    'address' in change &&
    'data' in change &&
    'type' in change.data &&
    change.data.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>' &&
    'data' in change.data
  ) {
    return JSON.parse(JSON.stringify(change.data.data)) as ChangeData;
  } else {
    return undefined;
  }
}

export function normalizeAddress(address: string): string {
  return '0x' + address.substring(2).padStart(64, '0');
}

export function getTransactionAmount(
  transaction: ITransactionPayload
): bigint | undefined {
  if (transaction.type !== 'user_transaction') {
    return undefined;
  }

  const accountToBalance = getBalanceMap(transaction);

  const [totalDepositAmount, totalWithdrawAmount] = Object.values(
    accountToBalance
  ).reduce(
    ([totalDepositAmount, totalWithdrawAmount]: bigint[], value) => {
      if (value.amount > 0) {
        totalDepositAmount += value.amount;
      }
      if (value.amount < 0) {
        totalWithdrawAmount -= value.amount;
      }
      return [totalDepositAmount, totalWithdrawAmount];
    },
    [BigInt(0), BigInt(0)]
  );

  return totalDepositAmount > totalWithdrawAmount
    ? totalDepositAmount
    : totalWithdrawAmount;
}
