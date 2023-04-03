import {
    createPSBTToSell,
    createPSBTToBuy,
    UTXO, network,
    convertPrivateKeyFromStr,
    convertPrivateKey,
    reqListForSaleInscription,
    reqBuyInscription, DummyUTXOValue, broadcastTx,
    BuyReqInfo, reqBuyMultiInscriptions, findExactValueUTXO, estimateNumInOutputsForBuyInscription, estimateTxFee
} from "../src/index";
import { Psbt } from "bitcoinjs-lib";
import { assert } from "chai";
import BigNumber from 'bignumber.js';
require("dotenv").config({ path: __dirname + "/.env" });


// for unit test
let sellerUTXOs = [
    // inscription UTXOs
    // real
    {
        tx_hash: "48acb493580784a4c4fc43e14fae475fc334fba813558015fc781e06a06b9cdd",
        tx_output_n: 0,
        value: new BigNumber(4118), // normal
    },
    {
        tx_hash: "e7df697d79503a9e9b1e090fc0918703ed0aedecf7c063143ee9c359417f5ac7",
        tx_output_n: 0,
        value: new BigNumber(1000),
    },
];

let sellerInscriptions = {
    "48acb493580784a4c4fc43e14fae475fc334fba813558015fc781e06a06b9cdd:0": [
        {
            id: "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0",
            offset: new BigNumber(1000),
        }
    ],
}

let sellerUTXOs2 = [
    // inscription UTXOs
    {
        tx_hash: "566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3",
        tx_output_n: 0,
        value: new BigNumber(10000), // insc
    },
    {
        tx_hash: "f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0f",
        tx_output_n: 0,
        value: new BigNumber(10000), // insc
    },
    {
        tx_hash: "e33ba42aba8127e6f531941b3b5e4ba29202c2f6a7376a1bc384c88852abb90e",
        tx_output_n: 2,
        value: new BigNumber(999),
    },
    {
        tx_hash: "e33ba42aba8127e6f531941b3b5e4ba29202c2f6a7376a1bc384c88852abb90e",
        tx_output_n: 3,
        value: new BigNumber(1000),
    },
];

let sellerInscriptions2 = {
    "566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3:0": [
        {
            id: "566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3i0",
            offset: new BigNumber(0),
        }
    ],
    "f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0f:0": [
        {
            id: "f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0fi0",
            offset: new BigNumber(0),
        }
    ],
}

let buyerUTXOs = [
    {
        tx_hash: "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e",
        tx_output_n: 1,
        value: new BigNumber(21646), // normal
    },
];

let buyerInscriptions = {
    // "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee:0": [
    //     {
    //         id: "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0",
    //         offset: 1000,
    //         sat: 486840414210370
    //     }
    // ]
}


// for real
// let sellerUTXOs = [
//     // inscription UTXOs
//     // real

//     // {
//     //     tx_hash: "b8764464f68d7303edd71cf9d73a58c5dc60315df64f0174b375945be58350fc",
//     //     tx_output_n: 0,
//     //     value: 1078, // normal
//     // },
//     {
//         tx_hash: "08f7f0b3f60630c8308833e56d7d66c3a3edc99f70fc71fdb2ad19855005874b",
//         tx_output_n: 1,
//         value: new BigNumber(1000),
//     },
//     {
//         tx_hash: "c89a0e66b28124d6f2906023bf4d5ee9f123586b211999b0ebb823e2203ab51c",
//         tx_output_n: 1,
//         value: new BigNumber(1000),
//     },
//     {
//         tx_hash: "b8764464f68d7303edd71cf9d73a58c5dc60315df64f0174b375945be58350fc",
//         tx_output_n: 0,
//         value: new BigNumber(8890), // insc
//     },
//     // {
//     //     tx_hash: "da7d8f7d7234d65ce8876475ba75e7ab60f6ea807fc0b248270f640db2d0189f",
//     //     tx_output_n: 1,
//     //     value: 1536, // normal
//     // },
//     // {
//     //     tx_hash: "357b0288744386a5a62c4bda4640566750feee7c0e15f7888d247d251b8db75c",
//     //     tx_output_n: 0,
//     //     value: 4421,
//     // }
// ];

// let sellerInsciptions = {
//     "b8764464f68d7303edd71cf9d73a58c5dc60315df64f0174b375945be58350fc:0": [
//         {
//             id: "81a8890668180996fe94fb4b893a40c77c28b898683d9459c99d3dfc048782e1i0",
//             offset: new BigNumber(0),
//         }
//     ]
// }

// // for unit tests
// let buyerUTXOs = [
//     {
//         tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
//         tx_output_n: 0,
//         value: new BigNumber(1390), // ins
//     },
//     {
//         tx_hash: "08f7f0b3f60630c8308833e56d7d66c3a3edc99f70fc71fdb2ad19855005874b",
//         tx_output_n: 2,
//         value: new BigNumber(1000), // normal
//     },
//     {
//         tx_hash: "e25533f18f5818ad784c0b6c6a94570857b9e544bf869d2f13adf0de8f827b8d",
//         tx_output_n: 1,
//         value: new BigNumber(97460), // normal
//     },
//     // {
//     //     tx_hash: "e25533f18f5818ad784c0b6c6a94570857b9e544bf869d2f13adf0de8f827b8d",
//     //     tx_output_n: 0,
//     //     value: new BigNumber(1000), // normal
//     // }
// ];

// let buyerInscriptions = {
//     "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee:0": [
//         {
//             id: "8f93fc0dbe146b84bc2c5275ffb803aedb8cc60c641c794fba06cd125676c47ei0",
//             offset: new BigNumber(1000),
//         }
//     ]
// }

// TODO: fill the private key
var sellerPrivateKeyWIF = process.env.PRIV_KEY_1 || "";
var sellerPrivateKey = convertPrivateKeyFromStr(sellerPrivateKeyWIF);
let sellerAddress = process.env.ADDRESS_1 || "";

var sellerPrivateKeyWIF2 = process.env.PRIV_KEY_3 || "";
var sellerPrivateKey2 = convertPrivateKeyFromStr(sellerPrivateKeyWIF2);
let sellerAddress2 = process.env.ADDRESS_3 || "";

let buyerPrivateKeyWIF = process.env.PRIV_KEY_2 || "";
let buyerAddress = process.env.ADDRESS_2 || "";
let buyerPrivateKey = convertPrivateKeyFromStr(buyerPrivateKeyWIF);

describe("Buy multi inscriptions in one PSBT", () => {
    // it("happy case", async () => {
    //     // first, seller create the transaction
    //     const sellInscriptionIDs: string[] = [
    //         "81a8890668180996fe94fb4b893a40c77c28b898683d9459c99d3dfc048782e1i0",
    //         "8f93fc0dbe146b84bc2c5275ffb803aedb8cc60c641c794fba06cd125676c47ei0",
    //     ];

    //     const sellerPrivateKeys: Buffer[] = [
    //         sellerPrivateKey,
    //         buyerPrivateKey
    //     ]
    //     const amountPayToSeller: BigNumber[] = [new BigNumber(1100), new BigNumber(1200)];
    //     const feePayToCreator: BigNumber[] = [new BigNumber(0), new BigNumber(1001)];

    //     const creatorAddresses: string[] = [buyerAddress, sellerAddress];

    //     const buyReqInfos: BuyReqInfo[] = [];
    //     const receiverAddresses = [
    //         buyerAddress,
    //         buyerAddress,
    //     ];

    //     const receiverBTCAddresses = [sellerAddress, buyerAddress];

    //     const UTXOs = [sellerUTXOs, buyerUTXOs];
    //     const inscriptions = [sellerInsciptions, buyerInscriptions];

    //     const feeRatePerByte = 10;

    //     for (let i = 0; i < sellInscriptionIDs.length; i++) {
    //         const inscriptionID = sellInscriptionIDs[i];
    //         console.log("feePayToCreator ", i, feePayToCreator[i]);
    //         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
    //             sellerPrivateKey: sellerPrivateKeys[i],
    //             utxos: UTXOs[i],
    //             inscriptions: inscriptions[i],
    //             sellInscriptionID: inscriptionID,
    //             receiverBTCAddress: receiverBTCAddresses[i],
    //             amountPayToSeller: amountPayToSeller[i],
    //             feePayToCreator: feePayToCreator[i],
    //             creatorAddress: creatorAddresses[i],
    //             feeRatePerByte,
    //         });

    //         console.log("SELL: base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs : ", i, base64Psbt, selectedUTXOsSeller, splitTxID, splitUTXOs);

    //         console.log("Add buyReqInfos: ", buyReqInfos);
    //         buyReqInfos.push({
    //             sellerSignedPsbtB64: base64Psbt,
    //             price: amountPayToSeller[i].plus(feePayToCreator[i]),
    //             receiverInscriptionAddress: receiverAddresses[i],
    //         });
    //     }

    //     buyerUTXOs.splice(1, 1);

    //     console.log("Param buyReqInfos: ", buyReqInfos);

    //     // create tx buy

    //     const res = reqBuyMultiInscriptions({ buyReqInfos, buyerPrivateKey, utxos: buyerUTXOs, inscriptions: buyerInscriptions, feeRatePerByte });
    //     console.log("res: ", res);
    //     console.log("BUY splitTxID: ", res.splitTxID);
    //     console.log("BUY splitTxRaw: ", res.splitTxRaw);
    //     console.log("BUY splitUTXOs: ", res.splitUTXOs);
    //     console.log("BUY txID: ", res.txID);
    //     console.log("BUY txHex: ", res.txHex);
    //     console.log("BUY selectedUTXOs: ", res.selectedUTXOs);
    //     console.log("BUY fee: ", res.fee);
    //     console.log("BUY Tx: ", res.tx);
    // });

    it("buy 3 inscriptions - both 3 inscriptions pay fee for creators - need to split utxos (dummy UTXO & payment UTXOs)", async () => {
        // first, seller create the transaction
        const sellInscriptionIDs: string[] = [
            "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0",
            "566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3i0",
            "f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0fi0",
        ];

        const sellerPrivateKeys: Buffer[] = [
            sellerPrivateKey,
            sellerPrivateKey2,
            sellerPrivateKey2,
        ]
        const amountPayToSeller: BigNumber[] = [new BigNumber(1100), new BigNumber(1200), new BigNumber(1300)];
        const feePayToCreator: BigNumber[] = [new BigNumber(1001), new BigNumber(1002), new BigNumber(1003)];

        const creatorAddresses: string[] = [sellerAddress2, sellerAddress, sellerAddress];

        const buyReqInfos: BuyReqInfo[] = [];
        const receiverAddresses = [
            buyerAddress,
            buyerAddress,
            sellerAddress,
        ];

        const receiverBTCAddresses = [sellerAddress, sellerAddress2, sellerAddress2];

        const clonedSellerUTXOs = [...sellerUTXOs];
        const clonedSellerUTXOs2 = [...sellerUTXOs2];
        const UTXOs = [clonedSellerUTXOs, clonedSellerUTXOs2, clonedSellerUTXOs2];
        const inscriptions = [{ ...sellerInscriptions }, { ...sellerInscriptions2 }, { ...sellerInscriptions2 }];

        const feeRatePerByte = 10;

        // create tx sell
        for (let i = 0; i < sellInscriptionIDs.length; i++) {
            const inscriptionID = sellInscriptionIDs[i];
            console.log("feePayToCreator ", i, feePayToCreator[i]);
            const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
                sellerPrivateKey: sellerPrivateKeys[i],
                utxos: UTXOs[i],
                inscriptions: inscriptions[i],
                sellInscriptionID: inscriptionID,
                receiverBTCAddress: receiverBTCAddresses[i],
                amountPayToSeller: amountPayToSeller[i],
                feePayToCreator: feePayToCreator[i],
                creatorAddress: creatorAddresses[i],
                feeRatePerByte,
            });

            // remove split utxos to create next txs
            let tmpSelectedUTXOsSeller = [...selectedUTXOsSeller, ...splitUTXOs];
            if (tmpSelectedUTXOsSeller.length > 0) {
                for (const selectedUtxo of tmpSelectedUTXOsSeller) {
                    const index = UTXOs[i].findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
                    UTXOs[i].splice(index, 1);
                }
            }

            console.log("HHH UTXOs[i]: ", UTXOs[i]);

            console.log("SELL: base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs : ", i, base64Psbt, selectedUTXOsSeller, splitTxID, splitUTXOs);

            console.log("Add buyReqInfos: ", buyReqInfos);
            buyReqInfos.push({
                sellerSignedPsbtB64: base64Psbt,
                price: amountPayToSeller[i].plus(feePayToCreator[i]),
                receiverInscriptionAddress: receiverAddresses[i],
            });
        }

        // buyerUTXOs.splice(1, 1);

        console.log("Param buyReqInfos: ", buyReqInfos);

        // create tx buy

        const res = reqBuyMultiInscriptions({ buyReqInfos, buyerPrivateKey, utxos: buyerUTXOs, inscriptions: buyerInscriptions, feeRatePerByte });
        console.log("res: ", res);
        console.log("BUY splitTxID: ", res.splitTxID);
        console.log("BUY splitTxRaw: ", res.splitTxRaw);
        console.log("BUY splitUTXOs: ", res.splitUTXOs);
        console.log("BUY txID: ", res.txID);
        console.log("BUY txHex: ", res.txHex);
        console.log("BUY selectedUTXOs: ", res.selectedUTXOs);
        console.log("BUY fee: ", res.fee);
        console.log("BUY Tx: ", res.tx);

        // console.log("PBST no fee for creator: ", base64Psbt);

        assert.notEqual(res.splitTxID, "");
        assert.notEqual(res.splitTxRaw, "");
        assert.equal(res.splitUTXOs.length, 1);

        assert.notEqual(res.txID, "");
        assert.notEqual(res.txHex, "");
        assert.equal(res.selectedUTXOs.length, 5);

        const tx = res.tx;

        // dummy utxo of buyer

        assert.equal(tx.ins[0].hash.reverse().toString("hex"), res.splitTxID);
        assert.equal(tx.ins[0].index, 3);

        // utxo contains inscriptionId b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0
        assert.equal(tx.ins[1].hash.reverse().toString("hex"), "48acb493580784a4c4fc43e14fae475fc334fba813558015fc781e06a06b9cdd");
        assert.equal(tx.ins[1].index, 0);
        // dummy utxo of seller index 0
        assert.equal(tx.ins[2].hash.reverse().toString("hex"), "e7df697d79503a9e9b1e090fc0918703ed0aedecf7c063143ee9c359417f5ac7");
        assert.equal(tx.ins[2].index, 0);

        // utxo payment of buyer for inscriptionId b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0
        assert.equal(tx.ins[3].hash.reverse().toString("hex"), res.splitTxID);
        assert.equal(tx.ins[3].index, 0);

        // utxo contains inscriptionId 566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3i0
        assert.equal(tx.ins[4].hash.reverse().toString("hex"), "566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3");
        assert.equal(tx.ins[4].index, 0);
        // dummy utxo of seller index 1
        assert.equal(tx.ins[5].hash.reverse().toString("hex"), "e33ba42aba8127e6f531941b3b5e4ba29202c2f6a7376a1bc384c88852abb90e");
        assert.equal(tx.ins[5].index, 2);

        // utxo payment of buyer for inscriptionId 566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3i0
        assert.equal(tx.ins[6].hash.reverse().toString("hex"), res.splitTxID);
        assert.equal(tx.ins[6].index, 1);

        // utxo contains inscriptionId f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0fi0
        assert.equal(tx.ins[7].hash.reverse().toString("hex"), "f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0f");
        assert.equal(tx.ins[7].index, 0);
        // dummy utxo of seller index 2
        assert.equal(tx.ins[8].hash.reverse().toString("hex"), "e33ba42aba8127e6f531941b3b5e4ba29202c2f6a7376a1bc384c88852abb90e");
        assert.equal(tx.ins[8].index, 3);

        // utxo payment of buyer for inscriptionId f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0fi0
        assert.equal(tx.ins[9].hash.reverse().toString("hex"), res.splitTxID);
        assert.equal(tx.ins[9].index, 2);



        // utxo payment of buyer
        assert.equal(tx.ins[10].hash.reverse().toString("hex"), res.splitTxID);
        assert.equal(tx.ins[10].index, 4);






        // const psbt = Psbt.fromBase64(base64Psbt);
        // assert.equal(psbt.txInputs.length, 1);
        // assert.equal(psbt.txOutputs.length, 1);

        // assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1234);
        // assert.equal(psbt.txInputs[0].index, 0);

        // assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber());
        // assert.equal(psbt.txOutputs[0].address, sellerAddress);
    });

    it("buy 3 inscriptions - both 3 inscriptions pay fee for creators - the buyer has enough exact value output coins for payments", async () => {

        buyerUTXOs.push(...[{
            tx_hash: "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e",
            tx_output_n: 2,
            value: new BigNumber(2101), // normal
        },
        {
            tx_hash: "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e",
            tx_output_n: 3,
            value: new BigNumber(2202), // normal
        },
        {
            tx_hash: "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e",
            tx_output_n: 4,
            value: new BigNumber(2303), // normal
        },
        {
            tx_hash: "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e",
            tx_output_n: 5,
            value: new BigNumber(1000), // normal
        }]);

        // first, seller create the transaction
        const sellInscriptionIDs: string[] = [
            "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0",
            "566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3i0",
            "f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0fi0",
        ];

        const sellerPrivateKeys: Buffer[] = [
            sellerPrivateKey,
            sellerPrivateKey2,
            sellerPrivateKey2,
        ]
        const amountPayToSeller: BigNumber[] = [new BigNumber(1100), new BigNumber(1200), new BigNumber(1300)];
        const feePayToCreator: BigNumber[] = [new BigNumber(1001), new BigNumber(1002), new BigNumber(1003)];

        const creatorAddresses: string[] = [sellerAddress2, sellerAddress, sellerAddress];

        const buyReqInfos: BuyReqInfo[] = [];
        const receiverAddresses = [
            buyerAddress,
            buyerAddress,
            sellerAddress,
        ];

        const receiverBTCAddresses = [sellerAddress, sellerAddress2, sellerAddress2];
        const clonedSellerUTXOs = [...sellerUTXOs];
        const clonedSellerUTXOs2 = [...sellerUTXOs2];

        const UTXOs = [clonedSellerUTXOs, clonedSellerUTXOs2, clonedSellerUTXOs2];
        const inscriptions = [{ ...sellerInscriptions }, { ...sellerInscriptions2 }, { ...sellerInscriptions2 }];

        const feeRatePerByte = 10;

        // create tx sell
        for (let i = 0; i < sellInscriptionIDs.length; i++) {
            const inscriptionID = sellInscriptionIDs[i];
            console.log("feePayToCreator ", i, feePayToCreator[i]);
            const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
                sellerPrivateKey: sellerPrivateKeys[i],
                utxos: UTXOs[i],
                inscriptions: inscriptions[i],
                sellInscriptionID: inscriptionID,
                receiverBTCAddress: receiverBTCAddresses[i],
                amountPayToSeller: amountPayToSeller[i],
                feePayToCreator: feePayToCreator[i],
                creatorAddress: creatorAddresses[i],
                feeRatePerByte,
            });

            // remove split utxos to create next txs
            let tmpSelectedUTXOsSeller = [...selectedUTXOsSeller, ...splitUTXOs];
            if (tmpSelectedUTXOsSeller.length > 0) {
                for (const selectedUtxo of tmpSelectedUTXOsSeller) {
                    const index = UTXOs[i].findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
                    UTXOs[i].splice(index, 1);
                }
            }

            console.log("HHH UTXOs[i]: ", UTXOs[i]);

            console.log("SELL: base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs : ", i, base64Psbt, selectedUTXOsSeller, splitTxID, splitUTXOs);

            console.log("Add buyReqInfos: ", buyReqInfos);
            buyReqInfos.push({
                sellerSignedPsbtB64: base64Psbt,
                price: amountPayToSeller[i].plus(feePayToCreator[i]),
                receiverInscriptionAddress: receiverAddresses[i],
            });
        }

        // buyerUTXOs.splice(1, 1);

        console.log("Param buyReqInfos: ", buyReqInfos);

        // create tx buy

        const res = reqBuyMultiInscriptions({ buyReqInfos, buyerPrivateKey, utxos: buyerUTXOs, inscriptions: buyerInscriptions, feeRatePerByte });
        console.log("res: ", res);
        console.log("BUY splitTxID: ", res.splitTxID);
        console.log("BUY splitTxRaw: ", res.splitTxRaw);
        console.log("BUY splitUTXOs: ", res.splitUTXOs);
        console.log("BUY txID: ", res.txID);
        console.log("BUY txHex: ", res.txHex);
        console.log("BUY selectedUTXOs: ", res.selectedUTXOs);
        console.log("BUY fee: ", res.fee);
        console.log("BUY Tx: ", res.tx);

        // console.log("PBST no fee for creator: ", base64Psbt);

        const expectedSplitTxFee = 0;
        const expectedNumIns = 5 + 2 * 3;
        const expectedNumOuts = 3 + 2 * 3 + 2;
        const expectedTxFee = estimateTxFee(expectedNumIns, expectedNumOuts, feeRatePerByte);

        assert.equal(res.splitTxID, "");
        assert.equal(res.splitTxRaw, "");
        assert.equal(res.splitUTXOs.length, 0);

        assert.notEqual(res.txID, "");
        assert.notEqual(res.txHex, "");
        assert.equal(res.selectedUTXOs.length, 5);
        assert.equal(res.fee.toNumber(), expectedTxFee + expectedSplitTxFee);

        const tx = res.tx;
        assert.equal(tx.ins.length, expectedNumIns);
        assert.equal(tx.outs.length, expectedNumOuts);

        // dummy utxo of buyer
        assert.equal(tx.ins[0].hash.reverse().toString("hex"), "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e");
        assert.equal(tx.ins[0].index, 5);

        // utxo contains inscriptionId b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0
        assert.equal(tx.ins[1].hash.reverse().toString("hex"), "48acb493580784a4c4fc43e14fae475fc334fba813558015fc781e06a06b9cdd");
        assert.equal(tx.ins[1].index, 0);
        // dummy utxo of seller index 0
        assert.equal(tx.ins[2].hash.reverse().toString("hex"), "e7df697d79503a9e9b1e090fc0918703ed0aedecf7c063143ee9c359417f5ac7");
        assert.equal(tx.ins[2].index, 0);

        // utxo payment of buyer for inscriptionId b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0
        assert.equal(tx.ins[3].hash.reverse().toString("hex"), "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e");
        assert.equal(tx.ins[3].index, 2);

        // utxo contains inscriptionId 566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3i0
        assert.equal(tx.ins[4].hash.reverse().toString("hex"), "566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3");
        assert.equal(tx.ins[4].index, 0);
        // dummy utxo of seller index 1
        assert.equal(tx.ins[5].hash.reverse().toString("hex"), "e33ba42aba8127e6f531941b3b5e4ba29202c2f6a7376a1bc384c88852abb90e");
        assert.equal(tx.ins[5].index, 2);

        // utxo payment of buyer for inscriptionId 566b645a720d3da477e884203fbab3b1a76f5bb8c9c3fca923768f7012ed59a3i0
        assert.equal(tx.ins[6].hash.reverse().toString("hex"), "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e");
        assert.equal(tx.ins[6].index, 3);

        // utxo contains inscriptionId f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0fi0
        assert.equal(tx.ins[7].hash.reverse().toString("hex"), "f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0f");
        assert.equal(tx.ins[7].index, 0);
        // dummy utxo of seller index 2
        assert.equal(tx.ins[8].hash.reverse().toString("hex"), "e33ba42aba8127e6f531941b3b5e4ba29202c2f6a7376a1bc384c88852abb90e");
        assert.equal(tx.ins[8].index, 3);

        // utxo payment of buyer for inscriptionId f3e391b9d2e1d5c0ea93e335107f61f5aeddf421afce5efe8866467fbe678a0fi0
        assert.equal(tx.ins[9].hash.reverse().toString("hex"), "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e");
        assert.equal(tx.ins[9].index, 4);

        // utxo of buyer to pay network fee
        assert.equal(tx.ins[10].hash.reverse().toString("hex"), "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e");
        assert.equal(tx.ins[10].index, 1);














        // const psbt = Psbt.fromBase64(base64Psbt);
        // assert.equal(psbt.txInputs.length, 1);
        // assert.equal(psbt.txOutputs.length, 1);

        // assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1234);
        // assert.equal(psbt.txInputs[0].index, 0);

        // assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber());
        // assert.equal(psbt.txOutputs[0].address, sellerAddress);
    });
});