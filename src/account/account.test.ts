import {
  mnemonicToAccount,
  generateMnemonic,
  getWalletPrivateKeys,
  validateMnemonic,
  getDerivationPaths,
  DerivationMode,
} from './account'
import * as bitcoin from 'bitcoinjs-lib'

const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const TEST_DERIVATION_PATHS = {
  legacy: "m/44'/0'/0'/0/999",
  nestedSegwit: "m/49'/0'/0'/0/998",
  nativeSegwit: "m/84'/0'/0'/0/997",
  taproot: "m/86'/0'/0'/0/996",
}

describe('Account Tests', () => {
  it('mnemonicToAccount should generate the right default spend strategy', () => {
    const account = mnemonicToAccount({
      mnemonic: TEST_MNEMONIC,
      opts: {
        network: bitcoin.networks.regtest,
      },
    })

    expect(account.spendStrategy.addressOrder).toEqual([
      'nativeSegwit',
      'nestedSegwit',
      'legacy',
      'taproot',
    ])
    expect(account.spendStrategy.utxoSortGreatestToLeast).toBe(true)
    expect(account.spendStrategy.changeAddress).toBe('nativeSegwit')
  })

  it('mnemonicToAccount should generate the right custom spend strategy', () => {
    const account = mnemonicToAccount({
      mnemonic: TEST_MNEMONIC,
      opts: {
        network: bitcoin.networks.regtest,
        spendStrategy: {
          addressOrder: ['taproot', 'legacy', 'nestedSegwit', 'nativeSegwit'],
          utxoSortGreatestToLeast: false,
          changeAddress: 'legacy',
        },
      },
    })

    expect(account.spendStrategy.addressOrder).toEqual([
      'taproot',
      'legacy',
      'nestedSegwit',
      'nativeSegwit',
    ])
    expect(account.spendStrategy.utxoSortGreatestToLeast).toBe(false)
    expect(account.spendStrategy.changeAddress).toBe('legacy')
  })

  it('mnemonicToAccount should work with default derivationPaths', () => {
    const account = mnemonicToAccount({
      mnemonic: TEST_MNEMONIC,
      opts: {
        network: bitcoin.networks.regtest,
      },
    })

    expect(account.legacy.derivationPath).toBe("m/44'/1'/0'/0/0")
    expect(account.nestedSegwit.derivationPath).toBe("m/49'/1'/0'/0/0")
    expect(account.nativeSegwit.derivationPath).toBe("m/84'/1'/0'/0/0")
    expect(account.taproot.derivationPath).toBe("m/86'/1'/0'/0/0")

    expect(account.legacy.address).toBe('mkpZhYtJu2r87Js3pDiWJDmPte2NRZ8bJV')
    expect(account.nestedSegwit.address).toBe(
      '2Mww8dCYPUpKHofjgcXcBCEGmniw9CoaiD2'
    )
    expect(account.nativeSegwit.address).toBe(
      'bcrt1q6rz28mcfaxtmd6v789l9rrlrusdprr9pz3cppk'
    )
    expect(account.taproot.address).toBe(
      'bcrt1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqjeprhg'
    )

    expect(account.legacy.pubkey).toBe(
      '02a7451395735369f2ecdfc829c0f774e88ef1303dfe5b2f04dbaab30a535dfdd6'
    )
    expect(account.nestedSegwit.pubkey).toBe(
      '03a1af804ac108a8a51782198c2d034b28bf90c8803f5a53f76276fa69a4eae77f'
    )
    expect(account.nativeSegwit.pubkey).toBe(
      '02e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c319'
    )
    expect(account.taproot.pubkey).toBe(
      '0255355ca83c973f1d97ce0e3843c85d78905af16b4dc531bc488e57212d230116'
    )
    expect(account.taproot.pubKeyXOnly).toBe(
      '55355ca83c973f1d97ce0e3843c85d78905af16b4dc531bc488e57212d230116'
    )
  })

  it('mnemonicToAccount should work with custom derivationPaths', () => {
    const account = mnemonicToAccount({
      mnemonic: TEST_MNEMONIC,
      opts: {
        network: bitcoin.networks.regtest,
        derivationPaths: TEST_DERIVATION_PATHS,
      },
    })

    expect(account.legacy.derivationPath).toBe("m/44'/0'/0'/0/999")
    expect(account.nestedSegwit.derivationPath).toBe("m/49'/0'/0'/0/998")
    expect(account.nativeSegwit.derivationPath).toBe("m/84'/0'/0'/0/997")
    expect(account.taproot.derivationPath).toBe("m/86'/0'/0'/0/996")

    expect(account.legacy.address).toBe('n4UB1By7USunM5R4ivdihhYkp1tY84oeuu')
    expect(account.nestedSegwit.address).toBe(
      '2N9XTnMurNTR4MFY9kpDAgqaHjdRHXYDvzb'
    )
    expect(account.nativeSegwit.address).toBe(
      'bcrt1qn2n42yyx3eeh5mp08858kltysygrrd95slm23k'
    )
    expect(account.taproot.address).toBe(
      'bcrt1p26hyxc7dqdq44m99ggsdwpx046av5uff057gl7edajqlyly9qyus59x39n'
    )

    expect(account.legacy.pubkey).toBe(
      '0379af79751899a87883ff3728ecf3dd094bcf77e5531bd64da1c7791eab51fa56'
    )
    expect(account.nestedSegwit.pubkey).toBe(
      '0358524ff929208bf6676ee03e02960105c61f060d32cca03dedb1faa247cac64d'
    )
    expect(account.nativeSegwit.pubkey).toBe(
      '02aa05b9094bdbc489dc6b336b23e8ab12f33448d2bf9708454cd76acb14907abf'
    )
    expect(account.taproot.pubkey).toBe(
      '02c43b42d9cea2a355d90e9374177d465471e410db495a8340fb535ceea9f1f618'
    )
    expect(account.taproot.pubKeyXOnly).toBe(
      'c43b42d9cea2a355d90e9374177d465471e410db495a8340fb535ceea9f1f618'
    )
  })

  it('mnemonicToAccount does not throw an error if mnemonic is invalid', () => {
    expect(() =>
      mnemonicToAccount({
        mnemonic: 'invalid mnemonic',
        opts: {
          network: bitcoin.networks.regtest,
        },
      })
    ).not.toThrow(Error)
  })

  it('getWalletPrivateKeys should work with default derivationPaths', () => {
    const account = getWalletPrivateKeys({
      mnemonic: TEST_MNEMONIC,
      opts: {
        network: bitcoin.networks.regtest,
      },
    })

    expect(account.legacy.privateKey).toBe(
      'e01fea8a48e2854fdd0255c12b1d704967d9401f11c3f4980006ced8977574dc'
    )
    expect(account.nestedSegwit.privateKey).toBe(
      'c9bdb49cfbaedca21c4b1f3a7803c34636b1d7dc55a717132443fc3f4c5867e8'
    )
    expect(account.nativeSegwit.privateKey).toBe(
      'a9c4134b73560f43fc5c081e5c1daa7ce068adc806d80e1f37cb658e0fea4c8d'
    )
    expect(account.taproot.privateKey).toBe(
      'dff1c8c2c016a572914b4c5adb8791d62b4768ae9d0a61be8ab94cf5038d7d90'
    )
  })

  it('getWalletPrivateKeys should work with custom derivationPaths', () => {
    const account = getWalletPrivateKeys({
      mnemonic: TEST_MNEMONIC,
      opts: {
        network: bitcoin.networks.regtest,
        derivationPaths: TEST_DERIVATION_PATHS,
      },
    })

    expect(account.legacy.privateKey).toBe(
      '64c9a3543213639eb80d4317db5e66b702c93fd009a28f39837cb71807d1dac3'
    )
    expect(account.nestedSegwit.privateKey).toBe(
      '5c475de483cc1e0b25fc143749894b828559d46a8283e8374f5221a7ebdf5478'
    )
    expect(account.nativeSegwit.privateKey).toBe(
      '079cd154b93b396e7fb1ad2073c5ab036da40a77c53d9245dcb37bbc7e4ab3a2'
    )
    expect(account.taproot.privateKey).toBe(
      'db8ef506d05fe881f3697c32c851d881471364138e6dc437c9e2772d924a98d7'
    )
  })

  it('getWalletPrivateKeys does not throw an error if mnemonic is invalid', () => {
    expect(() =>
      getWalletPrivateKeys({
        mnemonic: 'invalid mnemonic',
        opts: {
          network: bitcoin.networks.regtest,
        },
      })
    ).not.toThrow(Error)
  })

  it('generateMnemonic generates a 12 word mnemonic', () => {
    const mnemonic = generateMnemonic()
    const words = mnemonic.split(' ')
    expect(words).toHaveLength(12)
  })

  it('getDerivationPaths returns the correct default derivation paths', () => {
    const paths = getDerivationPaths()

    expect(paths.legacy).toBe("m/44'/0'/0'/0/0")
    expect(paths.nestedSegwit).toBe("m/49'/0'/0'/0/0")
    expect(paths.nativeSegwit).toBe("m/84'/0'/0'/0/0")
    expect(paths.taproot).toBe("m/86'/0'/0'/0/0")

    const paths1 = getDerivationPaths(1)

    expect(paths1.legacy).toBe("m/44'/0'/0'/0/1")
    expect(paths1.nestedSegwit).toBe("m/49'/0'/0'/0/1")
    expect(paths1.nativeSegwit).toBe("m/84'/0'/0'/0/1")
    expect(paths1.taproot).toBe("m/86'/0'/0'/0/1")
  })

  it('getDerivationPaths returns the right derivation paths using the bip32_simple derivation mode', () => {
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

  it('getDerivationPaths returns the right derivation paths using the bip44_standard derivation mode', () => {
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

  it('validateMnemonic returns true for valid mnemonic', () => {
    expect(validateMnemonic(TEST_MNEMONIC)).toBeTruthy()
  })

  it('validateMnemonic returns false for invalid mnemonic', () => {
    expect(validateMnemonic('invalid mnemonic')).toBeFalsy()
  })
})
