"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const tslib_1 = require("tslib");
const sandshrew_1 = require("../rpclient/sandshrew");
const esplora_1 = require("../rpclient/esplora");
const ord_1 = require("../rpclient/ord");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
const utils_1 = require("../shared/utils");
const alkanes_1 = require("../rpclient/alkanes");
class Provider {
    sandshrew;
    esplora;
    ord;
    api;
    alkanes;
    network;
    networkType;
    url;
    constructor({ url, projectId, network, networkType, version = 'v1', apiProvider, }) {
        let isTestnet;
        let isRegtest;
        switch (network) {
            case bitcoin.networks.testnet:
                isTestnet = true;
            case bitcoin.networks.regtest:
                isRegtest = true;
        }
        const masterUrl = [url, version, projectId].filter(Boolean).join('/');
        this.alkanes = new alkanes_1.AlkanesRpc(masterUrl);
        this.sandshrew = new sandshrew_1.SandshrewBitcoinClient(masterUrl);
        this.esplora = new esplora_1.EsploraRpc(masterUrl);
        this.ord = new ord_1.OrdRpc(masterUrl);
        this.api = apiProvider;
        this.network = network;
        this.networkType = networkType;
        this.url = masterUrl;
    }
    async pushPsbt({ psbtHex, psbtBase64, }) {
        if (!psbtHex && !psbtBase64) {
            throw new Error('Please supply psbt in either base64 or hex format');
        }
        if (psbtHex && psbtBase64) {
            throw new Error('Please select one format of psbt to broadcast');
        }
        let psbt;
        if (psbtHex) {
            psbt = bitcoin.Psbt.fromHex(psbtHex, {
                network: this.network,
            });
        }
        if (psbtBase64) {
            psbt = bitcoin.Psbt.fromBase64(psbtBase64, {
                network: this.network,
            });
        }
        let extractedTx;
        try {
            extractedTx = psbt.extractTransaction();
        }
        catch (error) {
            throw new Error(`Transaction could not be extracted do to invalid Psbt. ${error}`);
        }
        const txId = extractedTx.getId();
        const rawTx = extractedTx.toHex();
        const [result] = await this.sandshrew.bitcoindRpc.testMemPoolAccept([rawTx]);
        if (!result.allowed) {
            throw new Error(`Mempool rejected tx due to ${result['reject-reason']}`);
        }
        await this.sandshrew.bitcoindRpc.sendRawTransaction(rawTx);
        let txInMemPool;
        try {
            await (0, utils_1.waitForTransaction)({
                txId,
                sandshrewBtcClient: this.sandshrew,
                esploraClient: this.esplora,
            });
            txInMemPool = await this.sandshrew.bitcoindRpc.getMemPoolEntry(txId);
        }
        catch (e) {
            await (0, utils_1.delay)(1000);
            const tx = await this.esplora.getTxInfo(txId);
            if (!tx || !tx.status.confirmed) {
                throw new Error(`Transaction not found in mempool or confirmed due to ${e}`);
            }
            return {
                txId,
                rawTx,
                size: tx.size,
                weight: tx.weight,
                fee: tx.fee,
                satsPerVByte: (tx.fee / (tx.weight / 4)).toFixed(2),
            };
        }
        const fee = txInMemPool.fees['base'] * 10 ** 8;
        return {
            txId,
            rawTx,
            size: txInMemPool.vsize,
            weight: txInMemPool.weight,
            fee: fee,
            satsPerVByte: (fee / (txInMemPool.weight / 4)).toFixed(2),
        };
    }
}
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map