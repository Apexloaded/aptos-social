import { Network } from "@aptos-labs/ts-sdk";

export const NETWORK =
  (process.env.NEXT_PUBLIC_APP_NETWORK as Network) ?? ("testnet" as Network);
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
export const HOSTNAME = process.env.NEXT_PUBLIC_HOSTNAME;
export const API_URL = `http://localhost:3000/api`;
