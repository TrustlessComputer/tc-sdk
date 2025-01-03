import {
    BNZero,
    DefaultSequenceRBF,
    Inscription,
    Mainnet,
    MinSats,
    NetworkType,
    Regtest,
    StorageService,
    TcClient,
    UTXO,
    broadcastTx,
    convertPrivateKey,
    convertPrivateKeyFromStr,
    createBatchInscribeTxs,
    createInscribeTx,
    createTx,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    ordCreateInscribeTx,
    createInscribeImgTx,
    selectUTXOs,
    setBTCNetwork,
    setupConfig,
    generateTaprootAddress,
} from "../dist";

import BigNumber from 'bignumber.js';
import { assert } from 'chai';
import { ethers } from "ethers";

const fs = require('fs');

require("dotenv").config({ path: __dirname + "/.env" });
console.log(__dirname + "../test/.env");
var Web3 = require('web3');


// TODO: fill the private key
// var privateKeyWIF1 = process.env.PRIV_KEY_1 || "";
// var privateKey1 = convertPrivateKeyFromStr(privateKeyWIF1);
// let address1 = process.env.ADDRESS_1 || "";

let privateKeyWIF2 = process.env.PRIV_KEY_2 || "";
let address2 = process.env.ADDRESS_2 || "";
// let address2 = process.env.ADDRESS_2_REGTEST || "";
let privateKey2 = convertPrivateKeyFromStr(privateKeyWIF2);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


describe("Sign msg Tx", async () => {
    const password = '1234';
    const LocalStorage = require('node-localstorage').LocalStorage
    const localStorage = new LocalStorage('./scratch');
    const storage = new StorageService()
    storage.implement({
        namespace: undefined,
        getMethod(key: string): Promise<any> {
            return localStorage.getItem(key);
        },
        removeMethod(key: string): Promise<any> {
            return localStorage.removeItem(key);
        },
        setMethod(key: string, data: string): Promise<any> {
            return localStorage.setItem(key, data);
        }
    });

    const tcClient = new TcClient(Mainnet)
    setupConfig({
        storage,
        tcClient: tcClient,
        netType: NetworkType.Mainnet
    })
    setBTCNetwork(NetworkType.Mainnet);
    // @ts-ignore
    globalThis.storage = storage;

    // it("ORD create inscribe tx", async () => {
    //     let utxos: UTXO[] = [
    //         {
    //             tx_hash: "a857b34ad15ba3806073d4557b321567fceec5d0f9c4335553d9cad2dc32f2dc",
    //             tx_output_n: 1,
    //             value: new BigNumber(65034)
    //         }

    //     ];



    //     // private key 2
    //     // let utxos: UTXO[] = [
    //     //     {
    //     //         tx_hash: "4ecb19d9a6fbe8580f53708e4c0d81378c31059db070414497a9cb6289233686",
    //     //         tx_output_n: 1,
    //     //         value: new BigNumber(23340)
    //     //     },
    //     //     {
    //     //         tx_hash: "9f8f6ce4a2e935b6955a664eba337d9cad2df6a6a81b35d8df2fae21ec9dfc86",
    //     //         tx_output_n: 1,
    //     //         value: new BigNumber(877)
    //     //     }

    //     // ];

    //     // 64
    //     const content = {
    //         p: "brc-20",
    //         op: "transfer",
    //         tick: "BVMN",
    //         amt: "15024236490",
    //     };

    //     // 78
    //     // const content = {
    //     //     "p": "brc-20",
    //     //     "op": "deploy",
    //     //     "tick": "axby",
    //     //     "max": "100000000",
    //     //     "lim": "100000000",
    //     // }

    //     // const content2 = {
    //     //     "p": "brc-20", 
    //     //     "op": "deploy", 
    //     //     "tick": "axby",
    //     //     "max": "100000000", 
    //     //     "lim": "100000000"
    //     // }


    //     // const content = {
    //     //     "p": "brc-20",
    //     //     "op": "mint",
    //     //     "tick": "RCAD",
    //     //     "amt": "1000000000",
    //     // }

    //     // const content = {
    //     //     "p": "brc-20",
    //     //     "op": "mint",
    //     //     "tick": "RCAD",
    //     //     "amt": "1000000000",
    //     // }



    //     const contentStr = JSON.stringify(content);

    //     console.log("contentStr: ", contentStr, contentStr.length);


    //     const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await ordCreateInscribeTx({
    //         senderPrivateKey: privateKey2,
    //         senderAddress: address2,
    //         utxos: utxos,
    //         inscriptions: {},
    //         feeRatePerByte: 30,
    //         data: contentStr,
    //     });

    //     console.log("commitTxHex: ", commitTxHex);
    //     console.log("commitTxID: ", commitTxID);
    //     console.log("revealTxHex: ", revealTxHex);
    //     console.log("revealTxID: ", revealTxID);
    //     console.log("totalFee: ", totalFee);


    //     await broadcastTx(commitTxHex);
    //     await sleep(10000);
    //     await broadcastTx(revealTxHex);


    //     // createInscribeTx({

    //     // })



    //     // send  btc
    //     // const { txID, txHex, fee: feeRes } = createTxSendBTC({
    //     //     senderPrivateKey: privateKey2,
    //     //     senderAddress: address2,
    //     //     utxos,
    //     //     inscriptions: {},
    //     //     paymentInfos: [
    //     //         // { address: receiverAddress, amount: new BigNumber(10000000) },
    //     //         { address: "bc1qapk2kv9jxs3ut30xdfcemqaqdlrwv3sndd0f7c", amount: new BigNumber(100000) },
    //     //     ],
    //     //     feeRatePerByte: 25,
    //     //     sequence: DefaultSequenceRBF,
    //     // });

    //     // const finalTXID = await broadcastTx(txHex);
    //     // console.log("finalTXID: ", finalTXID);
    //     // console.log(txID, txHex, feeRes);
    //     // console.log("commitTxB64: ", commitTxB64);
    //     // console.log("hashLockRedeemScriptHex: ", hashLockRedeemScriptHex);
    //     // console.log("revealVByte: ", revealVByte);
    //     // console.log("hashLockPriKey: ", hashLockPriKey);
    //     // const dataBuff = Buffer.from("f8698080825208949b9add2b5b572ccc43ef2660d8b81cfd0701435b8898a7d9b8314c000080823696a0ee3795a786dd6c4f028517f2f5dd7333f066b83d03ca7404d73b8b212454e123a0488ddfdb48101b5ac0647e1b823f98e05ba7310c3046810e3327d1d2ccc51434", "hex");

    //     // console.log(dataBuff.length);


    // });


    // it("ORD create inscribe img tx", async () => {
    //     let utxos: UTXO[] = [
    //         {
    //             tx_hash: "432aee889a826323171695c76423e46c761fbe8446c96f60b281282010828c0b",
    //             tx_output_n: 1,
    //             value: new BigNumber(86012)
    //         }

    //     ];

    //     const address = generateTaprootAddress(privateKey2);
    //     console.log({ address });

    //     const receiverAddress = "bc1pd9swmqhw2zn0y6x0wxjjdpqsjphdwfq92en68m7qzq7w9tnrhm7q3l9r7p";



    //     // 64

    //     const file = fs.readFileSync(__dirname + "/images/test_small.jpeg");

    //     console.log({ file })



    //     const contentStr = file;

    //     console.log("contentStr: ", contentStr, contentStr.length);


    //     const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await createInscribeImgTx({
    //         senderPrivateKey: privateKey2,
    //         senderAddress: address2,
    //         utxos: utxos,
    //         inscriptions: {},
    //         feeRatePerByte: 23,
    //         data: contentStr,
    //         contentType: "image/jpeg",
    //         receiverAddress: receiverAddress,
    //     });

    //     console.log("commitTxHex: ", commitTxHex);
    //     console.log("commitTxID: ", commitTxID);
    //     console.log("revealTxHex: ", revealTxHex);
    //     console.log("revealTxID: ", revealTxID);
    //     console.log("totalFee: ", totalFee);


    //     // await broadcastTx(commitTxHex);
    //     // await sleep(10000);
    //     // await broadcastTx(revealTxHex);
    // });

    it("ORD deploy brc20", async () => {
        // private key 2
        let utxos: UTXO[] = [
            {
                tx_hash: "b30dfa7070e8b34c530ce4d7e49c0b23c2740595775c26d7c30dd3af987a28f8",
                tx_output_n: 1,
                value: new BigNumber(4330)
            }

        ];


        // const content = {
        //     "p": "brc-20",
        //     "op": "deploy",
        //     "tick": "axby",
        //     "max": "100000000",
        //     "lim": "100000000"
        // }

        // const contentStr = JSON.stringify(content);


        // const content = {
        //     "p": "brc-20",
        //     "op": "mint",
        //     "tick": "axby",
        //     "amt": "100000000"
        // }

        const contentStr = "Hello, world!"


        const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await ordCreateInscribeTx({
            senderPrivateKey: privateKey2,
            senderAddress: address2,
            utxos: utxos,
            inscriptions: {},
            feeRatePerByte: 5,
            data: contentStr,
        });

        console.log("commitTxHex: ", commitTxHex);
        console.log("commitTxID: ", commitTxID);
        console.log("revealTxHex: ", revealTxHex);
        console.log("revealTxID: ", revealTxID);
        console.log("totalFee: ", totalFee);

        // await broadcastTx(commitTxHex);

        // await sleep(3000);

        // await broadcastTx(revealTxHex);


        // createInscribeTx({

        // })



        // send  btc
        // const { txID, txHex, fee: feeRes } = createTxSendBTC({
        //     senderPrivateKey: privateKey2,
        //     senderAddress: address2,
        //     utxos,
        //     inscriptions: {},
        //     paymentInfos: [
        //         // { address: receiverAddress, amount: new BigNumber(10000000) },
        //         { address: "bc1qapk2kv9jxs3ut30xdfcemqaqdlrwv3sndd0f7c", amount: new BigNumber(100000) },
        //     ],
        //     feeRatePerByte: 25,
        //     sequence: DefaultSequenceRBF,
        // });

        // const finalTXID = await broadcastTx(txHex);
        // console.log("finalTXID: ", finalTXID);
        // console.log(txID, txHex, feeRes);
        // console.log("commitTxB64: ", commitTxB64);
        // console.log("hashLockRedeemScriptHex: ", hashLockRedeemScriptHex);
        // console.log("revealVByte: ", revealVByte);
        // console.log("hashLockPriKey: ", hashLockPriKey);
        // const dataBuff = Buffer.from("f8698080825208949b9add2b5b572ccc43ef2660d8b81cfd0701435b8898a7d9b8314c000080823696a0ee3795a786dd6c4f028517f2f5dd7333f066b83d03ca7404d73b8b212454e123a0488ddfdb48101b5ac0647e1b823f98e05ba7310c3046810e3327d1d2ccc51434", "hex");

        // console.log(dataBuff.length);


    });

    // it("parse asm tx: ", () => {
    //     // const hex = "207022ae3ead9927479c920d24b29249e97ed905ad5865439f962ba765147ee038ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800367b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a227a626974222c22616d74223a2231227d68";
    //     // const buff = Buffer.from(hex, "hex");
    //     // const asm = script.toASM(buff);
    //     // console.log("asm: ", asm);




    //     // // const asm2 = "7022ae3ead9927479c920d24b29249e97ed905ad5865439f962ba765147ee038 OP_CHECKSIG OP_0 OP_IF 6f7264 OP_1 746578742f706c61696e3b636861727365743d7574662d38 OP_0 7b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a227a626974222c22616d74223a2231227d OP_ENDIF"
    //     // const buff2 = script.fromASM(asm);
    //     // const hex2 = buff2.toString("hex");
    //     // console.log("hex2: ", hex2);

    //     const txHex = "02000000000101a2faaf1f91b5387c34e5577050748260ae6ec455bb5467b59fdf9ea5a07e5a0d0000000000fdffffff012202000000000000225120b994ae5f1c653ae69136df697b9539881e5ccde65d520bb51f5af39ccc19e7cc014087be85fcf966483d499db893ea015960cea2df48f061d5c93aa76447ce9cc86fc8a0a55b0a712d77188ef9c7658dda0743d003b57dfe365ce6ae5c4982ac9dfd00000000";
    //     const tx = Transaction.fromHex(txHex);


    //     console.log("tx: ", tx);

    // })
});