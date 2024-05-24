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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const interface_1 = require("../shared/interface");
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const bip32_1 = require("bip32");
const bip32 = (0, bip32_1.BIP32Factory)(secp256k1_1.default);
const bip39 = __importStar(require("bip39"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
bitcoin.initEccLib(secp256k1_1.default);
const genWallet_1 = require("../tests/genWallet");
const publicKeyToAddress = (publicKey, type, network) => {
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
            redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey, network }),
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
};
class Account {
    mnemonic;
    network;
    index = 0;
    provider;
    constructor({ mnemonic, network, index, provider, }) {
        this.mnemonic = mnemonic;
        this.network = network;
        this.index = index;
        this.provider = provider;
    }
    hdPathToAddressType = ({ hdPath }) => {
        if (hdPath.startsWith("m/84'/0'/0'/")) {
            return interface_1.AddressType.P2WPKH;
        }
        if (hdPath.startsWith("m/49'/0'/0'/")) {
            return interface_1.AddressType.P2SH_P2WPKH;
        }
        if (hdPath.startsWith("m/86'/0'/0'/")) {
            return interface_1.AddressType.P2TR;
        }
        if (hdPath.startsWith("m/44'/0'/0'/")) {
            return interface_1.AddressType.P2PKH;
        }
        throw new Error('unknown hd path');
    };
    mnemonicToAccount({ hdPath }) {
        const seed = bip39.mnemonicToSeedSync(this.mnemonic);
        const root = bip32.fromSeed(seed);
        const child = root.derivePath(hdPath);
        const pubkey = child.publicKey.toString('hex');
        const privateKey = child.privateKey.toString('hex');
        const addressType = this.hdPathToAddressType({ hdPath });
        const addressKeyValue = interface_1.internalAddressTypeToName[addressType];
        const btcAddress = publicKeyToAddress(pubkey, addressType, this.network);
        return {
            pubkey: pubkey,
            addressType: interface_1.addressNameToType[addressKeyValue],
            address: btcAddress,
            privateKey: privateKey,
        };
    }
    addresses() {
        const accounts = (0, genWallet_1.generateWallet)(this.network === bitcoin.networks.testnet, this.mnemonic, this.index);
        return accounts;
    }
    async spendableUtxos({ address }) {
        const utxos = await this.provider.esplora.getAddressUtxo(address);
        return utxos;
    }
}
exports.Account = Account;
//# sourceMappingURL=account.js.map