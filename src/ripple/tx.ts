// Dependencies for Node.js.
// In browsers, use a <script> tag instead.
// if (typeof module !== "undefined") {
//     // Use var here because const/let are block-scoped to the if statement.
//     var xrpl = require('xrpl');
// }

// var Wallet = xrpl.Wallet;

import { Client, Wallet, Payment, xrpToDrops, dropsToXrp, getBalanceChanges, SubmittableTransaction, Memo } from "xrpl";
import { encodeBase58, decodeBase58, encodeBase58WithChecksum } from "../utils";
import { getAccountInfo, sha256Hash } from "./utils";
import BigNumber from 'bignumber.js';

const XRPL_RPC = "wss://s.altnet.rippletest.net:51233";


const generateXRPWallet = (seed: string) => {
    const seedEncoded = encodeBase58WithChecksum(Buffer.from(seed));
    console.log(`generateXRPWallet ${seedEncoded}`);
    // Step 2: Generate or use an existing wallet
    const wallet = Wallet.fromSeed(seedEncoded); // Replace with your secret key
    console.log(`Wallet address: ${wallet.address}`);

    console.log(`Wallet ${wallet}`);

}

const submitTx = async (blobTx: string, client: Client) => {
    const resp = await client.submitAndWait(blobTx);
    if (resp.status == "error" || !resp.result) {
        console.error(`submitTx error: ${resp}`);
        throw new Error(`submitTx error: ${resp}`)
    }
    console.log("submitTx resp:", resp);

    if (!resp.result.validated) {
        throw new Error("submitTx transaction is not validated");
    }

    return resp.result;
}

const createRippleTransaction = async ({
    wallet,
    receiverAddress,
    amount,
    memos = [],
    fee = new BigNumber(0),
}: {
    wallet: any,
    receiverAddress: string
    amount: BigNumber,
    memos?: Memo[],
    fee?: BigNumber,
}): Promise<{ txID: string, txFee: string }> => {

    // Step 1: Connect to the XRPL testnet
    const client = new Client(XRPL_RPC); // Testnet URL
    await client.connect();
    console.log("Connected to XRPL testnet");

    const balance = await client.getBalances(wallet.address)
    console.log("Get balance from node: ", balance);

    const accountInfo = await getAccountInfo(wallet.address, client);
    console.log("Account Sequence:", accountInfo.result.account_data?.Sequence);

    // Step 2: Generate or use an existing wallet
    // const wallet = Wallet.fromSeed("L3DYgF3iHbkWvrmfyG5Cbwk2b5p88K9tmpp3wiT7HaUr5UU6p9Hc"); // Replace with your secret key
    // console.log(`Wallet address: ${wallet.address}`);


    // Step 3: Define the payment transaction
    const payment: Payment = {
        TransactionType: "Payment",
        Account: wallet.address,
        Destination: receiverAddress, // Replace with destination address
        Amount: amount.toString(), // Amount in drops (1 XRP = 1,000,000 drops)
        // Fee: fee.toString(),
        // LastLedgerSequence:   // default current ledger + 200
        // Memos: memos,
    };


    if (fee.comparedTo(new BigNumber(0)) == 1) {
        payment.Fee = fee.toString();  // in drops
    }

    if (memos && memos.length > 0) {
        payment.Memos = memos;
    }

    // Step 4: Prepare the transaction
    const preparedTx = await client.autofill(payment);
    console.log("Transaction prepared:", preparedTx);

    // Step 5: Sign the transaction
    const signedTx = wallet.sign(preparedTx);
    console.log("Transaction signed:", signedTx);

    // Step 6: Submit the transaction
    const result = await submitTx(signedTx.tx_blob, client);
    console.log("Transaction result:", result);

    // Step 7: Disconnect from the client
    await client.disconnect();
    console.log("Disconnected from XRPL");

    return { txID: result.hash, txFee: result.tx_json.Fee || "0" };
}


export {
    generateXRPWallet,
    createRippleTransaction,
}