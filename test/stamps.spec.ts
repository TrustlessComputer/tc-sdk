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
    createTransferSRC20Script,
    createTx,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    ordCreateInscribeTx,
    selectUTXOs,
    setBTCNetwork,
    setupConfig,
    ARC4Encrypt,
    ARC4Decrypt,
    addZeroTrail,
    createTransferSRC20Tx
} from "../dist";
import { Transaction, script } from 'bitcoinjs-lib';

import BigNumber from 'bignumber.js';
import { assert } from 'chai';
import { ethers } from "ethers";

import * as CryptoJS from "crypto-js";

require("dotenv").config({ path: __dirname + "/.env" });
console.log(__dirname + "../test/.env");
var Web3 = require('web3');


// TODO: fill the private key
var privateKeyWIF1 = process.env.PRIV_KEY_1 || "";
var privateKey1 = convertPrivateKeyFromStr(privateKeyWIF1);
let address1 = process.env.ADDRESS_1 || "";

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

    // it("ARC4 Test", async () => {
    //     // let secretKey = reverseString("6005ee8cc02e528e20c8e5ff71191723b0260391020862a03587a985f813dabe");
    //     // let secretKey = Buffer.from("6005ee8cc02e528e20c8e5ff71191723b0260391020862a03587a985f813dabe", "hex").reverse().toString("hex");
    //     let secretKey = "6005ee8cc02e528e20c8e5ff71191723b0260391020862a03587a985f813dabe";  // tx id

    //     // ebad318f589a78530a2680201930620b32719117ff5e8c02e825e20cc8ee5006
    //     const ciphertext =
    //         "c46b73fe2ff939bea5d0a577950dc8876e863bed11c887d681417dfd70533e" +
    //         "9036c8182c70770f8f6bd702a25c7179bfff1ccb3a844297a717226b88b976" +
    //         "dc054e58b755f233295d2a8759a3e4cbf678619d8e75379e7989046dbce16b" +
    //         "932b35a45d21395ac8bb54b8f9dae3fd2dbc309c24e550cf2211fe6aa897e5";

    //     const plainText = "00457374616d703a7b2270223a227372632d3230222c226f70223a227472616e73666572222c227469636b223a225354455645222c22616d74223a22313030303030303030227d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    //     // encrypt
    //     const cipherParams = ARC4Encrypt(secretKey, plainText);

    //     // decrypt
    //     const plainTextRes = ARC4Decrypt(secretKey, cipherParams);

    //     console.log({ plainTextRes, ciphertext, secretKey, ciphertextRes: cipherParams.toString(CryptoJS.format.Hex) });

    // });

    // it("Add zero trails test", async () => {
    //     const res =
    //         addZeroTrail("00457374616d703a7b2270223a227372632d3230222c226f70223a227472616e73666572222c227469636b223a225354455645222c22616d74223a22313030303030303030227d")
    //     console.log("add str: ", res);


    // })


    // it("createTransferSRC20Script2", async () => {

    //     const dataJson = {
    //         p: "src-20",
    //         op: "transfer",
    //         tick: "sats",
    //         amt: "100000000",

    //     }

    //     const dataStr = JSON.stringify(dataJson);


    //     createTransferSRC20Script2({ data: dataStr, secretKey: "a857b34ad15ba3806073d4557b321567fceec5d0f9c4335553d9cad2dc32f2dc" });
    // })

    it("createTransferSRC20Tx", async () => {

        let utxos: UTXO[] = [
            {
                tx_hash: "9f9c393ba37b0a4c85d410cb28f28ecee024614d826f71c5018378486d8d883a",
                tx_output_n: 3,
                value: new BigNumber(22592)
            },
            {
                tx_hash: "9a92336f3218b1fb904e4a5a1628b22a1a79086c9975170387c249cbd41d451d",
                tx_output_n: 1,
                value: new BigNumber(45358)
            }
        ];

        const dataJson = {
            p: "src-20",
            op: "transfer",
            tick: "doge",
            amt: "1000000",

        }

        const dataStr = JSON.stringify(dataJson);

        // console.log("contentStr: ", contentStr, contentStr.length);


        const { txHex, txID, totalFee: fee, changeAmount, selectedUTXOs } = await createTransferSRC20Tx({
            senderPrivateKey: privateKey2,
            senderAddress: address2,
            utxos: utxos,
            inscriptions: {},
            receiverAddress: "bc1qdk2jcz05y5nf6hf629ccza3zc6eflvxmkqhpesttzvm0f2hq4ntqnqw89j",
            feeRatePerByte: 125,
            sequence: DefaultSequenceRBF,
            data: dataStr,
        });

        console.log({ txHex, txID, totalFee: fee, changeAmount, selectedUTXOs });

        // console.log("commitTxHex: ", commitTxHex);
        // console.log("commitTxID: ", commitTxID);
        // console.log("revealTxHex: ", revealTxHex);
        // console.log("revealTxID: ", revealTxID);
        // console.log("totalFee: ", totalFee);


        // await broadcastTx(txHex);
        // await sleep(6000);
        // await broadcastTx(revealTxHex);



    });


    // let utxos: UTXO[] = [
    //     {
    //         tx_hash: "a857b34ad15ba3806073d4557b321567fceec5d0f9c4335553d9cad2dc32f2dc",
    //         tx_output_n: 1,
    //         value: new BigNumber(65034)
    //     }

    // ];





    // // private key 2
    // // let utxos: UTXO[] = [
    // //     {
    // //         tx_hash: "4ecb19d9a6fbe8580f53708e4c0d81378c31059db070414497a9cb6289233686",
    // //         tx_output_n: 1,
    // //         value: new BigNumber(23340)
    // //     },
    // //     {
    // //         tx_hash: "9f8f6ce4a2e935b6955a664eba337d9cad2df6a6a81b35d8df2fae21ec9dfc86",
    // //         tx_output_n: 1,
    // //         value: new BigNumber(877)
    // //     }

    // // ];

    // // 64
    // // const content = {
    // //     p: "brc-20",
    // //     op: "transfer",
    // //     tick: "sats",
    // //     amt: "15024236490",
    // // };

    // // 78
    // // const content = {
    // //     "p": "brc-20",
    // //     "op": "deploy",
    // //     "tick": "axby",
    // //     "max": "100000000",
    // //     "lim": "100000000",
    // // }

    // // const content2 = {
    // //     "p": "brc-20", 
    // //     "op": "deploy", 
    // //     "tick": "axby",
    // //     "max": "100000000", 
    // //     "lim": "100000000"
    // // }




    // const content = {
    //     "p": "brc-20",
    //     "op": "mint",
    //     "tick": "RCAD",
    //     "amt": "1000000000",
    // }

    // // const content = {
    // //     "p": "brc-20",
    // //     "op": "mint",
    // //     "tick": "RCAD",
    // //     "amt": "1000000000",
    // // }



    // const contentStr = JSON.stringify(content);

    // console.log("contentStr: ", contentStr, contentStr.length);


    // const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await ordCreateInscribeTx({
    //     senderPrivateKey: privateKey2,
    //     senderAddress: address2,
    //     utxos: utxos,
    //     inscriptions: {},
    //     feeRatePerByte: 30,
    //     data: contentStr,
    // });

    // console.log("commitTxHex: ", commitTxHex);
    // console.log("commitTxID: ", commitTxID);
    // console.log("revealTxHex: ", revealTxHex);
    // console.log("revealTxID: ", revealTxID);
    // console.log("totalFee: ", totalFee);


    // await broadcastTx(commitTxHex);
    // await sleep(6000);
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