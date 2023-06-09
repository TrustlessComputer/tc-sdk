// import { DefaultSequenceRBF, Network, NetworkType, UTXO, convertPrivateKeyFromStr, setBTCNetwork, } from "../src/bitcoin";
// import { Mainnet, TcClient, Testnet, aggregateUTXOs, createBatchInscribeTxs, createInscribeTx, createRawRevealTx, replaceByFeeInscribeTx, splitBatchInscribeTx } from "../src/tc";

import {
    BNZero,
    DefaultSequenceRBF,
    Inscription,
    MinSats,
    NetworkType,
    Regtest,
    UTXO,
    broadcastTx,
    convertPrivateKey,
    convertPrivateKeyFromStr,
    createBatchInscribeTxs,
    createTx,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    selectUTXOs,
    setBTCNetwork,
    splitBatchInscribeTx
} from "../dist";
import {
    Mainnet,
    MasterWallet,
    StorageService,
    TcClient,
    decryptAES,
    encryptAES,
    getStorageHDWallet,
    randomMnemonic,
    setStorageHDWallet,
    setupConfig,
    validateHDWallet
} from "../dist";

import BigNumber from 'bignumber.js';
import { assert } from 'chai';
import { ethers } from "ethers";

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

let buyerUTXOs = [
    // Testnet
    // {
    //     tx_hash: "257211e1a557ba1f9b058aaf7cc1f7280e4cfdaeb76e68087010e04b0870ad55",
    //     tx_output_n: 1,
    //     value: new BigNumber(6000),
    // },
    // {
    //     tx_hash: "a128032184d352256e12d81e60e70188cde9da67423439521eae8829f067274c",
    //     tx_output_n: 0,
    //     value: new BigNumber(6050),
    // },

    // Mainnet
    {
        tx_hash: "7b936229ad20dbcd2eed0fca2bf60838cf9be83ebc4994b9115093fa0072f8e1",
        tx_output_n: 1,
        value: new BigNumber(440655),
    },
    // {
    //     tx_hash: "60e83a8c8b5ba2e4317253ee617d8fe3a5c8e6f2d61ff95df484e9605eac6228",
    //     tx_output_n: 0,
    //     value: new BigNumber(1000),
    // },
    // {
    //     tx_hash: "2e10cccd862ef25e39db9c3b33ed0fd68a3a2e6c315077137ab6af6ba5de0cef",
    //     tx_output_n: 0,
    //     value: new BigNumber(1000),
    // },

];

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
    // it("create signed raw tc tx", async () => {
    //     // var web3 = new Web3(Web3.givenProvider);
    //     // const tcAddress = "0x82268aF8207117ddBCD8ce4e444263CcD8d1bF87";
    //     // const toAddress = "0xF91cEe2DE943733e338891Ef602c962eF4D7Eb81";
    //     // const callbackFn = (err: any, res: any) => {
    //     //     console.log("err: ", err);
    //     //     console.log("res: ", res);
    //     // }
    //     // await web3.eth.signTransaction({
    //     //     from: tcAddress,
    //     //     gasPrice: "10",
    //     //     gas: "21000",
    //     //     to: toAddress,
    //     //     value: "10000000000000000",
    //     //     data: ""
    //     // }, tcAddress, callbackFn);

    //     const tx = {
    //         "nonce": "0x0", "gasPrice": "0x2540be400", "gas": "0x5208", "to": "0xF91cEe2DE943733e338891Ef602c962eF4D7Eb81", "value": "0x2386f26fc10000", "input": "0x", "v": "0xadae", "r": "0xf9b5498dbbb514d896391ed0aff62fe381fcada60c4a24d50995217f4e5debf", "s": "0x136bf98a811ff28e1b39cd0b4da2a91c65f2f8ccdf6602e894f5a1e67f896d5b", "hash": "0x7b18470897091fc2cc75b0b7288b2e0e1ffc7ab13b146e295c6acf6a62f9bf54", "from": "0x82268aF8207117ddBCD8ce4e444263CcD8d1bF87", "blockHash": null, "blockNumber": null, "transactionIndex": null
    //     }

    //     const unsignedTx = {
    //         to: tx.to,
    //         nonce: 0,
    //         gasLimit: tx.gas,
    //         gasPrice: tx.gasPrice,
    //         data: tx.input,
    //         value: tx.value,
    //         chainId: 22213,
    //     };
    //     const signature = {
    //         v: 44462,
    //         r: tx.r,
    //         s: tx.s
    //     }

    //     const serialized = ethers.utils.serializeTransaction(unsignedTx, signature);
    //     console.log("serialized: ", serialized);

    // })
    // it("should return the raw commit tx", async () => {
    //     // const data = "0xf86e808502540be40082520894f91cee2de943733e338891ef602c962ef4d7eb81880de0b6b3a76400008082adaea04cc68e8614cc64510585da088c65f22ad0db499dfc70de4bd7d443782a2ee138a00bbf93851e4a98f92adcb72a4f77bad23275f8c9c4925a8272c357bcfe2e610a";
    //     // const tcAddress = "0x82268aF8207117ddBCD8ce4e444263CcD8d1bF87";
    //     const tcTxIDs = ["0x3fcf0decf4b8740a82da6d8e78ff59b6ddc1c6b85696b9abeffbe3f22dceab73"]; // need to be inscribed

    //     setBTCNetwork(NetworkType.Mainnet);
    //     const tcClient = new TcClient(Mainnet);

    //     const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await createInscribeTx({
    //         senderPrivateKey: buyerPrivateKey,
    //         tcTxIDs,
    //         utxos: buyerUTXOs,
    //         inscriptions: {},
    //         feeRatePerByte: 5,
    //         tcClient: tcClient,
    //     });
    //     // console.log("commitTxB64: ", commitTxB64);
    //     // console.log("hashLockRedeemScriptHex: ", hashLockRedeemScriptHex);
    //     // console.log("revealVByte: ", revealVByte);
    //     // console.log("hashLockPriKey: ", hashLockPriKey);
    //     // const dataBuff = Buffer.from("f8698080825208949b9add2b5b572ccc43ef2660d8b81cfd0701435b8898a7d9b8314c000080823696a0ee3795a786dd6c4f028517f2f5dd7333f066b83d03ca7404d73b8b212454e123a0488ddfdb48101b5ac0647e1b823f98e05ba7310c3046810e3327d1d2ccc51434", "hex");

    //     // console.log(dataBuff.length);

    //     console.log("commitTxHex: ", commitTxHex);
    //     console.log("commitTxID: ", commitTxID);
    //     console.log("revealTxHex: ", revealTxHex);
    //     console.log("revealTxID: ", revealTxID);
    //     console.log("totalFee: ", totalFee);
    // });


    // it("create batch inscribe txs", async () => {
    //     // const data = "0xf86e808502540be40082520894f91cee2de943733e338891ef602c962ef4d7eb81880de0b6b3a76400008082adaea04cc68e8614cc64510585da088c65f22ad0db499dfc70de4bd7d443782a2ee138a00bbf93851e4a98f92adcb72a4f77bad23275f8c9c4925a8272c357bcfe2e610a";
    //     const tcAddress = "0xF91cEe2DE943733e338891Ef602c962eF4D7Eb81";

    //     setBTCNetwork(NetworkType.Mainnet);
    //     // const tcClient = new TcClient();

    //     // const res = await tcClient.getUnInscribedTransactionByAddress(tcAddress);
    //     // console.log("Uninscribe tx: ", res);

    //     // const tcTxDetails = await tcClient.getUnInscribedTransactionDetailByAddress(tcAddress);
    //     // console.log("tcTxDetails.unInscribedTxDetails: ", tcTxDetails.unInscribedTxDetails);


    //     // private key 2
    //     let utxos: UTXO[] = [
    //         {
    //             tx_hash: "45313f4b3e68640c816c758905ce019cdb94dca9115a07edea68d9b778d292f4",
    //             tx_output_n: 0,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "4a61446ffb9d404037cb8e790b278fa46c98340c47860890153b78960591fd70",
    //             tx_output_n: 0,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "6c6480144e7faf27f41e41a47c0b339c29cf0b31b1482a939c144c2c3325350e",
    //             tx_output_n: 2,
    //             value: new BigNumber(343430)
    //         },
    //         {
    //             tx_hash: "c2163fe5e0680efdbd8b4b812a8be550b7c5cb82a1d2b96252f0a89a9ea0dc4c",
    //             tx_output_n: 0,
    //             value: new BigNumber(1000000)
    //         },

    //     ];


    //     const tcTxDetails: any[] = [{
    //         Nonce: 7,
    //         Hash: "0x3ee5ab23e36ca2a375e5faeafa44cbbd00fcd09553cac7a185088a3594235fe3",
    //     },
    //     ];

    //     const resp = await createBatchInscribeTxs({
    //         senderPrivateKey: privateKey2,
    //         senderAddress: address2,
    //         tcTxDetails: tcTxDetails,
    //         utxos,
    //         inscriptions: {},
    //         feeRatePerByte: 20,
    //         sequence: DefaultSequenceRBF,
    //     });
    //     console.log("resp: ", resp);


    //     // const repsRBF = await replaceByFeeInscribeTx({
    //     //     senderPrivateKey: buyerPrivateKey,
    //     //     utxos: UTXOs,
    //     //     inscriptions: {},
    //     //     revealTxID: "660c0fa49cdb8fe178a2b16c38ad5ff828040657776b5257b47517643ccd71d3",
    //     //     feeRatePerByte: 18,
    //     //     tcClient: tcClient,
    //     //     tcAddress: tcAddress,
    //     //     btcAddress: buyerAddress,
    //     //     sequence: DefaultSequenceRBF,
    //     // })

    //     // console.log("repsRBF: ", repsRBF);
    // });

    // it("aggregate utxos", async () => {
    //     // const { keyPair }
    //     const tcClient = new TcClient(Mainnet);
    //     const result = await aggregateUTXOs({
    //         tcAddress: "0x82268aF8207117ddBCD8ce4e444263CcD8d1bF87",
    //         btcAddress: "bc1p3nfh4peeg770mhx4rueskzdmxgjxqcryypstrstcky8cy8g9sxusx8xfnn",
    //         utxos: [
    //             {
    //                 tx_hash: "67d3cf1188a08796020b9addaa449636017a578d4e6e7d5e1584dd284ba7dc1f",
    //                 tx_output_n: 1,
    //                 value: BigNumber(1000)
    //             }
    //         ],
    //         tcClient,
    //     })

    //     console.log("result: ", result);
    // });


    it("split batch inscribe tx ids - multiple batch", async () => {
        // const tcTxDetails: any[] = [{
        //     Nonce: 1,
        //     Hash: "a",
        // },
        // {
        //     Nonce: 2,
        //     Hash: "b",
        // },
        // {
        //     Nonce: 4,
        //     Hash: "c",
        // },
        // {
        //     Nonce: 6,
        //     Hash: "d",
        // },
        // {
        //     Nonce: 7,
        //     Hash: "e",
        // },];

        const tcAddress = "0x09f38485d3599b9Afe533F37A6bdfcC0217aC3c5"

        const res = await tcClient.getUnInscribedTransactionDetailByAddress(tcAddress)

        const result = await splitBatchInscribeTx({
            tcTxDetails: res.unInscribedTxDetails,
        })

        console.log("result splitBatchInscribeTx: ", result, result.length);

        // assert.deepEqual(result, [['a', 'b'], ['c'], ['d', 'e']]);
    });

    // it("split batch inscribe tx ids - one batch multiple txs", async () => {
    //     const tcTxDetails: any[] = [{
    //         Nonce: 1,
    //         Hash: "a",
    //     },
    //     {
    //         Nonce: 2,
    //         Hash: "b",
    //     },
    //     {
    //         Nonce: 3,
    //         Hash: "c",
    //     }];

    //     const result = await splitBatchInscribeTx({
    //         tcTxDetails,
    //     })

    //     console.log("result splitBatchInscribeTx: ", result);

    //     assert.deepEqual(result, [['a', 'b', 'c']]);
    // });

    // it("split batch inscribe tx ids - one batch one tx", async () => {
    //     const tcTxDetails: any[] = [{
    //         Nonce: 1,
    //         Hash: "a",
    //     }];

    //     const result = await splitBatchInscribeTx({
    //         tcTxDetails,
    //     })

    //     console.log("result splitBatchInscribeTx: ", result);

    //     assert.deepEqual(result, [['a']]);
    // });


    // it("finalize raw commit tx", async () => {
    //     const signedCommitTxB64 = "cHNidP8BAIkCAAAAAd4foRsqGbk6aEeWRzYv0ww9wCt/7tCoFcDuikKNP/BNAAAAAAD/////AsYHAAAAAAAAIlEgydBhfWmBPkcNjiD8mMF7+yxJskRnbs4Nhrk3RuzO5SyuGwAAAAAAACJRIIwBcHKBtuPNaLYvJMGzVoV0l9y6m0oYFTJFCJBSfZf4AAAAAAABASsQJwAAAAAAACJRIIwBcHKBtuPNaLYvJMGzVoV0l9y6m0oYFTJFCJBSfZf4ARNAIghJb5aBPBsiWMmurMp8bVvpno9TsPeLIZm8MlQvkYlSDiUqOao8Vux3fm+S+If4O4P+IHUYDxeZ8vPLC8//7QEXIJO8b4pdMKXOlGH5JToh0FFIinmYG051yiKI+QFa1fYVAAAA";

    //     const psbt = Psbt.fromBase64(signedCommitTxB64);
    //     psbt.finalizeAllInputs();

    //     const msgTx = psbt.extractTransaction();

    //     console.log("commitTxHex: ", msgTx.toHex());
    //     console.log("commitTxID: ", msgTx.getId());
    // });


    // it("should return the raw commit tx", async () => {

    //     const commitTxID = "2930061e7b32bc90f79109f0a13d1fa4c417bc58e00ab98e28b37d131fcf401d";
    //     const hashLockPriKey = "KwsMY7zgHQ3DobYpto3HFkkTh8k5Pw5FL3d8pLAqSSntF4c8WG8p";
    //     const hashLockRedeemScriptHex = "2097f06802a32c09033bdc7b8e84d5c9a5b8c88781493d63e55d9bea956f5c7d2fac006304736274634c8862766d763182268af8207117ddbcd8ce4e444263ccd8d1bf87000000d6f8698080825208949b9add2b5b572ccc43ef2660d8b81cfd0701435b8898a7d9b8314c000080823696a0ee3795a786dd6c4f028517f2f5dd7333f066b83d03ca7404d73b8b212454e123a0488ddfdb48101b5ac0647e1b823f98e05ba7310c3046810e3327d1d2ccc5143468";
    //     const revealVByte = 165;
    //     const pubKeyStr = "93bc6f8a5d30a5ce9461f9253a21d051488a79981b4e75ca2288f9015ad5f615";


    //     const { revealTxHex, revealTxID } = await createRawRevealTx({
    //         internalPubKey: Buffer.from(pubKeyStr, "hex"),
    //         feeRatePerByte: 6,
    //         commitTxID,
    //         hashLockPriKey,
    //         hashLockRedeemScriptHex,
    //         revealVByte,
    //     });
    //     console.log("revealTxHex: ", revealTxHex);
    //     console.log("revealTxID: ", revealTxID);


    //     // 02000000000101de1fa11b2a19b93a68479647362fd30c3dc02b7feed0a815c0ee8a428d3ff04d0000000000ffffffff02c607000000000000225120c9d0617d69813e470d8e20fc98c17bfb2c49b244676ece0d86b93746eccee52cae1b0000000000002251208c01707281b6e3cd68b62f24c1b356857497dcba9b4a181532450890527d97f801402208496f96813c1b2258c9aeacca7c6d5be99e8f53b0f78b2199bc32542f9189520e252a39aa3c56ec777e6f92f887f83b83fe2075180f1799f2f3cb0bcfffed00000000


    // });


});