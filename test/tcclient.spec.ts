import { ECPair, Network, Regtest, TcClient, Testnet, convertPrivateKeyFromStr, createInscribeTx, createRawRevealTx, generateInscribeContent, start_taptree } from "../src";

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
    //     const tcClient = new TcClient(Testnet);
    //     console.log("tcClient.network ", tcClient.network);
    //     console.log("tcClient.url ", tcClient.url);
    //     const tcAddress = "0x82268aF8207117ddBCD8ce4e444263CcD8d1bF87";
    //     const resp = await tcClient.getNonceInscribeable(tcAddress);
    //     console.log("Final resp: ", resp);
    // });
    it("submit btc tx", async () => {
        const tcClient = new TcClient(Testnet);
        console.log("tcClient.network ", tcClient.network);
        console.log("tcClient.url ", tcClient.url);
        const txHex = "02000000000101648b02c26cc94c337f279a4dbc785ae8b41f24c42415b6a659b598097afb6cc70000000000ffffffff01e8030000000000002251209296a808da18058233515c4d90a1b3bf24a136364a10306da503be88b2068f9203404294480ad4ed025635ca96d8a825e6cd61f258bb1f9b587697f479adf509b5e8f0fbf597676f102ce189d26b92c8dab96e42dd4875405e4d7f0c2addb485a820b420c7eedfdd229d60cc370a48d3daf470151eaadcf4de3f7cc9661427703996514eac00634c8d62766d763182268af8207117ddbcd8ce4e444263ccd8d1bf87000000e0f86e808502540be40082520894f91cee2de943733e338891ef602c962ef4d7eb81880de0b6b3a76400008082adaea04cc68e8614cc64510585da088c65f22ad0db499dfc70de4bd7d443782a2ee138a00bbf93851e4a98f92adcb72a4f77bad23275f8c9c4925a8272c357bcfe2e610a6821c0a4314377c98855b0f3f86a8075a7f322a38b3b9505e4266647a8a5dc78f4fd5d00000000";
        const resp = await tcClient.submitInscribeTx(txHex);
        console.log("Final resp: ", resp);
    });


});