import { MarketplaceOffer, ProcessOfferOptions, SwapResponse } from '../types'
import { Provider } from '../../provider'
import { AddressType, AssetType, FormattedUtxo } from '../../shared/interface'
import { getAddressType, timeout } from '../..'
import { Signer } from '../../signer'
import { prepareAddressForDummyUtxos, updateUtxos } from '../helpers'

export interface UnsignedOrdinalsWalletBid {
  address: string
  publicKey: string
  feeRate: number
  provider: Provider
  assetType: AssetType
  inscriptions?: string[]
  outpoints?: string[]
}

export interface signedOrdinalsWalletBid {
  psbt: string
  provider: Provider
  assetType: AssetType
}

export async function getSellerPsbt(unsignedBid: UnsignedOrdinalsWalletBid) {
  const {
    assetType,
    address,
    publicKey,
    feeRate,
    provider,
    inscriptions,
    outpoints,
  } = unsignedBid
  switch (assetType) {
    case AssetType.BRC20:
      return await provider.api.getOrdinalsWalletNftOfferPsbt({
        address,
        publicKey,
        feeRate,
        inscriptions,
      })

    case AssetType.RUNES:
      return await provider.api.getOrdinalsWalletRuneOfferPsbt({
        address,
        publicKey,
        feeRate,
        outpoints,
      })

    case AssetType.COLLECTIBLE:
      return await provider.api.getOrdinalsWalletNftOfferPsbt({
        address,
        publicKey,
        feeRate,
        inscriptions,
      })
  }
}

export async function submitPsbt(signedBid: signedOrdinalsWalletBid) {
  const { assetType, psbt, provider } = signedBid
  switch (assetType) {
    case AssetType.BRC20:
      return await provider.api.submitOrdinalsWalletBid({ psbt })

    case AssetType.RUNES:
      return await provider.api.submitOrdinalsWalletBid({ psbt })

    case AssetType.COLLECTIBLE:
      return await provider.api.submitOrdinalsWalletBid({ psbt })
  }
}

export async function ordinalWalletSwap({
  address,
  offer,
  receiveAddress,
  feeRate,
  pubKey,
  assetType,
  provider,
  utxos,
  signer,
}: ProcessOfferOptions): Promise<SwapResponse> {
  let dummyTxId: string | null = null
  let purchaseTxId: string | null = null

  const addressType = getAddressType(address)
  if (addressType != AddressType.P2TR)
    throw new Error('Can only purchase with taproot on ordinalswallet')
  const network = provider.network

  const psbtForDummyUtxos = await prepareAddressForDummyUtxos({
    address,
    utxos,
    network,
    pubKey,
    feeRate,
    addressType,
  })

  if (psbtForDummyUtxos != null) {
    const { psbtBase64, inputTemplate, outputTemplate } = psbtForDummyUtxos
    const { signedPsbt } = await signer.signAllInputs({
      rawPsbt: psbtBase64,
      finalize: true,
    })

    const { txId } = await provider.pushPsbt({ psbtBase64: signedPsbt })
    dummyTxId = txId
    await timeout(5000)
    utxos = await updateUtxos({
      originalUtxos: utxos,
      txId,
      spendAddress: address,
      provider,
    })
  }
  const unsignedBid: UnsignedOrdinalsWalletBid = {
    address,
    publicKey: pubKey,
    feeRate,
    provider,
    assetType,
  }
  if (assetType === AssetType.RUNES) {
    unsignedBid['outpoints'] = [offer.outpoint]
  } else {
    unsignedBid['inscriptions'] = [offer.inscriptionId]
  }

  const sellerData = await getSellerPsbt(unsignedBid)
  const sellerPsbt = sellerData.data.purchase

  const signedPsbt = await signer.signAllInputs({
    rawPsbtHex: sellerPsbt,
    finalize: true,
  })

  const data = await submitPsbt({
    psbt: signedPsbt.signedHexPsbt,
    assetType,
    provider,
  })
  if (data.success) purchaseTxId = data.purchase
  return {
    dummyTxId,
    purchaseTxId,
  }
}
