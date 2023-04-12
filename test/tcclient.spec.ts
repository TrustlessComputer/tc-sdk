import { ECPair, Mainnet, Network, Regtest, TcClient, Testnet, convertPrivateKeyFromStr, createInscribeTx, createRawRevealTx } from "../src";

import BigNumber from 'bignumber.js';
import { ECPairInterface } from 'ecpair';
import { Psbt } from "bitcoinjs-lib";
import { assert } from 'chai';
import { ethers } from "ethers";

require("dotenv").config({ path: __dirname + "/.env" });
console.log(__dirname + "../test/.env");
var Web3 = require('web3');


// TODO: fill the private key
var sellerPrivateKeyWIF = process.env.PRIV_KEY_1 || "";
var sellerPrivateKey = convertPrivateKeyFromStr(sellerPrivateKeyWIF);
let sellerAddress = process.env.ADDRESS_1 || "";

let buyerPrivateKeyWIF = process.env.PRIV_KEY_2 || "";
let buyerAddress = process.env.ADDRESS_2 || "";
let buyerPrivateKey = convertPrivateKeyFromStr(buyerPrivateKeyWIF);
console.log("buyerPrivateKeyWIF ", buyerPrivateKeyWIF);
console.log("buyerAddress ", buyerAddress);


const tcClient = new TcClient(Mainnet);

let sellerUTXOs = [
    // inscription UTXOs
    // real

    {
        tx_hash: "3725557faa37f011b626a13d5f67cded181616487a7a69cee7ada3f1429db3e0",
        tx_output_n: 0,
        value: new BigNumber(1000),
    },
    {
        tx_hash: "3725557faa37f011b626a13d5f67cded181616487a7a69cee7ada3f1429db3e0",
        tx_output_n: 1,
        value: new BigNumber(2458),
    },
    {
        tx_hash: "3d707230fb43523b0b54beafee2971d6cbcf60ace633ab53d4a43d293de1acd0",
        tx_output_n: 1,
        value: new BigNumber(2000),
    },
    // {
    //     tx_hash: "da7d8f7d7234d65ce8876475ba75e7ab60f6ea807fc0b248270f640db2d0189f",
    //     tx_output_n: 1,
    //     value: 1536, // normal
    // },
    // {
    //     tx_hash: "357b0288744386a5a62c4bda4640566750feee7c0e15f7888d247d251b8db75c",
    //     tx_output_n: 0,
    //     value: 4421,
    // }
];

describe("TC client", async () => {
    // it("get inscribeable info", async () => {
    //     const tcAddress = "0x82268aF8207117ddBCD8ce4e444263CcD8d1bF87";
    //     const resp = await tcClient.getNonceInscribeable(tcAddress);
    //     console.log("Final resp: ", resp);
    // });
    // it("submit btc tx", async () => {
    //     console.log("tcClient.network ", tcClient.network);
    //     console.log("tcClient.url ", tcClient.url);
    //     const txHex = "02000000000101151ea6af3c1921c403b7a90cf6ed210826b9d67075510c6ed15cd90dc2bc209e0000000000ffffffff01e8030000000000002251209296a808da18058233515c4d90a1b3bf24a136364a10306da503be88b2068f92034067c65f1a755678af18d282781133ebb3f0d65f46b0512ee39fdb15dcf0e05615b367cac0b7cbd5af79a61f40cc6a647d0396e2ea4cda1a1ec13fc7580d452f50b420bf84a4d2a625b606701635bbab25d5ea29357729c2354d1a0917bcf4850a9f8dac00634c8d62766d76316363ec9eab02866c69e5a28e675ed07cbfadb7f9000000e0f86e018502540be40082520894f91cee2de943733e338891ef602c962ef4d7eb8188016345785d8a00008082adada0a3823c5c672dfe8def309ea6ecc8fd7906e1ce123fd3df17763f35988a400737a03417a5e31881d735d913065f01b6b28acfb43e0be3941b70c4488559c38209c26821c0a4314377c98855b0f3f86a8075a7f322a38b3b9505e4266647a8a5dc78f4fd5d00000000";
    //     const resp = await tcClient.submitInscribeTx(txHex);
    //     console.log("Final resp: ", resp);
    // });

    // it("submit btc tx", async () => {
    //     console.log("tcClient.network ", tcClient.network);
    //     console.log("tcClient.url ", tcClient.url);
    //     const hashLockKeyPair = ECPair.makeRandom();
    //     const resp = await tcClient.getTapScriptInfo(hashLockKeyPair.publicKey.toString("hex"), "");
    //     console.log("Final resp: ", resp);
    // });

    // it("get uninscribed txs", async () => {
    //     console.log("tcClient.network ", tcClient.network);
    //     console.log("tcClient.url ", tcClient.url);
    //     const tcAddress = "0x82268aF8207117ddBCD8ce4e444263CcD8d1bF87";
    //     const resp = await tcClient.getUnInscribedTransactionByAddress(tcAddress);
    //     console.log("Final resp: ", resp);
    // });

    it("get uninscribed txs", async () => {
        console.log("tcClient.network ", tcClient.network);
        console.log("tcClient.url ", tcClient.url);
        const tcAddress = "0x82268aF8207117ddBCD8ce4e444263CcD8d1bF87";
        const resp = await tcClient.getUnInscribedTransactionDetailByAddress(tcAddress);
        console.log("Final resp: ", resp);
    });


});