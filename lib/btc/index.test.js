"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const _1 = require(".");
const utxo_1 = require("../utxo");
const account_1 = require("../account");
const constants_1 = require("../shared/constants");
const provider_1 = require("../provider/provider");
const dotenv = tslib_1.__importStar(require("dotenv"));
dotenv.config();
const provider = new provider_1.Provider({
    url: 'https://mainnet.sandshrew.io',
    projectId: process.env.SANDSHREW_PROJECT_ID,
    network: bitcoin.networks.bitcoin,
    networkType: 'mainnet',
});
const account = (0, account_1.mnemonicToAccount)({
    mnemonic: constants_1.mainnetMnemonic,
    opts: constants_1.Opts,
});
const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(account.nativeSegwit.pubkey, 'hex'),
});
const { output } = bitcoin.payments.p2wpkh({ address });
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
describe('btc sendTx', () => {
    it('creates a transaction successfully', async () => {
        const result = await (0, _1.createPsbt)({
            toAddress: address,
            amount: 3000,
            feeRate: 10,
            account: account,
            provider: provider,
        });
        expect(result.psbt).toBeDefined();
        expect(utxo_1.accountSpendableUtxos).toHaveBeenCalledWith({
            account: account,
            provider: provider,
            spendAmount: 4540,
        });
    });
});
//# sourceMappingURL=index.test.js.map