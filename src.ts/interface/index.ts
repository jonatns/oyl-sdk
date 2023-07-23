export interface InscriptionResponse {
    address: string;
    inscriptions?: string;
    scriptPubkey: string;
    transaction: string;
    value: string;
}

  
export interface PrevOut {
  hash: string;
  index: number;
}

export interface Input {
  prevout: PrevOut;
  coin: {
    value: number;
  };
}

export interface Output {
  value: number;
  script: string;
  address: string;
}

export interface Transaction {
  inputs: Input[];
  outputs: Output[];
}

export enum AddressType {
    P2PKH,
    P2TR,
    P2SH_P2WPKH,
    P2WPKH
}
  