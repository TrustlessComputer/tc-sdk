// Dependencies for Node.js.
// In browsers, use a <script> tag instead.
// if (typeof module !== "undefined") {
//     // Use var here because const/let are block-scoped to the if statement.
//     var xrpl = require('xrpl');
// }

// var Wallet = xrpl.Wallet;

import { Client, Wallet, Payment, xrpToDrops, dropsToXrp, getBalanceChanges, SubmittableTransaction, Memo, AccountInfoRequest } from "xrpl";
import { encodeBase58, decodeBase58, encodeBase58WithChecksum } from "../utils";
import { getAccountInfo, sha256Hash } from "./utils";
import BigNumber from 'bignumber.js';
import { BlobOptions } from "buffer";

const XRPL_RPC = "wss://s.altnet.rippletest.net:51233";


const generateXRPWallet = (seed: string) => {
    const seedEncoded = encodeBase58WithChecksum(Buffer.from(seed));
    console.log(`generateXRPWallet ${seedEncoded}`);
    // Step 2: Generate or use an existing wallet
    const wallet = Wallet.fromSeed(seedEncoded); // Replace with your secret key
    console.log(`Wallet address: ${wallet.address}`);

    console.log(`Wallet ${wallet}`);

}

const submitTxWait = async (blobTx: string, client: Client): Promise<{ txID: string, txFee: string }> => {

    const resp = await client.submitAndWait(blobTx);


    if (resp.status == "error" || !resp.result) {
        console.error(`submitTx error: ${resp}`);
        throw new Error(`submitTx error: ${resp}`)
    }
    console.log("submitTx resp:", resp);

    if (!resp.result.validated) {
        throw new Error("submitTx transaction is not validated");
    }

    return {
        txID: resp.result.hash, txFee: resp.result.tx_json.Fee || ""
    }
}

const submitTx = async (blobTx: string, client: Client): Promise<{ txID: string, txFee: string }> => {

    const resp = await client.submit(blobTx);
    if (resp.status == "error" || !resp.result) {
        console.error(`submitTx error: ${resp}`);
        throw new Error(`submitTx error: ${resp}`)
    }
    console.log("submitTx resp:", resp);

    // if (!resp.result.validated) {
    //     throw new Error("submitTx transaction is not validated");
    // }

    return { txID: resp.result.tx_json.hash || "", txFee: resp.result.tx_json.Fee || "" };
}




const getCurrentSequence = async (client: Client, address: string): Promise<number> => {
    const request: AccountInfoRequest = {
        command: 'account_info',
        account: address,
        ledger_index: 'current',
    }
    const data = await client.request(request)
    // eslint-disable-next-line no-param-reassign, require-atomic-updates -- param reassign is safe with no race condition

    return data.result.account_data.Sequence

}

const createRippleTransaction = async ({
    client,
    wallet,
    receiverAddress,
    amount,
    memos = [],
    fee = new BigNumber(0),
    rpcEndpoint,
    sequence = 0,
    isWait = true,
}: {
    client: Client,
    wallet: any,
    receiverAddress: string
    amount: BigNumber,
    memos?: Memo[],
    fee?: BigNumber,
    rpcEndpoint: string,
    sequence?: number,
    isWait?: boolean,
}): Promise<{ txID: string, txFee: string }> => {

    // // Step 1: Connect to the XRPL testnet
    // const client = new Client(rpcEndpoint); // Testnet URL
    // await client.connect();
    // console.log("Connected to XRPL testnet");

    // const balance = await client.getBalances(wallet.address)
    // console.log("Get balance from node: ", balance);

    // const accountInfo = await getAccountInfo(wallet.address, client);
    // console.log("Account Sequence:", accountInfo.result.account_data?.Sequence);


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

    if (sequence > 0) {
        payment.Sequence = sequence;
    }

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
    let result;
    if (isWait) {
        result = await submitTxWait(signedTx.tx_blob, client);
    } else {
        result = await submitTx(signedTx.tx_blob, client);
    }

    console.log("Transaction result:", result);

    return result;
}

const createRawRippleTransaction = async ({
    client,
    wallet,
    receiverAddress,
    amount,
    memos = [],
    fee = new BigNumber(0),
    sequence = 0,
}: {
    client: Client,
    wallet: any,
    receiverAddress: string
    amount: BigNumber,
    memos?: Memo[],
    fee?: BigNumber,
    sequence?: number,
}): Promise<any> => {

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

    if (sequence > 0) {
        payment.Sequence = sequence;
    }

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

    // // Step 6: Submit the transaction
    // let result;
    // if (isWait) {
    //     result = await submitTxWait(signedTx.tx_blob, client);
    // } else {
    //     result = await submitTx(signedTx.tx_blob, client);
    // }

    // console.log("Transaction result:", result);

    return signedTx;
}


export {
    generateXRPWallet,
    createRippleTransaction,
    createRawRippleTransaction,
}