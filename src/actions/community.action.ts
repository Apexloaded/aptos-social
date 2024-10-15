'use server';

import { ENCRYPTION_KEY } from '@/config/constants';
import {
  blindKey,
  decryptContent,
  encryptContent,
  generateKeyPair,
} from '@/lib/crypto';
import { Community, ICommunity } from '@/models/community.model';
import { getSharedSecret } from '@noble/secp256k1';
import ShortUniqueId from 'short-unique-id';

export async function generateCommunityHash() {
  const { privateKey, publicKey } = generateKeyPair();

  const suid = new ShortUniqueId({ length: 64 });
  const uid = suid.rnd();

  await Community.create({
    communityHash: uid,
    privateKey: privateKey.toString(),
    publicKey: publicKey.toString(),
  });

  return uid;
}

export async function getCommunityByHash(communityHash: string) {
  const community = await Community.findOne<ICommunity>({ communityHash });
  const publicKey = community?.publicKey;
  const privateKey = community?.privateKey;

  if (!publicKey || !privateKey) {
    throw new Error('Community not found');
  }

  const decryptedPublicKey = decryptContent(
    new Uint8Array(Buffer.from(publicKey)),
    new TextEncoder().encode(ENCRYPTION_KEY)
  );
  const decryptedPrivateKey = decryptContent(
    new Uint8Array(Buffer.from(privateKey)),
    new TextEncoder().encode(ENCRYPTION_KEY)
  );

  const pubKey = new Uint8Array(Buffer.from(decryptedPublicKey));
  const privKey = new Uint8Array(Buffer.from(decryptedPrivateKey));

  return {
    communityHash: community.communityHash,
    privateKey: privKey,
    publicKey: pubKey,
  };
}
