import { Network } from '@aptos-labs/ts-sdk';

export const NETWORK =
  (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? ('testnet' as Network);
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS || '';
export const HOSTNAME = process.env.NEXT_PUBLIC_HOSTNAME;
export const API_URL = `http://localhost:3000/api`;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;

export const PINATA_JWT = process.env.NEXT_PRIVATE_PINATA_JWT || '';
export const PINATA_GATEWAY = process.env.NEXT_PRIVATE_PINATA_GATEWAY || '';
export const PINATA_GATEWAY_KEY =
  process.env.NEXT_PRIVATE_PINATA_GATEWAY_KEY || '';
export const IPFS_URL = process.env.NEXT_PUBLIC_IPFS_URL || 'ipfs.dweb.link';

export const OPENAI_API_KEY = process.env.NEXT_PRIVATE_OPENAI_API_KEY;
export const OPENAI_ORG_ID = process.env.NEXT_PRIVATE_OPENAI_ORG_ID;
export const OPENAI_PROJECT_ID = process.env.NEXT_PRIVATE_OPENAI_PROJECT_ID;
