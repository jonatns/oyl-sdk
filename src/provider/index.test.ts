import { networks } from 'bitcoinjs-lib'
import { Provider } from '.'
import * as dotenv from 'dotenv'

dotenv.config()

describe('Provider', () => {
  it('should instantiate a new provider with the specified api url', () => {
    const provider = new Provider({
      url: 'https://mainnet.sandshrew.io',
      projectId: process.env.SANDSHREW_PROJECT_ID!,
      network: networks.bitcoin,
      networkType: 'mainnet',
    })
    expect(provider).toBeDefined()
    expect(provider.api.toObject().host).toBe('http://localhost:9000')
  })
})
