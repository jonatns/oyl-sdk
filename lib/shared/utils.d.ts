/// <reference types="node" />
import * as bitcoin from 'bitcoinjs-lib';
import { BitcoinPaymentType, IBlockchainInfoUTXO, Network, ToSignInput, TxInput, UnspentOutput } from '../shared/interface';
import { Utxo } from '../txbuilder/buildOrdTx';
import { SandshrewBitcoinClient } from '../rpclient/sandshrew';
import { EsploraRpc } from '../rpclient/esplora';
export interface IBISWalletIx {
    validity: any;
    isBrc: boolean;
    isSns: boolean;
    name: any;
    amount: any;
    isValidTransfer: any;
    operation: any;
    ticker: any;
    isJson: boolean;
    content?: string;
    inscription_name: any;
    inscription_id: string;
    inscription_number: number;
    metadata: any;
    owner_wallet_addr: string;
    mime_type: string;
    last_sale_price: any;
    slug: any;
    collection_name: any;
    content_url: string;
    bis_url: string;
    wallet?: string;
    media_length?: number;
    genesis_ts?: number;
    genesis_height?: number;
    genesis_fee?: number;
    output_value?: number;
    satpoint?: string;
    collection_slug?: string;
    confirmations?: number;
}
export declare const addressTypeMap: {
    0: string;
    1: string;
    2: string;
    3: string;
};
export declare const inscriptionSats = 546;
export declare const ECPair: import("ecpair").ECPairAPI;
export declare const assertHex: (pubKey: Buffer) => Buffer;
export declare function getNetwork(value: Network | 'main' | 'mainnet' | 'regtest' | 'testnet'): bitcoin.networks.Network;
export declare function checkPaymentType(payment: bitcoin.PaymentCreator, network: Network): (script: Buffer) => false | bitcoin.payments.Payment;
export declare function tweakSigner(signer: bitcoin.Signer, opts?: any): bitcoin.Signer;
export declare function satoshisToAmount(val: number): string;
export declare function delay(ms: number): Promise<unknown>;
export declare function amountToSatoshis(val: any): number;
export declare const validator: (pubkey: Buffer, msghash: Buffer, signature: Buffer) => boolean;
export declare function utxoToInput(utxo: UnspentOutput, publicKey: Buffer): TxInput;
export declare const getWitnessDataChunk: (content: string, encodeType?: BufferEncoding) => Buffer[];
export declare const getSatpointFromUtxo: (utxo: IBlockchainInfoUTXO) => string;
export declare const getInscriptionsByWalletBIS: (walletAddress: string, offset?: number) => Promise<IBISWalletIx[]>;
export declare function calculateAmountGathered(utxoArray: IBlockchainInfoUTXO[]): number;
export declare function calculateAmountGatheredUtxo(utxoArray: Utxo[]): number;
export declare const formatOptionsToSignInputs: ({ _psbt, pubkey, segwitPubkey, segwitAddress, taprootAddress, network, }: {
    _psbt: bitcoin.Psbt;
    pubkey: string;
    segwitPubkey: string;
    segwitAddress: string;
    taprootAddress: string;
    network: bitcoin.Network;
}) => Promise<ToSignInput[]>;
export declare const formatInputsToSign: ({ _psbt, senderPublicKey, network, }: {
    _psbt: bitcoin.Psbt;
    senderPublicKey: string;
    network: bitcoin.Network;
}) => Promise<bitcoin.Psbt>;
export declare const timeout: (n: any) => Promise<unknown>;
export declare const signInputs: (psbt: bitcoin.Psbt, toSignInputs: ToSignInput[], taprootPubkey: string, segwitPubKey: string, segwitSigner: any, taprootSigner: any) => Promise<bitcoin.Psbt>;
export declare const createInscriptionScript: (pubKey: any, content: any) => string[];
export declare let RPC_ADDR: string;
export declare const callBTCRPCEndpoint: (method: string, params: string | string[], network: string) => Promise<any>;
export declare function waitForTransaction({ txId, sandshrewBtcClient, }: {
    txId: string;
    sandshrewBtcClient: SandshrewBitcoinClient;
}): Promise<[boolean, any?]>;
export declare function getOutputValueByVOutIndex({ txId, vOut, esploraRpc, }: {
    txId: string;
    vOut: number;
    esploraRpc: EsploraRpc;
}): Promise<any[] | null>;
export declare function calculateTaprootTxSize(taprootInputCount: number, nonTaprootInputCount: number, outputCount: number): number;
export declare function getRawTxnHashFromTxnId(txnId: string): Promise<any>;
export declare const isP2PKH: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const isP2WPKH: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const isP2WSHScript: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const isP2SHScript: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const isP2TR: (script: Buffer, network: Network) => BitcoinPaymentType;
export declare const sendCollectible: ({ inscriptionId, inputAddress, outputAddress, taprootPublicKey, segwitPublicKey, segwitAddress, isDry, segwitSigner, taprootSigner, payFeesWithSegwit, feeRate, network, taprootUtxos, segwitUtxos, metaOutputValue, sandshrewBtcClient, }: {
    inscriptionId: string;
    inputAddress: string;
    outputAddress: string;
    mnemonic: string;
    taprootPublicKey: string;
    segwitPublicKey: string;
    segwitAddress: string;
    isDry?: boolean;
    feeRate: number;
    segwitSigner: any;
    taprootSigner: any;
    payFeesWithSegwit?: boolean;
    network: 'testnet' | 'main' | 'regtest';
    taprootUtxos: Utxo[];
    segwitUtxos: Utxo[];
    metaOutputValue: number;
    sandshrewBtcClient: SandshrewBitcoinClient;
}) => Promise<{
    txId: string;
    rawTx: string;
}>;
export declare const filterTaprootUtxos: ({ taprootUtxos, }: {
    taprootUtxos: any[];
}) => Promise<any>;
export declare const filterUtxos: ({ utxos }: {
    utxos: any[];
}) => Promise<any>;
export declare const addBtcUtxo: ({ utxos, toAddress, fromAddress, psbt, amount, feeRate, network, spendAddress, senderPubKey, altSpendAddress, altSpendPubKey, altSpendUtxos, }: {
    utxos: any[];
    toAddress: string;
    fromAddress: string;
    psbt: bitcoin.Psbt;
    feeRate: number;
    amount: number;
    network: bitcoin.Network;
    spendAddress: string;
    senderPubKey: string;
    altSpendAddress?: string;
    altSpendPubKey?: string;
    altSpendUtxos?: Utxo[];
}) => Promise<bitcoin.Psbt>;
export declare const isValidJSON: (str: string) => boolean;
