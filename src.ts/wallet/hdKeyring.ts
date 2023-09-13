import * as bitcoin from 'bitcoinjs-lib'
import { ECPairInterface } from 'ecpair'
import bitcore from 'bitcore-lib'
import { isTaprootInput } from 'bitcoinjs-lib/src/psbt/bip371'
import { EventEmitter } from 'events'
import { tweakSigner, ECPair } from '../shared/utils'
import Mnemonic from 'bitcore-mnemonic'

const hdPathString = "m/86'/0'/0'/0"

interface HDKeyringOption {
  hdPath?: string
  mnemonic?: any
  activeIndexes?: number[]
  passphrase?: string
}

export class HdKeyring extends EventEmitter {
  mnemonic: any = null
  passphrase: string
  network: bitcoin.Network = bitcoin.networks.bitcoin
  hdPath: string
  root: bitcore.HDPrivateKey = null
  hdWallet?: Mnemonic
  wallets: ECPairInterface[] = []
  private _index2wallet: Record<number, [string, ECPairInterface]> = {}
  activeIndexes: number[] = []

  constructor(opts?: HDKeyringOption) {
    super(null)
    this.resolve(opts)
  }

  async serialize(): Promise<HDKeyringOption> {
    return {
      mnemonic: this.mnemonic,
      activeIndexes: this.activeIndexes,
      hdPath: this.hdPath,
      passphrase: this.passphrase,
    }
  }

  async resolve(_opts: HDKeyringOption = {}) {
    if (this.root) {
      throw new Error('Btc-Hd-Keyring: Secret recovery phrase already provided')
    }
    let opts = _opts as HDKeyringOption
    this.wallets = []
    this.mnemonic = null
    this.root = null
    this.hdPath = opts.hdPath || hdPathString

    if (opts.passphrase) {
      this.passphrase = opts.passphrase
    }

    if (opts.mnemonic) {
      this.initFromMnemonic(opts.mnemonic)
    }

    if (opts.activeIndexes) {
      this.activeAccounts(opts.activeIndexes)
    }
  }

  initFromMnemonic(mnemonic: string) {
    if (this.root) {
      throw new Error('Btc-Hd-Keyring: Secret recovery phrase already provided')
    }

    this.mnemonic = mnemonic
    this._index2wallet = {}

    this.hdWallet = new Mnemonic(mnemonic)
    this.root = this.hdWallet
      .toHDPrivateKey(
        this.passphrase,
        this.network == bitcoin.networks.bitcoin ? 'livenet' : 'testnet'
      )
      .deriveChild(this.hdPath)
    //console.log("root", this.root)
  }

  changeHdPath(hdPath: string) {
    this.hdPath = hdPath

    this.root = this.hdWallet
      .toHDPrivateKey(
        this.passphrase,
        this.network == bitcoin.networks.bitcoin ? 'livenet' : 'testnet'
      )
      .deriveChild(this.hdPath)

    const indexes = this.activeIndexes
    this._index2wallet = {}
    this.activeIndexes = []
    this.wallets = []
    this.activeAccounts(indexes)
  }

  getAccountByHdPath(hdPath: string, index: number) {
    const root = this.hdWallet
      .toHDPrivateKey(
        this.passphrase,
        this.network == bitcoin.networks.bitcoin ? 'livenet' : 'testnet'
      )
      .deriveChild(hdPath)
    const child = root!.deriveChild(index)
    const ecpair = ECPair.fromPrivateKey(child.privateKey.toBuffer())
    const address = ecpair.publicKey.toString('hex')
    return address
  }

  addAccounts(numberOfAccounts = 1) {
    if (!this.root) {
      this.initFromMnemonic(new Mnemonic().toString())
    }

    let count = numberOfAccounts
    let currentIdx = 0
    const newWallets: ECPairInterface[] = []

    while (count) {
      const [, wallet] = this._addressFromIndex(currentIdx)
      if (this.wallets.includes(wallet)) {
        currentIdx++
      } else {
        this.wallets.push(wallet)
        newWallets.push(wallet)
        this.activeIndexes.push(currentIdx)
        count--
      }
    }

    const hexWallets = newWallets.map((w) => {
      return w.publicKey.toString('hex')
    })

    return Promise.resolve(hexWallets)
  }

  activeAccounts(indexes: number[]) {
    const accounts: string[] = []
    for (const index of indexes) {
      const [address, wallet] = this._addressFromIndex(index)
      this.wallets.push(wallet)
      this.activeIndexes.push(index)

      accounts.push(address)
    }

    return accounts
  }

  getAddresses(start: number, end: number) {
    const from = start
    const to = end
    const accounts: { address: string; index: number }[] = []
    for (let i = from; i < to; i++) {
      const [address] = this._addressFromIndex(i)
      accounts.push({
        address,
        index: i + 1,
      })
    }
    return accounts
  }

  async getAccounts() {
    return this.wallets.map((w) => {
      return w.publicKey.toString('hex')
    })
  }

  private _getPrivateKeyFor(publicKey: string) {
    if (!publicKey) {
      throw new Error('Must specify publicKey.')
    }
    const wallet = this._getWalletForAccount(publicKey)
    return wallet
  }

  private _getWalletForAccount(publicKey: string) {
    let wallet = this.wallets.find(
      (wallet) => wallet.publicKey.toString('hex') == publicKey
    )
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching publicKey.')
    }
    return wallet
  }

  async signTransaction(
    psbt: bitcoin.Psbt,
    inputs: { index: number; publicKey: string; sighashTypes?: number[] }[],
    opts?: any
  ) {
    inputs.forEach(({ index, publicKey, sighashTypes }) => {
      const keyPair = this._getPrivateKeyFor(publicKey)
      const signer = isTaprootInput(psbt.data.inputs[index])
        ? tweakSigner(keyPair, opts)
        : keyPair
      psbt.signInput(index, signer, sighashTypes)
    })
    return psbt
  }

  private _addressFromIndex(i: number): [string, ECPairInterface] {
    if (!this._index2wallet[i]) {
      const child = this.root!.deriveChild(i)
      const ecpair = ECPair.fromPrivateKey(child.privateKey.toBuffer())
      const address = ecpair.publicKey.toString('hex')
      this._index2wallet[i] = [address, ecpair]
    }

    return this._index2wallet[i]
  }
}
