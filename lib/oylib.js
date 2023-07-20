"use strict";
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
exports.WalletUtils = void 0;
const OrdTransaction_1 = require("./txbuilder/OrdTransaction");
const OrdUnspendOutput_1 = require("./txbuilder/OrdUnspendOutput");
const utils_1 = require("./txbuilder/utils");
const rpclient_1 = require("./rpclient");
const transactions_1 = require("./transactions");
const bip32_1 = __importDefault(require("bip32"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const bip32_utils_1 = __importDefault(require("bip32-utils"));
const accounts_1 = require("./wallet/accounts");
const wallet_1 = require("./wallet");
// import { Chain, bord } from './wallet'
const bip32 = (0, bip32_1.default)(secp256k1_1.default);
const RequiredPath = [
    "m/44'/1'/0'/1",
    "m/49'/1'/0'/0",
    "m/84'/1'/0'/0",
    "m/86'/0'/0'/0", // P2TR (Taproot)
];
class WalletUtils {
    constructor(options) {
        try {
            this.node = (options === null || options === void 0 ? void 0 : options.node) || 'bcoin';
            this.network = (options === null || options === void 0 ? void 0 : options.network) || 'main';
            this.port = (options === null || options === void 0 ? void 0 : options.port) || 8332;
            this.host = (options === null || options === void 0 ? void 0 : options.host) || '198.199.72.193';
            this.apiKey = (options === null || options === void 0 ? void 0 : options.apiKey) || 'bikeshed';
            this.nodeClient = (options === null || options === void 0 ? void 0 : options.nodeClient) || true;
            if (this.node == 'bcoin' && !this.nodeClient) {
                //TODO Implement WalletClient in rpclient
                console.log('WalletClient inactive');
                return;
            }
            else if (this.node == 'bcoin' && this.nodeClient) {
                const clientOptions = {
                    network: this.network,
                    port: this.port,
                    host: this.host,
                    apiKey: this.apiKey,
                };
                console.log(clientOptions);
                this.client = new rpclient_1.NodeClient(clientOptions);
            }
        }
        catch (e) {
            console.log('An error occured: ', e);
        }
    }
    static fromObject(data) {
        const result = new this(data);
        return result;
    }
    toObject() {
        return {
            network: this.network,
            port: this.port,
            host: this.host,
            apiKey: this.apiKey,
        };
    }
    getAddressSummary({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof address === 'string') {
                address = [address];
            }
            const addressesUtxo = [];
            for (let i = 0; i < address.length; i++) {
                let utxos = yield transactions_1.transactions.getUnspentOutputs(address[i]);
                //console.log(utxos)
                addressesUtxo[i] = {};
                addressesUtxo[i]['utxo'] = utxos.unspent_outputs;
                addressesUtxo[i]['balance'] = transactions_1.transactions.calculateBalance(utxos.unspent_outputs);
            }
            return addressesUtxo;
        });
    }
    discoverBalance({ xpub, gapLimit, enableImport = false }) {
        return __awaiter(this, void 0, void 0, function* () {
            //xpub - extended public key (see wallet.deriveXpubFromSeed())
            const childKeyB58 = bip32.fromBase58(xpub);
            //should manage addresses based on xpub
            //should get change Addresses as well to identify inscriptions
            let chain = new bip32_utils_1.default.Chain(childKeyB58);
            bip32_utils_1.default.discovery(chain, gapLimit, (addresses, callback) => __awaiter(this, void 0, void 0, function* () {
                const res = yield this.getAddressSummary(addresses);
                let areUsed = res.map(function (res) {
                    return res.balance > 0;
                });
                callback(undefined, areUsed);
            }), function (err, used, checked) {
                if (err)
                    throw err;
                console.log('Discovered at most ' + used + ' used addresses');
                console.log('Checked ' + checked + ' addresses');
                console.log('With at least ' + (checked - used) + ' unused addresses');
                // throw away ALL unused addresses AFTER the last unused address
                let unused = checked - used;
                for (let i = 1; i < unused; ++i)
                    chain.pop();
                // remember used !== total, chain may have started at a k-index > 0
                console.log('Total number of addresses (after prune): ', chain.addresses.length);
            });
        });
    }
    getTaprootAddress({ publicKey }) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = (0, accounts_1.publicKeyToAddress)(publicKey, 'P2TR');
            return address;
        });
    }
    importWallet({ mnemonic, hdPath = `m/86'/0'/0'/0`, type = 'taproot' }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let addrType;
                switch (type) {
                    case 'taproot':
                        addrType = 'P2TR';
                        break;
                    case 'segwit':
                        addrType = 'P2WPKH';
                        break;
                    default:
                        addrType = 'P2TR';
                        break;
                }
                const wallet = yield wallet_1.accounts.importMnemonic(mnemonic, hdPath, addrType);
                const meta = yield this.getUtxosArtifacts({ address: wallet['address'] });
                const data = {
                    keyring: wallet,
                    assets: meta,
                };
                return data;
            }
            catch (err) {
                return err;
            }
        });
    }
    importMeta({ mnemonic }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const unisat = {
                    hdPath: "m/86'/0'/0'/0",
                    type: 'taproot',
                };
                const oylLib = {
                    hdPath: "m/49'/0'/0'",
                    type: 'segwit',
                };
                const payloadA = yield this.importWallet({
                    mnemonic: mnemonic,
                    hdPath: unisat.hdPath,
                    type: unisat.type,
                });
                const payloadB = yield this.importWallet({
                    mnemonic: mnemonic,
                    hdPath: oylLib.hdPath,
                    type: oylLib.type,
                });
                const data = {
                    unisatAddress: payloadA['keyring']['address'],
                    unisatAssets: payloadA['assets'],
                    oylLibAddress: payloadB['keyring']['address'],
                    oylLibAssets: payloadB['assets'],
                };
                return data;
            }
            catch (e) {
                return e;
            }
        });
    }
    getSegwitAddress({ publicKey }) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = (0, accounts_1.publicKeyToAddress)(publicKey, 'P2WPKH');
            return address;
        });
    }
    createWallet({ type }) {
        return __awaiter(this, void 0, void 0, function* () {
            let hdPathBip;
            let addrType;
            switch (type) {
                case 'taproot':
                    addrType = 'P2TR';
                    hdPathBip = '86';
                    console.log('taproot');
                    break;
                case 'segwit':
                    addrType = 'P2WPKH';
                    hdPathBip = '49';
                    console.log('segwit');
                    break;
                default:
                    addrType = 'P2TR';
                    hdPathBip = '86';
                    console.log('defaulted');
                    break;
            }
            const hdPath = `m/${hdPathBip}'/0'/0'`;
            const wallet = yield wallet_1.accounts.createWallet(hdPath, addrType);
            return wallet;
        });
    }
    getMetaBalance({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressSummary = yield this.getAddressSummary({ address });
            const confirmAmount = addressSummary.reduce((total, addr) => {
                const confirmedUtxos = addr.utxo.filter((utxo) => utxo.confirmations > 0);
                return (total + confirmedUtxos.reduce((sum, utxo) => sum + utxo.value / 1e8, 0));
            }, 0);
            const pendingAmount = addressSummary.reduce((total, addr) => {
                const unconfirmedUtxos = addr.utxo.filter((utxo) => utxo.confirmations === 0);
                return (total +
                    unconfirmedUtxos.reduce((sum, utxo) => sum + utxo.value / 1e8, 0));
            }, 0);
            const amount = confirmAmount + pendingAmount;
            const usdValue = yield transactions_1.transactions.convertUsdValue(amount);
            //console.log(usdValue)
            const response = {
                confirm_amount: confirmAmount.toFixed(8),
                pending_amount: pendingAmount.toFixed(8),
                amount: amount.toFixed(8),
                usd_value: usdValue,
            };
            return response;
        });
    }
    getTxHistory({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const history = yield this.client.getTxByAddress(address);
            const processedTransactions = history
                .map((tx) => {
                const { hash, mtime, outputs, inputs, confirmations } = tx;
                const output = outputs.find((output) => output.address === address);
                const input = inputs.find((input) => input.coin.address === address);
                const txDetails = {};
                txDetails["hash"] = hash;
                txDetails["confirmations"] = confirmations;
                if (input) {
                    txDetails["type"] = "sent";
                    txDetails["to"] = outputs.find((output) => output.address != address).address;
                    if (output) {
                        txDetails["amount"] = (input.coin.value / 1e8) - (output.value / 1e8);
                    }
                    else {
                        txDetails["amount"] = input.coin.value / 1e8;
                    }
                }
                else {
                    if (output) {
                        txDetails["type"] = "received";
                        txDetails["amount"] = output.value / 1e8;
                        txDetails["from"] = inputs.find((input) => input.coin.address != address).coin.address;
                    }
                }
                txDetails["symbol"] = 'BTC';
                return txDetails;
            })
                .filter((transaction) => transaction !== null); // Filter out null transactions
            return processedTransactions;
        });
    }
    calculateHighPriorityFee(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const fees = Object.values(payload).map((transaction) => transaction['fee']);
            fees.sort((a, b) => a - b);
            const medianFee = fees[Math.floor(fees.length / 2)];
            return medianFee * 2;
        });
    }
    getFees() {
        return __awaiter(this, void 0, void 0, function* () {
            const rawMempool = yield this.client.execute('getrawmempool', [true] /* verbose */);
            const mempoolInfo = yield this.client.execute('getmempoolinfo');
            const high = (yield this.calculateHighPriorityFee(rawMempool)) * 100000000; // 10 mins
            const low = mempoolInfo.mempoolminfee * 2 * 100000000;
            const medium = (high + low) / 2;
            return {
                high,
                medium,
                low,
            };
        });
    }
    getActiveAddresses({ xpub, lookAhead = 10 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const childKeyB58 = bip32.fromBase58(xpub);
            const chain = new wallet_1.Chain(childKeyB58);
            const batch = [chain.get()]; //get first at index 0
            let seenUnused = false;
            //Check through each Address to see which one has been used
            while (batch.length < lookAhead && seenUnused === false) {
                chain.next();
                batch.push(chain.get());
                const res = yield this.getAddressSummary({ address: batch });
                res.map(function (res) {
                    if (res.balance > 0) {
                        seenUnused = true;
                    }
                });
            }
            return batch;
        });
    }
    getTotalBalance({ batch }) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.getAddressSummary({ address: batch });
            let total = 0;
            res.forEach((element) => {
                total += element.balance;
            });
            return total;
        });
    }
    getInscriptions({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const artifacts = yield wallet_1.bord.getInscriptionsByAddr(address);
            return artifacts.map((item) => {
                const { id, inscription_number: num, inscription_number: number, content_length, content_type, timestamp, genesis_transaction, location, output, output_value, } = item;
                const detail = {
                    id,
                    address: item.address,
                    output_value: parseInt(output_value),
                    preview: `https://ordinals.com/preview/${id}`,
                    content: `https://ordinals.com/content/${id}`,
                    content_length: parseInt(content_length),
                    content_type,
                    timestamp,
                    genesis_transaction,
                    location,
                    output,
                    offset: parseInt(item.offset),
                    content_body: '',
                };
                return {
                    id,
                    num,
                    number,
                    detail,
                };
            });
        });
    }
    getUtxosArtifacts({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const utxos = yield transactions_1.transactions.getUnspentOutputs(address);
            const inscriptions = yield this.getInscriptions({ address });
            const utxoArtifacts = yield transactions_1.transactions.getMetaUtxos(utxos.unspent_outputs, inscriptions);
            return utxoArtifacts;
        });
    }
    importWatchOnlyAddress({ addresses = [] }) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < addresses.length; i++) {
                (() => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise((resolve) => setTimeout(resolve, 10000));
                    yield this.client.execute('importaddress', [addresses[i], '', true]);
                }))();
            }
        });
    }
    sendBtc({ mnemonic, to, amount, fee }) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield this.importWallet({
                mnemonic: mnemonic.trim(),
                hdPath: "m/49'/0'/0'",
                type: 'segwit',
            });
            const keyring = payload.keyring.keyring;
            const pubKey = keyring.wallets[0].publicKey.toString('hex');
            const signer = keyring.signTransaction.bind(keyring);
            const from = payload.keyring.address;
            const changeAddress = from;
            const network = "main";
            return yield this.createPsbtTx({ publicKey: pubKey, from: from, to: to, changeAddress: changeAddress, amount: amount, fee: fee, network: network, signer: signer });
        });
    }
    createPsbtTx({ publicKey, from, to, changeAddress, amount, fee, network, signer }) {
        return __awaiter(this, void 0, void 0, function* () {
            const utxos = yield this.getUtxosArtifacts({ address: from });
            const feeRate = fee / 100;
            const tx = new OrdTransaction_1.OrdTransaction(signer, network, from, publicKey, 'P2WPKH', feeRate);
            tx.addOutput(to, (0, utils_1.amountToSatoshis)(amount));
            tx.setChangeAddress(changeAddress);
            const outputAmount = tx.getTotalOutput();
            const nonOrdUtxos = [];
            const ordUtxos = [];
            utxos.forEach((v) => {
                if (v.inscriptions.length > 0) {
                    ordUtxos.push(v);
                }
                else {
                    nonOrdUtxos.push(v);
                }
            });
            let tmpSum = tx.getTotalInput();
            for (let i = 0; i < nonOrdUtxos.length; i++) {
                const nonOrdUtxo = nonOrdUtxos[i];
                if (tmpSum < outputAmount) {
                    tx.addInput(nonOrdUtxo);
                    tmpSum += nonOrdUtxo.satoshis;
                    continue;
                }
                const fee = yield tx.calNetworkFee();
                if (tmpSum < outputAmount + fee) {
                    tx.addInput(nonOrdUtxo);
                    tmpSum += nonOrdUtxo.satoshis;
                }
                else {
                    break;
                }
            }
            if (nonOrdUtxos.length === 0) {
                throw new Error('Balance not enough');
            }
            const unspent = tx.getUnspent();
            if (unspent === 0) {
                throw new Error('Balance not enough to pay network fee.');
            }
            // add dummy output
            tx.addChangeOutput(1);
            const networkFee = yield tx.calNetworkFee();
            if (unspent < networkFee) {
                throw new Error(`Balance not enough. Need ${(0, utils_1.satoshisToAmount)(networkFee)} BTC as network fee, but only ${(0, utils_1.satoshisToAmount)(unspent)} BTC.`);
            }
            const leftAmount = unspent - networkFee;
            if (leftAmount >= OrdUnspendOutput_1.UTXO_DUST) {
                // change dummy output to true output
                tx.getChangeOutput().value = leftAmount;
            }
            else {
                // remove dummy output
                tx.removeChangeOutput();
            }
            const psbt = yield tx.createSignedPsbt();
            tx.dumpTx(psbt);
            //@ts-ignore
            psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = false;
            const rawtx = psbt.extractTransaction().toHex();
            const result = yield this.client.pushTX(rawtx);
            return Object.assign({ txId: psbt.extractTransaction().getId() }, result);
        });
    }
    getSegwitAddressInfo({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = transactions_1.transactions.validateBtcAddress({ address, type: 'segwit' });
            if (!isValid) {
                return { isValid, summary: null };
            }
            const summary = yield this.getAddressSummary({ address });
            return { isValid, summary };
        });
    }
}
exports.WalletUtils = WalletUtils;
//# sourceMappingURL=oylib.js.map