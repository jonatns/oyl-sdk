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
exports.Signer = exports.pathTaproot = exports.pathSegwit = exports.pathSegwitNested = exports.pathLegacy = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const utils_1 = require("../shared/utils");
exports.pathLegacy = "m/44'/1'/0'/0";
exports.pathSegwitNested = "m/49'/1'/0'/0/0";
exports.pathSegwit = "m/84'/1'/0'/0/0";
exports.pathTaproot = "m/86'/1'/0'/0/0";
class Signer {
    constructor(network, addresses) {
        const keyPairs = addresses.map((key) => utils_1.ECPair.fromPrivateKey(Buffer.from(key.privateKey, 'hex')));
        this.keyPairs = keyPairs;
        this.network = network;
    }
    SignInput({ rawPsbt, inputNumber, }) {
        return __awaiter(this, void 0, void 0, function* () {
            let unSignedPsbt = bitcoin.Psbt.fromBase64(rawPsbt);
            const matchingPubKey = unSignedPsbt.inputHasPubkey(inputNumber, Buffer.from(this.keyPairs[0].publicKey));
            if (!matchingPubKey) {
                throw new Error('Input does not match signer type');
            }
            unSignedPsbt.signInput(inputNumber, this.keyPairs[0]);
            const signedPsbt = unSignedPsbt.finalizeInput(inputNumber).toBase64();
            return { signedPsbt: signedPsbt };
        });
    }
    SignTaprootInput({ rawPsbt, inputNumber, }) {
        return __awaiter(this, void 0, void 0, function* () {
            let unSignedPsbt = bitcoin.Psbt.fromBase64(rawPsbt, {
                network: this.network,
            });
            const tweakedSigner = (0, utils_1.tweakSigner)(this.keyPairs[1]);
            const matchingPubKey = unSignedPsbt.inputHasPubkey(inputNumber, Buffer.from(tweakedSigner.publicKey));
            if (!matchingPubKey) {
                throw new Error('Input does not match signer type');
            }
            unSignedPsbt.signTaprootInput(inputNumber, tweakedSigner);
            const signedPsbt = unSignedPsbt.finalizeInput(inputNumber).toBase64();
            return { signedPsbt: signedPsbt };
        });
    }
    SignAllTaprootInputs({ rawPsbt }) {
        return __awaiter(this, void 0, void 0, function* () {
            let unSignedTxn = bitcoin.Psbt.fromBase64(rawPsbt);
            const tweakedSigner = (0, utils_1.tweakSigner)(this.keyPairs[1]);
            unSignedTxn.signAllInputs(tweakedSigner);
            const signedPsbt = unSignedTxn.finalizeAllInputs().toBase64();
            return { signedPsbt: signedPsbt };
        });
    }
    SignAllInputs({ rawPsbt }) {
        return __awaiter(this, void 0, void 0, function* () {
            let unSignedTxn = bitcoin.Psbt.fromBase64(rawPsbt);
            unSignedTxn.signAllInputs(this.keyPairs[0]);
            const signedPsbt = unSignedTxn.finalizeAllInputs().toBase64();
            return { signedPsbt: signedPsbt };
        });
    }
    SignMessage({ messageToSign, keyToUse, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const signedMessage = this.keyPairs[keyToUse].sign(Buffer.from(messageToSign));
            console.log(signedMessage);
            return signedMessage;
        });
    }
}
exports.Signer = Signer;
//# sourceMappingURL=index.js.map