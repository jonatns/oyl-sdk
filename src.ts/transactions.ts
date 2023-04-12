
import requireGlobal from '../scripts'
const bcoin = requireGlobal("bcoin");

const network = bcoin.Network.get('testnet')

const walletOptions = {
    network: network.type,
    port: network.walletPort,
    apiKey: 'api-key'
}

async function getWalletBalance(account = 'default') {
    const walletClient = new bcoin.WalletClient(walletOptions);
    const wallet = walletClient.wallet(account); //dummy

    try {
        const result = await wallet.getBalance(account);
        const response = {
            status: '200',
            message: 'OK',
            result: {
                confirm_amount: (result.confirmed / 1e8).toFixed(8),
                pending_amount: ((result.unconfirmed - result.confirmed) / 1e8).toFixed(8),
                amount: (result.unconfirmed / 1e8).toFixed(8),
                usd_value: 'unavailable', // TO-DO Connect to Exchange Rates
            },
        };
        return response;
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return null;
    }
}


async function processUTXOs(txResponse, addresses) {

    const transactions = [];
    const minConfirmations = 3;

    txResponse.forEach((result) => {
        let confirmed: boolean = false;
        if (result.confirmations > minConfirmations) { confirmed = true; }
        let sent: boolean = false;
        let value: number = 0;
        const change: string[] = [];
        const receivers: string[] = [];
        const senders: string[] = [];
        const inputs: string[] = [];

        result.vin.forEach((input: any) => {
            if (addresses.includes(input.addr)) {
                sent = true;
            }
            senders.push(input.addr);
            inputs.push(input.txid);
        });
        result.vout.forEach((output: any) => {
            const outputAddr = output.scriptPubKey.addresses;
            const v = parseFloat(output.value);
            outputAddr.forEach((addr: any) => {
                const ad = addr[0];
                if (sent && !addresses.includes(addr)) {
                    receivers.push(addr);
                    value += v;
                } else if (!sent && addresses.includes(addr)) {
                    value += v;
                    receivers.push(addr);
                } else {
                    change.push(addr);
                }
            });
        });

        const transaction = {
            sent,
            value,
            change,
            confirmed,
            inputs,
            confirmations: result.confirmations,
            hash: result.txid,
            blockHeight: result.blockheight,
            fee: result.fees,
            sender: senders,
            receiver: receivers,
            receivedTime: result.time,
            confirmedTime: result.blocktime,
        };
        transactions.push(transaction);
    });

}
