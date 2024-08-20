import { AddressType, AssetType } from "../shared/interface";
import { FormattedUtxo } from '../utxo/utxo';
import { Psbt } from 'bitcoinjs-lib';
import { Provider } from '../provider'
import { Account } from '../account'
import * as bitcoin from 'bitcoinjs-lib'
import { Signer } from '../signer'


export interface ConditionalInput {
    hash: string
    index: number
    witnessUtxo: { value: number; script: Buffer }
    tapInternalKey?: Buffer
    segwitInternalKey?: Buffer
}

export interface SelectedUtxoOffers {
    offer: MarketplaceOffer;
    utxo: FormattedUtxo[];
};

export interface DummyUtxoOptions {
    address: string
    utxos: FormattedUtxo[]
    feeRate: number
    pubKey: string
    network: bitcoin.Network
    addressType: AddressType
}

export interface PaymentUtxoOptions {
    utxos: FormattedUtxo[]
    feeRate: number
    orderPrice: number
    address: string
    receiveAddress: string
    sellerPsbt: string
}

export interface PrepareAddressForDummyUtxos {
    address: string
    provider: Provider
    feeRate: number
    pubKey: string
    utxos?: FormattedUtxo[]
    addressType: AddressType
}

export interface SignedOkxBid {
    fromAddress: string;
    psbt?: string;
    assetType: AssetType
    provider: Provider
    offer: MarketplaceOffer
}

export interface UnsignedOkxBid {
    offerId: number
    assetType: AssetType
    provider: Provider
}

export interface GenOkxBrcAndCollectibleUnsignedPsbt {
    address: string
    utxos: FormattedUtxo[]
    feeRate: number
    receiveAddress: string
    network: bitcoin.Network
    pubKey: string
    addressType: AddressType
    sellerPsbt: string
    orderPrice: number
}

export interface GenOkxRuneUnsignedPsbt {
    address: string
    utxos: FormattedUtxo[]
    feeRate: number
    receiveAddress: string
    network: bitcoin.Network
    pubKey: string
    addressType: AddressType
    sellerPsbt: string
    orderPrice: number
}

export interface UnsignedPsbt {
    address: string
    utxos: FormattedUtxo[]
    feeRate: number
    receiveAddress: string
    network: bitcoin.Network
    pubKey: string
    addressType: AddressType
    signer?: Signer
    sellerPsbt: string
    orderPrice: number
    sellerAddress?: string
    assetType: AssetType
}

export interface SelectSpendAddress {
    offers: MarketplaceOffer[]
    provider: Provider
    feeRate: number
    account: Account
}


export interface MarketplaceOffer {
    ticker: string
    offerId: any
    amount?: string
    address?: string
    marketplace: string
    price?: number
    unitPrice?: number
    totalPrice?: number
    psbt?: string
    inscriptionId?: string
}

export enum Marketplaces {
    UNISAT,
    OKX,
}

export interface PsbtBuilder {
    network: bitcoin.Network
    utxos: FormattedUtxo[]
    retrievedUtxos?: FormattedUtxo[]
    inputTemplate: ConditionalInput[]
    changeOutput: OutputTxTemplate | null
    outputTemplate: OutputTxTemplate[]
    amountRetrieved: number
    spendAddress: string
    spendPubKey: string
    spendAmount: number
    addressType: AddressType
    feeRate: number
}

export interface BuiltPsbt {
    psbtHex: string,
    psbtBase64: string
}

export interface OutputTxTemplate {
    address: string
    value: number
}

export interface SwapPayload {
    address: string
    auctionId: string
    bidPrice: number
    pubKey: string
    receiveAddress: string
    feerate: number
}

export const marketplaceName = {
    'unisat': Marketplaces.UNISAT,
    'okx': Marketplaces.OKX
}

export interface UtxosToCoverAmount {
    utxos: FormattedUtxo[],
    amountNeeded: number,
    excludedUtxos?: FormattedUtxo[],
    insistConfirmedUtxos?: boolean
}

export interface BidAffordabilityCheck {
    address: string,
    estimatedCost: number,
    offers: MarketplaceOffer[],
    provider: Provider
}

export interface FeeEstimatorOptions {
    feeRate: number
    network: bitcoin.Network
    psbt?: Psbt
    witness?: Buffer[]
}