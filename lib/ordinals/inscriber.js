"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inscriber = void 0;
const ecc = __importStar(require("@bitcoinerlab/secp256k1"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const witness_1 = require("./witness");
bitcoin.initEccLib(ecc);
/**
 * Represents a util to inscribe ordinals.
 */
class Inscriber {
    /**
     * Initializes a new instance of the Inscriber.
     * @param options - Initialization options for the inscriber.
     */
    constructor({ address, destinationAddress, pubKey, postage, mediaContent, mediaType, outputs = [], meta = {}, network }) {
        this.payment = null;
        this.witnessScripts = {
            inscription: null,
            recovery: null,
        };
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
    generateCommit() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /**
     * Builds the PSBT for the inscription.
     * @param utxo - The unspent transaction output to use.
     * @returns The generated PSBT inputs and outputs.
     */
    build(utxo) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
}
exports.Inscriber = Inscriber;
//# sourceMappingURL=inscriber.js.map