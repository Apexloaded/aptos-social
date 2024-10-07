interface IUserTransaction {
  timestamp: string;
  sender: string;
  entry_function_id_str: string;
  gas_unit_price: number;
  version: number;
}

interface CoinActivities {
  amount: number;
  activity_type: string;
}

export interface ICoins {
  name: string;
  amount: number;
  decimals: number;
  symbol: string;
  assetType: `${string}::${string}::${string}`;
  assetVersion: string;
  icon_uri?: string;
}

export interface ITransaction {
  account_address: string;
  transaction_version: number;
  coin_activities: CoinActivities[];
  user_transaction: IUserTransaction;
}

export type TransactionCounterparty = {
  address: string;
  role: 'receiver' | 'smartContract';
};

export interface ITransactionPayload {
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: ITransactionPayloadChange[];
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: Payload;
  signature: Signature;
  events: Event[];
  timestamp: string;
  type: string;
}

export interface ITransactionPayloadChange {
  address?: string;
  state_key_hash: string;
  data: ResourceData;
  handle?: string;
  key?: string;
  value?: string;
  type: string;
}

export type ChangeData = {
  coin: { value: string };
  deposit_events: {
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
  withdraw_events: {
    guid: {
      id: {
        addr: string;
        creation_num: string;
      };
    };
  };
};

interface ResourceData {
  type: string;
  data: CoinStore | AccountData;
}

interface CoinStore {
  coin: {
    value: string;
  };
  deposit_events: EventDetails;
  frozen: boolean;
  withdraw_events: EventDetails;
}

interface AccountData {
  authentication_key: string;
  coin_register_events: EventDetails;
  guid_creation_num: string;
  key_rotation_events: EventDetails;
  rotation_capability_offer: {
    for: {
      vec: any[];
    };
  };
  sequence_number: string;
  signer_capability_offer: {
    for: {
      vec: any[];
    };
  };
}

interface EventDetails {
  counter: string;
  guid: {
    id: {
      addr: string;
      creation_num: string;
    };
  };
}

export interface Payload {
  function: string;
  type_arguments: string[];
  arguments: string[];
  type: string;
}

interface Signature {
  public_key: PublicKey;
  signature: PublicKey;
  type: string;
}

interface PublicKey {
  value: string;
  type: string;
}

export interface Event {
  guid: EventGuid;
  sequence_number: string;
  type: string;
  data: EventData;
}

interface EventGuid {
  creation_number: string;
  account_address: string;
}

interface EventData {
  amount: string;
  execution_gas_units: string;
  io_gas_units: string;
  storage_fee_octas: string;
  storage_fee_refund_octas: string;
  total_charge_gas_units: string;
}

