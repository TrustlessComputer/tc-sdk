import { Client, Wallet, Payment, AccountInfoResponse, decode } from "xrpl";

import { createHash } from "crypto";

async function getAccountInfo(address: string, client: Client): Promise<AccountInfoResponse> {
    // Replace with the XRPL node URL (testnet or mainnet)
    // const client = new Client("wss://s.altnet.rippletest.net:51233"); // Testnet
    // await client.connect();

    // Replace with the Ripple address you want to query
    // const address = "rBUCUFK578yFnWe8wSd23UKYgj42p61ssK";


    // Fetch account info
    // try {
    const accountInfo = await client.request({
        command: "account_info",
        account: address,
        ledger_index: "validated", // You can use "current", "closed", or a specific ledger number
    });

    // console.log("Account Info:", accountInfo);
    return accountInfo
    // } finally {
    //     await client.disconnect()
    // }
}




const decodeBlobTx = (blobTx: string) => {
    const decodedTx = decode(blobTx);
    console.log("Decoded Transaction:", decodedTx);
}




// Input data


const sha256Hash = (data: Buffer): Buffer => {
    // const data = "Hello, world!";

    // Generate SHA-256 hash
    // const hash = createHash("sha256").update(data).digest("hex");
    const hash = createHash("sha256").update(data);
    return hash.digest();
}





export {
    getAccountInfo,
    decodeBlobTx,
    sha256Hash,
}