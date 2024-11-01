import {
  mnemonicToAccount,
  Account,
  generateMnemonic,
  getWalletPrivateKeys,
  validateMnemonic,
  getDerivationPaths,
  DerivationMode,
} from './account'
import * as bitcoin from 'bitcoinjs-lib'

function isAccount(obj: any): obj is Account {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.taproot === 'object' &&
    typeof obj.taproot.pubkey === 'string' &&
    typeof obj.taproot.pubKeyXOnly === 'string' &&
    typeof obj.taproot.address === 'string' &&
    typeof obj.nativeSegwit === 'object' &&
    typeof obj.nativeSegwit.pubkey === 'string' &&
    typeof obj.nativeSegwit.address === 'string' &&
    typeof obj.nestedSegwit === 'object' &&
    typeof obj.nestedSegwit.pubkey === 'string' &&
    typeof obj.nestedSegwit.address === 'string' &&
    typeof obj.legacy === 'object' &&
    typeof obj.legacy.pubkey === 'string' &&
    typeof obj.legacy.address === 'string' &&
    typeof obj.spendStrategy === 'object' &&
    Array.isArray(obj.spendStrategy.addressOrder) &&
    typeof obj.spendStrategy.utxoSortGreatestToLeast === 'boolean' &&
    typeof obj.spendStrategy.changeAddress === 'string' &&
    typeof obj.network === 'object' &&
    typeof obj.network.messagePrefix === 'string' &&
    typeof obj.network.bech32 === 'string' &&
    typeof obj.network.bip32 === 'object' &&
    typeof obj.network.bip32.public === 'number' &&
    typeof obj.network.bip32.private === 'number' &&
    typeof obj.network.pubKeyHash === 'number' &&
    typeof obj.network.scriptHash === 'number' &&
    typeof obj.network.wif === 'number'
  )
}

describe('Account Tests', () => {
  it('Generate accurate Account object', () => {
    expect(
      isAccount(
        mnemonicToAccount({
          mnemonic:
            'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        })
      )
    ).toBe(true)
  })

  it('generateMnemonic generates a 12 word mnemonic', () => {
    const mnemonic = generateMnemonic()
    const words = mnemonic.split(' ')
    expect(words).toHaveLength(12)
  })

  it('getDerivationPaths returns the correct derivation paths for a given index and network', () => {
    const network = bitcoin.networks.bitcoin
    const derivationMode: DerivationMode = 'bip44_account_last'

    const paths = getDerivationPaths(0, network, derivationMode)

    expect(paths.legacy).toBe("m/44'/0'/0'/0/0")
    expect(paths.nestedSegwit).toBe("m/49'/0'/0'/0/0")
    expect(paths.nativeSegwit).toBe("m/84'/0'/0'/0/0")
    expect(paths.taproot).toBe("m/86'/0'/0'/0/0")

    const paths1 = getDerivationPaths(1, network, derivationMode)

    expect(paths1.legacy).toBe("m/44'/0'/0'/0/1")
    expect(paths1.nestedSegwit).toBe("m/49'/0'/0'/0/1")
    expect(paths1.nativeSegwit).toBe("m/84'/0'/0'/0/1")
    expect(paths1.taproot).toBe("m/86'/0'/0'/0/1")
  })

  it('getDerivationPaths returns the correct derivation paths for a given index and network using the bip32_simple derivation mode', () => {
    const network = bitcoin.networks.bitcoin
    const derivationMode: DerivationMode = 'bip32_simple'

    const paths = getDerivationPaths(0, network, derivationMode)

    expect(paths.legacy).toBe("m/44'/0'/0'/0")
    expect(paths.nestedSegwit).toBe("m/49'/0'/0'/0")
    expect(paths.nativeSegwit).toBe("m/84'/0'/0'/0")
    expect(paths.taproot).toBe("m/86'/0'/0'/0")

    const paths1 = getDerivationPaths(1, network, derivationMode)

    expect(paths1.legacy).toBe("m/44'/0'/1'/0")
    expect(paths1.nestedSegwit).toBe("m/49'/0'/1'/0")
    expect(paths1.nativeSegwit).toBe("m/84'/0'/1'/0")
    expect(paths1.taproot).toBe("m/86'/0'/1'/0")
  })

  it('getDerivationPaths returns the correct derivation paths for a given index and network using the bip44_standard derivation mode', () => {
    const network = bitcoin.networks.bitcoin
    const derivationMode: DerivationMode = 'bip44_standard'

    const paths = getDerivationPaths(0, network, derivationMode)

    expect(paths.legacy).toBe("m/44'/0'/0'/0/0")
    expect(paths.nestedSegwit).toBe("m/49'/0'/0'/0/0")
    expect(paths.nativeSegwit).toBe("m/84'/0'/0'/0/0")
    expect(paths.taproot).toBe("m/86'/0'/0'/0/0")

    const paths1 = getDerivationPaths(1, network, derivationMode)

    expect(paths1.legacy).toBe("m/44'/0'/1'/0/0")
    expect(paths1.nestedSegwit).toBe("m/49'/0'/1'/0/0")
    expect(paths1.nativeSegwit).toBe("m/84'/0'/1'/0/0")
    expect(paths1.taproot).toBe("m/86'/0'/1'/0/0")
  })

  it('mnemonicToAccount does not throw an error if mnemonic is invalid', () => {
    expect(() =>
      mnemonicToAccount({ mnemonic: 'invalid mnemonic' })
    ).not.toThrow(Error)
  })

  it('getWalletPrivateKeys does not throw an error if mnemonic is invalid', () => {
    expect(() =>
      getWalletPrivateKeys({ mnemonic: 'invalid mnemonic' })
    ).not.toThrow(Error)
  })

  it('validateMnemonic returns true for valid mnemonic', () => {
    expect(
      validateMnemonic(
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      )
    ).toBeTruthy()
  })

  it('validateMnemonic returns false for invalid mnemonic', () => {
    expect(validateMnemonic('invalid mnemonic')).toBeFalsy()
  })
})
