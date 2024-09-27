import { aptosClient } from './aptosClient';
import ShortUniqueId from 'short-unique-id';

export const APT_DECIMALS = 8;
const uid = new ShortUniqueId({
  dictionary: 'hex',
});

export const amountToApt = (
  value: number,
  decimal: number
) => {
  return value * Math.pow(10, decimal);
};

export const aptToAmount = (
  value: number,
  decimal: number
) => {
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

export const renameFile = (file: File) => {
  const extension = file.name.split('.').pop();
  const uuid = uid.stamp(32);
  const newName = `${uuid}.${extension}`;
  return new File([file], newName, { type: file.type });
};

export const timestampToDate = (time: string | number) => {
  const date = new Date(Number(time) * 1000);
  return date;
};