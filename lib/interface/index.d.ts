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
export declare enum AddressType {
    P2PKH = 0,
    P2TR = 1,
    P2SH_P2WPKH = 2,
    P2WPKH = 3
}
