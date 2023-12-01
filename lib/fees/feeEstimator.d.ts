/// <reference types="node" />
import { Psbt } from "bitcoinjs-lib";
import { Network } from "../shared/interface";
import { FeeEstimatorOptions } from "../shared/interface";
export default class FeeEstimator {
    protected fee: number;
    protected feeRate: number;
    protected network: Network;
    protected psbt: Psbt;
    protected witness?: Buffer[];
    protected virtualSize: number;
    protected weight: number;
    constructor({ feeRate, network, psbt, witness }: FeeEstimatorOptions);
    get data(): {
        fee: number;
        virtualSize: number;
        weight: number;
    };
    private sanityCheckFee;
    calculateNetworkFee(): number;
    private analyzePSBTComponents;
    private calculateScriptWitnessSize;
    private getBaseSize;
    private calculateVirtualSize;
    private getBaseSizeByType;
}
