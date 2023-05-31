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
    createTx,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    ordCreateInscribeTx,
    selectUTXOs,
    setBTCNetwork,
    setupConfig,
} from "../dist";

import BigNumber from 'bignumber.js';
import { assert } from 'chai';
import { ethers } from "ethers";
import { script } from 'bitcoinjs-lib';

require("dotenv").config({ path: __dirname + "/.env" });
console.log(__dirname + "../test/.env");
var Web3 = require('web3');


// TODO: fill the private key
var privateKeyWIF1 = process.env.PRIV_KEY_1 || "";
var privateKey1 = convertPrivateKeyFromStr(privateKeyWIF1);
let address1 = process.env.ADDRESS_1 || "";

let privateKeyWIF2 = process.env.PRIV_KEY_2 || "";
let address2 = process.env.ADDRESS_2 || "";
let address2Taproot = process.env.ADDRESS_2_REGTEST || "";
let privateKey2 = convertPrivateKeyFromStr(privateKeyWIF2);


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
    // @ts-ignore
    globalThis.storage = storage;

    it("ORD create inscribe tx", async () => {

        setBTCNetwork(NetworkType.Mainnet);

        let utxos: UTXO[] = [
            {
                tx_hash: "45313f4b3e68640c816c758905ce019cdb94dca9115a07edea68d9b778d292f4",
                tx_output_n: 0,
                value: new BigNumber(1000)
            },
            {
                tx_hash: "4a61446ffb9d404037cb8e790b278fa46c98340c47860890153b78960591fd70",
                tx_output_n: 0,
                value: new BigNumber(1000)
            },
            {
                tx_hash: "5f620e35593eeb93b2998e831cb05d75f227d5d5309552b27efdc7725169cbb6",
                tx_output_n: 1,
                value: new BigNumber(962724)
            },

        ];
        // prepare data

        // const content = {
        //     p: "brc-20",
        //     op: "transfer",
        //     tick: ticker,
        //     amt: amt,
        // };

        // const contentStr = JSON.stringify(content);


        const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await ordCreateInscribeTx({
            senderPrivateKey: privateKey2,
            senderAddress: address2,
            utxos: utxos,
            inscriptions: {},
            feeRatePerByte: 18,
            data: "Hello World!",
        });
        // console.log("commitTxB64: ", commitTxB64);
        // console.log("hashLockRedeemScriptHex: ", hashLockRedeemScriptHex);
        // console.log("revealVByte: ", revealVByte);
        // console.log("hashLockPriKey: ", hashLockPriKey);
        // const dataBuff = Buffer.from("f8698080825208949b9add2b5b572ccc43ef2660d8b81cfd0701435b8898a7d9b8314c000080823696a0ee3795a786dd6c4f028517f2f5dd7333f066b83d03ca7404d73b8b212454e123a0488ddfdb48101b5ac0647e1b823f98e05ba7310c3046810e3327d1d2ccc51434", "hex");

        // console.log(dataBuff.length);

        console.log("commitTxHex: ", commitTxHex);
        console.log("commitTxID: ", commitTxID);
        console.log("revealTxHex: ", revealTxHex);
        console.log("revealTxID: ", revealTxID);
        console.log("totalFee: ", totalFee);
    });

    // it("parse asm tx: ", () => {
    //     const hex = "207022ae3ead9927479c920d24b29249e97ed905ad5865439f962ba765147ee038ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800367b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a227a626974222c22616d74223a2231227d68";
    //     const buff = Buffer.from(hex, "hex");
    //     const asm = script.toASM(buff);
    //     console.log("asm: ", asm);

    // })
});