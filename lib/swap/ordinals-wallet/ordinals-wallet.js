"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordinalWalletSwap = exports.submitPsbt = exports.getSellerPsbt = void 0;
const interface_1 = require("shared/interface");
const __1 = require("../..");
const helpers_1 = require("../helpers");
async function getSellerPsbt(unsignedBid) {
    const { assetType, address, publicKey, feeRate, provider, inscriptions, outpoints } = unsignedBid;
    switch (assetType) {
        case interface_1.AssetType.BRC20:
            return await provider.api.getOrdinalsWalletNftOfferPsbt({ address, publicKey, feeRate, inscriptions });
        case interface_1.AssetType.RUNES:
            return await provider.api.getOrdinalsWalletRuneOfferPsbt({ address, publicKey, feeRate, outpoints });
        case interface_1.AssetType.COLLECTIBLE:
            return await provider.api.getOrdinalsWalletNftOfferPsbt({ address, publicKey, feeRate, inscriptions });
    }
}
exports.getSellerPsbt = getSellerPsbt;
async function submitPsbt(signedBid) {
    const { assetType, psbt, provider } = signedBid;
    switch (assetType) {
        case interface_1.AssetType.BRC20:
            return await provider.api.submitOrdinalsWalletBid({ psbt });
        case interface_1.AssetType.RUNES:
            return await provider.api.submitOrdinalsWalletBid({ psbt });
        case interface_1.AssetType.COLLECTIBLE:
            return await provider.api.submitOrdinalsWalletBid({ psbt });
    }
}
exports.submitPsbt = submitPsbt;
async function ordinalWalletSwap({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }) {
    let dummyTxId = null;
    let purchaseTxId = null;
    const addressType = (0, __1.getAddressType)(address);
    if (addressType != interface_1.AddressType.P2TR)
        throw new Error('Can only purchase with taproot on ordinalswallet');
    const network = provider.network;
    const psbtForDummyUtxos = await (0, helpers_1.prepareAddressForDummyUtxos)({ address, utxos, network, pubKey, feeRate, addressType });
    if (psbtForDummyUtxos != null) {
        const { psbtBase64, inputTemplate, outputTemplate } = psbtForDummyUtxos;
        const { signedPsbt } = await signer.signAllInputs({
            rawPsbt: psbtBase64,
            finalize: true,
        });
        const { txId } = await provider.pushPsbt({ psbtBase64: signedPsbt });
        dummyTxId = txId;
        await (0, __1.timeout)(5000);
        utxos = (0, helpers_1.updateUtxos)({
            originalUtxos: utxos,
            txId,
            inputTemplate,
            outputTemplate
        });
    }
    const unsignedBid = {
        address,
        publicKey: pubKey,
        feeRate,
        provider,
        assetType
    };
    if (assetType === interface_1.AssetType.RUNES) {
        unsignedBid["outpoints"] = [offer.outpoint];
    }
    else {
        unsignedBid["inscriptions"] = [offer.inscriptionId];
    }
    const sellerData = await getSellerPsbt(unsignedBid);
    const sellerPsbt = sellerData.data.purchase;
    const signedPsbt = await signer.signAllInputs({
        rawPsbtHex: sellerPsbt,
        finalize: true,
    });
    const data = await submitPsbt({
        psbt: signedPsbt.signedHexPsbt,
        assetType,
        provider
    });
    if (data.success)
        purchaseTxId = data.purchase;
    return {
        dummyTxId,
        purchaseTxId
    };
}
exports.ordinalWalletSwap = ordinalWalletSwap;
//# sourceMappingURL=ordinals-wallet.js.map