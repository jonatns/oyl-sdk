import fetch from "node-fetch"

/*
*
*
Need to figure out how to get inscriptions locally. At the moment, 
it uses a public api, Getting inscriptions directly on the client 
with a normal rpc server (without indexing) is tricky. It involves two considerations
The first one was explained in the README, still working on the 
second one. There is just a pattern/route we need to look for.
*
*
*/

export const getInscriptionByHash = async (txhash) => {
    try {
        const response = await fetch(`https://ordapi.xyz/output/${txhash}:0`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch inscriptions for address ${txhash}`);
        }

        const jsonResponse = await response.json();

        //TO-DO: Fix type
        const inscriptionsArr: any = []

        if (jsonResponse.inscriptions) {
            const path = jsonResponse.inscriptions

            let inscription = {
                inscriptionid: path.split("/inscription/")[1],
                value: jsonResponse.value,
                address: jsonResponse.address
            };

            inscriptionsArr.push(inscription);

        }

        return inscriptionsArr;
    } catch (error) {
        console.error(error);
    }
}


export const getInscriptionsByAddr = async (address) => {
    try {
        const response = await fetch(`https://ordapi.xyz/address/${address}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch inscriptions for address ${address}`);
        }

        //TO-DO fix types
        const inscriptionsJson = await response.json();
        const inscriptions: any = [];
        for (const inscriptionJson of inscriptionsJson) {
            if (inscriptionJson.hasOwnProperty('genesis_transaction')) {
                const inscription = {
                    inscriptionid: inscriptionJson.id,
                    value: inscriptionJson.output_value,
                    address: address
                };
                inscriptions.push(inscription);
            }
        }
        return inscriptions;
    } catch (error) {
        console.error(error);
    }
}