import * as secp256k1 from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { encrypt, decrypt } from '@noble/ciphers/simple';

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export function generateKeyPair(): KeyPair {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

export function deriveSharedSecret(
  privateKey: Uint8Array,
  publicKey: Uint8Array
): Uint8Array {
  return secp256k1.getSharedSecret(privateKey, publicKey);
}

export function blindKey(key: Uint8Array): Uint8Array {
  return sha256(key);
}

export function encryptContent(
  content: string,
  sharedSecret: Uint8Array
): Uint8Array {
  const encryptedContent = encrypt(
    sharedSecret,
    new TextEncoder().encode(content)
  );
  return new Uint8Array(encryptedContent);
}

export function decryptContent(
  encryptedContent: Uint8Array,
  sharedSecret: Uint8Array
): string {
  const content = encryptedContent.slice(16);
  const decryptedContent = decrypt(sharedSecret, content);
  return new TextDecoder().decode(decryptedContent);
}
