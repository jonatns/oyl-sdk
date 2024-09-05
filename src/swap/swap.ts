import { unisatSwap } from './unisat/unisat'
import { okxSwap } from './okx/okx'
import { Marketplaces, ProcessOfferOptions, SwapResponse, marketplaceName } from './types'
import { ordinalWalletSwap } from './ordinals-wallet/ordinals-wallet'
import { waitForTransaction } from 'shared/utils'


export async function processOffer (options: ProcessOfferOptions): Promise<SwapResponse>{
    let swapResponse: SwapResponse
    switch (marketplaceName[options.offer.marketplace]){
        case Marketplaces.UNISAT:
            swapResponse = await unisatSwap(options);
            break;
        case Marketplaces.ORDINALS_WALLET:
            swapResponse = await ordinalWalletSwap(options);
            break
        case Marketplaces.OKX:
            swapResponse = await okxSwap(options);
            break;
    }
    await waitForTransaction({
        txId: swapResponse.purchaseTxId,
        sandshrewBtcClient: this.sandshrew,
      })

    return swapResponse
}