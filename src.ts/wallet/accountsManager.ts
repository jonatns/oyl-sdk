import { HdKeyring } from './hdKeyring'
import { publicKeyToAddress } from './accounts'
import {
  AddressType,
  RecoverAccountOptions,
  oylAccounts,
} from '../shared/interface'
import * as bitcoin from 'bitcoinjs-lib'
import Mnemonic from 'bitcore-mnemonic'
import { getNetwork } from '../shared/utils'

export const customPaths = {
  oyl: {
    taprootPath: "m/86'/0'/0'/0",
    initializedFrom: 'oyl',
    segwitPath: "m/84'/0'/0'/0",
    segwitAddressType: AddressType.P2WPKH,
  },
  xverse: {
    taprootPath: "m/86'/0'/0'/0",
    initializedFrom: 'xverse',
    segwitPath: "m/49'/0'/0'/0",
    segwitAddressType: AddressType.P2SH_P2WPKH,
  },
  leather: {
    taprootPath: "m/86'/0'/0'/0",
    segwitPath: "m/84'/0'/0'/0",
    initializedFrom: 'leather',
    segwitAddressType: AddressType.P2WPKH,
  },
  unisat: {
    taprootPath: "m/86'/0'/0'/0",
    segwitPath: "m/84'/0'/0'/0",
    initializedFrom: 'unisat',
    segwitAddressType: AddressType.P2WPKH,
  },
  testnet: {
    taprootPath: "m/86'/1'/0'/0",
    initializedFrom: 'testnet',
    segwitPath: "m/84'/1'/0'/0",
    segwitAddressType: AddressType.P2WPKH,
  },
}

export class AccountManager {
  private mnemonic: string
  private taprootKeyring: any
  private segwitKeyring: any
  public activeIndexes: number[]
  public network: bitcoin.Network
  private hdPath: any

  /**
   * Initializes a new AccountManager instance with the given options.
   *
   * @param options - Configuration options for the AccountManager.
   */
  constructor(options: RecoverAccountOptions) {
    this.mnemonic =
      options?.mnemonic || new Mnemonic(Mnemonic.Words.ENGLISH).toString()
    this.activeIndexes = options?.activeIndexes
    this.network = options.network
    this.hdPath = options.customPath
      ? customPaths[options.customPath]
      : customPaths.oyl

    if (this.network === bitcoin.networks.testnet) {
      this.hdPath =
        options.customPath === 'unisat'
          ? customPaths.unisat
          : customPaths.testnet
    }

    this.taprootKeyring = new HdKeyring({
      mnemonic: this.mnemonic,
      hdPath: this.hdPath.taprootPath,
      activeIndexes: this.activeIndexes,
      network: this.network,
    })
    this.segwitKeyring = new HdKeyring({
      mnemonic: this.mnemonic,
      hdPath: this.hdPath.segwitPath,
      activeIndexes: this.activeIndexes,
      network: this.network,
    })
  }

  /**
   * Initializes taproot and segwit accounts by generating the necessary addresses.
   *
   * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the initialized accounts.
   */
  async initializeAccounts(): Promise<oylAccounts> {
    await this.taprootKeyring.addAccounts(1)
    await this.segwitKeyring.addAccounts(1)
    const taprootAccounts = await this.taprootKeyring.getAccounts()
    const segwitAccounts = await this.segwitKeyring.getAccounts()
    const taprootAddresses: string[] = []
    const segwitAddresses: string[] = []
    taprootAddresses.push(
      publicKeyToAddress(taprootAccounts[0], AddressType.P2TR, this.network)!
    )
    segwitAddresses.push(
      publicKeyToAddress(
        segwitAccounts[0],
        this.hdPath.segwitAddressType,
        this.network
      )!
    )
    const ret: oylAccounts = {
      taproot: {
        taprootKeyring: this.taprootKeyring,
        taprootPubKey: taprootAccounts[0].toString('hex'),
        taprootAddresses,
      },
      segwit: {
        segwitKeyring: this.segwitKeyring,
        segwitPubKey: taprootAccounts[0].toString('hex'),
        segwitAddresses,
      },
      initializedFrom: this.hdPath.initializedFrom,
      mnemonic: this.mnemonic,
    }
    return ret
  }

  /**
   * Recovers existing accounts by fetching and converting the public keys to addresses.
   *
   * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the recovered accounts.
   */
  async recoverAccounts(): Promise<oylAccounts> {
    const taprootAccounts = await this.taprootKeyring.getAccounts()
    const segwitAccounts = await this.segwitKeyring.getAccounts()
    const taprootAddresses: string[] = []
    const segwitAddresses: string[] = []
    let i = 0
    while (i < taprootAccounts.length) {
      taprootAddresses.push(
        publicKeyToAddress(taprootAccounts[i], AddressType.P2TR, this.network)!
      )
      segwitAddresses.push(
        publicKeyToAddress(
          segwitAccounts[i],
          this.hdPath.segwitAddressType,
          this.network
        )!
      )
      i++
    }
    const ret: oylAccounts = {
      taproot: {
        taprootKeyring: this.taprootKeyring,
        taprootPubKey: taprootAccounts[0].toString('hex'),
        taprootAddresses,
      },
      segwit: {
        segwitKeyring: this.segwitKeyring,
        segwitPubKey: segwitAccounts[0].toString('hex'),
        segwitAddresses,
      },
      initializedFrom: this.hdPath.initializedFrom,
      mnemonic: this.mnemonic,
    }
    return ret
  }

  /**
   * Adds a new account for both taproot and segwit and returns the updated account information.
   *
   * @returns {Promise<oylAccounts>} A promise that resolves to an object containing the updated accounts.
   */
  async addAccount(): Promise<oylAccounts> {
    await this.taprootKeyring.addAccounts(1)
    await this.segwitKeyring.addAccounts(1)
    const taprootAccounts = await this.taprootKeyring.getAccounts()
    const segwitAccounts = await this.segwitKeyring.getAccounts()
    console.log(taprootAccounts)
    const taprootAddresses: string[] = []
    const segwitAddresses: string[] = []
    let i = 0
    while (i < taprootAccounts.length) {
      taprootAddresses.push(
        publicKeyToAddress(taprootAccounts[i], AddressType.P2TR, this.network)!
      )
      segwitAddresses.push(
        publicKeyToAddress(
          segwitAccounts[i],
          this.hdPath.segwitAddressType,
          this.network
        )!
      )
      i++
    }
    const ret: oylAccounts = {
      taproot: {
        taprootKeyring: this.taprootKeyring,
        taprootPubKey: taprootAccounts[0].toString('hex'),
        taprootAddresses,
      },
      segwit: {
        segwitKeyring: this.segwitKeyring,
        segwitPubKey: segwitAccounts[0].toString('hex'),
        segwitAddresses,
      },
      initializedFrom: this.hdPath.initializedFrom,
      mnemonic: this.mnemonic,
    }
    return ret
  }
}
