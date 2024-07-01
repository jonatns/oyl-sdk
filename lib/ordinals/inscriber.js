"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inscriber = void 0;
const tslib_1 = require("tslib");
const ecc = tslib_1.__importStar(require("@bitcoinerlab/secp256k1"));
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const witness_1 = require("./witness");
bitcoin.initEccLib(ecc);
/**
 * Represents a util to inscribe ordinals.
 */
class Inscriber {
    mediaType;
    mediaContent;
    pubKey;
    network;
    meta;
    postage;
    address;
    destinationAddress;
    payment = null;
    witnessScripts = {
        inscription: null,
        recovery: null,
    };
    taprootTree;
    inputs;
    outputs;
    /**
     * Initializes a new instance of the Inscriber.
     * @param options - Initialization options for the inscriber.
     */
    constructor({ address, destinationAddress, pubKey, postage, mediaContent, mediaType, outputs = [], meta = {}, network, }) {
        if (!pubKey || !mediaContent) {
            throw new Error('Invalid options provided');
        }
        this.network = network;
        this.pubKey = pubKey;
        this.destinationAddress = destinationAddress;
        this.mediaType = mediaType;
        this.mediaContent = mediaContent;
        this.meta = meta;
        this.postage = postage;
        this.address = address;
        this.outputs = outputs;
    }
    /**
     * Retrieves the metadata of the inscription.
     * @returns The metadata of the inscription.
     */
    getMetadata() {
        return this.meta;
    }
    /**
     * Constructs the witness scripts for the inscription.
     */
    buildWitness() {
        this.witnessScripts = {
            inscription: (0, witness_1.witnessScriptBuilder)({
                mediaContent: this.mediaContent,
                mediaType: this.mediaType,
                meta: this.getMetadata(),
                pubKeyHex: this.pubKey,
            }),
            recovery: (0, witness_1.witnessScriptBuilder)({
                mediaContent: this.mediaContent,
                mediaType: this.mediaType,
                meta: this.getMetadata(),
                pubKeyHex: this.pubKey,
                recover: true,
            }),
        };
    }
    /**
     * Retrieves the redeem script for the inscription.
     * @returns The redeem script.
     */
    getInscriptionRedeemScript() {
        return {
            output: this.witnessScripts.inscription,
            redeemVersion: 192,
        };
    }
    /**
     * Constructs the taproot tree for the transaction.
     */
    buildTaprootTree() {
        this.buildWitness();
        this.taprootTree = [
            { output: this.witnessScripts.inscription },
            { output: this.witnessScripts.recovery },
        ];
    }
    /**
     * Generates the commitment for the inscription.
     * @returns The generated commitment.
     */
    async generateCommit() {
        this.buildTaprootTree();
        this.payment = bitcoin.payments.p2tr({
            internalPubkey: Buffer.from(this.pubKey, 'hex'),
            network: this.network,
            scriptTree: this.taprootTree,
            redeem: this.getInscriptionRedeemScript(),
        });
        return {
            address: this.payment.address,
            revealFee: null,
        };
    }
    /**
     * Builds the PSBT for the inscription.
     * @param utxo - The unspent transaction output to use.
     * @returns The generated PSBT inputs and outputs.
     */
    async build(utxo) {
        if (!this.payment) {
            throw new Error('Failed to build PSBT. Transaction not ready');
        }
        this.inputs = [
            {
                type: 'taproot',
                hash: utxo.txId,
                index: utxo.outputIndex,
                tapInternalKey: Buffer.from(this.pubKey, 'hex'),
                witnessUtxo: {
                    script: this.payment.output,
                    value: utxo.satoshis,
                },
                tapLeafScript: [
                    {
                        leafVersion: this.payment.redeemVersion,
                        script: this.payment.redeem.output,
                        controlBlock: this.payment.witness[this.payment.witness.length - 1],
                    },
                ],
            },
        ];
        this.outputs = [
            {
                address: this.destinationAddress || this.address,
                value: this.postage,
            },
            ...this.outputs,
        ];
        return { inputs: this.inputs, outputs: this.outputs };
    }
}
exports.Inscriber = Inscriber;
//# sourceMappingURL=inscriber.js.map