/*
*
*
The  parent key should be able to be derived sequentially. The UI can select/change
the path parameters (e.g "44"/"49"/"86")  
// */
import { HdKeyring } from "./keyrings/hdKeyring"

export async function createWallet(hdPathString: string): Promise<any> {
  // Create a new instance of HdKeyring with the provided hdPathString
  const keyring = await new HdKeyring({ hdPath: hdPathString });

  // Add a single account to the keyring
  await keyring.addAccounts(1);

  // Get the first account address
  const accounts = await keyring.getAccounts();
  const address = accounts[0];
  console.log("keyring: ", keyring)

  // Return the address
  return keyring;
}

