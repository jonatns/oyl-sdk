import { OylApiClient } from '../apiclient';
import { SandshrewBitcoinClient } from '../rpclient/sandshrew';
import { EsploraRpc } from "../rpclient/esplora";
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
    constructor({ address, pubKey, feeRate, psbtBase64, price }: {
        address: string;
        pubKey: string;
        feeRate: number;
        psbtBase64: string;
        price: number;
    });
    getUTXOsToCoverAmount(amountNeeded: number, inscriptionLocs?: string[]): Promise<any>;
    psbtBuilder(): Promise<string>;
    getAllUTXOsWorthASpecificValue(value: number): Promise<any>;
    calculateAmountGathered(utxoArray: any): any;
    getUnspentsWithConfirmationsForAddress(): Promise<any>;
    getUnspentsForAddressInOrderByValue(): Promise<any>;
    getMakersAddress(): Promise<void>;
}
