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
const ecc2 = __importStar(require("@cmdcode/crypto-utils"));
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
const tapscript_1 = require("@cmdcode/tapscript");
const cmdcode = __importStar(require("@cmdcode/tapscript"));
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
        const apiKey = options.projectId;
        this.apiClient = new apiclient_1.OylApiClient({
            host: 'https://api.oyl.gg',
            testnet: options.network == 'testnet' ? true : null,
            regtest: options.network == 'regtest' ? true : null,
            apiKey: apiKey,
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
    getAddressSummary({ address, includeInscriptions, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressesUtxo = {};
            let utxos = yield this.getUtxos(address, includeInscriptions);
            addressesUtxo['utxos'] = utxos.unspent_outputs;
            addressesUtxo['balance'] = transactions.calculateBalance(utxos.unspent_outputs);
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
                const data = {
                    keyring: wallet,
                };
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
                throw error;
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
                throw error;
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
                throw error;
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
    getTaprootBalance({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.apiClient.getTaprootBalance(address);
            return balance;
        });
    }
    /**
     * Fetches the balance details including confirmed and pending amounts for a given address.
     * @param {Object} param0 - An object containing the address property.
     * @param {string} param0.address - The address for which to fetch balance details.
     * @returns {Promise<any>} A promise that resolves to an object containing balance and its USD value.
     * @throws {Error} Throws an error if the balance retrieval fails.
     */
    getAddressBalance({ address }) {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.apiClient.getAddressBalance(address);
            return balance;
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
                if (utxo.txid) {
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
                throw new Error('Error fetching txn history');
            }
        });
    }
    getTaprootTxHistory({ taprootAddress, totalTxs = 20, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressType = (0, transactions_1.getAddressType)(taprootAddress);
            if (addressType === 1) {
                return yield this.apiClient.getTaprootTxHistory(taprootAddress, totalTxs);
            }
            else {
                throw new Error('Invalid address type');
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
    sendBtc({ fromAddress, toAddress, feeRate, amount, altSpendPubKey, spendAddress, spendPubKey, altSpendAddress, signer, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressType = (0, transactions_1.getAddressType)(toAddress);
            if (utils_1.addressTypeMap[addressType] === 'p2pkh') {
                throw new Error('Sending bitcoin to legacy address is not supported');
            }
            if (utils_1.addressTypeMap[addressType] === 'p2sh') {
                throw new Error('Sending bitcoin to a nested-segwit address is not supported');
            }
            let spendUtxos;
            let altSpendUtxos;
            spendUtxos = yield this.getUtxosArtifacts({
                address: spendAddress,
            });
            if (!spendUtxos) {
                throw new Error('insufficient balance');
            }
            if (altSpendAddress) {
                altSpendUtxos = yield this.getUtxosArtifacts({
                    address: altSpendAddress,
                });
            }
            if (!feeRate) {
                feeRate = (yield this.esploraRpc.getFeeEstimates())['1'];
            }
            const { rawPsbt } = yield this.createBtcTx({
                fromAddress,
                toAddress,
                spendPubKey,
                feeRate,
                amount,
                network: this.network,
                spendUtxos,
                spendAddress,
                altSpendPubKey,
                altSpendAddress,
                altSpendUtxos,
            });
            const { signedPsbt: segwitSigned } = yield signer.signAllSegwitInputs({
                rawPsbt: rawPsbt,
                finalize: true,
            });
            const { signedPsbt: taprootSigned, signedHexPsbt: taprootHexSigned } = yield signer.signAllTaprootInputs({
                rawPsbt: segwitSigned,
                finalize: true,
            });
            const validPsbt = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
                taprootHexSigned,
            ]);
            if (!validPsbt) {
                throw new Error('PSBT failed mempool acceptance. Signatures may be incorrect or it may not be finalized.');
            }
            const sendResponse = yield this.pushPsbt({ psbtBase64: taprootSigned });
            return sendResponse;
        });
    }
    createBtcTx({ fromAddress, toAddress, spendPubKey, feeRate, amount, network, spendUtxos, spendAddress, altSpendAddress, altSpendPubKey, altSpendUtxos, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const psbt = new bitcoin.Psbt({ network: network });
            let updatedPsbt = yield (0, utils_1.addBtcUtxo)({
                spendUtxos,
                psbt: psbt,
                toAddress,
                amount: amount,
                fromAddress,
                feeRate,
                network,
                spendAddress,
                spendPubKey,
                altSpendAddress,
                altSpendPubKey,
                altSpendUtxos,
            });
            return {
                rawPsbt: updatedPsbt.toBase64(),
            };
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
            const summary = yield this.getAddressSummary({
                address,
            });
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
                type: 'taproot',
            });
            if (!isValid) {
                return { isValid, summary: null };
            }
            const summary = yield this.getAddressSummary({
                address,
                includeInscriptions: false,
            });
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
            const tokens = yield this.apiClient.getBrc20sByAddress(address);
            for (let i = 0; i < tokens.data.length; i++) {
                const details = yield this.apiClient.getBrc20TokenDetails(tokens.data[i].ticker);
                tokens.data[i]['details'] = details.data;
            }
            return tokens;
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
    pushPsbt({ psbtHex, psbtBase64, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!psbtHex && !psbtBase64) {
                throw new Error('Please supply psbt in either base64 or hex format');
            }
            if (psbtHex && psbtBase64) {
                throw new Error('Please select one format of psbt to broadcast');
            }
            let psbt;
            if (psbtHex) {
                psbt = bitcoin.Psbt.fromHex(psbtHex, { network: this.network });
            }
            if (psbtBase64) {
                psbt = bitcoin.Psbt.fromBase64(psbtBase64, { network: this.network });
            }
            const txId = psbt.extractTransaction().getId();
            const rawTx = psbt.extractTransaction().toHex();
            const [result] = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([rawTx]);
            if (!result.allowed) {
                throw new Error(result['reject-reason']);
            }
            yield this.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(rawTx);
            return { txId, rawTx };
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
                throw new Error(e);
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
                    return {
                        sentPsbt: txHex,
                        sentPsbtBase64: Buffer.from(txHex, 'hex').toString('base64'),
                    };
                }
            }
            catch (e) {
                console.log(e);
                throw new Error(e);
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
    inscriptionCommitTx({ content, spendAddress, spendPubKey, signer, altSpendPubKey, altSpendAddress, feeRate, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const commitTxSize = (0, utils_1.calculateTaprootTxSize)(3, 0, 2);
            const feeForCommit = commitTxSize * feeRate < 200 ? 200 : commitTxSize * feeRate;
            const revealTxSize = (0, utils_1.calculateTaprootTxSize)(1, 0, 1);
            const feeForReveal = revealTxSize * feeRate < 200 ? 200 : revealTxSize * feeRate;
            const amountNeededForInscribe = Number(feeForCommit) + Number(feeForReveal) + utils_1.inscriptionSats;
            const utxosUsedForFees = [];
            let usingAlt = false;
            let spendUtxos;
            let altSpendUtxos;
            spendUtxos = yield this.getUtxosArtifacts({
                address: spendAddress,
            });
            if (!spendUtxos) {
                throw new Error('No utxos for this address');
            }
            if (altSpendAddress) {
                altSpendUtxos = yield this.getUtxosArtifacts({
                    address: altSpendAddress,
                });
            }
            const spendableUtxos = yield (0, utils_1.filterTaprootUtxos)({
                taprootUtxos: spendUtxos,
            });
            const psbt = new bitcoin.Psbt({ network: this.network });
            const secret = signer.taprootKeyPair.privateKey.toString('hex');
            const pubKey = ecc2.keys.get_pubkey(String(secret), true);
            const script = (0, utils_1.createInscriptionScript)(pubKey, content);
            const tapleaf = tapscript_1.Tap.encodeScript(script);
            const [tpubkey] = tapscript_1.Tap.getPubKey(pubKey, { target: tapleaf });
            const inscriberAddress = tapscript_1.Address.p2tr.fromPubKey(tpubkey, this.currentNetwork);
            psbt.addOutput({
                value: Number(feeForReveal) + utils_1.inscriptionSats,
                address: inscriberAddress,
            });
            let utxosToPayFee = (0, txbuilder_1.findUtxosToCoverAmount)(spendableUtxos, amountNeededForInscribe);
            if (!utxosToPayFee) {
                const filteredAltUtxos = yield (0, utils_1.filterTaprootUtxos)({
                    taprootUtxos: altSpendUtxos,
                });
                utxosToPayFee = (0, txbuilder_1.findUtxosToCoverAmount)(filteredAltUtxos, amountNeededForInscribe);
                if (!utxosToPayFee) {
                    throw new Error('Insufficient Balance');
                }
                usingAlt = true;
            }
            const feeAmountGathered = (0, utils_1.calculateAmountGatheredUtxo)(utxosToPayFee.selectedUtxos);
            const changeAmount = feeAmountGathered - feeForCommit - feeForReveal - utils_1.inscriptionSats;
            for (let i = 0; i < utxosToPayFee.selectedUtxos.length; i++) {
                utxosUsedForFees.push(utxosToPayFee.selectedUtxos[i].txId);
                psbt.addInput({
                    hash: utxosToPayFee.selectedUtxos[i].txId,
                    index: utxosToPayFee.selectedUtxos[i].outputIndex,
                    witnessUtxo: {
                        value: utxosToPayFee.selectedUtxos[i].satoshis,
                        script: Buffer.from(utxosToPayFee.selectedUtxos[i].scriptPk, 'hex'),
                    },
                });
            }
            psbt.addOutput({
                address: spendAddress,
                value: changeAmount,
            });
            const formattedPsbt = yield (0, utils_1.formatInputsToSign)({
                _psbt: psbt,
                senderPublicKey: usingAlt ? altSpendPubKey : spendPubKey,
                network: this.network,
            });
            return {
                commitPsbt: formattedPsbt.toBase64(),
                utxosUsedForFees: utxosUsedForFees,
            };
        });
    }
    inscriptionRevealTx({ receiverAddress, signer, content, feeRate, commitTxId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const revealTxSize = (0, utils_1.calculateTaprootTxSize)(1, 0, 1);
            const feeForReveal = revealTxSize * feeRate < 200 ? 200 : revealTxSize * feeRate;
            const revealSats = feeForReveal + utils_1.inscriptionSats;
            const secret = signer.taprootKeyPair.privateKey.toString('hex');
            const secKey = ecc2.keys.get_seckey(String(secret));
            const pubKey = ecc2.keys.get_pubkey(String(secret), true);
            const script = (0, utils_1.createInscriptionScript)(pubKey, content);
            const tapleaf = tapscript_1.Tap.encodeScript(script);
            const [tpubkey, cblock] = tapscript_1.Tap.getPubKey(pubKey, { target: tapleaf });
            const commitTxOutput = yield (0, utils_1.getOutputValueByVOutIndex)({
                txId: commitTxId,
                vOut: 0,
                esploraRpc: this.esploraRpc,
            });
            if (!commitTxOutput) {
                throw new Error('ERROR GETTING FIRST INPUT VALUE');
            }
            const txData = tapscript_1.Tx.create({
                vin: [
                    {
                        txid: commitTxId,
                        vout: 0,
                        prevout: {
                            value: revealSats,
                            scriptPubKey: ['OP_1', tpubkey],
                        },
                    },
                ],
                vout: [
                    {
                        value: 546,
                        scriptPubKey: tapscript_1.Address.toScriptPubKey(receiverAddress),
                    },
                ],
            });
            const sig = cmdcode.Signer.taproot.sign(secKey, txData, 0, {
                extension: tapleaf,
            });
            txData.vin[0].witness = [sig, script, cblock];
            const inscriptionTxHex = tapscript_1.Tx.encode(txData).hex;
            return {
                revealTx: inscriptionTxHex,
            };
        });
    }
    sendBRC20({ fromAddress, fromPubKey, toAddress, spendPubKey, feeRate, altSpendPubKey, spendAddress, altSpendAddress, signer, token, amount, }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!feeRate) {
                    feeRate = (yield this.esploraRpc.getFeeEstimates())['1'];
                }
                const content = `{"p":"brc-20","op":"transfer","tick":"${token}","amt":"${amount}"}`;
                const { commitPsbt, utxosUsedForFees } = yield this.inscriptionCommitTx({
                    content,
                    spendAddress,
                    spendPubKey,
                    signer,
                    altSpendPubKey,
                    altSpendAddress,
                    feeRate,
                });
                const { signedPsbt: segwitSigned } = yield signer.signAllSegwitInputs({
                    rawPsbt: commitPsbt,
                    finalize: true,
                });
                const { signedPsbt: taprootSigned, signedHexPsbt: taprootHexSigned } = yield signer.signAllTaprootInputs({
                    rawPsbt: segwitSigned,
                    finalize: true,
                });
                const validPsbt = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
                    taprootHexSigned,
                ]);
                if (!validPsbt) {
                    throw new Error('PSBT failed mempool acceptance. Signatures may be incorrect or it may not be finalized.');
                }
                const { txId: commitTxId } = yield this.pushPsbt({
                    psbtBase64: taprootSigned,
                });
                const txResult = yield (0, utils_1.waitForTransaction)({
                    txId: commitTxId,
                    sandshrewBtcClient: this.sandshrewBtcClient,
                });
                if (!txResult) {
                    throw new Error('ERROR WAITING FOR COMMIT TX');
                }
                const { revealTx } = yield this.inscriptionRevealTx({
                    receiverAddress: fromAddress,
                    signer,
                    content,
                    commitTxId: commitTxId,
                    feeRate,
                });
                const revealTxId = yield this.sandshrewBtcClient.bitcoindRpc.sendRawTransaction(revealTx);
                const revealResult = yield (0, utils_1.waitForTransaction)({
                    txId: revealTxId,
                    sandshrewBtcClient: this.sandshrewBtcClient,
                });
                if (!revealResult) {
                    throw new Error('ERROR WAITING FOR COMMIT TX');
                }
                yield (0, utils_1.delay)(5000);
                const { sentPsbt: sentRawPsbt } = yield this.inscriptionSendTx({
                    toAddress,
                    fromPubKey,
                    spendPubKey,
                    spendAddress,
                    altSpendAddress,
                    altSpendPubKey,
                    feeRate,
                    utxoId: revealTxId,
                    utxosUsedForFees: utxosUsedForFees,
                });
                const { signedPsbt: segwitSendSignedPsbt } = yield signer.signAllSegwitInputs({
                    rawPsbt: sentRawPsbt,
                    finalize: true,
                });
                const { signedPsbt: taprootSendSignedPsbt, signedHexPsbt: taprootSendSignedHexPsbt, } = yield signer.signAllTaprootInputs({
                    rawPsbt: segwitSendSignedPsbt,
                    finalize: true,
                });
                const validSendPsbt = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
                    taprootSendSignedHexPsbt,
                ]);
                if (!validSendPsbt) {
                    throw new Error('PSBT failed mempool acceptance. Signatures may be incorrect or it may not be finalized.');
                }
                const { txId: sentPsbtTxId } = yield this.pushPsbt({
                    psbtBase64: taprootSendSignedPsbt,
                });
                return {
                    txId: sentPsbtTxId,
                    rawTxn: taprootSendSignedPsbt,
                    sendBrc20Txids: [commitTxId, revealTxId, sentPsbtTxId],
                };
            }
            catch (err) {
                console.error(err);
                throw new Error(err);
            }
        });
    }
    inscriptionSendTx({ toAddress, fromPubKey, spendPubKey, spendAddress, altSpendAddress, altSpendPubKey, feeRate, utxoId, utxosUsedForFees, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!feeRate) {
                feeRate = (yield this.esploraRpc.getFeeEstimates())['1'];
            }
            const txSize = (0, utils_1.calculateTaprootTxSize)(2, 0, 2);
            const fee = txSize * feeRate < 300 ? 300 : txSize * feeRate;
            let usingAlt = false;
            let spendUtxos;
            let altSpendUtxos;
            spendUtxos = yield this.getUtxosArtifacts({
                address: spendAddress,
            });
            if (!spendUtxos) {
                throw new Error('No utxos for this address');
            }
            if (altSpendAddress) {
                altSpendUtxos = yield this.getUtxosArtifacts({
                    address: altSpendAddress,
                });
            }
            const spendableUtxos = yield (0, utils_1.filterTaprootUtxos)({
                taprootUtxos: spendUtxos,
            });
            const utxoInfo = yield this.esploraRpc.getTxInfo(utxoId);
            const psbt = new bitcoin.Psbt({ network: this.network });
            psbt.addInput({
                hash: utxoId,
                index: 0,
                witnessUtxo: {
                    script: Buffer.from(utxoInfo.vout[0].scriptpubkey, 'hex'),
                    value: 546,
                },
            });
            psbt.addOutput({
                address: toAddress,
                value: 546,
            });
            let availableUtxos = spendableUtxos.filter((utxo) => !utxosUsedForFees.includes(utxo.txId));
            let utxosToPayFee = (0, txbuilder_1.findUtxosToCoverAmount)(availableUtxos, fee);
            if (!utxosToPayFee) {
                const filteredAltUtxos = yield (0, utils_1.filterTaprootUtxos)({
                    taprootUtxos: altSpendUtxos,
                });
                let availableUtxos = filteredAltUtxos.filter((utxo) => !utxosUsedForFees.includes(utxo.txId));
                utxosToPayFee = (0, txbuilder_1.findUtxosToCoverAmount)(availableUtxos, fee);
                if (!utxosToPayFee) {
                    throw new Error('Insufficient Balance');
                }
                usingAlt = true;
            }
            const amountGathered = (0, utils_1.calculateAmountGatheredUtxo)(utxosToPayFee.selectedUtxos);
            const changeAmount = amountGathered - fee;
            for (let i = 0; i < utxosToPayFee.selectedUtxos.length; i++) {
                utxosUsedForFees.push(utxosToPayFee.selectedUtxos[i].txId);
                psbt.addInput({
                    hash: utxosToPayFee.selectedUtxos[i].txId,
                    index: utxosToPayFee.selectedUtxos[i].outputIndex,
                    witnessUtxo: {
                        value: utxosToPayFee.selectedUtxos[i].satoshis,
                        script: Buffer.from(utxosToPayFee.selectedUtxos[i].scriptPk, 'hex'),
                    },
                });
            }
            psbt.addOutput({
                address: spendAddress,
                value: changeAmount,
            });
            const partiallyFormattedPsbtTx = yield (0, utils_1.formatInputsToSign)({
                _psbt: psbt,
                senderPublicKey: fromPubKey,
                network: this.network,
            });
            const formattedPsbt = yield (0, utils_1.formatInputsToSign)({
                _psbt: partiallyFormattedPsbtTx,
                senderPublicKey: usingAlt ? altSpendPubKey : spendPubKey,
                network: this.network,
            });
            return { sentPsbt: formattedPsbt.toBase64() };
        });
    }
    sendOrdCollectible({ fromAddress, fromPubKey, toAddress, spendPubKey, feeRate, altSpendPubKey, spendAddress, altSpendAddress, signer, inscriptionId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rawPsbt } = yield this.createOrdCollectibleTx({
                inscriptionId,
                fromAddress,
                fromPubKey,
                spendPubKey,
                spendAddress,
                toAddress,
                altSpendAddress,
                altSpendPubKey,
                feeRate,
            });
            if (!feeRate) {
                feeRate = (yield this.esploraRpc.getFeeEstimates())['1'];
            }
            const { signedPsbt: segwitSigned } = yield signer.signAllSegwitInputs({
                rawPsbt: rawPsbt,
                finalize: true,
            });
            const { signedPsbt: taprootSigned, signedHexPsbt: taprootHexSigned } = yield signer.signAllTaprootInputs({
                rawPsbt: segwitSigned,
                finalize: true,
            });
            const validPsbt = yield this.sandshrewBtcClient.bitcoindRpc.testMemPoolAccept([
                taprootHexSigned,
            ]);
            if (!validPsbt) {
                throw new Error('PSBT failed mempool acceptance. Signatures may be incorrect or it may not be finalized.');
            }
            return yield this.pushPsbt({ psbtBase64: taprootSigned });
        });
    }
    createOrdCollectibleTx({ inscriptionId, fromAddress, fromPubKey, spendPubKey, spendAddress, toAddress, altSpendAddress, altSpendPubKey, feeRate, }) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const sendTxSize = (0, utils_1.calculateTaprootTxSize)(3, 0, 2);
            const fee = sendTxSize * feeRate < 250 ? 250 : sendTxSize * feeRate;
            let usingAlt = false;
            let spendUtxos;
            let altSpendUtxos;
            spendUtxos = yield this.getUtxosArtifacts({
                address: spendAddress,
            });
            if (!spendUtxos) {
                throw new Error('No utxos for this address');
            }
            if (altSpendAddress) {
                altSpendUtxos = yield this.getUtxosArtifacts({
                    address: altSpendAddress,
                });
            }
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
            let psbtTx = new bitcoin.Psbt({ network: this.network });
            const { unspent_outputs } = yield this.getUtxos(fromAddress, true);
            const inscriptionTx = unspent_outputs.find((utxo) => inscriptionTxId === utxo.tx_hash_big_endian);
            psbtTx.addInput({
                hash: inscriptionTxId,
                index: parseInt(inscriptionTxVOutIndex),
                witnessUtxo: {
                    script: Buffer.from(inscriptionTx.script, 'hex'),
                    value: inscriptionUtxoData.value,
                },
            });
            psbtTx.addOutput({
                address: toAddress,
                value: inscriptionUtxoData.value,
            });
            const utxosForTransferSendFees = yield (0, utils_1.filterTaprootUtxos)({
                taprootUtxos: spendUtxos,
            });
            let utxosToSend = (0, txbuilder_1.findUtxosToCoverAmount)(utxosForTransferSendFees, fee);
            if (!utxosToSend) {
                const unFilteredAltUtxos = yield (0, utils_1.filterTaprootUtxos)({
                    taprootUtxos: altSpendUtxos,
                });
                utxosToSend = (0, txbuilder_1.findUtxosToCoverAmount)(unFilteredAltUtxos, fee);
                if (!utxosToSend) {
                    throw new Error('Insufficient Balance');
                }
                usingAlt = true;
            }
            const amountGathered = (0, utils_1.calculateAmountGatheredUtxo)(utxosToSend.selectedUtxos);
            try {
                for (var _d = true, _e = __asyncValues(utxosToSend.selectedUtxos), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        const utxo = _c;
                        psbtTx.addInput({
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
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            const changeAmount = amountGathered - fee;
            if (changeAmount > 546) {
                psbtTx.addOutput({
                    address: spendAddress,
                    value: amountGathered - fee,
                });
            }
            const partiallyFormattedPsbtTx = yield (0, utils_1.formatInputsToSign)({
                _psbt: psbtTx,
                senderPublicKey: fromPubKey,
                network: this.network,
            });
            psbtTx = yield (0, utils_1.formatInputsToSign)({
                _psbt: partiallyFormattedPsbtTx,
                senderPublicKey: usingAlt ? altSpendPubKey : spendPubKey,
                network: this.network,
            });
            return { rawPsbt: psbtTx.toBase64() };
        });
    }
}
exports.Oyl = Oyl;
//# sourceMappingURL=oylib.js.map