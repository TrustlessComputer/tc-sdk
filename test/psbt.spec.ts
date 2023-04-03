import { DummyUTXOValue, UTXO, broadcastTx, convertPrivateKey, convertPrivateKeyFromStr, createPSBTToBuy, createPSBTToSell, createRawPSBTToSell, generateTaprootAddressFromPubKey, network, reqBuyInscription, reqListForSaleInscription } from "../src/index";

import BigNumber from 'bignumber.js';
import { Psbt } from "bitcoinjs-lib";
import { assert } from "chai";

require("dotenv").config({ path: __dirname + "/.env" });
console.log(__dirname + "../test/.env");


// for unit tests
// let sellerUTXOs = [
//     // inscription UTXOs
//     // real
//     {
//         tx_hash: "48acb493580784a4c4fc43e14fae475fc334fba813558015fc781e06a06b9cdd",
//         tx_output_n: 0,
//         value: new BigNumber(4118), // normal
//     },
//     {
//         tx_hash: "e7df697d79503a9e9b1e090fc0918703ed0aedecf7c063143ee9c359417f5ac7",
//         tx_output_n: 0,
//         value: new BigNumber(1000),
//     },
// ];

// let sellerInsciptions = {
//     "48acb493580784a4c4fc43e14fae475fc334fba813558015fc781e06a06b9cdd:0": [
//         {
//             id: "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0",
//             offset: new BigNumber(1000),
//             sat: 1277661004849427
//         }
//     ],
// }

// for unit tests
// let buyerUTXOs = [
//     {
//         tx_hash: "541372eeed02266920038467388a8ea0d132923f37e3b710a8e6d4ff7ac8836e",
//         tx_output_n: 1,
//         value: new BigNumber(11800), // normal
//     },
// ];

// let buyerInscriptions = {
//     // "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee:0": [
//     //     {
//     //         id: "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0",
//     //         offset: 1000,
//     //         sat: 486840414210370
//     //     }
//     // ]
// }


// for unit tests
let sellerUTXOs = [
    // inscription UTXOs
    // real

    // {
    //     tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
    //     tx_output_n: 1,
    //     value: 1078, // normal
    // },
    {
        tx_hash: "1bdb522dc035d83fd4c837e2cef53d12de348aa2602f1ad9bd5102f8e9d200c9",
        tx_output_n: 0,
        value: new BigNumber(1234),
    },
    {
        tx_hash: "300ec1c7401199c356072efa4b38387d38211dad8b0970372772ba5f4164d3f3",
        tx_output_n: 0,
        value: new BigNumber(2345),
    },
    {
        tx_hash: "b475e4fef1a1095c1cc48ebc1f7b502fce62c2f7e403b6bed12b02fe1652028f",
        tx_output_n: 0,
        value: new BigNumber(5678),
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

let sellerInsciptions = {
    "1bdb522dc035d83fd4c837e2cef53d12de348aa2602f1ad9bd5102f8e9d200c9:0": [
        {
            id: "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0",
            offset: new BigNumber(0),
            sat: 1277661004849427
        }
    ],
    "300ec1c7401199c356072efa4b38387d38211dad8b0970372772ba5f4164d3f3:0": [
        {
            id: "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0",
            offset: new BigNumber(0),
            sat: 1392873619146836
        }
    ],
    "b475e4fef1a1095c1cc48ebc1f7b502fce62c2f7e403b6bed12b02fe1652028f:0": [
        {
            id: "8f93fc0dbe146b84bc2c5275ffb803aedb8cc60c641c794fba06cd125676c47ei0",
            offset: new BigNumber(0),
            sat: 1277661004899817
        }
    ]
}

// for unit tests
let buyerUTXOs = [
    {
        tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
        tx_output_n: 0,
        value: new BigNumber(2000), // normal
    },
    {
        tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
        tx_output_n: 1,
        value: new BigNumber(2000), // normal
    },
    {
        tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
        tx_output_n: 0,
        value: new BigNumber(3000), // normal
    }
];

let buyerInscriptions = {
    "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee:0": [
        {
            id: "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0",
            offset: new BigNumber(1000),
            sat: 486840414210370
        }
    ]
}

// TODO: fill the private key
var sellerPrivateKeyWIF = process.env.PRIV_KEY_1 || "";
var sellerPrivateKey = convertPrivateKeyFromStr(sellerPrivateKeyWIF);
let sellerAddress = process.env.ADDRESS_1 || "";

let buyerPrivateKeyWIF = process.env.PRIV_KEY_2 || "";
let buyerAddress = process.env.ADDRESS_2 || "";
let buyerPrivateKey = convertPrivateKeyFromStr(buyerPrivateKeyWIF);
console.log("buyerPrivateKeyWIF ", buyerPrivateKeyWIF);
console.log("buyerAddress ", buyerAddress);


const feeRatePerByte = 6;




// describe("Sell inscription with PSBT", () => {
//     it("feePayToCreator = 0: no need to split UTXO", async () => {
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(0);

//         const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 4,
//         });

//         console.log("PBST no fee for creator: ", base64Psbt);

//         assert.equal(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 1);
//         assert.equal(psbt.txOutputs.length, 1);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1234);
//         assert.equal(psbt.txInputs[0].index, 0);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber());
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//     });
//     it("feePayToCreator > 0: need to split UTXO from ordinal UTXO, but ordinal UTXO value isn't enough to split tx", async () => {
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         let errorMsg;
//         try {
//             const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//                 sellerPrivateKey: sellerPrivateKey,
//                 utxos: sellerUTXOs,
//                 inscriptions: sellerInsciptions,
//                 sellInscriptionID,
//                 receiverBTCAddress: sellerAddress,
//                 amountPayToSeller,
//                 feePayToCreator,
//                 creatorAddress,
//                 feeRatePerByte: 4,
//             });

//         } catch (e) {
//             errorMsg = e?.toString() || "";
//         }

//         assert.notEqual(errorMsg, "");
//         assert.notEqual(errorMsg, undefined);
//     });
//     it("feePayToCreator > 0: need to split UTXO from ordinal UTXO", async () => {
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs, splitTxRaw } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 2,
//         });


//         assert.notEqual(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 2);
//         assert.equal(psbt.txOutputs.length, 2);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1037);
//         assert.equal(psbt.txInputs[0].index, 0);
//         assert.equal(psbt.data.inputs[1].witnessUtxo?.value, 1000);
//         assert.equal(psbt.txInputs[1].index, 1);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber() + DummyUTXOValue);
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//         assert.equal(psbt.txOutputs[1].value, feePayToCreator.toNumber());
//         assert.equal(psbt.txOutputs[1].address, creatorAddress);
//     });
//     it("feePayToCreator > 0: need to split UTXO from ordinal UTXO", async () => {
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 2,
//         });

//         assert.notEqual(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 2);
//         assert.equal(psbt.txOutputs.length, 2);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1037);
//         assert.equal(psbt.txInputs[0].index, 0);
//         assert.equal(psbt.data.inputs[1].witnessUtxo?.value, 1000);
//         assert.equal(psbt.txInputs[1].index, 1);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber() + DummyUTXOValue);
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//         assert.equal(psbt.txOutputs[1].value, feePayToCreator.toNumber());
//         assert.equal(psbt.txOutputs[1].address, creatorAddress);
//     });
//     it("feePayToCreator > 0: need to split UTXO from cardinal UTXO - select the smallest UTXO", async () => {
//         sellerUTXOs.push(
//             {
//                 tx_hash: "1bdb522dc035d83fd4c837e2cef53d12de348aa2602f1ad9bd5102f8e9d200c9",
//                 tx_output_n: 1,
//                 value: new BigNumber(999),
//             },
//         );
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 2,
//         });
//         console.log("PBST split UTXO from cardinal: ", base64Psbt);

//         assert.equal(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 2);
//         assert.equal(psbt.txOutputs.length, 2);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1234);
//         assert.equal(psbt.txInputs[0].index, 0);
//         assert.equal(psbt.data.inputs[1].witnessUtxo?.value, 999);
//         assert.equal(psbt.txInputs[1].index, 1);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber() + 999);
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//         assert.equal(psbt.txOutputs[1].value, feePayToCreator.toNumber());
//         assert.equal(psbt.txOutputs[1].address, creatorAddress);
//         sellerUTXOs.pop();
//     });
//     it("feePayToCreator > 0: need to split UTXO from cardinal UTXO", async () => {
//         sellerUTXOs.push(
//             {
//                 tx_hash: "1bdb522dc035d83fd4c837e2cef53d12de348aa2602f1ad9bd5102f8e9d200c9",
//                 tx_output_n: 1,
//                 value: new BigNumber(1500),
//             },
//         );
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 3,
//         });

//         assert.notEqual(splitTxID, "");
//         assert.equal(splitUTXOs.length, 1);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 2);
//         assert.equal(psbt.txOutputs.length, 2);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1234);
//         assert.equal(psbt.txInputs[0].index, 0);
//         assert.equal(psbt.data.inputs[1].witnessUtxo?.value, DummyUTXOValue);
//         assert.equal(psbt.txInputs[1].index, 0);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber() + DummyUTXOValue);
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//         assert.equal(psbt.txOutputs[1].value, feePayToCreator.toNumber());
//         assert.equal(psbt.txOutputs[1].address, creatorAddress);
//         sellerUTXOs.pop();
//     });
// });


// describe("Buy inscription with PSBT", () => {
//     it("seller PSBT has one input: dummy UTXO is available & have enough UTXO to payments", async () => {
//         buyerUTXOs.push({
//             tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
//             tx_output_n: 2,
//             value: new BigNumber(998), // normal
//         })

//         const price = new BigNumber(1100);
//         let base64Psbt = "cHNidP8BAF4CAAAAAckA0un4AlG92RovYKKKNN4SPfXO4jfI1D/YNcAtUtsbAAAAAAD/////AUwEAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwAAAAAAAEBK9IEAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwBCEMBQUrVH8NSiqS+Um0rOXnepEzWx/t19NBOrmYjaJJQ3q68xCVL10mpQYWZ9HGqV+cc1gF+zJ5ZO8418ky6hnKRxqGDAAA=";
//         // next, buyer create the transaction
//         const { tx, txID, txHex, fee, selectedUTXOs: selectedUTXOsBuyer, splitTxID, splitUTXOs } = await reqBuyInscription({
//             sellerSignedPsbtB64: base64Psbt,
//             buyerPrivateKey: buyerPrivateKey,
//             receiverInscriptionAddress: buyerAddress,
//             price: price,
//             utxos: buyerUTXOs,
//             inscriptions: buyerInscriptions,
//             feeRatePerByte: 3,
//         });

//         assert.equal(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsBuyer.length, 2);

//         assert.equal(tx.ins.length, 3);
//         assert.equal(tx.outs.length, 3);

//         // assert.equal(tx.ins[0]., 3);
//         assert.equal(tx.outs[0].value, 1234 + 998); // dummy + inscription value
//         assert.equal(tx.outs[1].value, 1100); // for seller
//         assert.equal(tx.outs[2].value, 1000); // new dummy

//         buyerUTXOs.pop();

//     });

//     it("seller PSBT has 2 inputs: must split dummy UTXO & but have not enough UTXO to payments", async () => {
//         const price = new BigNumber(2100);
//         let base64Psbt = "cHNidP8BALICAAAAAskA0un4AlG92RovYKKKNN4SPfXO4jfI1D/YNcAtUtsbAAAAAAD/////yQDS6fgCUb3ZGi9gooo03hI99c7iN8jUP9g1wC1S2xsBAAAAAP////8CMwgAAAAAAAAiUSAbHPlP4PCuwkZG5/JCgkbZ7BEpyHDarPp4zWlO70j4TOgDAAAAAAAAIlEgDBzmg1gYh2X/tSP4NO8AyefnLXBhmmiW1R8Y17zmONgAAAAAAAEBK9IEAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwBCEMBQewmfEmb4ocyHjnPLaG68IctXH7Bf9Nr8W4OXYaB+We9K0PwehdWbpQG+k+oTHw13w+wNyi8+6c9SxpkkakdsqCDAAEBK+cDAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwBCEMBQdRWgt/6a3bS9+M1J7IqtZaEkcgQFjeMGyHBnE1V4Lj46iawHQ/0I/RnSC8sjEFbwOYKONQlnYkL5X5+j2XvvueDAAAA";
//         // next, buyer create the transaction
//         let errorMsg = "";
//         try {
//             const { tx, txID, txHex, fee, selectedUTXOs: selectedUTXOsBuyer, splitTxID, splitUTXOs } = await reqBuyInscription({
//                 sellerSignedPsbtB64: base64Psbt,
//                 buyerPrivateKey: buyerPrivateKey,
//                 receiverInscriptionAddress: buyerAddress,
//                 price: price,
//                 utxos: buyerUTXOs,
//                 inscriptions: buyerInscriptions,
//                 feeRatePerByte,
//             });
//         } catch (e) {
//             errorMsg = e?.toString() || "";
//         }
//         assert.notEqual(errorMsg, "");
//         assert.notEqual(errorMsg, undefined);
//     });


//     it("seller PSBT has 2 inputs: must split dummy UTXO & but have not enough UTXO to payments", async () => {
//         const price = new BigNumber(2100);
//         let base64Psbt = "cHNidP8BALICAAAAAskA0un4AlG92RovYKKKNN4SPfXO4jfI1D/YNcAtUtsbAAAAAAD/////yQDS6fgCUb3ZGi9gooo03hI99c7iN8jUP9g1wC1S2xsBAAAAAP////8CMwgAAAAAAAAiUSAbHPlP4PCuwkZG5/JCgkbZ7BEpyHDarPp4zWlO70j4TOgDAAAAAAAAIlEgDBzmg1gYh2X/tSP4NO8AyefnLXBhmmiW1R8Y17zmONgAAAAAAAEBK9IEAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwBCEMBQewmfEmb4ocyHjnPLaG68IctXH7Bf9Nr8W4OXYaB+We9K0PwehdWbpQG+k+oTHw13w+wNyi8+6c9SxpkkakdsqCDAAEBK+cDAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwBCEMBQdRWgt/6a3bS9+M1J7IqtZaEkcgQFjeMGyHBnE1V4Lj46iawHQ/0I/RnSC8sjEFbwOYKONQlnYkL5X5+j2XvvueDAAAA";
//         // next, buyer create the transaction
//         let errorMsg = "";

//         let buyerUTXOs = [
//             // {
//             //     tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
//             //     tx_output_n: 2,
//             //     value: 1000,
//             // },
//             {
//                 tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
//                 tx_output_n: 0,
//                 value: new BigNumber(2000), // inscription
//             },
//             // {
//             //     tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
//             //     tx_output_n: 1,
//             //     value: 501, // normal
//             // },
//             // {
//             //     tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
//             //     tx_output_n: 2,
//             //     value: 502, // normal
//             // },
//             // {
//             //     tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
//             //     tx_output_n: 3,
//             //     value: 503, // normal
//             // },
//             // {
//             //     tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
//             //     tx_output_n: 4,
//             //     value: 504, // normal
//             // },
//             // {
//             //     tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
//             //     tx_output_n: 5,
//             //     value: 505, // normal
//             // },
//             // {
//             //     tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
//             //     tx_output_n: 6,
//             //     value: 1504, // normal
//             // },
//             // {
//             //     tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
//             //     tx_output_n: 7,
//             //     value: 502, // normal
//             // },
//             {
//                 tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
//                 tx_output_n: 8,
//                 value: new BigNumber(7505), // normal
//             },
//             {
//                 tx_hash: "3edce14398749454d105241212d46aad8a513f41dd38d84ebef452000b28c777",
//                 tx_output_n: 9,
//                 value: new BigNumber(10505), // normal
//             }
//         ];
//         // try {
//         const { tx, txID, txHex, fee, selectedUTXOs: selectedUTXOsBuyer, splitTxID, splitUTXOs } = await reqBuyInscription({
//             sellerSignedPsbtB64: base64Psbt,
//             buyerPrivateKey: buyerPrivateKey,
//             receiverInscriptionAddress: buyerAddress,
//             price: price,
//             utxos: buyerUTXOs,
//             inscriptions: buyerInscriptions,
//             feeRatePerByte,
//         });
//         console.log("tx: ", tx);
//         console.log("selectedUTXOsBuyer: ", selectedUTXOsBuyer);
//         // } catch (e) {
//         //     errorMsg = e?.toString() || "";
//         // }
//         // assert.notEqual(errorMsg, "");
//         // assert.notEqual(errorMsg, undefined);
//         // console.log("errorMsg: ", errorMsg);
//     });
// });

// describe("Buy and Sell inscription with PSBT", () => {

//     it("feePayToCreator > 0: seller split UTXO first", async () => {
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(0);

//         const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 4,
//         });

//         console.log("PBST no fee for creator: ", base64Psbt);

//         assert.equal(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 1);
//         assert.equal(psbt.txOutputs.length, 1);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1234);
//         assert.equal(psbt.txInputs[0].index, 0);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber());
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//     });
//     it("feePayToCreator > 0: need to split UTXO from ordinal UTXO, but ordinal UTXO value isn't enough to split tx", async () => {
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         let errorMsg;
//         try {
//             const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//                 sellerPrivateKey: sellerPrivateKey,
//                 utxos: sellerUTXOs,
//                 inscriptions: sellerInsciptions,
//                 sellInscriptionID,
//                 receiverBTCAddress: sellerAddress,
//                 amountPayToSeller,
//                 feePayToCreator,
//                 creatorAddress,
//                 feeRatePerByte: 4,
//             });

//         } catch (e) {
//             errorMsg = e?.toString() || "";
//         }

//         assert.notEqual(errorMsg, "");
//         assert.notEqual(errorMsg, undefined);
//     });
//     it("feePayToCreator > 0: need to split UTXO from ordinal UTXO", async () => {
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs, splitTxRaw } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 2,
//         });


//         assert.notEqual(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 2);
//         assert.equal(psbt.txOutputs.length, 2);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1037);
//         assert.equal(psbt.txInputs[0].index, 0);
//         assert.equal(psbt.data.inputs[1].witnessUtxo?.value, 1000);
//         assert.equal(psbt.txInputs[1].index, 1);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber() + DummyUTXOValue);
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//         assert.equal(psbt.txOutputs[1].value, feePayToCreator.toNumber());
//         assert.equal(psbt.txOutputs[1].address, creatorAddress);
//     });
//     it("feePayToCreator > 0: need to split UTXO from ordinal UTXO", async () => {
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 2,
//         });

//         assert.notEqual(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 2);
//         assert.equal(psbt.txOutputs.length, 2);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1037);
//         assert.equal(psbt.txInputs[0].index, 0);
//         assert.equal(psbt.data.inputs[1].witnessUtxo?.value, 1000);
//         assert.equal(psbt.txInputs[1].index, 1);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber() + DummyUTXOValue);
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//         assert.equal(psbt.txOutputs[1].value, feePayToCreator.toNumber());
//         assert.equal(psbt.txOutputs[1].address, creatorAddress);
//     });
//     it("feePayToCreator > 0: need to split UTXO from cardinal UTXO - select the smallest UTXO", async () => {
//         sellerUTXOs.push(
//             {
//                 tx_hash: "1bdb522dc035d83fd4c837e2cef53d12de348aa2602f1ad9bd5102f8e9d200c9",
//                 tx_output_n: 1,
//                 value: new BigNumber(999),
//             },
//         );
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 2,
//         });
//         console.log("PBST split UTXO from cardinal: ", base64Psbt);

//         assert.equal(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 2);
//         assert.equal(psbt.txOutputs.length, 2);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1234);
//         assert.equal(psbt.txInputs[0].index, 0);
//         assert.equal(psbt.data.inputs[1].witnessUtxo?.value, 999);
//         assert.equal(psbt.txInputs[1].index, 1);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber() + 999);
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//         assert.equal(psbt.txOutputs[1].value, feePayToCreator.toNumber());
//         assert.equal(psbt.txOutputs[1].address, creatorAddress);
//         sellerUTXOs.pop();
//     });
//     it("feePayToCreator > 0: need to split UTXO from cardinal UTXO", async () => {
//         sellerUTXOs.push(
//             {
//                 tx_hash: "1bdb522dc035d83fd4c837e2cef53d12de348aa2602f1ad9bd5102f8e9d200c9",
//                 tx_output_n: 1,
//                 value: new BigNumber(1500),
//             },
//         );
//         // first, seller create the transaction
//         const amountPayToSeller = new BigNumber(1100);
//         const feePayToCreator = new BigNumber(1000);

//         const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
//         const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";

//         const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitUTXOs } = await reqListForSaleInscription({
//             sellerPrivateKey: sellerPrivateKey,
//             utxos: sellerUTXOs,
//             inscriptions: sellerInsciptions,
//             sellInscriptionID,
//             receiverBTCAddress: sellerAddress,
//             amountPayToSeller,
//             feePayToCreator,
//             creatorAddress,
//             feeRatePerByte: 3,
//         });

//         assert.notEqual(splitTxID, "");
//         assert.equal(splitUTXOs.length, 1);
//         assert.equal(selectedUTXOsSeller.length, 1);

//         const psbt = Psbt.fromBase64(base64Psbt);
//         assert.equal(psbt.txInputs.length, 2);
//         assert.equal(psbt.txOutputs.length, 2);

//         assert.equal(psbt.data.inputs[0].witnessUtxo?.value, 1234);
//         assert.equal(psbt.txInputs[0].index, 0);
//         assert.equal(psbt.data.inputs[1].witnessUtxo?.value, DummyUTXOValue);
//         assert.equal(psbt.txInputs[1].index, 0);

//         assert.equal(psbt.txOutputs[0].value, amountPayToSeller.toNumber() + DummyUTXOValue);
//         assert.equal(psbt.txOutputs[0].address, sellerAddress);
//         assert.equal(psbt.txOutputs[1].value, feePayToCreator.toNumber());
//         assert.equal(psbt.txOutputs[1].address, creatorAddress);
//         sellerUTXOs.pop();
//     });
// });


// describe("Buy inscription with PSBT", () => {
//     it("seller PSBT has one input: dummy UTXO is available & have enough UTXO to payments", async () => {
//         buyerUTXOs.push({
//             tx_hash: "4963e4ec3bf2599c542259ad5cc393ceef6a1dfea1aa0df2c3533a27d173aeee",
//             tx_output_n: 2,
//             value: new BigNumber(998), // normal
//         })

//         const price = new BigNumber(1100);
//         let base64Psbt = "cHNidP8BAF4CAAAAAckA0un4AlG92RovYKKKNN4SPfXO4jfI1D/YNcAtUtsbAAAAAAD/////AUwEAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwAAAAAAAEBK9IEAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwBCEMBQUrVH8NSiqS+Um0rOXnepEzWx/t19NBOrmYjaJJQ3q68xCVL10mpQYWZ9HGqV+cc1gF+zJ5ZO8418ky6hnKRxqGDAAA=";
//         // next, buyer create the transaction
//         const { tx, txID, txHex, fee, selectedUTXOs: selectedUTXOsBuyer, splitTxID, splitUTXOs } = await reqBuyInscription({
//             sellerSignedPsbtB64: base64Psbt,
//             buyerPrivateKey: buyerPrivateKey,
//             receiverInscriptionAddress: buyerAddress,
//             price: price,
//             utxos: buyerUTXOs,
//             inscriptions: buyerInscriptions,
//             feeRatePerByte: 3,
//         });

//         assert.equal(splitTxID, "");
//         assert.equal(splitUTXOs.length, 0);
//         assert.equal(selectedUTXOsBuyer.length, 3);

//         assert.equal(tx.ins.length, 4);
//         assert.equal(tx.outs.length, 4);

//         // assert.equal(tx.ins[0]., 3);
//         assert.equal(tx.outs[0].value, 1234 + 998); // dummy + inscription value
//         assert.equal(tx.outs[1].value, 1100); // for seller
//         assert.equal(tx.outs[2].value, 1000); // new dummy
//         assert.equal(tx.outs[3].value, 1697); // change amount
//         // no new dummy UTXO
//         // no change amount

//         buyerUTXOs.pop();

//     });

//     it("seller PSBT has 2 inputs: must split dummy UTXO & but have not enough UTXO to payments", async () => {
//         const price = new BigNumber(2100);
//         let base64Psbt = "cHNidP8BALICAAAAAskA0un4AlG92RovYKKKNN4SPfXO4jfI1D/YNcAtUtsbAAAAAAD/////yQDS6fgCUb3ZGi9gooo03hI99c7iN8jUP9g1wC1S2xsBAAAAAP////8CMwgAAAAAAAAiUSAbHPlP4PCuwkZG5/JCgkbZ7BEpyHDarPp4zWlO70j4TOgDAAAAAAAAIlEgDBzmg1gYh2X/tSP4NO8AyefnLXBhmmiW1R8Y17zmONgAAAAAAAEBK9IEAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwBCEMBQewmfEmb4ocyHjnPLaG68IctXH7Bf9Nr8W4OXYaB+We9K0PwehdWbpQG+k+oTHw13w+wNyi8+6c9SxpkkakdsqCDAAEBK+cDAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwBCEMBQdRWgt/6a3bS9+M1J7IqtZaEkcgQFjeMGyHBnE1V4Lj46iawHQ/0I/RnSC8sjEFbwOYKONQlnYkL5X5+j2XvvueDAAAA";
//         // next, buyer create the transaction
//         let errorMsg = "";
//         try {
//             const { tx, txID, txHex, fee, selectedUTXOs: selectedUTXOsBuyer, splitTxID, splitUTXOs } = await reqBuyInscription({
//                 sellerSignedPsbtB64: base64Psbt,
//                 buyerPrivateKey: buyerPrivateKey,
//                 receiverInscriptionAddress: buyerAddress,
//                 price: price,
//                 utxos: buyerUTXOs,
//                 inscriptions: buyerInscriptions,
//                 feeRatePerByte,
//             });
//         } catch (e) {
//             errorMsg = e?.toString() || "";
//         }
//         assert.notEqual(errorMsg, "");
//         assert.notEqual(errorMsg, undefined);
//     });
// });

describe("Buy and Sell inscription with PSBT", () => {

    // it("feePayToCreator > 0: seller split UTXO first", async () => {
    //     // first, seller create the transaction
    //     const amountPayToSeller = new BigNumber(1100);
    //     const feePayToCreator = new BigNumber(0);

    //     const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
    //     const creatorAddress = "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9";
    //     const pubKey = "93bc6f8a5d30a5ce9461f9253a21d051488a79981b4e75ca2288f9015ad5f615";

    //     const newAddr = generateTaprootAddressFromPubKey(Buffer.from(pubKey, "hex"));
    //     console.log("newAddr: ", newAddr);

    //     const { base64Psbt, selectedUTXOs: selectedUTXOsSeller, splitTxID, splitTxRaw } = await reqListForSaleInscription({
    //         sellerPrivateKey: sellerPrivateKey,
    //         utxos: sellerUTXOs,
    //         inscriptions: sellerInsciptions,
    //         sellInscriptionID,
    //         receiverBTCAddress: sellerAddress,
    //         amountPayToSeller,
    //         feePayToCreator,
    //         creatorAddress,
    //         feeRatePerByte: 4,
    //     });
    //     console.log("SELL base64Psbt: ", base64Psbt);
    //     console.log(selectedUTXOsSeller);

    //     // if (splitTxID !== "" && splitTxRaw !== "") {
    //     //     const txID0 = await broadcastTx(splitTxRaw);
    //     //     console.log("Seller txID0: ", txID0);
    //     // }

    //     // next, buyer create the transaction
    //     // const { txID, txHex, fee, selectedUTXOs: selectedUTXOsBuyer, splitTxID: splitTxIDBuy, splitTxRaw: splitTxRawBuy, splitUTXOs } = await reqBuyInscription({
    //     //     sellerSignedPsbtB64: base64Psbt,
    //     //     buyerPrivateKey: buyerPrivateKey,
    //     //     receiverInscriptionAddress: buyerAddress,
    //     //     price: amountPayToSeller.plus(feePayToCreator),
    //     //     utxos: buyerUTXOs,
    //     //     inscriptions: buyerInscriptions,
    //     //     feeRatePerByte,
    //     // });


    //     // console.log("BUY splitTxID: ", splitTxIDBuy);
    //     // console.log("BUY splitTxRawBuy: ", splitTxRawBuy);
    //     // console.log("BUY splitUTXOs: ", splitUTXOs);

    //     // // broadcast buy tx first
    //     // // try {
    //     // //     await broadcastTx(txHex);
    //     // // } catch (e) {
    //     // //     console.log(e);
    //     // // }

    //     // // then, split tx



    //     // console.log("Final TxID TX hex: ", txID, txHex, fee);

    // });

    it("feePayToCreator > 0: seller split UTXO first", async () => {
        // first, seller create the transaction
        const amountPayToSeller = new BigNumber(1100);
        const feePayToCreator = new BigNumber(0);

        const sellInscriptionID = "73168fb8c16f6990eaf54122492cd5768a17f3801a32d01712e22869094a94fci0";
        const creatorAddress = "";
        const pubKey = "93bc6f8a5d30a5ce9461f9253a21d051488a79981b4e75ca2288f9015ad5f615";

        const internalPubKey = Buffer.from(pubKey, "hex");

        const { address } = generateTaprootAddressFromPubKey(internalPubKey);
        console.log("newAddr: ", address);
        const inscriptionUTXO = {
            tx_hash: "44d5587b6863c89a49d2ef3602509c4b5cb7f384d735980dd14a9e2f46fb9477",
            tx_output_n: 0,
            value: new BigNumber(2786),
        };

        const dummyUTXO = {
            tx_hash: "44d5587b6863c89a49d2ef3602509c4b5cb7f384d735980dd14a9e2f46fb9477",
            tx_output_n: 1,
            value: new BigNumber(0),
        }

        const base64Psbt = await createRawPSBTToSell({
            internalPubKey: internalPubKey,
            inscriptionUTXO,
            receiverBTCAddress: address,
            amountPayToSeller,
            feePayToCreator,
            creatorAddress,
            dummyUTXO: dummyUTXO,
        });
        console.log("SELL base64Psbt: ", base64Psbt);

        const signedPSBT = "cHNidP8BAF4CAAAAAXeU+0YvnkrRDZg114Tzt1xLnFACNu/SSZrIY2h7WNVEAAAAAAD/////AUwEAAAAAAAAIlEgjAFwcoG2481oti8kwbNWhXSX3LqbShgVMkUIkFJ9l/gAAAAAAAEBK+IKAAAAAAAAIlEgjAFwcoG2481oti8kwbNWhXSX3LqbShgVMkUIkFJ9l/gBAwSDAAAAARNB4sQlWCfZVsYWhA3dQh548o3Y5jVJXHkRFQDv2WPWPBh1HWo3ge/twHf09UPGMGIs4LjQe2+DH4+89Ug6fjU4toMBFyCTvG+KXTClzpRh+SU6IdBRSIp5mBtOdcoiiPkBWtX2FQAA";

        const signedPsbt = Psbt.fromBase64(signedPSBT);
        signedPsbt.finalizeAllInputs();

        console.log("signedPsbt : ", signedPsbt.data.inputs);


        let buyerUTXOs = [
            {
                tx_hash: "11e3923377f84ab932f489b7dc1862923fbb73f034d44d2a9a8d62721e5e94e5",
                tx_output_n: 1,
                value: new BigNumber(51341), // normal
            },
        ];

        let buyerInscriptions = {};

        //     // next, buyer create the transaction
        const { txID, txHex, fee, selectedUTXOs: selectedUTXOsBuyer, splitTxID: splitTxIDBuy, splitTxRaw: splitTxRawBuy, splitUTXOs } = await reqBuyInscription({
            sellerSignedPsbtB64: signedPsbt.toBase64(),
            buyerPrivateKey: buyerPrivateKey,
            receiverInscriptionAddress: buyerAddress,
            price: amountPayToSeller.plus(feePayToCreator),
            utxos: buyerUTXOs,
            inscriptions: buyerInscriptions,
            feeRatePerByte: 11,
        });


        console.log("HHH splitTxRawBuy: ", splitTxRawBuy);
        console.log("HHH txHex: ", txHex);






    });


});


