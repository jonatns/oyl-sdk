import * as bitcoin from 'bitcoinjs-lib';
import { UnspentOutput } from '../shared/interface';
/**
 * Represents a util to inscribe ordinals.
 */
export declare class Inscriber {
    private mediaType;
    private mediaContent;
    private pubKey;
    private network;
    private meta;
    private postage;
    private address;
    private destinationAddress;
    private payment;
    private witnessScripts;
    private taprootTree;
    inputs: any[];
    outputs: any[];
    /**
     * Initializes a new instance of the Inscriber.
     * @param options - Initialization options for the inscriber.
     */
    constructor({ address, destinationAddress, pubKey, postage, mediaContent, mediaType, outputs, meta, network }: {
        address: string;
        destinationAddress: string;
        pubKey: string;
        postage: number;
        network: bitcoin.Network;
        mediaContent: string;
        mediaType: string;
        outputs?: any[];
        meta?: Record<string, any>;
    });
    /**
     * Retrieves the metadata of the inscription.
     * @returns The metadata of the inscription.
     */
    private getMetadata;
    /**
     * Constructs the witness scripts for the inscription.
     */
    buildWitness(): void;
    /**
     * Retrieves the redeem script for the inscription.
     * @returns The redeem script.
     */
    getInscriptionRedeemScript(): bitcoin.payments.Payment['redeem'];
    /**
     * Constructs the taproot tree for the transaction.
     */
    buildTaprootTree(): void;
    /**
     * Generates the commitment for the inscription.
     * @returns The generated commitment.
     */
    generateCommit(): Promise<{
        address: string;
        revealFee: null;
    }>;
    /**
     * Builds the PSBT for the inscription.
     * @param utxo - The unspent transaction output to use.
     * @returns The generated PSBT inputs and outputs.
     */
    build(utxo: UnspentOutput): Promise<{
        inputs: any[];
        outputs: any[];
    }>;
}
