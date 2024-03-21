import { Oyl } from '../oylib';
import { defaultNetworkOptions } from '../shared/constants'

export const getAllInscriptionsByAddressRegtest = async (address: string) => {
  const oyl = new Oyl(defaultNetworkOptions.regtest)

  const utxosResponse = await oyl.esploraRpc.getAddressUtxo(address)
  const data = []

  const inscriptionUtxos = utxosResponse.filter((utxo) => utxo.value == 546)

  for (const utxo of inscriptionUtxos) {
    if (utxo.txid) {
      const transactionDetails = await oyl.ordRpc.getTxOutput(utxo.txid + ':' + utxo.vout)
      const {inscription_id, inscription_number, satpoint, content_type, address} = await oyl.ordRpc.getInscriptionById(transactionDetails.inscriptions[0])
      if (inscription_id) {
        data.push({
          inscription_id,
          inscription_number,
          satpoint,
          mime_type: content_type,
          owner_wallet_addr: address
        })
      }
    }
  }

  return {
    statusCode: 200,
    data
  }  
}

