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
exports.signBip322Message = exports.bip0322Hash = void 0;
const secp256k1 = __importStar(require("noble-secp256k1"));
const base_1 = require("@scure/base");
const btc = __importStar(require("@scure/btc-signer"));
const bitcoin_address_validation_1 = require("bitcoin-address-validation");
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const bitcoinjs_message_1 = require("bitcoinjs-message");
const varuint_bitcoin_1 = require("varuint-bitcoin");
const bitcoinMainnet = {
    bech32: 'bc',
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
};
const bitcoinTestnet = {
    bech32: 'tb',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
};
const bitcoinNetworks = {
    Mainnet: bitcoinMainnet,
    Testnet: bitcoinTestnet,
};
const getBtcNetwork = (networkType) => {
    return bitcoinNetworks[networkType];
};
/**
 *
 * @param message
 * @returns Bip322 Message Hash
 *
 */
function bip0322Hash(message) {
    const { sha256 } = bitcoinjs_lib_1.crypto;
    const tag = 'BIP0322-signed-message';
    const tagHash = sha256(Buffer.from(tag));
    const result = sha256(Buffer.concat([tagHash, tagHash, Buffer.from(message)]));
    return result.toString('hex');
}
exports.bip0322Hash = bip0322Hash;
function encodeVarString(b) {
    return Buffer.concat([(0, varuint_bitcoin_1.encode)(b.byteLength), b]);
}
const getSigningPk = (type, privateKey) => {
    switch (type) {
        case bitcoin_address_validation_1.AddressType.p2tr: {
            return secp256k1.schnorr.getPublicKey(privateKey);
        }
        case bitcoin_address_validation_1.AddressType.p2sh: {
            return secp256k1.getPublicKey(privateKey, true);
        }
        case bitcoin_address_validation_1.AddressType.p2wpkh: {
            return secp256k1.getPublicKey(privateKey, true);
        }
        default: {
            throw new Error('Unsupported Address Type');
        }
    }
};
const getSignerScript = (type, publicKey, network) => {
    switch (type) {
        case bitcoin_address_validation_1.AddressType.p2tr: {
            return btc.p2tr(publicKey, undefined, network);
        }
        case bitcoin_address_validation_1.AddressType.p2wpkh: {
            return btc.p2wpkh(publicKey, network);
        }
        case bitcoin_address_validation_1.AddressType.p2sh: {
            const p2wph = btc.p2wpkh(publicKey, network);
            return btc.p2sh(p2wph, network);
        }
        default: {
            throw new Error('Unsupported Address Type');
        }
    }
};
const signBip322Message = ({ message, network, privateKey, signatureAddress, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { type } = (0, bitcoin_address_validation_1.getAddressInfo)(signatureAddress);
    const ecpairPk = privateKey;
    const newPk = privateKey.toString('hex');
    if (type === bitcoin_address_validation_1.AddressType.p2sh) {
        return (yield (0, bitcoinjs_message_1.signAsync)(message, ecpairPk, false, { segwitType: 'p2sh(p2wpkh)' })).toString('base64');
    }
    const publicKey = getSigningPk(type, newPk);
    const txScript = getSignerScript(type, publicKey, getBtcNetwork(network));
    const inputHash = base_1.hex.decode('0000000000000000000000000000000000000000000000000000000000000000');
    const txVersion = 0;
    const inputIndex = 4294967295;
    const sequence = 0;
    const scriptSig = btc.Script.encode(['OP_0', base_1.hex.decode(bip0322Hash(message))]);
    // tx-to-spend
    const txToSpend = new btc.Transaction({
        allowUnknownOutputs: true,
        version: txVersion,
    });
    txToSpend.addOutput({
        amount: BigInt(0),
        script: txScript.script,
    });
    txToSpend.addInput({
        txid: inputHash,
        index: inputIndex,
        sequence,
        finalScriptSig: scriptSig,
    });
    // tx-to-sign
    const txToSign = new btc.Transaction({
        allowUnknownOutputs: true,
        version: txVersion,
    });
    txToSign.addInput({
        txid: txToSpend.id,
        index: 0,
        sequence,
        tapInternalKey: type === bitcoin_address_validation_1.AddressType.p2tr ? publicKey : undefined,
        witnessUtxo: {
            script: txScript.script,
            amount: BigInt(0),
        },
        redeemScript: bitcoin_address_validation_1.AddressType.p2sh ? txScript.redeemScript : Buffer.alloc(0),
    });
    txToSign.addOutput({ script: btc.Script.encode(['RETURN']), amount: BigInt(0) });
    console.log(newPk);
    txToSign.sign(base_1.hex.decode(newPk));
    txToSign.finalize();
    // formulate-signature
    const firstInput = txToSign.getInput(0);
    if ((_a = firstInput.finalScriptWitness) === null || _a === void 0 ? void 0 : _a.length) {
        const len = (0, varuint_bitcoin_1.encode)((_b = firstInput.finalScriptWitness) === null || _b === void 0 ? void 0 : _b.length);
        const result = Buffer.concat([len, ...firstInput.finalScriptWitness.map((w) => encodeVarString(w))]);
        return result.toString('base64');
    }
    else {
        return '';
    }
});
exports.signBip322Message = signBip322Message;
const seedPhrase = 'drift radio firm ostrich inherit egg someone invite type mom owner dream';
const paymentAddress = "bc1qy7qt5qskm5228pu2veqprkseqj3xenqzzu8yxq";
const ordinalsAddress = "bc1plwsq345eh0525nlwakuxc6qvgpma298v350y9adpx4vkunfeg0ws385vd8";
const message = `Please confirm that\nPayment Address: ${paymentAddress}\nOrdinals Address: ${ordinalsAddress}`;
//# sourceMappingURL=BIP322.js.map