'use client';

import { useState } from 'react';
import { EphemeralKeyPair } from '@aptos-labs/ts-sdk';
import {
  decodeEphemeralKeyPair,
  encodeEphemeralKeyPair,
  StoredEphemeralKeyPairs,
} from '@/lib/ephemeral';
import { StorageKeys } from '@/config/session.enum';

function useEphemeral() {
  const generateKeyPair = (): EphemeralKeyPair => {
    const ephemeralKeyPair = EphemeralKeyPair.generate();
    storeKeyPair(ephemeralKeyPair);
    return ephemeralKeyPair;
  };

  const getKeyPair = (nonce: string) => {
    const keyPairs = getKeyPairsFromStore();
    const ephemeralKeyPair = keyPairs[nonce];
    if (!ephemeralKeyPair) return null;
    return validateKeyPair(nonce, ephemeralKeyPair);
  };

  const storeKeyPair = (ekp: EphemeralKeyPair): void => {
    const accounts = getKeyPairsFromStore();
    accounts[ekp.nonce] = ekp;
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      StorageKeys.AptosEphemeral,
      encodeEphemeralKeyPair(accounts)
    );
  };

  const removeKeyPair = (nonce: string) => {
    const keyPairs = getKeyPairsFromStore();
    delete keyPairs[nonce];
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      StorageKeys.AptosEphemeral,
      encodeEphemeralKeyPair(keyPairs)
    );
  };

  const removeAllPairs = () => {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(StorageKeys.AptosEphemeral);
  };

  const validateKeyPair = (
    nonce: string,
    ephemeralKeyPair: EphemeralKeyPair
  ): EphemeralKeyPair | null => {
    if (
      nonce === ephemeralKeyPair.nonce &&
      ephemeralKeyPair.expiryDateSecs > BigInt(Math.floor(Date.now() / 1000))
    ) {
      return ephemeralKeyPair;
    }
    removeKeyPair(nonce);
    return null;
  };

  const getKeyPairsFromStore = (): StoredEphemeralKeyPairs => {
    try {
      const encodedEkp =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(StorageKeys.AptosEphemeral)
          : null;
      return encodedEkp ? decodeEphemeralKeyPair(encodedEkp) : {};
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(
        'Failed to decode ephemeral key pairs from localStorage',
        error
      );
      return {};
    }
  };

  return {
    generateKeyPair,
    getKeyPair,
    storeKeyPair,
    removeKeyPair,
    removeAllPairs,
  };
}

export default useEphemeral;
