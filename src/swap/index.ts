import { unisatSwap } from './unisat/unisat'
import { okxSwap } from './okx'
import { Marketplaces, ProcessOfferOptions, SwapResponse, marketplaceName } from './types'
import { ordinalWalletSwap } from './ordinals-wallet/ordinals-wallet'


export async function processOffer (options: ProcessOfferOptions): Promise<SwapResponse>{
    switch (marketplaceName[options.offer.marketplace]){
        case Marketplaces.UNISAT:
            return await unisatSwap(options);
        case Marketplaces.ORDINALS_WALLET:
            return await ordinalWalletSwap(options);
        case Marketplaces.OKX:
            return await okxSwap(options);
    }
}