"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOkxListing = exports.processOkxOffer = exports.getBuyerPsbt = exports.submitSignedPsbt = exports.getSellerPsbt = void 0;
const __1 = require("../..");
const interface_1 = require("../../shared/interface");
const nft_1 = require("./nft");
const helpers_1 = require("../helpers");
const runes_1 = require("./runes");
async function getSellerPsbt(unsignedBid) {
    switch (unsignedBid.assetType) {
        case interface_1.AssetType.BRC20:
            return await unsignedBid.provider.api.getOkxOfferPsbt({ offerId: unsignedBid.offerId });
        case interface_1.AssetType.RUNES:
            return await unsignedBid.provider.api.getOkxOfferPsbt({ offerId: unsignedBid.offerId, rune: true });
        case interface_1.AssetType.COLLECTIBLE:
            return await unsignedBid.provider.api.getOkxOfferPsbt({ offerId: unsignedBid.offerId });
    }
}
exports.getSellerPsbt = getSellerPsbt;
async function submitSignedPsbt(signedBid) {
    const offer = signedBid.offer;
    switch (signedBid.assetType) {
        case interface_1.AssetType.BRC20:
            const brcPayload = {
                ticker: offer.ticker,
                price: offer.totalPrice,
                amount: parseInt(offer.amount),
                fromAddress: signedBid.fromAddress,
                toAddress: offer.address,
                inscriptionId: offer.inscriptionId,
                buyerPsbt: signedBid.psbt,
                orderId: offer.offerId,
                brc20: true
            };
            return await signedBid.provider.api.submitOkxBid(brcPayload);
        case interface_1.AssetType.RUNES:
            const runePayload = {
                fromAddress: signedBid.fromAddress,
                psbt: signedBid.psbt,
                orderId: offer.offerId,
            };
            return await signedBid.provider.api.submitOkxRuneBid(runePayload);
        case interface_1.AssetType.COLLECTIBLE:
            const collectiblePayload = {
                ticker: offer.ticker,
                price: offer.totalPrice,
                amount: parseInt(offer.amount),
                fromAddress: signedBid.fromAddress,
                toAddress: offer.address,
                inscriptionId: offer.inscriptionId,
                buyerPsbt: signedBid.psbt,
                orderId: offer.offerId,
                brc20: false
            };
            return await signedBid.provider.api.submitOkxBid(collectiblePayload);
    }
}
exports.submitSignedPsbt = submitSignedPsbt;
async function getBuyerPsbt(unsignedPsbt) {
    switch (unsignedPsbt.assetType) {
        case interface_1.AssetType.BRC20:
            return (0, nft_1.genBrcAndOrdinalUnsignedPsbt)(unsignedPsbt);
        case interface_1.AssetType.RUNES:
            return await (0, runes_1.buildOkxRunesPsbt)(unsignedPsbt);
        case interface_1.AssetType.COLLECTIBLE:
            return (0, nft_1.genBrcAndOrdinalUnsignedPsbt)(unsignedPsbt);
    }
}
exports.getBuyerPsbt = getBuyerPsbt;
async function processOkxOffer({ address, offer, receiveAddress, feeRate, pubKey, assetType, provider, utxos, signer }) {
    let dummyTxId = null;
    let purchaseTxId = null;
    const addressType = (0, __1.getAddressType)(address);
    const network = provider.network;
    const psbtForDummyUtxos = (assetType != interface_1.AssetType.RUNES)
        ?
            await (0, helpers_1.prepareAddressForDummyUtxos)({ address, utxos, network, pubKey, feeRate, addressType })
        :
            null;
    if (psbtForDummyUtxos != null) {
        const { psbtBase64, inputTemplate, outputTemplate } = psbtForDummyUtxos;
        const { signedPsbt } = await signer.signAllInputs({
            rawPsbt: psbtBase64,
            finalize: true,
        });
        const { txId } = await provider.pushPsbt({ psbtBase64: signedPsbt });
        dummyTxId = txId;
        await (0, __1.timeout)(30000);
        utxos = await (0, helpers_1.updateUtxos)({
            originalUtxos: utxos,
            txId,
            spendAddress: address,
            provider
        });
    }
    const unsignedBid = {
        offerId: offer.offerId,
        provider,
        assetType
    };
    const sellerData = await getSellerPsbt(unsignedBid);
    const sellerPsbt = sellerData.data.sellerPsbt;
    const decodedPsbt = await provider.sandshrew.bitcoindRpc.decodePSBT(sellerPsbt);
    const sellerAddress = offer?.address;
    const buyerPsbt = await getBuyerPsbt({
        address,
        utxos,
        feeRate,
        receiveAddress,
        network,
        pubKey,
        addressType,
        sellerPsbt,
        sellerAddress: sellerAddress,
        orderPrice: offer.totalPrice,
        assetType,
        decodedPsbt
    });
    const { signedPsbt } = await signer.signAllInputs({
        rawPsbt: buyerPsbt,
        finalize: false
    });
    let finalPsbt = signedPsbt;
    if (assetType != interface_1.AssetType.RUNES)
        finalPsbt = (0, nft_1.mergeSignedPsbt)(signedPsbt, [sellerPsbt]);
    const transaction = await submitSignedPsbt({
        fromAddress: address,
        psbt: finalPsbt,
        assetType,
        provider,
        offer: offer
    });
    if (transaction?.statusCode == 200 || transaction?.data) {
        purchaseTxId = transaction.data;
        return {
            dummyTxId,
            purchaseTxId
        };
    }
    else {
        throw new __1.OylTransactionError(new Error(JSON.stringify(transaction)));
    }
}
exports.processOkxOffer = processOkxOffer;
async function processOkxListing({ address, listing, receiveBtcAddress, pubKey, receiveBtcPubKey, assetType, provider, signer, }) {
    const marketplaceType = listing.marketplace;
    if (assetType == interface_1.AssetType.COLLECTIBLE) {
        const listingDataRequest = {
            inscriptionId: listing.inscriptionId,
        };
        const listings = [listingDataRequest];
        const okxGetListingPsbt = {
            marketplaceType,
            assetType,
            sellerAddress: address,
            sellerPublicKey: pubKey,
            listings
        };
        const listingPsbtResponse = await provider.api.getListingPsbt(okxGetListingPsbt);
        if (listingPsbtResponse.statusCode != 200) {
            throw new Error(`Failed to get listing psbt: ${listingPsbtResponse.error}`);
        }
        const listingPsbt = listingPsbtResponse.data;
        const listingData = {
            nftAddress: address,
            nftUtxo: listing.utxo,
            receiveBtcAddress,
            price: listing.price
        };
        const unsignedPsbtHex = await (0, nft_1.generateInscriptionListingUnsignedPsbt)(listingData, provider.network, pubKey);
        const { signedPsbt } = await signer.signAllInputs({
            rawPsbtHex: unsignedPsbtHex,
            finalize: false
        });
        const listingPsbtData = {
            nftId: listingPsbt.additionalData.nftId,
            inscriptionId: listing.inscriptionId,
            unitPrice: listing.unitPrice,
            totalPrice: listing.totalPrice
        };
        const okxSubmitListingPsbt = {
            marketplaceType,
            assetType,
            sellerAddress: address,
            sellerPublicKey: pubKey,
            signedPsbt: signedPsbt,
            listings: [listingPsbtData]
        };
        console.log("okxSubmitListingPsbt", okxSubmitListingPsbt);
        const submitListingPsbtResponse = await provider.api.submitListingPsbt(okxSubmitListingPsbt);
        if (submitListingPsbtResponse.statusCode != 200) {
            throw new Error(`Failed to submit listing psbt: ${submitListingPsbtResponse.error}`);
        }
        const submitListingPsbt = submitListingPsbtResponse.data;
        return {
            success: submitListingPsbt.success,
            listingId: listing.inscriptionId
        };
    }
}
exports.processOkxListing = processOkxListing;
//# sourceMappingURL=okx.js.map