import { internalPubKeyToTaprootAddress } from "../shared/utils";

const stripHexPrefix = (v) => v.substr(0, 2) === '0x' ? v.substr(2) : v;

export const fetchFrBtcSigner = async (request, provider) => {
    
    try {
        const result = await provider.alkanes.simulate(request)
        return Buffer.from(stripHexPrefix(result.parsed.string), 'hex')
        
      } catch (error) {
        console.error(
          `Error getting signer for wrap`,
          error
        )
      }
}

export const getWrapAddress = async (provider, request) => {
    return internalPubKeyToTaprootAddress(await fetchFrBtcSigner(request, provider), provider.network)
}