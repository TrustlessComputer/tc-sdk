import BigNumber from "bignumber.js";
import { createRippleTransaction, generateWalletFromSeed, generateXRPWallet, randomWallet, decodeBlobTx, createScripts, createInscribeTxs } from "../dist";
import { randomBytes } from "crypto";
import { assert } from "chai";
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const seed = process.env.XRPL_PRIV_SEED || "";
const wallet = generateWalletFromSeed(seed);
const senderAddress = process.env.XRPL_ADDRESS || "";
const receiverAddress = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe";
const amount = new BigNumber(10);

// main().then(res => {
//     console.log("Res: ", res);
// })

// const bytes = randomBytes(3);

// const memoType = Buffer.from("text/plain", "utf-8").toString("hex");
// const memoData = Buffer.from("BVM.BVM.BVM", "utf-8").toString("hex");

// const memoData2 = Buffer.from("BVM.BVM.BVM.BVM", "utf-8").toString("hex");

// console.log(`Memos: ${memoType} ${memoData}, ${memoData2}`);

// const memos: Memo[] = [
//     {
//         Memo: {
//             MemoData: memoData,
//             MemoType: memoType
//         }

//     },
//     {
//         Memo: {
//             MemoData: memoData2,
//             MemoType: memoType
//         }

//     },
// ]


// createRippleTransaction({
//     wallet,
//     receiverAddress,
//     amount,
//     memos: memos

// }).then(res => {
//     console.log("Res: ", res);
// })





describe("XRPL create txs inscribe data", async () => {
    it("data length is smaller than 1KB: need to create one tx", async () => {

        const data = randomBytes(800);
        console.log("data: ", data.toString("hex"));

        const { txIDs, totalNetworkFee } = await createInscribeTxs({
            senderSeed: seed,
            receiverAddress,
            amount,
            data,
        })

        console.log("txIDs, totalNetworkFee: ", txIDs, totalNetworkFee);
    })

})