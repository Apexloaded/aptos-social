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
  if (typeof walletAddress !== 'string' || walletAddress.length < 6) {
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
    });
    formattedValue = cur.format(numValue);
  }

  // Conditionally remove the dollar sign if 'includeSymbol' is false
  if (!includeSymbol && !shorten) {
    formattedValue = formattedValue.replace(/[\$]/g, '').trim();
  }

  return formattedValue;
}
