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
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin = __importStar(require("bitcoinjs-lib"));
const _1 = require(".");
const utxo_1 = require("../utxo");
const account_1 = require("../account");
const constants_1 = require("../shared/constants");
const provider_1 = require("../provider/provider");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const provider = new provider_1.Provider({
    url: 'https://mainnet.sandshrew.io',
    projectId: process.env.SANDSHREW_PROJECT_ID,
    network: bitcoin.networks.bitcoin,
    networkType: 'mainnet',
});
const account = (0, account_1.mnemonicToAccount)(constants_1.mainnetMnemonic, constants_1.Opts);
const { address } = bitcoin.payments.p2tr({
    pubkey: Buffer.from(account.taproot.pubKeyXOnly, 'hex'),
});
const { output } = bitcoin.payments.p2tr({ address });
const scriptPk = output.toString('hex');
jest.mock('../provider/provider', () => ({
    Provider: jest.fn().mockImplementation(() => ({
        esplora: {
            getFeeEstimates: jest.fn().mockResolvedValue({ '1': 100 }),
        },
    })),
}));
jest.spyOn(require('../utxo'), 'accountSpendableUtxos').mockResolvedValue({
    totalAmount: 20000,
    utxos: [
        {
            txId: 'e3c3b1c9e5a45b4f6c7e1a9c3d6e2a7d8f9b0c3a5c7e4f6d7e1a8b9c0a1b2c3d',
            outputIndex: 0,
            satoshis: 20000,
            scriptPk: scriptPk,
        },
    ],
});
jest.spyOn(require('.'), 'findCollectible').mockResolvedValue({
    txId: 'e3c3b1c9e5a45b4f6c7e1a9c3d6e2a7d8f9b0c3a5c7e4f6d7e1a8b9c0a1b2c31',
    voutIndex: 294,
    data: {
        scriptpubkey: '51200d89d702fafc100ab8eae890cbaf40b3547d6f1429564cf5d5f8d517f4caa390',
        scriptpubkey_asm: 'OP_PUSHNUM_1 OP_PUSHBYTES_32 0d89d702fafc100ab8eae890cbaf40b3547d6f1429564cf5d5f8d517f4caa390',
        scriptpubkey_type: 'v1_p2tr',
        scriptpubkey_address: 'bc1ppkyawqh6lsgq4w82azgvht6qkd286mc599tyeaw4lr230ax25wgqdcldtm',
        value: 546,
    },
});
describe('collectible sendTx', () => {
    it('creates a transaction successfully', async () => {
        const result = await (0, _1.sendTx)({
            toAddress: address,
            inscriptionId: 'testInscriptionId:0',
            feeRate: 10,
            account: account,
            provider: provider,
        });
        expect(result.psbt).toBeDefined();
        expect(utxo_1.accountSpendableUtxos).toHaveBeenCalledWith({
            account: account,
            provider: provider,
            spendAmount: 1540,
        });
        expect(_1.findCollectible).toHaveBeenCalledWith({
            account: account,
            provider: provider,
            inscriptionId: 'testInscriptionId:0',
        });
    });
});
//# sourceMappingURL=index.test.js.map