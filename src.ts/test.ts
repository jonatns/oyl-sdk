import { bord } from "./wallet";
import { Script } from "./bscripts";
// import { NodeClient, WalletClient } from "./rpclient";


// //node-port: 8333
// //wallet-port: 8334

// const clientOptions = {
//   network: 'main',
//   port: 8333,
//   host: "198.199.72.193",
//   apiKey: 'bikeshed'
// };

const address = "bc1pakyzxwpk5hxaw7me4rmculprgnfceuxaxyuwjewrjlqwwy5gjk4shksvy2";


//const nodeClient = new NodeClient(clientOptions);

//console.log(nodeClient);

(async ()=>{
//console.log("txbyaddress", await nodeClient.getTXByAddress(address))
console.log(await bord.getInscriptionByHash("8c29b3c193424c85d254052fa5cdc3bcd20b26f50603702ac67700bc4afbd259"));
console.log(Script.fromRaw("x"))
console.log(await bord.getInscriptionsByAddr(address));
})();