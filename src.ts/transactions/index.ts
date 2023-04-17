import { PrevOut, Output, Transaction } from '../interface/transaction'


export const getAddressTx = async function (address: string, client) {
    const result = await client.getTXByAddress(address);
    return result;
}


export const getUnspentOutputs = (transactions: Transaction[]): Output[] => {
    const spentOutputs: PrevOut[] = [];

    for (const tx of transactions) {
        for (const input of tx.inputs) {
            spentOutputs.push(input.prevout);
        }
    }

    const unspentOutputs: Output[] = [];

    for (const tx of transactions) {
        tx.outputs.forEach((output, index) => {
            const outputIdentifier = { hash: tx.inputs[0].prevout.hash, index };
            const isSpent = spentOutputs.some(
                (spentOutput) =>
                    spentOutput.hash === outputIdentifier.hash &&
                    spentOutput.index === outputIdentifier.index
            );

            if (!isSpent) {
                unspentOutputs.push(output);
            }
        });
    }
    return unspentOutputs;
}

export const  calculateBalance =  function (utxos): number  {
    let balance = 0;
    for (const utxo of utxos) {
        balance += utxo.value;
    }
    return balance / 1e8; // Convert from satoshis to BTC
}
