import { GetCollectionDataResponse } from '@aptos-labs/ts-sdk';

export interface ICollection extends GetCollectionDataResponse {
  created_at: number;
  logo_img: string;
  banner_img: string;
  featured_img: string;
  custom_id: string;
  is_default: boolean;
  website: string;
  collection_address: string;
  mint_fee_per_nft_by_stages: Array<any>;
  mint_enabled: boolean;
}

export interface INewCollection {
  name: string;
  description: string;
  max_supply: number;
  custom_id: string;
  royalty_percentage?: number;
  logo_img?: string;
  banner_img?: string;
  featured_img?: string;
};
