import { internalPubKeyToTaprootAddress } from "../shared/utils";
import { decodeSimulateResponse, encodeSimulateRequest } from "alkanes/lib/invoke";
import { metashrew } from "../rpclient/alkanes";

const stripHexPrefix = (v) => v.substr(0, 2) === '0x' ? v.substr(2) : v;
let id = 0;

export const fetchSigner = async (provider) => {
  const url = metashrew.get() || provider.alkanes.alkanesUrl;
  const payload = encodeSimulateRequest({
    alkanes: [],
    height: 880000n,
    vout: 0,
    txindex: 0,
    target: {
      block: 32n,
      tx: 0n
    },
    inputs: [103n],
    pointer: 0,
    refundPointer: 0,
    block: '0x',
    transaction: '0x'
  });
  const responseText = await (await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': "application/json"
    },
    body: JSON.stringify({
      method: 'metashrew_view',
      params: ["simulate", payload, "latest"],
      id: id++,
      jsonrpc: "2.0"
    })
  })).text();
  const response = JSON.parse(responseText);
  return Buffer.from(stripHexPrefix(decodeSimulateResponse(response.result).execution.data), 'hex');
};
export const getWrapAddress = async (provider) => {
    return internalPubKeyToTaprootAddress(await fetchSigner(provider), provider.network)
}
