import { HdKeyring } from './hdKeyring'
import { publicKeyToAddress } from './accounts'
import { AddressType, oylAccounts } from '../shared/interface'

export class AccountManager {
  private mnemonic: string
  private taprootKeyring: any
  private segwitKeyring: any
  public activeIndexes: number[]
  public taprootPath: string = "m/49'/0'/0'"
  public segwitPath: string = "m/84'/0'/0'"

  constructor(options) {
    this.mnemonic = options?.mnemonic
    this.activeIndexes = options?.activeIndexes
    this.taprootKeyring = new HdKeyring({
      mnemonic: this.mnemonic,
      hdPath: this.taprootPath,
      activeIndexes: this.activeIndexes,
    })
    this.segwitKeyring = new HdKeyring({
      mnemonic: this.mnemonic,
      hdPath: this.segwitPath,
      activeIndexes: this.activeIndexes,
    })
  }

  //

  async initializeAccounts(): Promise<oylAccounts> {
    await this.taprootKeyring.addAccounts(1)
    await this.segwitKeyring.addAccounts(1)
    const taprootAcccounts = await this.taprootKeyring.getAccounts()
    const segwitAccounts = await this.segwitKeyring.getAccounts()
    const taprootAddresses: string[] = []
    const segwitAddresses: string[] = []
    taprootAddresses.push(
      publicKeyToAddress(taprootAcccounts[0], AddressType.P2TR)!
    )
    segwitAddresses.push(
      publicKeyToAddress(segwitAccounts[0], AddressType.P2WPKH)!
    )
    const ret: oylAccounts = {
      taproot: {
        taprootKeyring: this.taprootKeyring,
        taprootAddresses,
      },
      segwit: {
        segwitKeyring: this.segwitKeyring,
        segwitAddresses,
      },
      mnemonic: this.mnemonic,
    }
    return ret
  }

  async recoverAccounts(): Promise<oylAccounts> {
    const taprootAcccounts = await this.taprootKeyring.getAccounts()
    const segwitAccounts = await this.segwitKeyring.getAccounts()
    const taprootAddresses: string[] = []
    const segwitAddresses: string[] = []
    let i = 0
    while (i < taprootAcccounts.length) {
      taprootAddresses.push(
        publicKeyToAddress(taprootAcccounts[i], AddressType.P2TR)!
      )
      segwitAddresses.push(
        publicKeyToAddress(segwitAccounts[i], AddressType.P2WPKH)!
      )
      i++
    }
    const ret: oylAccounts = {
      taproot: {
        taprootKeyring: this.taprootKeyring,
        taprootAddresses,
      },
      segwit: {
        segwitKeyring: this.segwitKeyring,
        segwitAddresses,
      },
      mnemonic: this.mnemonic,
    }
    return ret
  }

  async addAccount(): Promise<oylAccounts> {
    await this.taprootKeyring.addAccounts(1)
    await this.segwitKeyring.addAccounts(1)
    const taprootAcccounts = await this.taprootKeyring.getAccounts()
    const segwitAccounts = await this.segwitKeyring.getAccounts()
    const taprootAddresses: string[] = []
    const segwitAddresses: string[] = []
    let i = 0
    while (i < taprootAcccounts.length) {
      taprootAddresses.push(
        publicKeyToAddress(taprootAcccounts[i], AddressType.P2TR)!
      )
      segwitAddresses.push(
        publicKeyToAddress(segwitAccounts[i], AddressType.P2WPKH)!
      )
      i++
    }
    const ret: oylAccounts = {
      taproot: {
        taprootKeyring: this.taprootKeyring,
        taprootAddresses,
      },
      segwit: {
        segwitKeyring: this.segwitKeyring,
        segwitAddresses,
      },
      mnemonic: this.mnemonic,
    }
    return ret
  }
}
