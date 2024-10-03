import { MODULE_ADDRESS } from '@/config/constants';
import { profile, feeds, trends } from './aptos.module';
import { AccountAddress } from '@aptos-labs/ts-sdk';

/**
 * Profile Module Functions
 */
export const register_creator: `${string}::${string}::${string}` = `${MODULE_ADDRESS}::${profile}::register_creator`;
export const update_creator: `${string}::${string}::${string}` = `${MODULE_ADDRESS}::${profile}::update_creator`;
export const is_name_take: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::is_name_taken`;
export const find_creator: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::find_creator`;
export const find_creator_by_name: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::find_creator_by_name`;
export const recommend_users_to_follow: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::recommend_users_to_follow`;
export const follow: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::follow`;
export const unfollow: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${profile}::unfollow`;

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
export const collect_post: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::collect_post`;
export const get_feeds: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::get_feeds`;
export const get_trending_posts: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::get_trending_posts`;
export const get_post_by_id: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::get_post_by_id`;
export const add_comment: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::add_comment`;
export const get_comments: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::get_comments`;
export const like: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::like`;
export const unlike: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::unlike`;
export const upvote_post: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::upvote_post`;
export const downvote_post: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::downvote_post`;
export const get_posts_by_hashtag: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::get_posts_by_hashtag`;
export const get_owned_posts: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${feeds}::get_owned_posts`;

/**
 * Trends Module Functions
 */
export const get_trending_hashtags: `${string}::${string}::${string}` = `${AccountAddress.from(
  MODULE_ADDRESS
)}::${trends}::get_trending_hashtags`;