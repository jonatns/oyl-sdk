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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HdKeyring = void 0;
const bitcoin = __importStar(require("bitcoinjs-lib"));
const bip371_1 = require("bitcoinjs-lib/src/psbt/bip371");
const events_1 = require("events");
const utils_1 = require("../shared/utils");
const bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
const hdPathString = "m/86'/0'/0'/0";
class HdKeyring extends events_1.EventEmitter {
    constructor(opts) {
        super(null);
        this.mnemonic = null;
        this.network = bitcoin.networks.bitcoin;
        this.root = null;
        this.wallets = [];
        this._index2wallet = {};
        this.activeIndexes = [];
        this.resolve(opts);
    }
    serialize() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                mnemonic: this.mnemonic,
                activeIndexes: this.activeIndexes,
                hdPath: this.hdPath,
                passphrase: this.passphrase,
            };
        });
    }
    resolve(_opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.root) {
                throw new Error('Btc-Hd-Keyring: Secret recovery phrase already provided');
            }
            let opts = _opts;
            this.wallets = [];
            this.mnemonic = null;
            this.root = null;
            this.hdPath = opts.hdPath || hdPathString;
            if (opts.passphrase) {
                this.passphrase = opts.passphrase;
            }
            if (opts.mnemonic) {
                this.initFromMnemonic(opts.mnemonic);
            }
            if (opts.activeIndexes) {
                this.activeAccounts(opts.activeIndexes);
            }
        });
    }
    initFromMnemonic(mnemonic) {
        if (this.root) {
            throw new Error('Btc-Hd-Keyring: Secret recovery phrase already provided');
        }
        this.mnemonic = mnemonic;
        this._index2wallet = {};
        this.hdWallet = new bitcore_mnemonic_1.default(mnemonic);
        this.root = this.hdWallet
            .toHDPrivateKey(this.passphrase, this.network == bitcoin.networks.bitcoin ? 'livenet' : 'testnet')
            .deriveChild(this.hdPath);
        //console.log("root", this.root)
    }
    changeHdPath(hdPath) {
        this.hdPath = hdPath;
        this.root = this.hdWallet
            .toHDPrivateKey(this.passphrase, this.network == bitcoin.networks.bitcoin ? 'livenet' : 'testnet')
            .deriveChild(this.hdPath);
        const indexes = this.activeIndexes;
        this._index2wallet = {};
        this.activeIndexes = [];
        this.wallets = [];
        this.activeAccounts(indexes);
    }
    getAccountByHdPath(hdPath, index) {
        const root = this.hdWallet
            .toHDPrivateKey(this.passphrase, this.network == bitcoin.networks.bitcoin ? 'livenet' : 'testnet')
            .deriveChild(hdPath);
        const child = root.deriveChild(index);
        const ecpair = utils_1.ECPair.fromPrivateKey(child.privateKey.toBuffer());
        const address = ecpair.publicKey.toString('hex');
        return address;
    }
    addAccounts(numberOfAccounts = 1) {
        if (!this.root) {
            this.initFromMnemonic(new bitcore_mnemonic_1.default().toString());
        }
        let count = numberOfAccounts;
        let currentIdx = 0;
        const newWallets = [];
        while (count) {
            const [, wallet] = this._addressFromIndex(currentIdx);
            if (this.wallets.includes(wallet)) {
                currentIdx++;
            }
            else {
                this.wallets.push(wallet);
                newWallets.push(wallet);
                this.activeIndexes.push(currentIdx);
                count--;
            }
        }
        const hexWallets = newWallets.map((w) => {
            return w.publicKey.toString('hex');
        });
        return Promise.resolve(hexWallets);
    }
    activeAccounts(indexes) {
        const accounts = [];
        for (const index of indexes) {
            const [address, wallet] = this._addressFromIndex(index);
            this.wallets.push(wallet);
            this.activeIndexes.push(index);
            accounts.push(address);
        }
        return accounts;
    }
    getAddresses(start, end) {
        const from = start;
        const to = end;
        const accounts = [];
        for (let i = from; i < to; i++) {
            const [address] = this._addressFromIndex(i);
            accounts.push({
                address,
                index: i + 1,
            });
        }
        return accounts;
    }
    getAccounts() {
        return this.wallets.map((w) => {
            return w.publicKey.toString('hex');
        });
    }
    _getPrivateKeyFor(publicKey) {
        if (!publicKey) {
            throw new Error('Must specify publicKey.');
        }
        const wallet = this._getWalletForAccount(publicKey);
        return wallet;
    }
    _getWalletForAccount(publicKey) {
        let wallet = this.wallets.find((wallet) => wallet.publicKey.toString('hex') == publicKey);
        if (!wallet) {
            throw new Error('Simple Keyring - Unable to find matching publicKey.');
        }
        return wallet;
    }
    signTransaction(psbt, inputs, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            inputs.forEach(({ index, publicKey, sighashTypes }) => {
                const keyPair = this._getPrivateKeyFor(publicKey);
                const signer = (0, bip371_1.isTaprootInput)(psbt.data.inputs[index])
                    ? (0, utils_1.tweakSigner)(keyPair, opts)
                    : keyPair;
                psbt.signInput(index, signer, sighashTypes);
            });
            return psbt;
        });
    }
    _addressFromIndex(i) {
        if (!this._index2wallet[i]) {
            const child = this.root.deriveChild(i);
            const ecpair = utils_1.ECPair.fromPrivateKey(child.privateKey.toBuffer());
            const address = ecpair.publicKey.toString('hex');
            this._index2wallet[i] = [address, ecpair];
        }
        return this._index2wallet[i];
    }
}
exports.HdKeyring = HdKeyring;
//# sourceMappingURL=hdKeyring.js.map