export const APT_DECIMALS = 8;

export const convertAmountFromHumanReadableToOnChain = (
  value: number,
  decimal: number
) => {
  return value * Math.pow(10, decimal);
};

export const convertAmountFromOnChainToHumanReadable = (
  value: number,
  decimal: number
) => {
  return value / Math.pow(10, decimal);
};

export const getFirstLetters = (fullName: string) => {
  const words = fullName.split(" ");
  let initials = "";
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
  const nonEmptyWordsArray = wordsArray.filter((word) => word !== "");
  const length = trimmedSentence === "" ? 0 : nonEmptyWordsArray.length;
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
  if (typeof walletAddress !== "string" || walletAddress.length < 6) {
    return "Invalid wallet address";
  }

  const prefix = startAt
    ? walletAddress.substring(0, startAt)
    : walletAddress.substring(0, 5);
  const suffix = endAt
    ? walletAddress.substring(walletAddress.length - endAt)
    : walletAddress.substring(walletAddress.length - 4);
  const div = separator ? separator : "...";

  return `${prefix}${div}${suffix}`;
}