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
exports.getMetaUtxos = exports.convertUsdValue = exports.calculateBalance = exports.getBtcPrice = exports.getUnspentOutputs = void 0;
var node_fetch_1 = __importDefault(require("node-fetch"));
/**
 *
 Returns from https://www.blockchain.com/explorer/api/blockchain_api.
 One way UTXOs can be gotten directly from the node is with RPC command - 'gettxout'
 However this accepts a single transaction as a parameter, making it impratical to use
 directly when getting UTXOs by address/public key. The best idea will be to index the
 all UTXOs from the blockchain in a db (just like with wallets and transactions on bcoin)
 and extend the bcoin RPC server. To return the nodes.
 Also consider - if this is a client wallet that can be run with a custom server, there will
 need to be a default alternative outside Oyl Api (e.g the blockchainApi)
 *
 */
var getUnspentOutputs = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var response, jsonResponse, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, node_fetch_1.default)("https://blockchain.info/unspent?active=".concat(address), {
                        headers: {
                            Accept: "application/json",
                        },
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("Failed to fetch unspent output for address ".concat(address));
                }
                return [4 /*yield*/, response.json()];
            case 2:
                jsonResponse = _a.sent();
                return [2 /*return*/, jsonResponse];
            case 3:
                error_1 = _a.sent();
                console.log(Error);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUnspentOutputs = getUnspentOutputs;
var getBtcPrice = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, jsonResponse, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, node_fetch_1.default)("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", {
                        headers: {
                            Accept: "application/json",
                        },
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("Failed to fetch btc price from binance");
                }
                return [4 /*yield*/, response.json()];
            case 2:
                jsonResponse = _a.sent();
                return [2 /*return*/, jsonResponse];
            case 3:
                error_2 = _a.sent();
                console.log(Error);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getBtcPrice = getBtcPrice;
var calculateBalance = function (utxos) {
    var balance = 0;
    for (var utxo = 0; utxo < utxos.length; utxo++) {
        balance += utxos[utxo].value;
    }
    return balance / 1e8; // Convert from satoshis to BTC
};
exports.calculateBalance = calculateBalance;
var convertUsdValue = function (amount) { return __awaiter(void 0, void 0, void 0, function () {
    var pricePayload, btcPrice, amountInBTC;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getBtcPrice)()];
            case 1:
                pricePayload = _a.sent();
                btcPrice = parseFloat(pricePayload.price);
                amountInBTC = parseFloat(amount) * btcPrice;
                return [2 /*return*/, amountInBTC.toFixed(2)];
        }
    });
}); };
exports.convertUsdValue = convertUsdValue;
var getMetaUtxos = function (utxos, inscriptions) { return __awaiter(void 0, void 0, void 0, function () {
    var formattedData, _i, utxos_1, utxo, formattedUtxo, _a, inscriptions_1, inscription;
    return __generator(this, function (_b) {
        formattedData = [];
        for (_i = 0, utxos_1 = utxos; _i < utxos_1.length; _i++) {
            utxo = utxos_1[_i];
            formattedUtxo = {
                txId: utxo.tx_hash_big_endian,
                outputIndex: utxo.tx_output_n,
                satoshis: utxo.value,
                scriptPk: utxo.script,
                addressType: getAddressType(utxo.script),
                inscriptions: []
            };
            for (_a = 0, inscriptions_1 = inscriptions; _a < inscriptions_1.length; _a++) {
                inscription = inscriptions_1[_a];
                if (inscription.id.includes(utxo.tx_hash_big_endian)) {
                    formattedUtxo.inscriptions.push({
                        id: inscription.id,
                        num: inscription.num,
                        offset: inscription.detail.offset
                    });
                }
            }
            formattedData.push(formattedUtxo);
        }
        return [2 /*return*/, formattedData];
    });
}); };
exports.getMetaUtxos = getMetaUtxos;
function getAddressType(script) {
    // Add  logic to determine the address type based on the script
    // For example, you can check if it's a P2PKH or P2SH script
    // and return the corresponding AddressType enum value
    // Assuming you have an AddressType enum defined
    // const AddressType = {
    //   P2PKH: 'P2PKH',
    //   P2SH: 'P2SH'
    // };
    //return AddressType.P2PKH; 
    return "P2TR";
}
//# sourceMappingURL=transactions.js.map