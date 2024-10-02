import { NETWORK } from '@/config/constants';
import { Aptos, AptosConfig, InputViewFunctionData } from '@aptos-labs/ts-sdk';

const aptos = new Aptos(new AptosConfig({ network: NETWORK }));

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}
