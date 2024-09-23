import { MODULE_ADDRESS } from '@/config/constants';
import { profile, feeds } from './aptos.module';
import { AccountAddress } from '@aptos-labs/ts-sdk';

export const register_creator: `${string}::${string}::${string}` = `${MODULE_ADDRESS}::${profile}::register_creator`;
export const is_name_take: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::is_name_taken`;
export const find_creator: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::find_creator`;
export const find_creator_by_name: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::find_creator_by_name`;


/**
 * Feeds Modules Functions
 */
export const create_collection: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::create_collection`;
export const get_creators_collections: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::get_creators_collections`;
export const get_metadata: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::get_metadata`;
export const mint_post: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::mint_post`;
export const list_all_posts: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::list_all_posts`;

