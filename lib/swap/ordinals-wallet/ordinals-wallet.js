"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPsbt = exports.getSellerPsbt = void 0;
const interface_1 = require("shared/interface");
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
//# sourceMappingURL=ordinals-wallet.js.map