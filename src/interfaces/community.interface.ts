import {
  AccountAddress,
  AnyNumber,
  U8,
  ChainId,
  Serializer,
  Serializable,
  U64,
} from '@aptos-labs/ts-sdk';

export interface ICommunity {
  id: number;
  name: string;
  communityHash: string;
  description: string;
  logo: string;
  banner: string;
  owner: string;
  members: string[];
  is_paid: boolean;
  is_messageable: boolean;
  entry_fee?: number;
  posts: number[];
  created_at: number;
}

export interface INewCommunity extends Partial<ICommunity> {}

export class CanViewProof extends Serializable {
  public viewer: AccountAddress;
  public community: AccountAddress;
  public chain_id: U8;

  constructor(args: {
    viewer: AccountAddress;
    community: AccountAddress;
    chain_id: number;
  }) {
    super();
    this.viewer = args.viewer;
    this.community = args.community;
    this.chain_id = new U8(2);
  }

  serialize(serializer: Serializer): void {
    serializer.serialize(this.viewer);
    serializer.serialize(this.community);
    serializer.serialize(this.chain_id);
  }
}

export interface IGetCommunityPosts {
  address: string;
  user: string;
  page: number;
  itemsPerPage: number;
  pub_key?: Uint8Array;
  sig?: Uint8Array;
}