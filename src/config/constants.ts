import { Network } from '@aptos-labs/ts-sdk';

export const NETWORK =
  (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? ('testnet' as Network);
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS || '';
export const HOSTNAME = process.env.NEXT_PUBLIC_HOSTNAME;
export const API_URL = `http://localhost:3000/api`;
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
export const DEFAULT_COLLECTION = process.env.NEXT_PUBLIC_DEFAULT_COLLECTION;
export const EXPLORER = process.env.NEXT_PUBLIC_APTOS_EXPLORER;
export const ENCRYPTION_KEY = process.env.NEXT_PRIVATE_ENCRYPTION_KEY;

export const PINATA_JWT = process.env.NEXT_PRIVATE_PINATA_JWT || '';
export const PINATA_GATEWAY = process.env.NEXT_PRIVATE_PINATA_GATEWAY || '';
export const PINATA_GATEWAY_KEY =
  process.env.NEXT_PRIVATE_PINATA_GATEWAY_KEY || '';
export const IPFS_URL = process.env.NEXT_PUBLIC_IPFS_URL || 'ipfs.dweb.link';

export const OPENAI_API_KEY = process.env.NEXT_PRIVATE_OPENAI_API_KEY;
export const OPENAI_ORG_ID = process.env.NEXT_PRIVATE_OPENAI_ORG_ID;
export const OPENAI_PROJECT_ID = process.env.NEXT_PRIVATE_OPENAI_PROJECT_ID;

export const BLURURL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAFxEAAwEAAAAAAAAAAAAAAAAAAAECEf/aAAwDAQACEQMRAD8AoNxbhL3xvpeNluNyeQ0pwCxJGwA5NPapTTitZRbxk5nknyJckliyjqTzSlT54b6bk+h0R//Z';
