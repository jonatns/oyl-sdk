import { OylTransactionError } from '../errors'
import { Provider } from '../provider/provider'
import * as bitcoin from 'bitcoinjs-lib'
import { FormattedUtxo, accountSpendableUtxos } from '../utxo'
import {
  ECPair,
  calculateTaprootTxSize,
  createInscriptionScript,
  delay,
  formatInputsToSign,
  getFee,
  getOutputValueByVOutIndex,
  tweakSigner,
  waitForTransaction,
} from '../shared/utils'
import { Account } from '../account'
import { minimumFee } from '../btc'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { ECPairInterface } from 'ecpair'
import { LEAF_VERSION_TAPSCRIPT } from 'bitcoinjs-lib/src/payments/bip341'
import { getAddressType } from '../transactions'
import { Signer } from '../signer'

export const transferEstimate = async ({
  toAddress,
  feeRate,
  account,
  provider,
  fee,
}: {
  toAddress: string
  feeRate: number
  account: Account
  provider: Provider
  fee?: number
}) => {
  try {
    if (!feeRate) {
      feeRate = (await provider.esplora.getFeeEstimates())['1']
    }
    const psbt: bitcoin.Psbt = new bitcoin.Psbt({ network: provider.network })
    const minFee = minimumFee({
      taprootInputCount: 2,
      nonTaprootInputCount: 0,
      outputCount: 2,
    })
    let calculatedFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
    let finalFee = fee ? fee : calculatedFee

    const gatheredUtxos: {
      totalAmount: number
      utxos: FormattedUtxo[]
    } = await accountSpendableUtxos({
      account,
      provider,
      spendAmount: finalFee + 546,
    })

    let utxosToSend = gatheredUtxos

    if (!fee && gatheredUtxos.utxos.length > 1) {
      const txSize = minimumFee({
        taprootInputCount: gatheredUtxos.utxos.length,
        nonTaprootInputCount: 0,
        outputCount: 2,
      })
      finalFee = txSize * feeRate < 250 ? 250 : txSize * feeRate

      if (gatheredUtxos.totalAmount < finalFee + 546) {
        utxosToSend = await accountSpendableUtxos({
          account,
          provider,
          spendAmount: finalFee + 546,
        })
      }
    }

    for (let i = 0; i < gatheredUtxos.utxos.length; i++) {
      if (getAddressType(gatheredUtxos.utxos[i].address) === 0) {
        const previousTxHex: string = await provider.esplora.getTxHex(
          gatheredUtxos.utxos[i].txId
        )
        psbt.addInput({
          hash: gatheredUtxos.utxos[i].txId,
          index: gatheredUtxos.utxos[i].outputIndex,
          nonWitnessUtxo: Buffer.from(previousTxHex, 'hex'),
        })
      }
      if (getAddressType(gatheredUtxos.utxos[i].address) === 2) {
        const redeemScript = bitcoin.script.compile([
          bitcoin.opcodes.OP_0,
          bitcoin.crypto.hash160(
            Buffer.from(account.nestedSegwit.pubkey, 'hex')
          ),
        ])

        psbt.addInput({
          hash: gatheredUtxos.utxos[i].txId,
          index: gatheredUtxos.utxos[i].outputIndex,
          redeemScript: redeemScript,
          witnessUtxo: {
            value: gatheredUtxos.utxos[i].satoshis,
            script: bitcoin.script.compile([
              bitcoin.opcodes.OP_HASH160,
              bitcoin.crypto.hash160(redeemScript),
              bitcoin.opcodes.OP_EQUAL,
            ]),
          },
        })
      }
      if (
        getAddressType(gatheredUtxos.utxos[i].address) === 1 ||
        getAddressType(gatheredUtxos.utxos[i].address) === 3
      ) {
        psbt.addInput({
          hash: gatheredUtxos.utxos[i].txId,
          index: gatheredUtxos.utxos[i].outputIndex,
          witnessUtxo: {
            value: gatheredUtxos.utxos[i].satoshis,
            script: Buffer.from(gatheredUtxos.utxos[i].scriptPk, 'hex'),
          },
        })
      }
    }

    psbt.addOutput({
      address: toAddress,
      value: 546,
    })

    const changeAmount = utxosToSend.totalAmount - (finalFee + 546)

    psbt.addOutput({
      address: account[account.spendStrategy.changeAddress].address,
      value: changeAmount,
    })

    const updatedPsbt = await formatInputsToSign({
      _psbt: psbt,
      senderPublicKey: account.taproot.pubkey,
      network: provider.network,
    })

    return { psbt: updatedPsbt.toBase64(), fee: finalFee }
  } catch (error) {
    throw new OylTransactionError(error)
  }
}

export const commit = async ({
  ticker,
  amount,
  feeRate,
  account,
  provider,
  fee,
  finalSendFee,
}: {
  ticker: string
  amount: number
  feeRate: number
  account: Account
  provider: Provider
  fee?: number
  finalSendFee?: number
}) => {
  try {
    const content = `{"p":"brc-20","op":"transfer","tick":"${ticker}","amt":"${amount}"}`
    if (!feeRate) {
      feeRate = (await provider.esplora.getFeeEstimates())['1']
    }

    const psbt: bitcoin.Psbt = new bitcoin.Psbt({ network: provider.network })
    const commitTxSize = calculateTaprootTxSize(1, 0, 2)
    const feeForCommit =
      commitTxSize * feeRate < 250 ? 250 : commitTxSize * feeRate

    const revealTxSize = calculateTaprootTxSize(1, 0, 2)
    const feeForReveal =
      revealTxSize * feeRate < 250 ? 250 : revealTxSize * feeRate

    const baseEstimate =
      Number(feeForCommit) + Number(feeForReveal) + finalSendFee + 546

    let calculatedFee =
      baseEstimate * feeRate < 250 ? 250 : baseEstimate * feeRate
    let finalFee = fee
      ? fee + Number(feeForReveal) + 546 + finalSendFee
      : calculatedFee

    let gatheredUtxos: {
      totalAmount: number
      utxos: FormattedUtxo[]
    } = await accountSpendableUtxos({
      account,
      provider,
      spendAmount: finalFee,
    })

    const taprootKeyPair: ECPairInterface = ECPair.fromPrivateKey(
      Buffer.from(account.taproot.privateKey, 'hex')
    )
    const tweakedTaprootKeyPair: Buffer = toXOnly(
      tweakSigner(taprootKeyPair).publicKey
    )
    const script = createInscriptionScript(tweakedTaprootKeyPair, content)

    const outputScript = bitcoin.script.compile(script)

    const inscriberInfo = bitcoin.payments.p2tr({
      internalPubkey: tweakedTaprootKeyPair,
      scriptTree: { output: outputScript },
      network: provider.network,
    })

    psbt.addOutput({
      value: Number(feeForReveal) + 546,
      address: inscriberInfo.address,
    })

    if (!fee && gatheredUtxos.utxos.length > 1) {
      const txSize = minimumFee({
        taprootInputCount: gatheredUtxos.utxos.length,
        nonTaprootInputCount: 0,
        outputCount: 2,
      })
      finalFee = txSize * feeRate < 250 ? 250 : txSize * feeRate

      if (gatheredUtxos.totalAmount < finalFee) {
        gatheredUtxos = await accountSpendableUtxos({
          account,
          provider,
          spendAmount: finalFee,
        })
      }
    }

    for (let i = 0; i < gatheredUtxos.utxos.length; i++) {
      if (getAddressType(gatheredUtxos.utxos[i].address) === 0) {
        const previousTxHex: string = await provider.esplora.getTxHex(
          gatheredUtxos.utxos[i].txId
        )
        psbt.addInput({
          hash: gatheredUtxos.utxos[i].txId,
          index: gatheredUtxos.utxos[i].outputIndex,
          nonWitnessUtxo: Buffer.from(previousTxHex, 'hex'),
        })
      }
      if (getAddressType(gatheredUtxos.utxos[i].address) === 2) {
        const redeemScript = bitcoin.script.compile([
          bitcoin.opcodes.OP_0,
          bitcoin.crypto.hash160(
            Buffer.from(account.nestedSegwit.pubkey, 'hex')
          ),
        ])

        psbt.addInput({
          hash: gatheredUtxos.utxos[i].txId,
          index: gatheredUtxos.utxos[i].outputIndex,
          redeemScript: redeemScript,
          witnessUtxo: {
            value: gatheredUtxos.utxos[i].satoshis,
            script: bitcoin.script.compile([
              bitcoin.opcodes.OP_HASH160,
              bitcoin.crypto.hash160(redeemScript),
              bitcoin.opcodes.OP_EQUAL,
            ]),
          },
        })
      }
      if (
        getAddressType(gatheredUtxos.utxos[i].address) === 1 ||
        getAddressType(gatheredUtxos.utxos[i].address) === 3
      ) {
        psbt.addInput({
          hash: gatheredUtxos.utxos[i].txId,
          index: gatheredUtxos.utxos[i].outputIndex,
          witnessUtxo: {
            value: gatheredUtxos.utxos[i].satoshis,
            script: Buffer.from(gatheredUtxos.utxos[i].scriptPk, 'hex'),
          },
        })
      }
    }

    if (gatheredUtxos.totalAmount < finalFee) {
      throw new OylTransactionError(Error('Insufficient Balance'))
    }

    const changeAmount = gatheredUtxos.totalAmount - finalFee

    psbt.addOutput({
      address: account[account.spendStrategy.changeAddress].address,
      value: changeAmount,
    })

    const updatedPsbt = await formatInputsToSign({
      _psbt: psbt,
      senderPublicKey: account.taproot.pubkey,
      network: provider.network,
    })

    return { psbt: updatedPsbt.toBase64(), fee: finalFee, script: outputScript }
  } catch (error) {
    throw new OylTransactionError(error)
  }
}

export const reveal = async ({
  receiverAddress,
  script,
  feeRate,
  account,
  provider,
  fee = 0,
  commitTxId,
}: {
  receiverAddress: string
  script: Buffer
  feeRate: number
  account: Account
  provider: Provider
  fee?: number
  commitTxId: string
}) => {
  try {
    if (!feeRate) {
      feeRate = (await provider.esplora.getFeeEstimates())['1']
    }

    const psbt: bitcoin.Psbt = new bitcoin.Psbt({ network: provider.network })
    const minFee = minimumFee({
      taprootInputCount: 1,
      nonTaprootInputCount: 0,
      outputCount: 2,
    })

    const revealTxBaseFee = minFee * feeRate < 250 ? 250 : minFee * feeRate
    const revealTxChange = Number(revealTxBaseFee) - fee

    const commitTxOutput = await getOutputValueByVOutIndex({
      txId: commitTxId,
      vOut: 0,
      esploraRpc: provider.esplora,
    })

    if (!commitTxOutput) {
      throw new Error('ERROR GETTING FIRST INPUT VALUE')
    }

    const taprootKeyPair: ECPairInterface = ECPair.fromPrivateKey(
      Buffer.from(account.taproot.privateKey, 'hex')
    )

    const tweakedTaprootKeyPair = tweakSigner(taprootKeyPair, {
      network: provider.network,
    })
    const tweakedPubKey: Buffer = toXOnly(
      tweakSigner(taprootKeyPair, { network: provider.network }).publicKey
    )

    const p2pk_redeem = { output: script }

    const { output, witness } = bitcoin.payments.p2tr({
      internalPubkey: tweakedPubKey,
      scriptTree: p2pk_redeem,
      redeem: p2pk_redeem,
      network: provider.network,
    })

    psbt.addInput({
      hash: commitTxId,
      index: 0,
      witnessUtxo: {
        value: commitTxOutput.value,
        script: output,
      },
      tapLeafScript: [
        {
          leafVersion: LEAF_VERSION_TAPSCRIPT,
          script: p2pk_redeem.output,
          controlBlock: witness![witness!.length - 1],
        },
      ],
    })

    psbt.addOutput({
      value: 546,
      address: receiverAddress,
    })
    if (revealTxChange > 546) {
      psbt.addOutput({
        value: revealTxChange,
        address: receiverAddress,
      })
    }

    psbt.signInput(0, tweakedTaprootKeyPair)
    psbt.finalizeInput(0)

    return { psbt: psbt.toBase64(), fee: revealTxChange }
  } catch (error) {
    throw new OylTransactionError(error)
  }
}

export const transfer = async ({
  commitChangeUtxoId,
  revealTxId,
  toAddress,
  feeRate,
  account,
  provider,
  fee = 0,
}: {
  commitChangeUtxoId: string
  revealTxId: string
  toAddress: string
  feeRate: number
  account: Account
  provider: Provider
  fee?: number
}) => {
  try {
    if (!feeRate) {
      feeRate = (await provider.esplora.getFeeEstimates())['1']
    }
    const psbt: bitcoin.Psbt = new bitcoin.Psbt({ network: provider.network })
    const utxoInfo = await provider.esplora.getTxInfo(commitChangeUtxoId)
    const revealInfo = await provider.esplora.getTxInfo(revealTxId)
    let totalValue: number = 0

    psbt.addInput({
      hash: revealTxId,
      index: 0,
      witnessUtxo: {
        script: Buffer.from(revealInfo.vout[0].scriptpubkey, 'hex'),
        value: 546,
      },
    })

    for (let i = 1; i <= utxoInfo.vout.length - 1; i++) {
      totalValue += utxoInfo.vout[i].value
      psbt.addInput({
        hash: commitChangeUtxoId,
        index: i,
        witnessUtxo: {
          script: Buffer.from(utxoInfo.vout[i].scriptpubkey, 'hex'),
          value: utxoInfo.vout[i].value,
        },
      })
    }

    psbt.addOutput({
      address: toAddress,
      value: 546,
    })

    psbt.addOutput({
      address: account[account.spendStrategy.changeAddress].address,
      value: totalValue - fee,
    })

    const formattedPsbt = await formatInputsToSign({
      _psbt: psbt,
      senderPublicKey: account.taproot.pubkey,
      network: provider.network,
    })

    return { psbt: formattedPsbt.toBase64() }
  } catch (error) {
    throw new OylTransactionError(error)
  }
}

export const send = async ({
  ticker,
  amount,
  toAddress,
  account,
  provider,
  feeRate,
  signer,
}: {
  ticker: string
  amount: number
  toAddress: string
  feeRate: number
  account: Account
  provider: Provider
  signer: Signer
}) => {
  let successTxIds: string[] = []
  const estimate = await transferEstimate({
    toAddress: toAddress,
    feeRate: feeRate,
    account: account,
    provider: provider,
  })

  const { psbt: dryCommitPsbt } = await commit({
    ticker: ticker,
    amount: amount,
    feeRate: feeRate,
    account: account,
    provider: provider,
    finalSendFee: estimate.fee,
  })

  const { signedPsbt: commitSigned } = await signer.signAllInputs({
    rawPsbt: dryCommitPsbt!,
    finalize: true,
  })

  const commitFee = await getFee({
    provider,
    psbt: commitSigned,
    feeRate: feeRate,
  })

  const { psbt: finalCommitPsbt, script } = await commit({
    ticker: ticker,
    amount: amount,
    feeRate: feeRate,
    account: account,
    provider: provider,
    finalSendFee: estimate.fee,
    fee: commitFee,
  })

  const { signedPsbt: finalCommitSigned } = await signer.signAllInputs({
    rawPsbt: finalCommitPsbt!,
    finalize: true,
  })

  const { txId: commitTxId } = await provider.pushPsbt({
    psbtBase64: finalCommitSigned,
  })

  successTxIds.push(commitTxId)
  const { psbt: revealPsbt } = await reveal({
    feeRate: feeRate,
    account: account,
    provider: provider,
    script: script,
    commitTxId: commitTxId,
    receiverAddress: account.taproot.address,
  })

  const revealFee = await getFee({
    provider,
    psbt: revealPsbt,
    feeRate: feeRate,
  })

  const { psbt: finalRevealPsbt } = await reveal({
    feeRate: feeRate,
    account: account,
    provider: provider,
    script: script,
    commitTxId: commitTxId,
    receiverAddress: account.taproot.address,
    fee: revealFee,
  })

  const { txId: revealTxId } = await provider.pushPsbt({
    psbtBase64: finalRevealPsbt,
  })

  if (!revealTxId) {
    throw new Error('Unable to reveal inscription.')
  }

  successTxIds.push(revealTxId)

  await waitForTransaction({
    txId: revealTxId,
    sandshrewBtcClient: provider.sandshrew,
  })

  await delay(5000)

  const { psbt: transferPsbt } = await transfer({
    feeRate: feeRate,
    account: account,
    provider: provider,
    revealTxId: revealTxId,
    commitChangeUtxoId: commitTxId,
    toAddress: toAddress,
  })

  const { signedPsbt: transferSigned } = await signer.signAllInputs({
    rawPsbt: transferPsbt!,
    finalize: true,
  })

  const transferFee = await getFee({
    provider,
    psbt: transferSigned,
    feeRate: feeRate,
  })

  const { psbt: finalTransferPsbt } = await transfer({
    feeRate: feeRate,
    account: account,
    provider: provider,
    revealTxId: revealTxId,
    commitChangeUtxoId: commitTxId,
    toAddress: toAddress,
    fee: transferFee,
  })

  const { signedPsbt: finalTransferSigned } = await signer.signAllInputs({
    rawPsbt: finalTransferPsbt!,
    finalize: true,
  })

  const { txId: transferTxId } = await provider.pushPsbt({
    psbtBase64: finalTransferSigned,
  })
  return {
    txId: transferTxId,
    rawTxn: finalTransferSigned,
    sendBrc20Txids: [...successTxIds, transferTxId],
  }
}
