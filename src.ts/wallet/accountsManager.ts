import { HdKeyring } from './hdKeyring'
import { publicKeyToAddress } from './accounts'
import { AddressType, oylAccounts } from '../shared/interface'
import Mnemonic from 'bitcore-mnemonic'

const genMnemonic = new Mnemonic(Mnemonic.Words.ENGLISH).toString()
const defaultPaths = {
  taprootPath: "m/86'/0'/0'/0",
  initializedFrom: "default",
  segwitPath: "m/84'/0'/0'/0",
  segwitAddressType: AddressType.P2WPKH,
}
const customPaths = {
  xverse: {
    taprootPath: "m/86'/0'/0'/0",
    initializedFrom: "xverse",
    segwitPath: "m/49'/0'/0'/0",
    segwitAddressType: AddressType.P2SH_P2WPKH,
  },
  leather: {
    taprootPath: "m/86'/0'/0'/0",
    segwitPath: "m/84'/0'/0'/0",
    initializedFrom: "leather",
    segwitAddressType: AddressType.P2WPKH,
  },
  unisat: {
    taprootPath: "m/86'/0'/0'/0",
    segwitPath: "m/84'/0'/0'/0",
    initializedFrom: "unisat",
    segwitAddressType: AddressType.P2WPKH,
  },
}

export class AccountManager {
  private mnemonic: string = genMnemonic
  private taprootKeyring: any
  private segwitKeyring: any
  public activeIndexes: number[]
  private hdPath: any

  constructor(options?) {
    this.mnemonic = options?.mnemonic
    this.activeIndexes = options?.activeIndexes
    this.hdPath = options?.customPath
      ? customPaths[options.customPath]
      : defaultPaths
    this.taprootKeyring = new HdKeyring({
      mnemonic: this.mnemonic || genMnemonic,
      hdPath: this.hdPath.taprootPath,
      activeIndexes: this.activeIndexes,
    })
    this.segwitKeyring = new HdKeyring({
      mnemonic: this.mnemonic || genMnemonic,
      hdPath: this.hdPath.segwitPath,
      activeIndexes: this.activeIndexes,
    })
  }

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
      publicKeyToAddress(segwitAccounts[0], this.hdPath.segwitAddressType)!
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
      initializedFrom: this.hdPath.initializedFrom,
      mnemonic: genMnemonic,
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
        publicKeyToAddress(segwitAccounts[i], this.hdPath.segwitAddressType)!
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
      initializedFrom: this.hdPath.initializedFrom,
      mnemonic: this.mnemonic,
    }
    return ret
  }

  async addAccount(): Promise<oylAccounts> {
    await this.taprootKeyring.addAccounts(1)
    await this.segwitKeyring.addAccounts(1)
    const taprootAcccounts = await this.taprootKeyring.getAccounts()
    const segwitAccounts = await this.segwitKeyring.getAccounts()
    console.log(taprootAcccounts)
    const taprootAddresses: string[] = []
    const segwitAddresses: string[] = []
    let i = 0
    while (i < taprootAcccounts.length) {
      taprootAddresses.push(
        publicKeyToAddress(taprootAcccounts[i], AddressType.P2TR)!
      )
      segwitAddresses.push(
        publicKeyToAddress(segwitAccounts[i], this.hdPath.segwitAddressType)!
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
      initializedFrom: this.hdPath.initializedFrom,
      mnemonic: this.mnemonic,
    }
    return ret
  }
}
