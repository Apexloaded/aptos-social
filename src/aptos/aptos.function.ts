import { MODULE_ADDRESS } from '@/config/constants';
import { profile } from './aptos.module';
import { AccountAddress } from '@aptos-labs/ts-sdk';

export const register_creator: `${string}::${string}::${string}` = `${MODULE_ADDRESS}::${profile}::register_creator`;
export const is_name_take: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::is_name_taken`;
