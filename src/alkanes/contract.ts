import { Account, Signer, Provider } from '..'
import * as bitcoin from 'bitcoinjs-lib'
import { AlkanesPayload } from '../shared/interface'
import {
  findXAmountOfSats,
  formatInputToSign,
  timeout,
  tweakSigner,
} from '../shared/utils'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import {
  createDeployCommitPsbt,
  createDeployRevealPsbt,
  deployCommit,
  p2tr_ord_reveal,
} from './alkanes'
import { getEstimatedFee } from '../psbt'
import { FormattedUtxo } from '../utxo'
export const contractDeployment = async ({
  payload,
  utxos,
  account,
  protostone,
  provider,
  feeRate,
  signer,
}: {
  payload: AlkanesPayload
  utxos: FormattedUtxo[]
  account: Account
  protostone: Buffer
  provider: Provider
  feeRate?: number
  signer: Signer
}) => {
  const { script, txId } = await deployCommit({
    payload,
    utxos,
    account,
    provider,
    feeRate,
    signer,
  })

  await timeout(3000)

  const reveal = await deployReveal({
    commitTxId: txId,
    script,
    protostone,
    account,
    provider,
    feeRate,
    signer,
  })

  return { ...reveal, commitTx: txId }
}

export const actualDeployCommitFee = async ({
  payload,
  tweakedPublicKey,
  utxos,
  account,
  provider,
  feeRate,
}: {
  payload: AlkanesPayload
  tweakedPublicKey: string
  utxos: FormattedUtxo[]
  account: Account
  provider: Provider
  feeRate?: number
}) => {
  if (!feeRate) {
    feeRate = (await provider.esplora.getFeeEstimates())['1']
  }

  const { psbt } = await createDeployCommitPsbt({
    payload,
    utxos,
    tweakedPublicKey,
    account,
    provider,
    feeRate,
  })

  const { fee: estimatedFee } = await getEstimatedFee({
    feeRate,
    psbt,
    provider,
  })

  const { psbt: finalPsbt } = await createDeployCommitPsbt({
    payload,
    utxos,
    tweakedPublicKey,
    account,
    provider,
    feeRate,
    fee: estimatedFee,
  })

  const { fee: finalFee, vsize } = await getEstimatedFee({
    feeRate,
    psbt: finalPsbt,
    provider,
  })

  return { fee: finalFee, vsize }
}

export const actualDeployRevealFee = async ({
  protostone,
  tweakedPublicKey,
  commitTxId,
  receiverAddress,
  script,
  provider,
  feeRate,
}: {
  protostone: Buffer
  tweakedPublicKey: string
  commitTxId: string
  receiverAddress: string
  script: Buffer
  provider: Provider
  feeRate?: number
}) => {
  if (!feeRate) {
    feeRate = (await provider.esplora.getFeeEstimates())['1']
  }

  const { psbt } = await createDeployRevealPsbt({
    protostone,
    commitTxId,
    receiverAddress,
    script,
    tweakedPublicKey,
    provider,
    feeRate,
  })

  const { fee: estimatedFee } = await getEstimatedFee({
    feeRate,
    psbt,
    provider,
  })

  const { psbt: finalPsbt } = await createDeployRevealPsbt({
    protostone,
    commitTxId,
    receiverAddress,
    script,
    tweakedPublicKey,
    provider,
    feeRate,
    fee: estimatedFee,
  })

  const { fee: finalFee, vsize } = await getEstimatedFee({
    feeRate,
    psbt: finalPsbt,
    provider,
  })

  return { fee: finalFee, vsize }
}

export const deployReveal = async ({
  protostone,
  commitTxId,
  script,
  account,
  provider,
  feeRate,
  signer,
}: {
  protostone: Buffer
  commitTxId: string
  script: string
  account: Account
  provider: Provider
  feeRate?: number
  signer: Signer
}) => {
  const tweakedTaprootKeyPair: bitcoin.Signer = tweakSigner(
    signer.taprootKeyPair,
    {
      network: provider.network,
    }
  )

  const tweakedPublicKey = tweakedTaprootKeyPair.publicKey.toString('hex')

  const { fee } = await actualDeployRevealFee({
    protostone,
    tweakedPublicKey,
    receiverAddress: account.taproot.address,
    commitTxId,
    script: Buffer.from(script, 'hex'),
    provider,
    feeRate,
  })

  const { psbt: finalRevealPsbt } = await createDeployRevealPsbt({
    protostone,
    tweakedPublicKey,
    receiverAddress: account.taproot.address,
    commitTxId,
    script: Buffer.from(script, 'hex'),
    provider,
    feeRate,
    fee,
  })

  let finalReveal = bitcoin.Psbt.fromBase64(finalRevealPsbt, {
    network: provider.network,
  })

  finalReveal.signInput(0, tweakedTaprootKeyPair)
  finalReveal.finalizeInput(0)

  const finalSignedPsbt = finalReveal.toBase64()

  const revealResult = await provider.pushPsbt({
    psbtBase64: finalSignedPsbt,
  })

  return revealResult
}

export const recoverCommit = async ({
  commitTxId,
  utxos,
  account,
  provider,
  feeRate,
  signer,
  script,
}: {
  commitTxId: string
  utxos: FormattedUtxo[]
  account: Account
  provider: Provider
  feeRate?: number
  signer: Signer
  script: Buffer
}) => {
  const tweakedTaprootKeyPair: bitcoin.Signer = tweakSigner(
    signer.taprootKeyPair,
    {
      network: provider.network,
    }
  )
  const tweakedPublicKey = tweakedTaprootKeyPair.publicKey
  const scriptTree = {
    output: script,
  }
  const commitAddress = bitcoin.payments.p2tr({
    internalPubkey: toXOnly(tweakedPublicKey),
    scriptTree,
    network: provider.network,
  }).address
  const commitTx = await provider.esplora.getTxInfo(commitTxId)
  if (!commitTx) {
    throw new Error(`Commit tx not found for txid: ${commitTxId}`)
  }
  const voutIndex = commitTx.vout.findIndex(
    (vout) => vout.scriptpubkey_address === commitAddress
  )
  if (voutIndex === -1) {
    throw new Error('Could not find vout for commit transaction')
  }
  const commitVout = commitTx.vout[voutIndex]

  const psbt = new bitcoin.Psbt({ network: provider.network })

  psbt.addInput({
    hash: commitTxId,
    index: voutIndex,
    witnessUtxo: {
      script: Buffer.from(commitVout.scriptpubkey, 'hex'),
      value: commitVout.value,
    },
    tapInternalKey: toXOnly(tweakedPublicKey),
  })

  const estimatedFee =
    (await getEstimatedFee({
      feeRate,
      psbt: psbt.toBase64(),
      provider,
    }))?.fee || 2000

  let totalValue = commitVout.value
  if (totalValue < estimatedFee) {
    const satsNeeded = estimatedFee - totalValue
    const spendableUtxos = utxos.filter(
      (utxo) =>
        utxo.txId !== commitTxId &&
        utxo.inscriptions.length === 0 &&
        Object.keys(utxo.runes).length === 0 &&
        Object.keys(utxo.alkanes).length === 0
    )
    const gatheredUtxos = findXAmountOfSats(spendableUtxos, satsNeeded)
    if (gatheredUtxos.totalAmount < satsNeeded) {
      throw new Error('Insufficient funds to pay for recovery transaction fee')
    }
    for (const utxo of gatheredUtxos.utxos) {
      psbt.addInput({
        hash: utxo.txId,
        index: utxo.outputIndex,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPk, 'hex'),
          value: utxo.satoshis,
        },
      })
      totalValue += utxo.satoshis
    }
  }

  psbt.addOutput({
    address: account.nativeSegwit.address,
    value: totalValue - estimatedFee,
  })
  const alkanesPubkey = account.taproot?.pubkey || account.nativeSegwit?.pubkey;

  psbt.signInput(0, tweakedTaprootKeyPair)
  for (let i = 1; i < psbt.inputCount; i++) {
    formatInputToSign({
      v: psbt.data.inputs[i],
      senderPublicKey: alkanesPubkey,
      network: provider.network,
    })
    psbt.signInput(i, tweakedTaprootKeyPair);
  }
  psbt.finalizeAllInputs();
  return provider.pushPsbt({ psbtBase64: psbt.toBase64() })
}
