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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletUtils = void 0;
var rpclient_1 = require("./rpclient");
var transactions_1 = require("./transactions");
var bip32_1 = __importDefault(require("bip32"));
var secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
var bip32_utils_1 = __importDefault(require("bip32-utils"));
var wallet_1 = require("./wallet");
var bip32 = (0, bip32_1.default)(secp256k1_1.default);
var RequiredPath = [
    "m/44'/1'/0'/1",
    "m/49'/1'/0'/0",
    "m/84'/1'/0'/0",
    "m/86'/0'/0'/0", // P2TR (Taproot) 
];
var WalletUtils = /** @class */ (function () {
    function WalletUtils(options) {
        try {
            this.node = (options === null || options === void 0 ? void 0 : options.node) || "bcoin";
            this.network = (options === null || options === void 0 ? void 0 : options.network) || "main";
            this.port = (options === null || options === void 0 ? void 0 : options.port) || 8332;
            this.host = (options === null || options === void 0 ? void 0 : options.host) || "198.199.72.193";
            this.apiKey = (options === null || options === void 0 ? void 0 : options.apiKey) || "bikeshed";
            this.nodeClient = (options === null || options === void 0 ? void 0 : options.nodeClient) || true;
            if (this.node == "bcoin" && !this.nodeClient) {
                //TODO Implement WalletClient in rpclient 
                console.log("WalletClient inactive");
            }
            else if (this.node == "bcoin" && this.nodeClient) {
                var clientOptions = {
                    network: this.network,
                    port: this.port,
                    host: this.host,
                    apiKey: this.apiKey
                };
                console.log(clientOptions);
                this.client = new rpclient_1.NodeClient(clientOptions);
            }
        }
        catch (e) {
            console.log("An error occured: ", e);
        }
    }
    WalletUtils.fromObject = function (data) {
        var result = new this(data);
        return result;
    };
    WalletUtils.prototype.toObject = function () {
        return {
            network: this.network,
            port: this.port,
            host: this.host,
            apiKey: this.apiKey
        };
    };
    WalletUtils.prototype.getAddressSummary = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var addressesUtxo, i, utxos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof (address) === "string") {
                            address = [address];
                        }
                        addressesUtxo = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < address.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, transactions_1.transactions.getUnspentOutputs(address[i])];
                    case 2:
                        utxos = _a.sent();
                        console.log(utxos);
                        addressesUtxo[i] = {};
                        addressesUtxo[i]["utxo"] = utxos.unspent_outputs;
                        addressesUtxo[i]["balance"] = transactions_1.transactions.calculateBalance(utxos.unspent_outputs);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, addressesUtxo];
                }
            });
        });
    };
    WalletUtils.prototype.discoverBalance = function (xpub, gapLimit, enableImport) {
        if (enableImport === void 0) { enableImport = false; }
        return __awaiter(this, void 0, void 0, function () {
            var childKeyB58, chain;
            var _this = this;
            return __generator(this, function (_a) {
                childKeyB58 = bip32.fromBase58(xpub);
                chain = new bip32_utils_1.default.Chain(childKeyB58);
                bip32_utils_1.default.discovery(chain, gapLimit, function (addresses, callback) { return __awaiter(_this, void 0, void 0, function () {
                    var res, areUsed;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.getAddressSummary(addresses)];
                            case 1:
                                res = _a.sent();
                                areUsed = res.map(function (res) {
                                    return res.balance > 0;
                                });
                                callback(undefined, areUsed);
                                return [2 /*return*/];
                        }
                    });
                }); }, function (err, used, checked) {
                    if (err)
                        throw err;
                    console.log('Discovered at most ' + used + ' used addresses');
                    console.log('Checked ' + checked + ' addresses');
                    console.log('With at least ' + (checked - used) + ' unused addresses');
                    // throw away ALL unused addresses AFTER the last unused address
                    var unused = checked - used;
                    for (var i = 1; i < unused; ++i)
                        chain.pop();
                    // remember used !== total, chain may have started at a k-index > 0
                    console.log('Total number of addresses (after prune): ', chain.addresses.length);
                });
                return [2 /*return*/];
            });
        });
    };
    WalletUtils.prototype.createWallet = function (network) {
        return __awaiter(this, void 0, void 0, function () {
            var mnemonics, xpub;
            return __generator(this, function (_a) {
                mnemonics = new wallet_1.Mnemonic({ bits: 256 });
                xpub = wallet_1.accounts.deriveXpubFromSeed(mnemonics, network);
                return [2 /*return*/, xpub];
            });
        });
    };
    WalletUtils.prototype.getMetaBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var addressSummary, confirmAmount, pendingAmount, amount, usdValue, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAddressSummary(address)];
                    case 1:
                        addressSummary = _a.sent();
                        confirmAmount = addressSummary.reduce(function (total, addr) {
                            var confirmedUtxos = addr.utxo.filter(function (utxo) { return utxo.confirmations > 0; });
                            return total + confirmedUtxos.reduce(function (sum, utxo) { return sum + (utxo.value / 1e8); }, 0);
                        }, 0);
                        pendingAmount = addressSummary.reduce(function (total, addr) {
                            var unconfirmedUtxos = addr.utxo.filter(function (utxo) { return utxo.confirmations === 0; });
                            return total + unconfirmedUtxos.reduce(function (sum, utxo) { return sum + (utxo.value / 1e8); }, 0);
                        }, 0);
                        amount = confirmAmount + pendingAmount;
                        return [4 /*yield*/, transactions_1.transactions.convertUsdValue(amount)];
                    case 2:
                        usdValue = _a.sent();
                        console.log(usdValue);
                        response = {
                            confirm_amount: confirmAmount.toFixed(8),
                            pending_amount: pendingAmount.toFixed(8),
                            amount: amount.toFixed(8),
                            usd_value: usdValue
                        };
                        return [2 /*return*/, response];
                }
            });
        });
    };
    WalletUtils.prototype.getTxHistory = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var history, processedTransactions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.getTxByAddress(address)];
                    case 1:
                        history = _a.sent();
                        processedTransactions = history.map(function (tx) {
                            var hash = tx.hash, mtime = tx.mtime, outputs = tx.outputs, inputs = tx.inputs;
                            // Find the output associated with the given address
                            var output = outputs.find(function (output) { return output.address === address; });
                            if (!output) {
                                return null; // Skip this transaction if the address is not found in outputs
                            }
                            var amount = output.value / 1e8; // Assuming BTC amount is in satoshis
                            var symbol = 'BTC';
                            // Convert Unix timestamp to date string
                            var date = new Date(mtime * 1000).toDateString();
                            return {
                                txid: hash,
                                mtime: mtime,
                                date: date,
                                amount: amount,
                                symbol: symbol,
                                address: address
                            };
                        }).filter(function (transaction) { return transaction !== null; });
                        return [2 /*return*/, processedTransactions];
                }
            });
        });
    };
    WalletUtils.prototype.getActiveAddresses = function (xpub, lookAhead) {
        if (lookAhead === void 0) { lookAhead = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var childKeyB58, chain, batch, seenUnused, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        childKeyB58 = bip32.fromBase58(xpub);
                        chain = new wallet_1.Chain(childKeyB58);
                        batch = [chain.get()] //get first at index 0
                        ;
                        seenUnused = false;
                        _a.label = 1;
                    case 1:
                        if (!(batch.length < lookAhead && seenUnused === false)) return [3 /*break*/, 3];
                        chain.next();
                        batch.push(chain.get());
                        return [4 /*yield*/, this.getAddressSummary(batch)];
                    case 2:
                        res = _a.sent();
                        res.map(function (res) {
                            if (res.balance > 0) {
                                seenUnused = true;
                            }
                        });
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, batch];
                }
            });
        });
    };
    WalletUtils.prototype.getTotalBalance = function (batch) {
        return __awaiter(this, void 0, void 0, function () {
            var res, total;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAddressSummary(batch)];
                    case 1:
                        res = _a.sent();
                        total = 0;
                        res.forEach(function (element) {
                            total += element.balance;
                        });
                        return [2 /*return*/, total];
                }
            });
        });
    };
    WalletUtils.prototype.getInscriptions = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var artifacts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wallet_1.bord.getInscriptionsByAddr(address)];
                    case 1:
                        artifacts = _a.sent();
                        return [2 /*return*/, artifacts.map(function (item) {
                                var id = item.id, num = item.inscription_number, number = item.inscription_number, content_length = item.content_length, content_type = item.content_type, timestamp = item.timestamp, genesis_transaction = item.genesis_transaction, location = item.location, output = item.output, output_value = item.output_value;
                                var detail = {
                                    id: id,
                                    address: item.address,
                                    output_value: parseInt(output_value),
                                    preview: "https://ordinals.com/preview/".concat(id),
                                    content: "https://ordinals.com/content/".concat(id),
                                    content_length: parseInt(content_length),
                                    content_type: content_type,
                                    timestamp: timestamp,
                                    genesis_transaction: genesis_transaction,
                                    location: location,
                                    output: output,
                                    offset: parseInt(item.offset),
                                    content_body: ""
                                };
                                return {
                                    id: id,
                                    num: num,
                                    number: number,
                                    detail: detail
                                };
                            })];
                }
            });
        });
    };
    WalletUtils.prototype.getUtxosArtifacts = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var utxos, inscriptions, utxoArtifacts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, transactions_1.transactions.getUnspentOutputs(address)];
                    case 1:
                        utxos = _a.sent();
                        return [4 /*yield*/, this.getInscriptions(address)];
                    case 2:
                        inscriptions = _a.sent();
                        return [4 /*yield*/, transactions_1.transactions.getMetaUtxos(utxos.unspent_outputs, inscriptions)];
                    case 3:
                        utxoArtifacts = _a.sent();
                        return [2 /*return*/, utxoArtifacts];
                }
            });
        });
    };
    WalletUtils.prototype.importWatchOnlyAddress = function (addresses) {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, i;
            var _this = this;
            return __generator(this, function (_a) {
                _loop_1 = function (i) {
                    (function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10000); })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, this.client.execute('importaddress', [addresses[i], "", true])];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })();
                };
                for (i = 0; i < addresses.length; i++) {
                    _loop_1(i);
                }
                return [2 /*return*/];
            });
        });
    };
    return WalletUtils;
}());
exports.WalletUtils = WalletUtils;
//# sourceMappingURL=oylib.js.map