"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInscriptionListingUnsignedPsbt = exports.buildDummyAndPaymentUtxos = exports.mergeSignedPsbt = exports.genBrcAndOrdinalUnsignedPsbt = void 0;
const tslib_1 = require("tslib");
const helpers_1 = require("../helpers");
const coin_bitcoin_1 = require("@okxweb3/coin-bitcoin");
const bitcoin = tslib_1.__importStar(require("bitcoinjs-lib"));
function genBrcAndOrdinalUnsignedPsbt({ address, utxos, network, pubKey, orderPrice, sellerPsbt, feeRate, receiveAddress }) {
    const data = buildDummyAndPaymentUtxos({ utxos, feeRate, orderPrice, address, receiveAddress, sellerPsbt });
    const buyingData = data;
    const buyerPsbt = (0, coin_bitcoin_1.generateUnsignedBuyingPsbt)(buyingData, network, pubKey);
    //base64 format
    return buyerPsbt;
}
exports.genBrcAndOrdinalUnsignedPsbt = genBrcAndOrdinalUnsignedPsbt;
function mergeSignedPsbt(signedBuyerPsbt, sellerPsbt) {
    const mergedPsbt = (0, coin_bitcoin_1.mergeSignedBuyingPsbt)(signedBuyerPsbt, sellerPsbt);
    return mergedPsbt.toBase64();
}
exports.mergeSignedPsbt = mergeSignedPsbt;
function buildDummyAndPaymentUtxos({ utxos, feeRate, orderPrice, address, receiveAddress, sellerPsbt }) {
    const allUtxosWorth600 = (0, helpers_1.getAllUTXOsWorthASpecificValue)(utxos, 600);
    if (allUtxosWorth600.length < 2) {
        throw new Error('not enough padding utxos (600 sat) for marketplace buy');
    }
    const dummyUtxos = [];
    for (let i = 0; i < 2; i++) {
        dummyUtxos.push({
            txHash: allUtxosWorth600[i].txId,
            vout: allUtxosWorth600[i].outputIndex,
            coinAmount: allUtxosWorth600[i].satoshis,
        });
    }
    const amountNeeded = orderPrice + parseInt((helpers_1.ESTIMATE_TX_SIZE * feeRate).toFixed(0));
    const retrievedUtxos = (0, helpers_1.getUTXOsToCoverAmount)({
        utxos,
        amountNeeded,
        excludedUtxos: allUtxosWorth600
    });
    if (retrievedUtxos.length === 0) {
        throw new Error('Not enough funds to purchase this offer');
    }
    const paymentUtxos = [];
    retrievedUtxos.forEach((utxo) => {
        paymentUtxos.push({
            txHash: utxo.txId,
            vout: utxo.outputIndex,
            coinAmount: utxo.satoshis,
        });
    });
    const data = {
        dummyUtxos,
        paymentUtxos,
    };
    data['receiveNftAddress'] = receiveAddress;
    data['paymentAndChangeAddress'] = address;
    data['feeRate'] = feeRate;
    data['sellerPsbts'] = [sellerPsbt];
    return data;
}
exports.buildDummyAndPaymentUtxos = buildDummyAndPaymentUtxos;
async function generateInscriptionListingUnsignedPsbt(inscriptionListingData, network, pubKey) {
    console.log("inscriptionListingData", inscriptionListingData);
    const listingData = {
        nftAddress: inscriptionListingData.nftAddress,
        nftUtxo: {
            txHash: "e7e023d1acab9eadc51c68100ec50230167c6b9d1dc5bb7b6ab98ad9cca90401",
            vout: 0,
            coinAmount: 331,
            rawTransation: ""
        },
        receiveBtcAddress: inscriptionListingData.receiveBtcAddress,
        price: inscriptionListingData.price
    };
    console.log("listingData", listingData);
    const psbtBase64 = (0, coin_bitcoin_1.generateUnsignedListingPsbt)(listingData, network, pubKey);
    const unsignedPsbtHex = (bitcoin.Psbt.fromBase64(psbtBase64, { network })).toHex();
    return unsignedPsbtHex;
}
exports.generateInscriptionListingUnsignedPsbt = generateInscriptionListingUnsignedPsbt;
//# sourceMappingURL=nft.js.map