/// <reference types="node" />
export interface InscriptionResponse {
    address: string;
    inscriptions?: string;
    scriptPubkey: string;
    transaction: string;
    value: string;
}
export interface UnspentOutput {
    txId: string;
    outputIndex: number;
    satoshis: number;
    scriptPk: string;
    addressType: AddressType;
    address: string;
    ords: {
        id: string;
        offset: number;
    }[];
}
export interface TxInput {
    data: {
        hash: string;
        index: number;
        witnessUtxo: {
            value: number;
            script: Buffer;
        };
        tapInternalKey?: Buffer;
    };
    utxo: UnspentOutput;
}
export interface TxOutput {
    address: string;
    value: number;
}
export interface ToSignInput {
    index: number;
    publicKey: string;
    sighashTypes?: number[];
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
export declare enum AddressType {
    P2PKH = 0,
    P2TR = 1,
    P2SH_P2WPKH = 2,
    P2WPKH = 3
}
export interface ProviderOptions {
    network: String;
    host: String;
    port: Number;
    provider?: Providers;
    auth?: String;
}
export declare enum Providers {
    bcoin = 0,
    oyl = 1,
    electrum = 2
}
export interface SwapBrcBid {
    address: String;
    auctionId: String;
    bidPrice: Number;
    pubKey: String;
}
export interface SignedBid {
    psbtBid: String;
    auctionId: String;
    bidId: String;
}
export interface SwapBrc {
    address: String;
    auctionId: String;
    bidPrice: Number;
    pubKey: String;
    mnemonic: String;
    hdPath: String;
    type: String;
}
