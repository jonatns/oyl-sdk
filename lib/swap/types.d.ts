/// <reference types="node" />
import { AddressType } from "../shared/interface";
import { FormattedUtxo } from '@utxo/utxo';
import { Psbt } from 'bitcoinjs-lib';
import { Provider } from '../provider';
import { Account } from '../account';
import * as bitcoin from 'bitcoinjs-lib';
export interface ConditionalInput {
    hash: string;
    index: number;
    witnessUtxo: {
        value: number;
        script: Buffer;
    };
    tapInternalKey?: Buffer;
    segwitInternalKey?: Buffer;
}
export interface SelectedUtxoOffers {
    offer: MarketplaceOffer;
    utxo: FormattedUtxo[];
}
export interface SelectSpendAddress {
    offers: MarketplaceOffer[];
    provider: Provider;
    feeRate: number;
    account: Account;
}
export interface MarketplaceOffer {
    ticker: string;
    offerId: any;
    amount?: string;
    address?: string;
    marketplace: string;
    price?: number;
    unitPrice?: number;
    totalPrice?: number;
    psbt?: string;
    inscriptionId?: string;
}
export declare enum Marketplaces {
    UNISAT = 0,
    OKX = 1
}
export interface PsbtBuilder {
    network: bitcoin.Network;
    utxos: FormattedUtxo[];
    retrievedUtxos?: FormattedUtxo[];
    inputTemplate: ConditionalInput[];
    changeOutput: OutputTxTemplate | null;
    outputTemplate: OutputTxTemplate[];
    amountRetrieved: number;
    spendAddress: string;
    spendPubKey: string;
    spendAmount: number;
    addressType: AddressType;
    feeRate: number;
}
export interface BuiltPsbt {
    psbtHex: string;
    psbtBase64: string;
}
export interface OutputTxTemplate {
    address: string;
    value: number;
}
export interface SwapPayload {
    address: string;
    auctionId: string;
    bidPrice: number;
    pubKey: string;
    receiveAddress: string;
    feerate: number;
}
export declare const marketplaceName: {
    unisat: Marketplaces;
    okx: Marketplaces;
};
export interface UtxosToCoverAmount {
    utxos: FormattedUtxo[];
    amountNeeded: number;
    excludedUtxos?: FormattedUtxo[];
    insistConfirmedUtxos?: boolean;
}
export interface BidAffordabilityCheck {
    address: string;
    estimatedCost: number;
    offers: MarketplaceOffer[];
    provider: Provider;
}
export interface FeeEstimatorOptions {
    feeRate: number;
    network: bitcoin.Network;
    psbt?: Psbt;
    witness?: Buffer[];
}
