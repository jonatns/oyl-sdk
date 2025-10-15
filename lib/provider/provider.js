"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const tslib_1 = require("tslib");
const sandshrew_1 = require("../rpclient/sandshrew");
const esplora_1 = require("../rpclient/esplora");
const ord_1 = require("../rpclient/ord");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
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
            throw new Error('Please supply PSBT in either base64 or hex format');
        }
        if (psbtHex && psbtBase64) {
            throw new Error('Please select only one format of PSBT to broadcast');
        }
        console.log('🔹 Loading PSBT...');
        const psbt = psbtHex
            ? bitcoin.Psbt.fromHex(psbtHex, { network: this.network })
            : bitcoin.Psbt.fromBase64(psbtBase64, { network: this.network });
        console.log('🔹 Extracting transaction from PSBT...');
        let extractedTx;
        try {
            extractedTx = psbt.extractTransaction();
        }
        catch (err) {
            throw new Error(`Transaction could not be extracted from PSBT: ${err}`);
        }
        const txId = extractedTx.getId();
        const rawTx = extractedTx.toHex();
        console.log(`📦 Transaction ID: ${txId}`);
        console.log('🔹 Testing mempool acceptance...');
        const [result] = await this.sandshrew.bitcoindRpc.testMemPoolAccept([rawTx]);
        if (!result.allowed) {
            throw new Error(`Mempool rejected transaction: ${result['reject-reason']}`);
        }
        console.log('🚀 Broadcasting transaction...');
        await this.sandshrew.bitcoindRpc.sendRawTransaction(rawTx);
        // Retry mempool check
        let txInfo;
        for (let i = 0; i < 10; i++) {
            try {
                txInfo = await this.sandshrew.bitcoindRpc.getMemPoolEntry(txId);
                if (txInfo)
                    break;
            }
            catch (_) { }
            await new Promise((r) => setTimeout(r, 1000));
        }
        // Fallback: check Esplora
        if (!txInfo) {
            console.log('⚠️ Transaction not found in mempool, checking Esplora...');
            const tx = await this.esplora.getTxInfo(txId);
            if (!tx || !tx.status.confirmed) {
                throw new Error('Transaction not found in mempool or confirmed');
            }
            txInfo = tx;
        }
        const fee = txInfo.fees?.base ? txInfo.fees.base * 1e8 : txInfo.fee;
        console.log('✅ Transaction broadcasted successfully!');
        return {
            txId,
            rawTx,
            size: txInfo.vsize ?? txInfo.size,
            weight: txInfo.weight,
            fee,
            satsPerVByte: (fee / ((txInfo.weight ?? txInfo.size * 4) / 4)).toFixed(2),
        };
    }
}
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map