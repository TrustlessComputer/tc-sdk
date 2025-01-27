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
    createInscribeTxGeneral,
    getNumberHex,
} from "../dist";

import BigNumber from 'bignumber.js';
import { assert } from 'chai';
import { ethers } from "ethers";

// const fs = require('fs');

const fs = require('fs').promises;

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

const readFile = async (fileName: string): Promise<Buffer> => {
    const data = await fs.readFile(__dirname + fileName);
    console.log('File content:', data);
    return data;
}


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

    // it("Test getNumberHex", () => {
    //     console.log(`1 is  ${getNumberHex(1)}`);
    //     console.log(`12 is  ${getNumberHex(12)}`);
    //     console.log(`23 is  ${getNumberHex(23)}`);
    //     console.log(`32 is  ${getNumberHex(32)}`);
    //     console.log(`100 is  ${getNumberHex(100)}`);
    //     console.log(`300 is  ${getNumberHex(300)}`);

    // })

    // it("ORD inscribe parent inscription with meta protocol", async () => {
    //     // private key 2
    //     let utxos: UTXO[] = [
    //         {
    //             tx_hash: "3fc9f3e95628397175c67297e6aff0e2756b9e6e3fc2b6e18975f8330e59b142",
    //             tx_output_n: 1,
    //             value: new BigNumber(88642)
    //         }
    //     ];

    //     const metaProtocol = "BVM";
    //     const parentInscTxID = "a885ff18ea446eda845acf8ae4bc9f8429c16a60fd1428f7344a284e3ef21a07";  // dont change
    //     const parentInscTxIndex = 0;
    //     const parentUTXO: UTXO = {
    //         tx_hash: "92d6f930cca0874c26af389b788a28413732642333a1fc2c16c8ada6610d798f",
    //         tx_output_n: 0,
    //         value: new BigNumber(546),
    //     }

    //     const contentStr = ". BVM . The child inscription #0 ."
    //     const contentType = "text/plain;charset=utf-8";

    //     const contentBuffer = Buffer.from(contentStr, "utf-8");


    //     const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await createInscribeTxGeneral({
    //         senderPrivateKey: privateKey2,
    //         senderAddress: address2,
    //         utxos: utxos,
    //         inscriptions: {},
    //         feeRatePerByte: 5,
    //         data: contentBuffer,
    //         contentType,
    //         metaProtocol,
    //         parentInscTxID,
    //         parentInscTxIndex,
    //         parentUTXO,

    //     });

    //     console.log("commitTxHex: ", commitTxHex);
    //     console.log("commitTxID: ", commitTxID);
    //     console.log("revealTxHex: ", revealTxHex);
    //     console.log("revealTxID: ", revealTxID);
    //     console.log("totalFee: ", totalFee);

    //     // await broadcastTx(commitTxHex);

    //     // await sleep(3000);

    //     // await broadcastTx(revealTxHex);

    // });

    // it("test something", async () => {
    //     const resp = await fetch("https://ordinals.com/content/46b39a79e9087d4ceeed2b67bb5771a90ee6bd94f6aa75720732c355a7bd6e78i0");
    //     console.log("Resp: ", resp);
    //     console.log("Dataa:", await resp.text());

    // })


    it("ORD inscribe the root inscription", async () => {
        // private key 2
        let utxos: UTXO[] = [
            {
                tx_hash: "2c9992307b250c0e7771196e439e01e754b616ec37278e4d42b16ad4d94c1f00",
                tx_output_n: 1,
                value: new BigNumber(41264)
            }
        ];

        const metaProtocol = "Eternal AI";
        // const parentInscTxID = "a885ff18ea446eda845acf8ae4bc9f8429c16a60fd1428f7344a284e3ef21a07";  // dont change
        // const parentInscTxIndex = 0;
        // const parentUTXO: UTXO = {
        //     tx_hash: "92d6f930cca0874c26af389b788a28413732642333a1fc2c16c8ada6610d798f",
        //     tx_output_n: 0,
        //     value: new BigNumber(546),
        // }

        // TODO: EDIT HERE
        // const contentType = "text/javascript";
        const contentType = "text/html";
        // const contentBuffer = await readFile("./eternal/utils.js");

        // test / shardai / drawmin64"test/shardai/drawmin64"

        // const contentType = "text/base64";
        // const contentBuffer = await readFile("/shardai/final.js");
        const contentBuffer = await readFile("/shardai/index.html");
        console.log("contentBuffer: ", contentBuffer);
        console.log("contentBuffer len: ", contentBuffer.length);


        const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await createInscribeTxGeneral({
            senderPrivateKey: privateKey2,
            senderAddress: address2,
            utxos: utxos,
            inscriptions: {},
            feeRatePerByte: 6,
            data: contentBuffer,
            contentType,
            metaProtocol,
            // parentInscTxID,
            // parentInscTxIndex,
            // parentUTXO,

        });

        console.log("commitTxHex: ", commitTxHex);
        console.log("commitTxID: ", commitTxID);
        console.log("revealTxHex: ", revealTxHex);
        console.log("revealTxID: ", revealTxID);
        console.log("totalFee: ", totalFee);

        await broadcastTx(commitTxHex);

        await sleep(3000);

        await broadcastTx(revealTxHex);

    });
});