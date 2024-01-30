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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Oyl = exports.LEGACY_HD_PATH = exports.SEGWIT_HD_PATH = exports.TAPROOT_HD_PATH = exports.NESTED_SEGWIT_HD_PATH = void 0;
const constants_1 = require("./shared/constants");
const txbuilder_1 = require("./txbuilder");
const utils_1 = require("./shared/utils");
const transactions = __importStar(require("./transactions"));
const accounts_1 = require("./wallet/accounts");
const wallet_1 = require("./wallet");
const accountsManager_1 = require("./wallet/accountsManager");
const interface_1 = require("./shared/interface");
const apiclient_1 = require("./apiclient");
const bitcoin = __importStar(require("bitcoinjs-lib"));
const provider_1 = require("./rpclient/provider");
const transactions_1 = require("./transactions");
exports.NESTED_SEGWIT_HD_PATH = "m/49'/0'/0'/0";
exports.TAPROOT_HD_PATH = "m/86'/0'/0'/0";
exports.SEGWIT_HD_PATH = "m/84'/0'/0'/0";
exports.LEGACY_HD_PATH = "m/44'/0'/0'/0";
const RequiredPath = [
    exports.LEGACY_HD_PATH,
    exports.NESTED_SEGWIT_HD_PATH,
    exports.SEGWIT_HD_PATH,
    exports.TAPROOT_HD_PATH,
];
class Oyl {
    /**
     * Initializes a new instance of the Wallet class.
     */
    constructor(opts = constants_1.defaultNetworkOptions.mainnet) {
        const options = Object.assign(Object.assign({}, constants_1.defaultNetworkOptions[opts.network]), opts);
        this.apiClient = new apiclient_1.OylApiClient({
            host: 'https://api.oyl.gg',
            testnet: options.network == 'testnet' ? true : null,
        });
        const rpcUrl = `${options.baseUrl}/${options.version}/${options.projectId}`;
        const provider = new provider_1.Provider(rpcUrl);
        this.network = (0, utils_1.getNetwork)(options.network);
        this.sandshrewBtcClient = provider.sandshrew;
        this.esploraRpc = provider.esplora;
        this.ordRpc = provider.ord;
        this.currentNetwork =
            options.network === 'mainnet' ? 'main' : options.network;
    }
    /**
     * Gets a summary of the given address(es).
     * @param {string | string[]} address - A single address or an array of addresses.
     * @returns {Promise<Object[]>} A promise that resolves to an array of address summaries.
     */
    getAddressSummary({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof address === 'string') {
                address = [address];
            }
            const addressesUtxo = [];
            for (let i = 0; i < address.length; i++) {
                let utxos = yield this.getUtxos(address[i]);
                addressesUtxo[i] = {};
                addressesUtxo[i]['utxo'] = utxos.unspent_outputs;
                addressesUtxo[i]['balance'] = transactions.calculateBalance(utxos.unspent_outputs);
            }
            return addressesUtxo;
        });
    }
    /**
     * Derives a Taproot address from the given public key.
     * @param {string} publicKey - The public key to derive the address from.
     * @returns {string} A promise that resolves to the derived Taproot address.
     */
    getTaprootAddress({ publicKey }) {
        try {
            const address = (0, accounts_1.publicKeyToAddress)(publicKey, interface_1.AddressType.P2TR, this.network);
            return address;
        }
        catch (err) {
            return err;
        }
    }
    /**
     * Retrieves details for a specific BRC-20 token associated with the given address.
     * @param {string} address - The address to query BRC-20 token details from.
     * @param {string} ticker - The ticker symbol of the BRC-20 token to retrieve details for.
     * @returns {Promise<TickerDetails>} A promise that resolves to the details of the specified BRC-20 token.
     */
    getSingleBrcTickerDetails(address, ticker) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiClient.getBrc20sByAddress(address);
            const tickerDetails = response.data.find((details) => details.ticker.toLowerCase() === ticker.toLowerCase());
            return tickerDetails;
        });
    }
    /**
     * Initializes a wallet from a mnemonic phrase with the specified parameters.
     * @param {Object} options - The options object.
     * @param {string} options.mnemonic - The mnemonic phrase used to initialize the wallet.
     * @param {string} [options.type='taproot'] - The type of wallet to create. Options are 'taproot', 'segwit', 'legacy'.
     * @param {string} [options.hdPath=RequiredPath[3]] - The HD path to derive addresses from.
     * @returns {Promise<any>} A promise that resolves to the wallet data including keyring and assets.
     * @throws {Error} Throws an error if initialization fails.
     */
    fromPhrase({ mnemonic, addrType = interface_1.AddressType.P2TR, hdPath = RequiredPath[3], }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = yield wallet_1.accounts.importMnemonic(mnemonic, hdPath, addrType, this.network);
                this.wallet = wallet;
                const data = {
                    keyring: wallet,
                };
                this.mnemonic = mnemonic;
                return data;
            }
            catch (err) {
                return err;
            }
        });
    }
    /**
     * Recovers a wallet using the given options.
     * @param {RecoverAccountOptions} options - Options necessary for account recovery.
     * @returns {Promise<any>} A promise that resolves to the recovered wallet payload.
     * @throws {Error} Throws an error if recovery fails.
     */
    recoverWallet(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = new accountsManager_1.AccountManager(Object.assign(Object.assign({}, options), { network: this.network }));
                const walletPayload = yield wallet.recoverAccounts();
                return walletPayload;
            }
            catch (error) {
                return error;
            }
        });
    }
    /**
     * Adds a new account to the wallet using the given options.
     * @param {RecoverAccountOptions} options - Options describing the account to be added.
     * @returns {Promise<any>} A promise that resolves to the payload of the newly added account.
     * @throws {Error} Throws an error if adding the account fails.
     */
    addAccountToWallet(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = new accountsManager_1.AccountManager(Object.assign(Object.assign({}, options), { network: this.network }));
                const walletPayload = yield wallet.addAccount();
                return walletPayload;
            }
            catch (error) {
                return error;
            }
        });
    }
    /**
     * Initializes a new Oyl account with taproot & segwit HDKeyrings  within the wallet.
     * @returns {Promise<any>} A promise that resolves to the payload of the initialized accounts.
     * @throws {Error} Throws an error if the initialization fails.
     */
    initializeWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = new accountsManager_1.AccountManager({
                    network: this.network,
                    customPath: this.network == (0, utils_1.getNetwork)('testnet') ? 'testnet' : null,
                });
                const walletPayload = yield wallet.initializeAccounts();
                return walletPayload;
            }
            catch (error) {
                return error;
            }
        });
    }
    /**
     * Derives a SegWit address from a given public key.
     * @param {Object} param0 - An object containing the public key.
     * @param {string} param0.publicKey - The public key to derive the SegWit address from.
     * @returns {Promise<string>} A promise that resolves to the derived SegWit address.
     * @throws {Error} Throws an error if address derivation fails.
     */
    getSegwitAddress({ publicKey }) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = (0, accounts_1.publicKeyToAddress)(publicKey, interface_1.AddressType.P2WPKH, this.network);
            return address;
        });
    }
    /**
     * Creates a new Oyl with an optional specific derivation type.
     * @param {object} param0 - Object containing the type of derivation.
     * @param {string} [param0.type] - Optional type of derivation path.
     * @returns {{keyring: HdKeyring, address: string}} The newly created wallet object.
     */
    createWallet({ type }) {
        try {
            let hdPath;
            let addrType;
            switch (type) {
                case 'taproot':
                    addrType = interface_1.AddressType.P2TR;
                    hdPath = RequiredPath[3];
                    break;
                case 'segwit':
                    addrType = interface_1.AddressType.P2WPKH;
                    hdPath = RequiredPath[2];
                    break;
                case 'nested-segwit':
                    addrType = interface_1.AddressType.P2SH_P2WPKH;
                    hdPath = RequiredPath[1];
                case 'legacy':
                    addrType = interface_1.AddressType.P2PKH;
                    hdPath = RequiredPath[0];
                    break;
                default:
                    addrType = interface_1.AddressType.P2TR;
                    hdPath = RequiredPath[3];
                    break;
            }
            const wallet = wallet_1.accounts.createWallet(hdPath, addrType, this.network);
            return wallet;
        }
        catch (err) {
            return err;
        }
    }
    /**
     * Fetches the balance details including confirmed and pending amounts for a given address.
     * @param {Object} param0 - An object containing the address property.
     * @param {string} param0.address - The address for which to fetch balance details.
     * @returns {Promise<any>} A promise that resolves to an object containing balance and its USD value.
     * @throws {Error} Throws an error if the balance retrieval fails.
     */
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
            const usdValue = yield transactions.convertUsdValue(amount);
            const response = {
                confirm_amount: confirmAmount.toFixed(8),
                pending_amount: pendingAmount.toFixed(8),
                amount: amount.toFixed(8),
                usd_value: usdValue,
            };
            return response;
        });
    }
    getUtxos(address, includeInscriptions = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const utxosResponse = yield this.esploraRpc.getAddressUtxo(address);
            const formattedUtxos = [];
            let filtered = utxosResponse;
            if (!includeInscriptions) {
                filtered = utxosResponse.filter((utxo) => utxo.value > 546);
            }
            for (const utxo of filtered) {
                const transactionDetails = yield this.esploraRpc.getTxInfo(utxo.txid);
                const voutEntry = transactionDetails.vout.find((v) => v.scriptpubkey_address === address);
                formattedUtxos.push({
                    tx_hash_big_endian: utxo.txid,
                    tx_output_n: utxo.vout,
                    value: utxo.value,
                    confirmations: utxo.status.confirmed ? 3 : 0,
                    script: voutEntry.scriptpubkey,
                    tx_index: 0,
                });
            }
            return { unspent_outputs: formattedUtxos };
        });
    }
    /**
     * Retrieves the transaction history for a given address and processes the transactions.
     * @param {Object} param0 - An object containing the address property.
     * @param {string} param0.address - The address for which to fetch transaction history.
     * @returns {Promise<any[]>} A promise that resolves to an array of processed transaction details.
     * @throws {Error} Throws an error if transaction history retrieval fails.
     */
    getTxHistory({ addresses }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (addresses.length > 2) {
                    throw new Error('Only accepts a max of 2 addresses');
                }
                const utxoPromises = addresses.map((address, index) => this.esploraRpc._call('esplora_address::txs', [address]));
                const currentBlock = yield this.esploraRpc._call('esplora_blocks:tip:height', []);
                const resolvedUtxoPromises = yield Promise.all(utxoPromises);
                const combinedHistory = resolvedUtxoPromises.flat();
                const removedDuplicatesArray = new Map(combinedHistory.map((item) => [item.txid, item]));
                const finalCombinedHistory = Array.from(removedDuplicatesArray.values());
                const processedTxns = finalCombinedHistory.map((tx) => {
                    const { txid, vout, size, vin, status, fee } = tx;
                    const blockDelta = currentBlock - status.block_height + 1;
                    const confirmations = blockDelta > 0 ? blockDelta : 0;
                    const inputAddress = vin.find(({ prevout }) => prevout.scriptpubkey_address === addresses[0] ||
                        prevout.scriptpubkey_address === addresses[1]);
                    let vinSum = 0;
                    let voutSum = 0;
                    for (let input of vin) {
                        if (addresses.includes(input.prevout.scriptpubkey_address)) {
                            vinSum += input.prevout.value;
                        }
                    }
                    for (let output of vout) {
                        if (addresses.includes(output.scriptpubkey_address)) {
                            voutSum += output.value;
                        }
                    }
                    const txDetails = {};
                    txDetails['txId'] = txid;
                    txDetails['confirmations'] = confirmations;
                    txDetails['type'] = inputAddress ? 'sent' : 'received';
                    txDetails['blockTime'] = status.block_time;
                    txDetails['blockHeight'] = status.block_height;
                    txDetails['fee'] = fee;
                    txDetails['feeRate'] = Math.floor(fee / size);
                    txDetails['vinSum'] = vinSum;
                    txDetails['voutSum'] = voutSum;
                    txDetails['amount'] = inputAddress ? vinSum - voutSum - fee : voutSum;
                    txDetails['symbol'] = 'BTC';
                    return txDetails;
                });
                return processedTxns;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    getTaprootTxHistory({ taprootAddress }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressType = (0, transactions_1.getAddressType)(taprootAddress);
            if (addressType === 1) {
                const txns = yield this.esploraRpc._call('esplora_address::txs', [
                    taprootAddress,
                ]);
                const currentBlock = yield this.esploraRpc._call('esplora_blocks:tip:height', []);
                const lastTenTxns = txns.slice(0, 10);
                let isCollectible = false;
                const processedTxns = lastTenTxns.map((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, e_1, _b, _c;
                    const { txid, vout, size, vin, status, fee } = tx;
                    let inscriptionsOnTx = yield this.apiClient.getInscriptionsForTxn(txid);
                    const symbols = [];
                    if (inscriptionsOnTx.length > 0) {
                        try {
                            for (var _d = true, inscriptionsOnTx_1 = __asyncValues(inscriptionsOnTx), inscriptionsOnTx_1_1; inscriptionsOnTx_1_1 = yield inscriptionsOnTx_1.next(), _a = inscriptionsOnTx_1_1.done, !_a;) {
                                _c = inscriptionsOnTx_1_1.value;
                                _d = false;
                                try {
                                    const inscription = _c;
                                    const inscriptionsOnTxContent = yield this.ordRpc.getInscriptionContent(inscription['inscription_id']);
                                    isCollectible =
                                        (yield this.ordRpc.getInscriptionById(inscription['inscription_id'])).content_type === 'image/png';
                                    try {
                                        let jsonObj = JSON.parse(atob(inscriptionsOnTxContent));
                                        const symbolToAdd = jsonObj.tick;
                                        symbols.push(symbolToAdd);
                                    }
                                    catch (error) { }
                                }
                                finally {
                                    _d = true;
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (!_d && !_a && (_b = inscriptionsOnTx_1.return)) yield _b.call(inscriptionsOnTx_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    const blockDelta = currentBlock - status.block_height + 1;
                    const confirmations = blockDelta > 0 ? blockDelta : 0;
                    let inputAddress = false;
                    let fromAddress;
                    let toAddress;
                    let vinSum = 0;
                    let voutSum = 0;
                    for (let input of vin) {
                        if (taprootAddress === input.prevout.scriptpubkey_address) {
                            inputAddress = true;
                            vinSum += input.prevout.value;
                        }
                        if (taprootAddress !== input.prevout.scriptpubkey_address) {
                            fromAddress = input.prevout.scriptpubkey_address;
                        }
                    }
                    for (let output of vout) {
                        if (taprootAddress === output.scriptpubkey_address) {
                            voutSum += output.value;
                        }
                        if (taprootAddress !== output.scriptpubkey_address) {
                            toAddress = output.scriptpubkey_address;
                        }
                    }
                    const inscriptionType = symbols.length > 0 ? 'brc-20' : isCollectible ? 'collectible' : 'N/A';
                    const txDetails = {};
                    txDetails['txId'] = txid;
                    txDetails['confirmations'] = confirmations;
                    txDetails['type'] =
                        inputAddress && symbols.length === 0
                            ? 'sent'
                            : inputAddress && symbols.length > 1
                                ? 'swap'
                                : inscriptionType === 'N/A' ||
                                    (!inputAddress && symbols.length >= 1)
                                    ? 'received'
                                    : 'inscribed';
                    txDetails['blockTime'] = status.block_time;
                    txDetails['blockHeight'] = status.block_height;
                    txDetails['fee'] = fee;
                    txDetails['feeRate'] = Math.floor(fee / size);
                    txDetails['vinSum'] = vinSum;
                    txDetails['from'] = fromAddress;
                    txDetails['to'] = toAddress;
                    txDetails['voutSum'] = voutSum;
                    txDetails['amount'] = inputAddress ? vinSum - voutSum - fee : voutSum;
                    txDetails['symbol'] = symbols.length > 0 ? symbols : ['btc'];
                    txDetails['inscriptionType'] = inscriptionType;
                    return txDetails;
                }));
                return yield Promise.all(processedTxns);
            }
            else {
                throw Error('Invalid address type');
            }
        });
    }
    /**
     * Retrieves a list of inscriptions for a given address.
     * @param {Object} param0 - An object containing the address property.
     * @param {string} param0.address - The address to query for inscriptions.
     * @returns {Promise<Array<any>>} A promise that resolves to an array of inscription details.
     */
    getInscriptions({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const collectibles = [];
            const brc20 = [];
            const allOrdinals = (yield this.apiClient.getAllInscriptionsByAddress(address)).data;
            const allCollectibles = allOrdinals.filter((ordinal) => ordinal.mime_type === 'image/png' || ordinal.mime_type.includes('html'));
            const allBrc20s = allOrdinals.filter((ordinal) => ordinal.mime_type === 'text/plain;charset=utf-8');
            for (const artifact of allCollectibles) {
                const { inscription_id, inscription_number, satpoint } = artifact;
                const content = yield this.ordRpc.getInscriptionContent(inscription_id);
                const detail = {
                    id: inscription_id,
                    address: artifact.owner_wallet_addr,
                    content: content,
                    location: satpoint,
                };
                collectibles.push({
                    id: inscription_id,
                    inscription_number,
                    detail,
                });
            }
            for (const artifact of allBrc20s) {
                const { inscription_id, inscription_number, satpoint } = artifact;
                const content = yield this.ordRpc.getInscriptionContent(inscription_id);
                const decodedContent = atob(content);
                if ((0, utils_1.isValidJSON)(decodedContent) && JSON.parse(decodedContent)) {
                    const detail = {
                        id: inscription_id,
                        address: artifact.owner_wallet_addr,
                        content: content,
                        location: satpoint,
                    };
                    brc20.push({
                        id: inscription_id,
                        inscription_number,
                        detail,
                    });
                }
            }
            return { collectibles, brc20 };
        });
    }
    /**
     * Retrieves UTXO artifacts for a given address.
     * @param {Object} param0 - An object containing the address property.
     * @param {string} param0.address - The address to query for UTXO artifacts.
     * @returns A promise that resolves to the UTXO artifacts.
     */
    getUtxosArtifacts({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { unspent_outputs } = yield this.getUtxos(address, false);
            const inscriptions = yield this.getInscriptions({ address });
            const utxoArtifacts = yield transactions.getMetaUtxos(address, unspent_outputs, inscriptions);
            return utxoArtifacts;
        });
    }
    /**
     * Creates a Partially Signed Bitcoin Transaction (PSBT) to send regular satoshis, signs and broadcasts it.
     * @param {Object} params - The parameters for creating the PSBT.
     * @param {string} params.to - The receiving address.
     * @param {string} params.from - The sending address.
     * @param {string} params.amount - The amount to send.
     * @param {number} params.feeRate - The transaction fee rate.
     * @param {any} params.signer - The bound signer method to sign the transaction.
     * @param {string} params.publicKey - The public key associated with the transaction.
     * @returns {Promise<Object>} A promise that resolves to an object containing transaction ID and other response data from the API client.
     */
    sendBtc({ to, from, amount, feeRate, publicKey, mnemonic, segwitAddress, segwitPubkey, segwitHdPath = 'oyl', payFeesWithSegwit = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payFeesWithSegwit && (!segwitAddress || !segwitPubkey)) {
                throw new Error('Invalid segwit information entered');
            }
            const hdPaths = accountsManager_1.customPaths[segwitHdPath];
            const taprootSigner = yield this.createTaprootSigner({
                mnemonic: mnemonic,
                taprootAddress: from,
                hdPathWithIndex: hdPaths['taprootPath'],
            });
            let segwitSigner;
            if (segwitAddress) {
                segwitSigner = yield this.createSegwitSigner({
                    mnemonic: mnemonic,
                    segwitAddress: segwitAddress,
                    hdPathWithIndex: hdPaths['segwitPath'],
                });
            }
            const taprootUtxos = yield this.getUtxosArtifacts({
                address: from,
            });
            let segwitUtxos;
            if (segwitAddress) {
                segwitUtxos = yield this.getUtxosArtifacts({
                    address: segwitAddress,
                });
            }
            if (!feeRate) {
                feeRate = (yield this.esploraRpc.getFeeEstimates())['1'];
            }
            const { txnId, rawTxn } = yield (0, utils_1.createBtcTx)({
                inputAddress: from,
                outputAddress: to,
                amount: amount,
                feeRate: feeRate,
                segwitAddress: segwitAddress,
                segwitPublicKey: segwitPubkey,
                taprootPublicKey: publicKey,
                mnemonic: mnemonic,
                payFeesWithSegwit: payFeesWithSegwit,
                taprootSigner: taprootSigner,
                segwitSigner: segwitSigner,
                network: this.network,
                segwitUtxos: segwitUtxos,
                taprootUtxos: taprootUtxos,
            });
            const [result] = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([rawTxn]);
            if (!result.allowed) {
                throw new Error(result['reject-reason']);
            }
            yield this.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(rawTxn);
            return { txnId: txnId, rawTxn: rawTxn };
        });
    }
    /**
     * Retrieves information about a SegWit address.
     * @param {Object} params - The parameters containing the address information.
     * @param {string} params.address - The SegWit address to validate and get information for.
     * @returns {Promise<Object>} A promise that resolves to an object containing validity status and summary of the address.
     */
    getSegwitAddressInfo({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = transactions.validateSegwitAddress({
                address,
                type: 'segwit',
            });
            if (!isValid) {
                return { isValid, summary: null };
            }
            const summary = yield this.getAddressSummary({ address });
            return { isValid, summary };
        });
    }
    /**
     * Retrieves information about a Taproot address.
     * @param {Object} params - The parameters containing the address information.
     * @param {string} params.address - The Taproot address to validate and get information for.
     * @returns {Promise<Object>} A promise that resolves to an object containing validity status and summary of the address.
     */
    getTaprootAddressInfo({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = transactions.validateTaprootAddress({
                address,
                type: 'segwit',
            });
            if (!isValid) {
                return { isValid, summary: null };
            }
            const summary = yield this.getAddressSummary({ address });
            return { isValid, summary };
        });
    }
    /**
     * Fetches offers associated with a specific BRC20 ticker.
     * @param {Object} params - The parameters containing the ticker information.
     * @param {string} params.ticker - The ticker symbol to retrieve offers for.
     * @returns {Promise<any>} A promise that resolves to an array of offers.
     */
    getBrcOffers({ ticker }) {
        return __awaiter(this, void 0, void 0, function* () {
            const offers = yield this.apiClient.getOkxTickerOffers({ ticker: ticker });
            return offers;
        });
    }
    /**
     * Fetches aggregated offers associated with a specific BRC20 ticker.
     * @param {Object} params - The parameters containing the ticker information.
     * @param {string} params.ticker - The ticker symbol to retrieve offers for.
     * @param {}
     * @returns {Promise<any>} A promise that resolves to an array of offers.
     */
    getAggregatedBrcOffers({ ticker, limitOrderAmount, marketPrice, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const testnet = this.network == (0, utils_1.getNetwork)('testnet');
            const offers = yield this.apiClient.getAggregatedOffers({
                ticker,
                limitOrderAmount,
                marketPrice,
                testnet,
            });
            return offers;
        });
    }
    /**
     * Lists BRC20 tokens associated with an address.
     * @param {Object} params - The parameters containing the address information.
     * @param {string} params.address - The address to list BRC20 tokens for.
     * @returns {Promise<any>} A promise that resolves to an array of BRC20 tokens.
     */
    listBrc20s({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.apiClient.getBrc20sByAddress(address);
        });
    }
    /**
     * Lists inscribed collectibles associated with an address.
     * @param {Object} params - The parameters containing the address information.
     * @param {string} params.address - The address to list collectibles for.
     * @returns {Promise<any>} A promise that resolves to an array of collectibles.
     */
    listCollectibles({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.apiClient.getCollectiblesByAddress(address);
        });
    }
    /**
     * Retrieves a specific inscribed collectible by its ID.
     * @param {string} inscriptionId - The ID of the collectible to retrieve.
     * @returns {Promise<any>} A promise that resolves to the collectible data.
     */
    getCollectibleById(inscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.ordRpc.getInscriptionById(inscriptionId);
            return data;
        });
    }
    signPsbt({ psbtHex, publicKey, address, signer, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressType = (0, transactions_1.getAddressType)(address);
            const tx = new txbuilder_1.OGPSBTTransaction(signer, address, publicKey, addressType, this.network);
            const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: this.network });
            const signedPsbt = yield tx.signPsbt(psbt);
            return {
                psbtHex: signedPsbt.toHex(),
            };
        });
    }
    pushPsbt(psbtHex) {
        return __awaiter(this, void 0, void 0, function* () {
            const psbt = bitcoin.Psbt.fromHex(psbtHex, { network: this.network });
            const txId = psbt.extractTransaction().getId();
            const rawTx = psbt.extractTransaction().toHex();
            const [result] = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([rawTx]);
            if (!result.allowed) {
                throw new Error(result['reject-reason']);
            }
            yield this.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(rawTx);
            return { txId };
        });
    }
    finalizePsbtBase64(psbtBase64) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { hex: finalizedPsbtHex } = yield this.sandshrewBtcClient._call('btc_finalizepsbt', [`${psbtBase64}`]);
                return finalizedPsbtHex;
            }
            catch (e) {
                console.log(e);
                return '';
            }
        });
    }
    sendPsbt(txData, isDry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (isDry) {
                    const response = yield this.sandshrewBtcClient._call('btc_testmempoolaccept', [`${txData}`]);
                    console.log({ response });
                }
                else {
                    const { hex: txHex } = yield this.sandshrewBtcClient._call('btc_sendrawtransaction', [`${txData}`]);
                }
                return {
                    signedPsbtHex: '',
                    signedPsbtBase64: '',
                };
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    createSegwitSigner({ mnemonic, segwitAddress, hdPathWithIndex, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const segwitAddressType = transactions.getAddressType(segwitAddress);
            if (segwitAddressType == null) {
                throw Error('Unrecognized Address Type');
            }
            const segwitPayload = yield this.fromPhrase({
                mnemonic: mnemonic.trim(),
                hdPath: hdPathWithIndex,
                addrType: segwitAddressType,
            });
            const segwitKeyring = segwitPayload.keyring.keyring;
            const segwitSigner = segwitKeyring.signTransaction.bind(segwitKeyring);
            return segwitSigner;
        });
    }
    createTaprootSigner({ mnemonic, taprootAddress, hdPathWithIndex = accountsManager_1.customPaths['oyl']['taprootPath'], }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressType = transactions.getAddressType(taprootAddress);
            if (addressType == null) {
                throw Error('Unrecognized Address Type');
            }
            const tapPayload = yield this.fromPhrase({
                mnemonic: mnemonic.trim(),
                hdPath: hdPathWithIndex,
                addrType: addressType,
            });
            const tapKeyring = tapPayload.keyring.keyring;
            const taprootSigner = tapKeyring.signTransaction.bind(tapKeyring);
            return taprootSigner;
        });
    }
    createSigner({ mnemonic, fromAddress, hdPathWithIndex, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressType = transactions.getAddressType(fromAddress);
            if (addressType == null) {
                throw Error('Unrecognized Address Type');
            }
            const tapPayload = yield this.fromPhrase({
                mnemonic: mnemonic.trim(),
                hdPath: hdPathWithIndex,
                addrType: addressType,
            });
            const tapKeyring = tapPayload.keyring.keyring;
            const taprootSigner = tapKeyring.signTransaction.bind(tapKeyring);
            return taprootSigner;
        });
    }
    sendBRC20(options) {
        var _a, e_2, _b, _c;
        var _d;
        return __awaiter(this, void 0, void 0, function* () {
            // await isDryDisclaimer(options.isDry)
            if (options.payFeesWithSegwit &&
                (!options.segwitAddress || !options.segwitPubKey)) {
                throw new Error('Invalid segwit information entered');
            }
            try {
                const addressType = transactions.getAddressType(options.fromAddress);
                if (addressType == null) {
                    throw Error('Unrecognized Address Type');
                }
                const path = (_d = options.segwitHdPath) !== null && _d !== void 0 ? _d : 'oyl';
                const hdPaths = accountsManager_1.customPaths[path];
                const taprootUtxos = yield this.getUtxosArtifacts({
                    address: options.fromAddress,
                });
                console.log({ taprootUtxosStr: JSON.stringify(taprootUtxos) });
                let segwitUtxos;
                if (options.segwitAddress) {
                    segwitUtxos = yield this.getUtxosArtifacts({
                        address: options.segwitAddress,
                    });
                }
                const commitTxSize = (0, utils_1.calculateTaprootTxSize)(3, 0, 2);
                const feeForCommit = commitTxSize * options.feeRate < 150
                    ? 200
                    : commitTxSize * options.feeRate;
                const revealTxSize = (0, utils_1.calculateTaprootTxSize)(1, 0, 1);
                const feeForReveal = revealTxSize * options.feeRate < 150
                    ? 200
                    : revealTxSize * options.feeRate;
                const brcSendSize = (0, utils_1.calculateTaprootTxSize)(2, 0, 2);
                const feeForBrcSend = brcSendSize * options.feeRate < 150
                    ? 200
                    : brcSendSize * options.feeRate;
                const inscriptionSats = 546;
                const amountNeededForInscribeAndSend = Number(feeForCommit) +
                    Number(feeForReveal) +
                    inscriptionSats +
                    feeForBrcSend;
                const amountGatheredForSend = (0, utils_1.calculateAmountGatheredUtxo)(taprootUtxos);
                if (amountGatheredForSend < amountNeededForInscribeAndSend) {
                    return { error: 'INSUFFICIENT FUNDS' };
                }
                let segwitSigner, segwitPrivateKey;
                const taprootSigner = yield this.createTaprootSigner({
                    mnemonic: options.mnemonic,
                    taprootAddress: options.fromAddress,
                    hdPathWithIndex: hdPaths['taprootPath'],
                });
                const taprootPrivateKey = yield this.fromPhrase({
                    mnemonic: options.mnemonic,
                    addrType: transactions.getAddressType(options.fromAddress),
                    hdPath: hdPaths['taprootPath'],
                });
                if (options.segwitAddress) {
                    segwitSigner = yield this.createSegwitSigner({
                        mnemonic: options.mnemonic,
                        segwitAddress: options.segwitAddress,
                        hdPathWithIndex: hdPaths['segwitPath'],
                    });
                    segwitPrivateKey = yield this.fromPhrase({
                        mnemonic: options.mnemonic,
                        addrType: transactions.getAddressType(options.segwitAddress),
                        hdPath: hdPaths['segwitPath'],
                    });
                }
                let feeRate;
                if (!(options === null || options === void 0 ? void 0 : options.feeRate)) {
                    feeRate = (yield this.esploraRpc.getFeeEstimates())['1'];
                }
                else {
                    feeRate = options.feeRate;
                }
                const content = `{"p":"brc-20","op":"transfer","tick":"${options.token}","amt":"${options.amount}"}`;
                const { txId, error: inscribeError } = yield (0, utils_1.inscribe)({
                    content,
                    inputAddress: options.fromAddress,
                    outputAddress: options.destinationAddress,
                    mnemonic: options.mnemonic,
                    taprootPublicKey: options.taprootPublicKey,
                    segwitPublicKey: options.segwitPubKey,
                    segwitAddress: options.segwitAddress,
                    isDry: options.isDry,
                    payFeesWithSegwit: options.payFeesWithSegwit,
                    segwitSigner: segwitSigner,
                    taprootSigner: taprootSigner,
                    feeRate: feeRate,
                    network: this.currentNetwork,
                    segwitUtxos: segwitUtxos,
                    taprootUtxos: taprootUtxos,
                    taprootPrivateKey: taprootPrivateKey.keyring.keyring._index2wallet[0][1].privateKey.toString('hex'),
                    sandshrewBtcClient: this.sandshrewBtcClient,
                    esploraRpc: this.esploraRpc,
                });
                if (inscribeError) {
                    return { error: inscribeError };
                }
                const txResult = yield (0, utils_1.waitForTransaction)({
                    txId,
                    sandshrewBtcClient: this.sandshrewBtcClient,
                });
                if (!txResult) {
                    return { error: 'ERROR WAITING FOR COMMIT TX' };
                }
                const utxosForTransferSendFees = yield this.getUtxosArtifacts({
                    address: options.fromAddress,
                });
                const sendTxSize = (0, utils_1.calculateTaprootTxSize)(3, 0, 2);
                const feeForSend = sendTxSize * feeRate < 150 ? 200 : sendTxSize * feeRate;
                const utxosToSend = (0, txbuilder_1.findUtxosToCoverAmount)(utxosForTransferSendFees, feeForSend);
                const amountGathered = (0, utils_1.calculateAmountGatheredUtxo)(utxosToSend.selectedUtxos);
                const sendPsbt = new bitcoin.Psbt({
                    network: (0, utils_1.getNetwork)(this.currentNetwork),
                });
                sendPsbt.addInput({
                    hash: txId,
                    index: 0,
                    witnessUtxo: {
                        script: Buffer.from(utxosToSend.selectedUtxos[0].scriptPk, 'hex'),
                        value: 546,
                    },
                });
                try {
                    for (var _e = true, _f = __asyncValues(utxosToSend.selectedUtxos), _g; _g = yield _f.next(), _a = _g.done, !_a;) {
                        _c = _g.value;
                        _e = false;
                        try {
                            const utxo = _c;
                            sendPsbt.addInput({
                                hash: utxo.txId,
                                index: utxo.outputIndex,
                                witnessUtxo: {
                                    script: Buffer.from(utxo.scriptPk, 'hex'),
                                    value: utxo.satoshis,
                                },
                            });
                        }
                        finally {
                            _e = true;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_e && !_a && (_b = _f.return)) yield _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                sendPsbt.addOutput({
                    address: options.destinationAddress,
                    value: 546,
                });
                const reimbursementAmount = amountGathered - feeForSend;
                if (reimbursementAmount > 546) {
                    sendPsbt.addOutput({
                        address: options.fromAddress,
                        value: amountGathered - feeForSend,
                    });
                }
                const toSignInputs = yield (0, utils_1.formatOptionsToSignInputs)({
                    _psbt: sendPsbt,
                    pubkey: options.taprootPublicKey,
                    segwitPubkey: options.segwitPubKey,
                    segwitAddress: options.segwitAddress,
                    taprootAddress: options.fromAddress,
                    network: (0, utils_1.getNetwork)(this.currentNetwork),
                });
                const signedSendPsbt = yield (0, utils_1.signInputs)(sendPsbt, toSignInputs, options.taprootPublicKey, options.segwitPubKey, segwitSigner, taprootSigner);
                signedSendPsbt.finalizeAllInputs();
                const sendTxHex = signedSendPsbt.extractTransaction().toHex();
                const sendTxId = signedSendPsbt.extractTransaction().getId();
                const [result] = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([sendTxHex]);
                if (!result.allowed) {
                    throw new Error(result['reject-reason']);
                }
                yield this.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(sendTxHex);
                return { txId: sendTxId, rawTxn: sendTxHex };
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
    }
    sendOrdCollectible({ mnemonic, fromAddress, taprootPublicKey, destinationAddress, segwitPubKey, segwitAddress, payFeesWithSegwit, feeRate, isDry, inscriptionId, segwitHdPath = 'oyl', }) {
        var _a, e_3, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // await isDryDisclaimer(isDry)
                if (payFeesWithSegwit && (!segwitAddress || !segwitPubKey)) {
                    throw new Error('Invalid segwit information entered');
                }
                const hdPaths = accountsManager_1.customPaths[segwitHdPath];
                const collectibleData = yield this.getCollectibleById(inscriptionId);
                if (collectibleData.address !== fromAddress) {
                    throw new Error('Inscription does not belong to fromAddress');
                }
                const inscriptionTxId = collectibleData.satpoint.split(':')[0];
                const inscriptionTxVOutIndex = collectibleData.satpoint.split(':')[1];
                const inscriptionUtxoDetails = yield this.esploraRpc.getTxInfo(inscriptionTxId);
                const inscriptionUtxoData = inscriptionUtxoDetails.vout[inscriptionTxVOutIndex];
                const isSpentArray = yield this.esploraRpc.getTxOutspends(inscriptionTxId);
                const isSpent = isSpentArray[inscriptionTxVOutIndex];
                if (isSpent.spent) {
                    throw new Error('Inscription is missing');
                }
                const taprootSigner = yield this.createTaprootSigner({
                    mnemonic: mnemonic,
                    taprootAddress: fromAddress,
                    hdPathWithIndex: hdPaths['taprootPath'],
                });
                let segwitSigner;
                if (segwitAddress) {
                    segwitSigner = yield this.createSegwitSigner({
                        mnemonic: mnemonic,
                        segwitAddress: segwitAddress,
                        hdPathWithIndex: hdPaths['segwitPath'],
                    });
                }
                if (!feeRate) {
                    feeRate = (yield this.esploraRpc.getFeeEstimates())['1'];
                }
                const utxosForTransferSendFees = yield this.getUtxosArtifacts({
                    address: fromAddress,
                });
                const sendTxSize = (0, utils_1.calculateTaprootTxSize)(3, 0, 2);
                const feeForSend = sendTxSize * feeRate < 150 ? 200 : sendTxSize * feeRate;
                const utxosToSend = (0, txbuilder_1.findUtxosToCoverAmount)(utxosForTransferSendFees, feeForSend);
                const amountGathered = (0, utils_1.calculateAmountGatheredUtxo)(utxosToSend.selectedUtxos);
                const sendPsbt = new bitcoin.Psbt({
                    network: (0, utils_1.getNetwork)(this.currentNetwork),
                });
                sendPsbt.addInput({
                    hash: inscriptionTxId,
                    index: parseInt(inscriptionTxVOutIndex),
                    witnessUtxo: {
                        script: Buffer.from(utxosToSend.selectedUtxos[0].scriptPk, 'hex'),
                        value: inscriptionUtxoData.value,
                    },
                });
                try {
                    for (var _d = true, _e = __asyncValues(utxosToSend.selectedUtxos), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                        _c = _f.value;
                        _d = false;
                        try {
                            const utxo = _c;
                            sendPsbt.addInput({
                                hash: utxo.txId,
                                index: utxo.outputIndex,
                                witnessUtxo: {
                                    script: Buffer.from(utxo.scriptPk, 'hex'),
                                    value: utxo.satoshis,
                                },
                            });
                        }
                        finally {
                            _d = true;
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                sendPsbt.addOutput({
                    address: destinationAddress,
                    value: inscriptionUtxoData.value,
                });
                const reimbursementAmount = amountGathered - feeForSend;
                if (reimbursementAmount > 546) {
                    sendPsbt.addOutput({
                        address: fromAddress,
                        value: amountGathered - feeForSend,
                    });
                }
                const toSignInputs = yield (0, utils_1.formatOptionsToSignInputs)({
                    _psbt: sendPsbt,
                    pubkey: taprootPublicKey,
                    segwitPubkey: segwitPubKey,
                    segwitAddress: segwitAddress,
                    taprootAddress: fromAddress,
                    network: (0, utils_1.getNetwork)(this.currentNetwork),
                });
                const signedSendPsbt = yield (0, utils_1.signInputs)(sendPsbt, toSignInputs, taprootPublicKey, segwitPubKey, segwitSigner, taprootSigner);
                signedSendPsbt.finalizeAllInputs();
                const sendTxHex = signedSendPsbt.extractTransaction().toHex();
                const sendTxId = signedSendPsbt.extractTransaction().getId();
                if (isDry) {
                    return { txId: sendTxId, rawTxn: sendTxHex };
                }
                const [result] = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([sendTxHex]);
                if (!result.allowed) {
                    throw new Error(result['reject-reason']);
                }
                yield this.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(sendTxHex);
                return { txId: sendTxId, rawTxn: sendTxHex };
            }
            catch (err) {
                console.error(err);
                throw err;
            }
        });
    }
}
exports.Oyl = Oyl;
const isDryDisclaimer = (isDry) => __awaiter(void 0, void 0, void 0, function* () {
    if (isDry) {
        console.log('DRY!!!!! RUNNING METHOD IN DRY MODE');
    }
    else {
        console.log('WET!!!!!!! 5');
        yield (0, utils_1.delay)(1000);
        console.log('WET!!!!!!! 4');
        yield (0, utils_1.delay)(1000);
        console.log('WET!!!!!!! 3');
        yield (0, utils_1.delay)(1000);
        console.log('WET!!!!!!! 2');
        yield (0, utils_1.delay)(1000);
        console.log('WET!!!!!!! 1');
        yield (0, utils_1.delay)(1000);
        console.log('LAUNCH!');
        yield (0, utils_1.delay)(1000);
    }
});
//# sourceMappingURL=oylib.js.map