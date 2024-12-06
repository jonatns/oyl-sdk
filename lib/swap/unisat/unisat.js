"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageSignature = exports.processUnisatListing = exports.processUnisatOffer = exports.submitBuyerPsbt = exports.getSellerPsbt = void 0;
const interface_1 = require("../../shared/interface");
const __1 = require("../..");
const BIP322_1 = require("./BIP322");
async function getSellerPsbt(unsignedBid) {
    switch (unsignedBid.assetType) {
        case interface_1.AssetType.BRC20:
            return await unsignedBid.provider.api.initSwapBid(unsignedBid);
        case interface_1.AssetType.RUNES:
            return await unsignedBid.provider.api.initRuneSwapBid(unsignedBid);
        case interface_1.AssetType.COLLECTIBLE:
            return await unsignedBid.provider.api.initCollectionSwapBid(unsignedBid);
    }
}
exports.getSellerPsbt = getSellerPsbt;
async function submitBuyerPsbt(signedBid) {
    switch (signedBid.assetType) {
        case interface_1.AssetType.BRC20:
            return await signedBid.provider.api.submitSignedBid({ ...signedBid, psbtBid: signedBid.psbtHex });
        case interface_1.AssetType.RUNES:
            return await signedBid.provider.api.submitSignedRuneBid({ ...signedBid, psbtBid: signedBid.psbtHex });
        case interface_1.AssetType.COLLECTIBLE:
            return await signedBid.provider.api.submitSignedCollectionBid({ ...signedBid, psbtBid: signedBid.psbtHex });
    }
}
exports.submitBuyerPsbt = submitBuyerPsbt;
async function processUnisatOffer({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }) {
    let dummyTxId = null;
    let purchaseTxId = null;
    const unsignedBid = {
        address,
        auctionId: offer.offerId,
        bidPrice: offer.totalPrice,
        pubKey,
        receiveAddress,
        feerate: feeRate,
        provider,
        assetType
    };
    if (address != receiveAddress) {
        const signature = await getMessageSignature({ address, provider, receiveAddress, signer });
        unsignedBid['signature'] = signature;
    }
    const psbt_ = await getSellerPsbt(unsignedBid);
    if (psbt_?.error) {
        throw new __1.OylTransactionError(psbt_?.error);
    }
    if (psbt_.psbtDummy) {
        const unsignedDummyPsbt = psbt_.psbtDummy;
        const signedDummyPsbt = await signer.signAllInputs({
            rawPsbtHex: unsignedDummyPsbt,
            finalize: true,
        });
        await provider.pushPsbt({ psbtBase64: signedDummyPsbt.signedPsbt });
    }
    const unsignedPsbt = psbt_.psbtBid;
    const signedPsbt = await signer.signAllInputs({
        rawPsbtHex: unsignedPsbt,
        finalize: false,
    });
    const data = await submitBuyerPsbt({
        psbtHex: signedPsbt.signedHexPsbt,
        auctionId: offer.offerId,
        bidId: psbt_.bidId,
        assetType,
        provider
    });
    if (data.txid) {
        purchaseTxId = data.txid;
    }
    return {
        dummyTxId,
        purchaseTxId
    };
}
exports.processUnisatOffer = processUnisatOffer;
async function processUnisatListing({ address, listing, receiveBtcAddress, pubKey, receiveBtcPubKey, assetType, provider, signer, }) {
    const listings = [];
    const marketplaceType = listing.marketplace;
    listings.push({
        inscriptionId: listing?.inscriptionId,
        price: listing?.price,
        unitPrice: listing?.unitPrice,
        totalPrice: listing?.totalPrice,
        sellerReceiveAddress: receiveBtcAddress,
        utxo: listing?.utxo.txId
    });
    const unisatGetListingPsbt = {
        marketplaceType,
        assetType,
        sellerAddress: address,
        sellerPublicKey: pubKey,
        listings
    };
    const listingPsbtResponse = await provider.api.getListingPsbt(unisatGetListingPsbt);
    if (listingPsbtResponse.statusCode != 200) {
        throw new Error(`Failed to get listing psbt: ${listingPsbtResponse.error}`);
    }
    const listingPsbt = listingPsbtResponse.data;
    const listingId = listingPsbt.additionalData.auctionId;
    const { signedHexPsbt } = await signer.signAllInputs({
        rawPsbtHex: listingPsbt.psbt,
        finalize: false,
    });
    const unisatSubmitListingPsbt = {
        marketplaceType,
        assetType,
        sellerAddress: address,
        sellerPublicKey: pubKey,
        signedPsbt: signedHexPsbt,
        orderId: listingId
    };
    const submitListingPsbtResponse = await provider.api.submitListingPsbt(unisatSubmitListingPsbt);
    if (submitListingPsbtResponse.statusCode != 200) {
        throw new Error(`Failed to submit listing psbt: ${submitListingPsbtResponse.error}`);
    }
    const submitListingPsbt = submitListingPsbtResponse.data;
    return {
        success: submitListingPsbt.success,
        listingId
    };
}
exports.processUnisatListing = processUnisatListing;
async function getMessageSignature({ address, receiveAddress, signer, provider }) {
    const message = `Please confirm that\nPayment Address: ${address}\nOrdinals Address: ${receiveAddress}`;
    if ((0, __1.getAddressType)(receiveAddress) == interface_1.AddressType.P2WPKH) {
        const keyPair = signer.segwitKeyPair;
        const privateKey = keyPair.privateKey;
        const signature = await (0, BIP322_1.signBip322Message)({
            message,
            network: provider.networkType,
            privateKey,
            signatureAddress: receiveAddress,
        });
        return signature;
    }
    else if ((0, __1.getAddressType)(receiveAddress) == interface_1.AddressType.P2TR) {
        const keyPair = signer.taprootKeyPair;
        const privateKey = keyPair.privateKey;
        const signature = await (0, BIP322_1.signBip322Message)({
            message,
            network: provider.networkType,
            privateKey,
            signatureAddress: receiveAddress,
        });
        return signature;
    }
}
exports.getMessageSignature = getMessageSignature;
//# sourceMappingURL=unisat.js.map