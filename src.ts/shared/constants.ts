import { NetworkOptions } from './interface'

export const UTXO_DUST = 546

export const maximumScriptBytes = 520

export const MAXIMUM_FEE = 5000000

export const getBrc20Data = ({
  amount,
  tick,
}: {
  amount: number | string
  tick: string
}) => ({
  mediaContent: `{"p":"brc-20","op":"transfer","tick":"${tick}","amt":"${amount}"}`,
  mediaType: 'text/plain',
})

export const defaultNetworkOptions: NetworkOptions = {
  baseUrl: 'https://mainnet.sandshrew.io',
  version: 'v1',
  projectId: 'd6aebfed1769128379aca7d215f0b689', // default mainnet API key
}
