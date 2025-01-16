import BIP32Factory from "bip32";
import * as bip39 from "bip39";
import { Command } from 'commander'
import { mapValues } from "lodash";
import * as bitcoin from "bitcoinjs-lib";

export const REGTEST_PARAMS = {
  bech32: "bcrt",
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128,
};

export function getAddress(node) {
  return bitcoin.payments.p2wpkh({
    pubkey: node.publicKey,
    network: bitcoin.networks.regtest,
  }).address;
};

export async function getPrivate(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const bip32 = BIP32Factory(await import("tiny-secp256k1"));
  const root = bip32.fromSeed(seed, bitcoin.networks.regtest);
  return root.derivePath("m/84'/0'/0'/0/0");
};

export const ADDRESS_COMMANDS = mapValues({
  getprivate: (command) => command.description("get private key in hex associated with mnemonic")
    .option("-m, --mnemonic <mnemonic>", "mnemonic for wallet")
    .action((options) => {
      (async () => {
        console.log(Buffer.from((await getPrivate(options.mnemonic || process.env.MNEMONIC || (() => { throw Error("must supply mnemonic via -m flag or the MNEMONIC environment variable"); })())).privateKey).toString('hex'));
      })().catch((err) => console.error(err))
    })
}, (v, k) => v(new Command(k)))
