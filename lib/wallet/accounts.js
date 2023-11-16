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
exports.importMnemonic = exports.isValidAddress = exports.publicKeyToAddress = exports.createWallet = void 0;
/*
*
*
The  parent key should be able to be derived sequentially. The UI can select/change
the path parameters (e.g "44"/"49"/"86")
// */
const bitcoin = __importStar(require("bitcoinjs-lib"));
const hdKeyring_1 = require("./hdKeyring");
const interface_1 = require("../shared/interface");
function createWallet(hdPathString, type) {
    // Create a new instance of HdKeyring with the provided hdPathString
    const keyring = new hdKeyring_1.HdKeyring({ hdPath: hdPathString });
    // Add a single account to the keyring
    keyring.addAccounts(1);
    // Get the first account public key
    const accounts = keyring.getAccounts();
    const pubkey = accounts[0];
    const address = publicKeyToAddress(pubkey, type);
    if (address == null)
        throw Error('Invalid publickey or address type');
    const fullPayload = {};
    fullPayload['keyring'] = keyring;
    fullPayload['address'] = address;
    //TO-DO - check return value of fullPayload so you dont have wallet.keyring.keyring
    return fullPayload;
}
exports.createWallet = createWallet;
function publicKeyToAddress(publicKey, type) {
    const network = bitcoin.networks.bitcoin;
    if (!publicKey)
        return null;
    const pubkey = Buffer.from(publicKey, 'hex');
    if (type === interface_1.AddressType.P2PKH) {
        const { address } = bitcoin.payments.p2pkh({
            pubkey,
            network,
        });
        return address || null;
    }
    else if (type === interface_1.AddressType.P2WPKH) {
        const { address } = bitcoin.payments.p2wpkh({
            pubkey,
            network,
        });
        return address || null;
    }
    else if (type === interface_1.AddressType.P2SH_P2WPKH) {
        const { address } = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey }),
        });
        return address || null;
    }
    else if (type === interface_1.AddressType.P2TR) {
        const { address } = bitcoin.payments.p2tr({
            internalPubkey: pubkey.slice(1, 33),
            network,
        });
        return address || null;
    }
    else {
        return null;
    }
}
exports.publicKeyToAddress = publicKeyToAddress;
function isValidAddress(address, network = bitcoin.networks.bitcoin) {
    let error;
    try {
        bitcoin.address.toOutputScript(address, network);
    }
    catch (e) {
        error = e;
    }
    if (error) {
        return false;
    }
    else {
        return true;
    }
}
exports.isValidAddress = isValidAddress;
function importMnemonic(mnemonic, path, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const keyring = yield new hdKeyring_1.HdKeyring({ mnemonic: mnemonic, hdPath: path });
        // Add a single account to the keyring
        yield keyring.addAccounts(1);
        // Get the first account public key
        const accounts = yield keyring.getAccounts();
        //console.log(accounts);
        const pubkey = accounts[0];
        console.log(`pubkey for address: ${pubkey}`);
        const address = publicKeyToAddress(pubkey, type);
        if (address == null)
            throw Error('Invalid publickey or address type');
        const fullPayload = {};
        fullPayload['keyring'] = keyring;
        fullPayload['address'] = address;
        return fullPayload;
    });
}
exports.importMnemonic = importMnemonic;
//# sourceMappingURL=accounts.js.map