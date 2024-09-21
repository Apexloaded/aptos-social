import { StorageKeys } from '@/config/session.enum';
import { EphemeralKeyPair } from '@aptos-labs/ts-sdk';

export type StoredEphemeralKeyPairs = { [nonce: string]: EphemeralKeyPair };

/**
 * Stringify the ephemeral key pairs to be stored in localStorage
 */
export const encodeEphemeralKeyPair = (ekp: StoredEphemeralKeyPairs): string =>
  JSON.stringify(ekp, (_, e) => {
    if (typeof e === 'bigint') return { __type: 'bigint', value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: 'Uint8Array', value: Array.from(e) };
    if (e instanceof EphemeralKeyPair)
      return { __type: 'EphemeralKeyPair', data: e.bcsToBytes() };
    return e;
  });

/**
 * Parse the ephemeral key pairs from a string
 */
export const decodeEphemeralKeyPair = (
  encodedEkp: string
): StoredEphemeralKeyPairs =>
  JSON.parse(encodedEkp, (_, e) => {
    if (e && e.__type === 'bigint') return BigInt(e.value);
    if (e && e.__type === 'Uint8Array') return new Uint8Array(e.value);
    if (e && e.__type === 'EphemeralKeyPair')
      return EphemeralKeyPair.fromBytes(e.data);
    return e;
  });
