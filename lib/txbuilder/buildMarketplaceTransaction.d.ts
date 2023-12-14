import { OylApiClient } from '../apiclient';
import { SandshrewBitcoinClient } from '../rpclient/sandshrew';
import { EsploraRpc } from "../rpclient/esplora";
import { MarketplaceBuy } from '../shared/interface';
export declare class BuildMarketplaceTransaction {
    walletAddress: string;
    pubKey: string;
    apiClient: OylApiClient;
    esploraRpc: EsploraRpc;
    feeRate: number;
    psbtBase64: string;
    orderPrice: number;
    sandshrewBtcClient: SandshrewBitcoinClient;
    makersAddress: string | null;
    takerScript: string;
    constructor({ address, pubKey, feeRate, psbtBase64, price }: MarketplaceBuy);
    getUTXOsToCoverAmount(amountNeeded: number, inscriptionLocs?: string[]): Promise<any>;
    psbtBuilder(): Promise<{
        psbtHex: string;
        psbtBase64: string;
    }>;
    psbtMultiBuilder(): Promise<void>;
    getAllUTXOsWorthASpecificValue(value: number): Promise<any>;
    calculateAmountGathered(utxoArray: any): any;
    getUnspentsWithConfirmationsForAddress(): Promise<any>;
    getUnspentsForAddressInOrderByValue(): Promise<any>;
    getMakersAddress(): Promise<void>;
}
