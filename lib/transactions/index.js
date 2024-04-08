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
exports.validateSegwitAddress = exports.validateTaprootAddress = exports.getAddressType = exports.getMetaUtxos = exports.convertUsdValue = exports.calculateBalance = exports.getBtcPrice = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const interface_1 = require("../shared/interface");
const accounts_1 = require("../wallet/accounts");
const getBtcPrice = async () => {
    try {
        const response = await (0, node_fetch_1.default)(`https://blockchain.info/ticker`, {
            headers: {
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch btc price from binance`);
        }
        const jsonResponse = await response.json();
        return jsonResponse;
    }
    catch (error) {
        console.log(error);
    }
};
exports.getBtcPrice = getBtcPrice;
const calculateBalance = function (utxos) {
    let balance = 0;
    for (let utxo = 0; utxo < utxos.length; utxo++) {
        balance += utxos[utxo].value;
    }
    return balance / 1e8; // Convert from satoshis to BTC
};
exports.calculateBalance = calculateBalance;
const convertUsdValue = async (amount) => {
    const pricePayload = await (0, exports.getBtcPrice)();
    const btcPrice = parseFloat(pricePayload.USD.last);
    const amountInBTC = parseFloat(amount) * btcPrice;
    return amountInBTC.toFixed(2);
};
exports.convertUsdValue = convertUsdValue;
const getMetaUtxos = async (address, utxos, inscriptions) => {
    const formattedData = [];
    for (const utxo of utxos) {
        const formattedUtxo = {
            txId: utxo.tx_hash_big_endian,
            outputIndex: utxo.tx_output_n,
            satoshis: utxo.value,
            scriptPk: utxo.script,
            confirmations: utxo.confirmations,
            addressType: getAddressType(address),
            address: address,
            inscriptions: [],
        };
        for (const inscription of inscriptions['collectibles']) {
            if (inscription.detail.location.includes(utxo.tx_hash_big_endian) &&
                utxo.value === 546) {
                formattedUtxo.inscriptions.push({ collectibles: inscription.detail });
            }
        }
        for (const inscription of inscriptions['brc20']) {
            if (inscription.detail.location.includes(utxo.tx_hash_big_endian) &&
                utxo.value === 546) {
                formattedUtxo.inscriptions.push({ brc20: inscription.detail });
            }
        }
        formattedData.push(formattedUtxo);
    }
    return formattedData;
};
exports.getMetaUtxos = getMetaUtxos;
function getAddressType(address) {
    if (accounts_1.addressFormats.mainnet.p2pkh.test(address) ||
        accounts_1.addressFormats.testnet.p2pkh.test(address) ||
        accounts_1.addressFormats.regtest.p2pkh.test(address)) {
        return interface_1.AddressType.P2PKH;
    }
    else if (accounts_1.addressFormats.mainnet.p2tr.test(address) ||
        accounts_1.addressFormats.testnet.p2tr.test(address) ||
        accounts_1.addressFormats.regtest.p2tr.test(address)) {
        return interface_1.AddressType.P2TR;
    }
    else if (accounts_1.addressFormats.mainnet.p2sh.test(address) ||
        accounts_1.addressFormats.testnet.p2sh.test(address) ||
        accounts_1.addressFormats.regtest.p2sh.test(address)) {
        return interface_1.AddressType.P2SH_P2WPKH;
    }
    else if (accounts_1.addressFormats.mainnet.p2wpkh.test(address) ||
        accounts_1.addressFormats.testnet.p2wpkh.test(address) ||
        accounts_1.addressFormats.regtest.p2wpkh.test(address)) {
        return interface_1.AddressType.P2WPKH;
    }
    else {
        return null;
    }
}
exports.getAddressType = getAddressType;
const validateTaprootAddress = ({ address, type }) => {
    try {
        const decodedBech32 = bitcoin.address.fromBech32(address);
        if (decodedBech32.version === 1 && decodedBech32.data.length === 32) {
            return type === 'taproot';
        }
    }
    catch (error) {
        // Address is not in Bech32 format
        return false;
    }
    return false;
};
exports.validateTaprootAddress = validateTaprootAddress;
const validateSegwitAddress = ({ address, type }) => {
    try {
        const decodedBech32 = bitcoin.address.fromBech32(address);
        if (decodedBech32.version === 0) {
            return type === 'segwit';
        }
    }
    catch (error) {
        // Address is not in Bech32 format
        return false;
    }
    return false;
};
exports.validateSegwitAddress = validateSegwitAddress;
//# sourceMappingURL=index.js.map