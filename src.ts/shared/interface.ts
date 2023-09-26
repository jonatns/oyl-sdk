export interface InscriptionResponse {
  address: string
  inscriptions?: string
  scriptPubkey: string
  transaction: string
  value: string
}

export interface UnspentOutput {
  txId: string
  outputIndex: number
  satoshis: number
  scriptPk: string
  addressType: AddressType
  address: string
  ords: {
    id: string
    offset: number
  }[]
}

export interface TxInput {
  data: {
    hash: string
    index: number
    witnessUtxo: { value: number; script: Buffer }
    tapInternalKey?: Buffer
  }
  utxo: UnspentOutput
}

export interface TxOutput {
  address: string
  value: number
}

export interface ToSignInput {
  index: number
  publicKey: string
  sighashTypes?: number[]
}

export interface PrevOut {
  hash: string
  index: number
}

export interface Input {
  prevout: PrevOut
  coin: {
    value: number
  }
}

export interface Output {
  value: number
  script: string
  address: string
}

export interface Transaction {
  inputs: Input[]
  outputs: Output[]
}

export enum AddressType {
  P2PKH,
  P2TR,
  P2SH_P2WPKH,
  P2WPKH,
}

export interface ProviderOptions {
  network: String
  host: String
  port: Number
  provider?: Providers
  auth?: String
}

export enum Providers {
  bcoin,
  oyl,
  electrum

}

export interface SwapBrcBid {
  address: String
  auctionId: String
  bidPrice: Number
  pubKey: String
}

export interface SignedBid {
    psbtBid: String
    auctionId: String
    bidId: String
}

export interface SwapBrc {
  address: String
  auctionId: String
  bidPrice: Number
  pubKey: String
  mnemonic: String
  hdPath: String
  type: String
}