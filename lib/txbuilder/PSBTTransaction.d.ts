import * as bitcoin from 'bitcoinjs-lib';
import { AddressType, UnspentOutput, TxOutput, ToSignInput } from '../shared/interface';
export declare class PSBTTransaction {
    private inputs;
    outputs: TxOutput[];
    private changeOutputIndex;
    private signer;
    private address;
    changedAddress: string;
    private network;
    private feeRate;
    private pubkey;
    private enableRBF;
    /**
     * Creates an instance of PSBTTransaction.
     * @param signer - Signer method bound to the HdKeyring.
     * @param address - Address associated with the transaction.
     * @param pubkey - Public key for the transaction.
     * @param feeRate - The fee rate in satoshis per byte.
     */
    constructor(signer: any, address: any, publicKey: any, feeRate: any, segwitSigner?: any, segwitPubKey?: any);
    /**
     * Sets whether to enable Replace-by-Fee for the transaction.
     * @param {boolean} enable - A boolean to enable or disable RBF.
     */
    setEnableRBF(enable: boolean): void;
    setChangeAddress(address: string): void;
    addInput(utxo: UnspentOutput): void;
    getTotalInput(): number;
    getTotalOutput(): number;
    getUnspent(): number;
    isEnoughFee(): Promise<boolean>;
    calNetworkFee(): Promise<number>;
    addOutput(address: string, value: number): void;
    getOutput(index: number): TxOutput;
    addChangeOutput(value: number): void;
    getChangeOutput(): TxOutput;
    getChangeAmount(): number;
    removeChangeOutput(): void;
    removeRecentOutputs(count: number): void;
    /**
     * Formats the inputs for signing based on the given PSBT and whether it is a reveal transaction.
     * @param { bitcoin.Psbt} psbt |  - The PSBT in hex string format or Psbt instance.
     * @returns {Promise<ToSignInput[]>} A promise that resolves to an array of inputs to sign.
     */
    formatOptionsToSignInputs: (psbt: bitcoin.Psbt) => Promise<{
        psbt: bitcoin.Psbt;
        toSignInputs: ToSignInput[];
    }>;
    signInputs(psbt: bitcoin.Psbt, toSignInputs: ToSignInput[]): Promise<void>;
    /**
     * Creates a signed PSBT for the transaction.
     * @returns {Promise<bitcoin.Psbt>} A promise that resolves to the signed PSBT instance.
     */
    createSignedPsbt(): Promise<bitcoin.Psbt>;
    /**
     * Signs the provided PSBT with the available keys.
     * @param {bitcoin.Psbt} psbt - The PSBT to sign.
     * @returns {Promise<bitcoin.Psbt>} A promise that resolves to the signed PSBT.
     */
    signPsbt(psbt: bitcoin.Psbt): Promise<bitcoin.Psbt>;
    /**
     * Generates the raw transaction hex and calculates the fee.
     * @param {boolean} autoAdjust - Whether to automatically adjust output values for the fee.
     * @returns {Promise<{ fee: number, rawtx: string, toSatoshis: number, estimateFee: number }>} A promise that resolves to an object containing the fee,
     *                                                                                                   raw transaction hex, total output value in satoshis,
     *                                                                                                   and the estimated fee.
     */
    generate(autoAdjust: boolean): Promise<{
        fee: number;
        rawtx: string;
        toSatoshis: number;
        estimateFee: number;
    }>;
    dumpTx(psbt: any): Promise<void>;
}
