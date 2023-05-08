import {
    BNZero,
    Inscription,
    MinSats,
    NetworkType,
    Regtest,
    UTXO,
    broadcastTx,
    convertPrivateKey,
    convertPrivateKeyFromStr,
    createTx,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    selectUTXOs,
    setBTCNetwork,
} from "../src/index";

import BigNumber from "bignumber.js";
import { DefaultDeserializer } from "v8";
import { assert } from "chai";
import { getUTXOsFromBlockStream } from '../src/tc/blockstream';
import { number } from "bitcoinjs-lib/src/script";

require("dotenv").config({ path: __dirname + "/.env" });


// for real tx
// let UTXOs: UTXO[] = [
//   // normal UTXOs
//   // real
//   {
//     tx_hash: "9fb225358d6774b3f88b9d8aa1b08f5b976e4f842ec9518f529e36e1b73c1ec9",
//     block_height: 777754,
//     tx_input_n: -1,
//     tx_output_n: 1,
//     value: 1890
//   },

//   // inscription UTXOs
//   // real
//   {
//     tx_hash: "be6360fc87a5e81ef88b9dfbf6b299556af19476a68a3dbd24725f3422f1124e",
//     block_height: 777781,
//     tx_input_n: -1,
//     tx_output_n: 0,
//     value: 390
//   },
//   {
//     tx_hash: "2a6ad9ade8c0788722f5df00033f8c7e301c069c88c6593871884c0b76d9c36a",
//     block_height: 777933,
//     tx_input_n: -1,
//     tx_output_n: 0,
//     value: 7114
//   },
//   {
//     tx_hash: "688ccc809428656928a59e79da7b97595879b5faa23edf73b80aa810bc1f874d",
//     block_height: 777933,
//     tx_input_n: -1,
//     tx_output_n: 0,
//     value: 5198
//   },
// ];

// let UTXOs: UTXO[] = [
//     {
//         tx_hash: "9a6a37681c0ad4326e8f30e75359bb4cb6627b4a515d8c317ffae5d42d5c39d1",
//         tx_output_n: 0,
//         value: 10000
//     }
// ];

// for unit tests
let UTXOs: UTXO[] = [
    // normal UTXOs
    {
        tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
        tx_output_n: 1,
        value: new BigNumber(1000)
    },
    {
        tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
        tx_output_n: 2,
        value: new BigNumber(2000)
    },
    {
        tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
        tx_output_n: 3,
        value: new BigNumber(10000)
    },
    // inscription UTXOs
    // real
    {
        tx_hash: "fecd11d6da5404af3574db4d4fd87aa2d4e2a4d4c3d7d6a767474eeea34e55f3",
        tx_output_n: 0,
        value: new BigNumber(5274)
    },

    {
        tx_hash: "dd1d3dfce672ccdeabf0b4d96de95045760e465ab359171132fb3dbff232ab09",
        tx_output_n: 0,  // offset != 0
        value: new BigNumber(1234)
    },
];

var sellerPrivateKeyWIF = process.env.PRIV_KEY_1 || "";
var sellerPrivateKey = convertPrivateKeyFromStr(sellerPrivateKeyWIF);
let sellerAddress = process.env.ADDRESS_1 || "";

let buyerPrivateKeyWIF = process.env.PRIV_KEY_2 || "";
let buyerAddress = process.env.ADDRESS_2 || "";
let buyerPrivateKey = convertPrivateKeyFromStr(buyerPrivateKeyWIF);


let inscriptions: { [key: string]: Inscription[] } = {

    // "688ccc809428656928a59e79da7b97595879b5faa23edf73b80aa810bc1f874d:0": [{ id: "759227f04721a0f3d097826fa7b66a34228dd2ed61e89a77d51a50d3cd7ab6dci0", offset: 0 }],
    // "2a6ad9ade8c0788722f5df00033f8c7e301c069c88c6593871884c0b76d9c36a:0": [{ id: "b4e20295fa3c738490cf1d8a542a9a1354affa649f601866b12c092a956de1c3i0", offset: 0 }],
    // "be6360fc87a5e81ef88b9dfbf6b299556af19476a68a3dbd24725f3422f1124e:0": [{ id: "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0", offset: 0 }]

    // for test
    "fecd11d6da5404af3574db4d4fd87aa2d4e2a4d4c3d7d6a767474eeea34e55f3:0": [{ id: "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0", offset: new BigNumber(1607) }],
    "dd1d3dfce672ccdeabf0b4d96de95045760e465ab359171132fb3dbff232ab09:0": [{ id: "dd1d3dfce672ccdeabf0b4d96de95045760e465ab359171132fb3dbff232ab09i1", offset: new BigNumber(568) }]
};

let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
let txIDKey = "b44b7b9688ee1203f58de75dce01e954891f4a118cb4adfa9803334fef660e25:0";

let receiverAddress = "bc1prvw0jnlq7zhvy3jxuley9qjxm8kpz2wgwrd2e7nce455am6glpxqavdcc9";
let feeRatePerByte = 6;
let sendAmount = new BigNumber(0);
let isUseInscriptionPayFeeParam = true;

// describe("Selecting UTXOs Tests", () => {
//   it("should return error Can not find inscription UTXO for sendInscriptionID", () => {
//     let sendInscriptionID = "not-found-id";
//     let error;

//     try {
//       const { } = selectUTXOs(UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
//     } catch (e) {
//       error = e;
//     }
//     assert.equal(error?.toString(), "Error: Can not find inscription UTXO for sendInscriptionID");
//   });

//   it("inscriptionId is not empty - should return 1 selected UTXO value is enough to pay fee (inscription) - isUseInscriptionPayFeeParam = true", () => {
//     let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";

//     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
//       UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

//     console.log("selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee ", selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee);

//     let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
//     actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

//     let actualInscriptionInfos = inscriptions[actualTxIDKey];
//     let actualInscriptionID = actualInscriptionInfos[0].id;

//     assert.equal(selectedUTXOs.length, 1);
//     assert.equal(actualInscriptionID, sendInscriptionID);
//     assert.equal(isUseInscriptionPayFee, true);

//     assert.equal(valueOutInscription, 5274 - fee);
//     assert.equal(valueOutInscription > 4607, true);
//     assert.equal(changeAmount, 0);
//   });

//   it("inscriptionId is empty && sendAmount > 0 - should return 1 selected normal UTXO - isUseInscriptionPayFeeParam = true", () => {
//     let sendInscriptionID = "";
//     let sendAmount = 100;

//     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
//       UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

//     console.log("selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee ", selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee);

//     assert.equal(selectedUTXOs.length, 1);
//     assert.equal(selectedUTXOs[0].value , 2000);
//     assert.equal(isUseInscriptionPayFee, false);
//     assert.equal(valueOutInscription, 0);
//     assert.equal(fee, 924)
//     assert.equal(changeAmount, 2000 - fee - 100);
//   });

//   it("inscriptionId is not empty - should return 1 selected UTXO value is not enough to pay fee (inscription) - isUseInscriptionPayFeeParam = true", () => {
//     let sendInscriptionID = "dd1d3dfce672ccdeabf0b4d96de95045760e465ab359171132fb3dbff232ab09i1";
//     let error;
//     try {
//     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
//       UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
//     } catch (e) {
//       error = e;
//     }
//     assert.equal(error?.toString(), "Error: Your balance is insufficient for covering the network fees.");
//   });

//   it("inscriptionId is not empty & sendAmount > 0  - should return 1 selected UTXO value is not enough to pay fee (inscription) - isUseInscriptionPayFeeParam = true", () => {
//     let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
//     let sendAmount = 100;
//     let error;
//     try {
//     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
//       UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
//     } catch (e) {
//       error = e;
//     }
//     assert.equal(error?.toString(), "Error: Don't support send BTC while sending inscription");
//   });

//   it("inscriptionId is empty && sendAmount = 0 - should return 1 selected UTXO value is not enough to pay fee (inscription) - isUseInscriptionPayFeeParam = true", () => {
//     let sendInscriptionID = "";
//     let sendAmount = 0;

//     let error;
//     try {
//     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
//       UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
//     } catch (e) {
//       error = e;
//     }
//     assert.equal(error?.toString(), "Error: Payment info is empty");
//   });


//   // later verison (use multiple input coins to create tx)
// //  it("should return 1 selected UTXO - isUseInscriptionPayFeeParam = true", () => {
// //     let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";

// //     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
// //       UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

// //     let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
// //     actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

// //     let actualInscriptionInfos = inscriptions[actualTxIDKey];
// //     let actualInscriptionID = actualInscriptionInfos[0].id;

// //     assert.equal(selectedUTXOs.length, 1);
// //     assert.equal(actualInscriptionID, sendInscriptionID);
// //     assert.equal(isUseInscriptionPayFee, true);
// //     assert.equal(valueOutInscription, 5274 - fee);
// //     assert.equal(valueOutInscription >= MinSats, true);
// //     assert.equal(changeAmount, 0);
// //   });

// //     it("insciption offset = 0 : should return 2 selected UTXOs (insciption & medium UTXO) - isUseInscriptionPayFeeParam = false", () => {
// //       let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
// //       let isUseInscriptionPayFeeParam = false;

// //       const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
// //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

// //       let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
// //       actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

// //       let actualInscriptionInfos = inscriptions[actualTxIDKey];
// //       let actualInscriptionID = actualInscriptionInfos[0].id;

// //       assert.equal(selectedUTXOs.length, 2);
// //       assert.equal(actualInscriptionID, sendInscriptionID);

// //       assert.equal(selectedUTXOs[1].value, 2000);
// //       assert.equal(fee, 1332);
// //       assert.equal(isUseInscriptionPayFee, false);
// //       assert.equal(valueOutInscription, 5274);
// //       assert.equal(changeAmount, 2000 - 1332);
// //     });

// //     it("insciption offset != 0 : MUST return 2 selected UTXOs (insciption & medium UTXO to pay fee) - isUseInscriptionPayFeeParam = default", () => {
// //       let sendInscriptionID = "dd1d3dfce672ccdeabf0b4d96de95045760e465ab359171132fb3dbff232ab09i1";
// //       let isUseInscriptionPayFeeParam = false;

// //       const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
// //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

// //       let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
// //       actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

// //       let actualInscriptionInfos = inscriptions[actualTxIDKey];
// //       let actualInscriptionID = actualInscriptionInfos[0].id;

// //       assert.equal(selectedUTXOs.length, 2);
// //       assert.equal(actualInscriptionID, sendInscriptionID);
// //       assert.equal(selectedUTXOs[1].value, 2000);
// //       assert.equal(fee, 1332);
// //       assert.equal(isUseInscriptionPayFee, false);
// //       assert.equal(valueOutInscription, 1234);
// //       assert.equal(changeAmount, 2000 - 1332);
// //     });

// //     it("insciption value is not enough to pay fee : should return 2 selected UTXOs (insciption & biggest UTXO) - isUseInscriptionPayFeeParam default", () => {
// //       let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
// //       let isUseInscriptionPayFeeParam = true;
// //       let feeRatePerByte = 48;

// //       const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
// //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

// //       let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
// //       actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

// //       let actualInscriptionInfos = inscriptions[actualTxIDKey];
// //       let actualInscriptionID = actualInscriptionInfos[0].id;

// //       assert.equal(selectedUTXOs.length, 2);
// //       assert.equal(actualInscriptionID, sendInscriptionID);

// //       assert.equal(selectedUTXOs[1].value, 10000);
// //       assert.equal(fee, 10000);
// //       assert.equal(isUseInscriptionPayFee, false);
// //       assert.equal(valueOutInscription, 5274);
// //       assert.equal(changeAmount, 10000 - fee);
// //     });

// //     it("insciption offset 0 - send amount > 0: should return 2 selected UTXOs (insciption &  medium  UTXO) - isUseInscriptionPayFeeParam default", () => {
// //       let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
// //       let isUseInscriptionPayFeeParam = true;
// //       let feeRatePerByte = 6;
// //       let sendAmount = 100;

// //       const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
// //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

// //       let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
// //       actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

// //       let actualInscriptionInfos = inscriptions[actualTxIDKey];
// //       let actualInscriptionID = actualInscriptionInfos[0].id;

// //       assert.equal(selectedUTXOs.length, 2);
// //       assert.equal(actualInscriptionID, sendInscriptionID);

// //       assert.equal(selectedUTXOs[1].value, 2000);
// //       assert.equal(fee, 1590);
// //       assert.equal(isUseInscriptionPayFee, false);
// //       assert.equal(valueOutInscription, 5274);
// //       assert.equal(changeAmount, 2000 - fee - sendAmount);
// //     });

// //     it("insciption offset 0 - send amount > 0: should return 3 selected UTXOs (insciption &  multiple UTXO) - isUseInscriptionPayFeeParam default", () => {
// //       let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
// //       let isUseInscriptionPayFeeParam = true;
// //       let feeRatePerByte = 6;
// //       let sendAmount = 9000;

// //       const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
// //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

// //       let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
// //       actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

// //       let actualInscriptionInfos = inscriptions[actualTxIDKey];
// //       let actualInscriptionID = actualInscriptionInfos[0].id;

// //       assert.equal(selectedUTXOs.length, 3);
// //       assert.equal(actualInscriptionID, sendInscriptionID);

// //       assert.equal(selectedUTXOs[1].value, 10000);
// //       assert.equal(selectedUTXOs[2].value, 2000);
// //       assert.equal(fee, 1998);
// //       assert.equal(isUseInscriptionPayFee, false);
// //       assert.equal(valueOutInscription, 5274);
// //       assert.equal(changeAmount, 12000 - fee - sendAmount);
// //     });



//     // it("create tx should return 1 selected UTXO - isUseInscriptionPayFeeParam = true", () => {
//     //   let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";

//     //   // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
//     //   //   UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

//   // it("send BTC - should return 1 selected UTXO - isUseInscriptionPayFeeParam = true", () => {
//   //   let sendInscriptionID = "";
//   //   let sendAmount = 966;

//   //   // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
//   //   //   UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

//   //   const { txID, txHex, fee: feeRes } = createTx(senderPrivateKey, UTXOs, inscriptions, sendInscriptionID, receiverAddress, sendAmount, 6, true);
//   //   console.log(txID, txHex, feeRes);



//     //  generateAddress(senderPrivateKey);
// });


describe("Create tx with multiple UTXOs Tests", () => {
    // it("should return 1 selected UTXO - isUseInscriptionPayFeeParam = true", () => {
    //     let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";

    //     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

    //     let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
    //     actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

    //     let actualInscriptionInfos = inscriptions[actualTxIDKey];
    //     let actualInscriptionID = actualInscriptionInfos[0].id;

    //     assert.equal(selectedUTXOs.length, 1);
    //     assert.equal(actualInscriptionID, sendInscriptionID);
    //     assert.equal(isUseInscriptionPayFee, true);
    //     assert.equal(valueOutInscription.toNumber(), 5274 - fee.toNumber());
    //     assert.equal(valueOutInscription.toNumber() >= MinSats, true);
    //     assert.equal(changeAmount.eq(BNZero), true);
    // });

    // it("insciption offset != 0 : MUST return 2 selected UTXOs (insciption & medium UTXO to pay fee) - isUseInscriptionPayFeeParam = default", () => {
    //     let sendInscriptionID = "dd1d3dfce672ccdeabf0b4d96de95045760e465ab359171132fb3dbff232ab09i1";
    //     let isUseInscriptionPayFeeParam = false;

    //     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

    //     let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
    //     actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

    //     let actualInscriptionInfos = inscriptions[actualTxIDKey];
    //     let actualInscriptionID = actualInscriptionInfos[0].id;

    //     assert.equal(selectedUTXOs.length, 2);
    //     assert.equal(actualInscriptionID, sendInscriptionID);
    //     assert.equal(selectedUTXOs[1].value.toNumber(), 2000);
    //     assert.equal(fee.toNumber(), 1332);
    //     assert.equal(isUseInscriptionPayFee, false);
    //     assert.equal(valueOutInscription.toNumber(), 1234);
    //     assert.equal(changeAmount.toNumber(), 2000 - 1332);
    // });

    // it("insciption value is not enough to pay fee : should return 2 selected UTXOs (insciption & biggest UTXO) - isUseInscriptionPayFeeParam default", () => {
    //     let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
    //     let isUseInscriptionPayFeeParam = true;
    //     let feeRatePerByte = 48;

    //     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

    //     let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
    //     actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

    //     let actualInscriptionInfos = inscriptions[actualTxIDKey];
    //     let actualInscriptionID = actualInscriptionInfos[0].id;

    //     assert.equal(selectedUTXOs.length, 2);
    //     assert.equal(actualInscriptionID, sendInscriptionID);

    //     assert.equal(selectedUTXOs[1].value.toNumber(), 10000);
    //     assert.equal(fee.toNumber(), 10000);
    //     assert.equal(isUseInscriptionPayFee, false);
    //     assert.equal(valueOutInscription.toNumber(), 5274);
    //     assert.equal(changeAmount.toNumber(), 10000 - fee.toNumber());
    // });

    // it("insciption offset 0 - send amount > 0: should return 2 selected UTXOs (insciption &  medium  UTXO) - isUseInscriptionPayFeeParam default", () => {
    //     let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
    //     let isUseInscriptionPayFeeParam = true;
    //     let feeRatePerByte = 6;
    //     let sendAmount = new BigNumber(100);

    //     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

    //     let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
    //     actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

    //     let actualInscriptionInfos = inscriptions[actualTxIDKey];
    //     let actualInscriptionID = actualInscriptionInfos[0].id;

    //     assert.equal(selectedUTXOs.length, 2);
    //     assert.equal(actualInscriptionID, sendInscriptionID);

    //     assert.equal(selectedUTXOs[1].value.toNumber(), 2000);
    //     assert.equal(fee.toNumber(), 1590);
    //     assert.equal(isUseInscriptionPayFee, false);
    //     assert.equal(valueOutInscription.toNumber(), 5274);
    //     assert.equal(changeAmount.eq(new BigNumber(2000).minus(fee).minus(sendAmount)), true);
    // });

    // it("insciption offset 0 - send amount > 0: should return 3 selected UTXOs (insciption &  multiple UTXO) - isUseInscriptionPayFeeParam default", () => {
    //     let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
    //     let isUseInscriptionPayFeeParam = true;
    //     let feeRatePerByte = 6;
    //     let sendAmount = new BigNumber(9000);

    //     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //         UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

    //     let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
    //     actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

    //     let actualInscriptionInfos = inscriptions[actualTxIDKey];
    //     let actualInscriptionID = actualInscriptionInfos[0].id;

    //     assert.equal(selectedUTXOs.length, 3);
    //     assert.equal(actualInscriptionID, sendInscriptionID);

    //     assert.equal(selectedUTXOs[1].value.toNumber(), 10000);
    //     assert.equal(selectedUTXOs[2].value.toNumber(), 2000);
    //     assert.equal(fee.toNumber(), 1998);
    //     assert.equal(isUseInscriptionPayFee, false);
    //     assert.equal(valueOutInscription.toNumber(), 5274);
    //     assert.equal(changeAmount.eq(new BigNumber(12000).minus(fee).minus(sendAmount)), true);
    // });

    // it("insciption offset 0 - send amount > 0, need extra UTXOs: should return 3 selected UTXOs (insciption &  multiple UTXO) - isUseInscriptionPayFeeParam default", () => {
    //     let sendInscriptionID = "a22ed5f4e741519e91f51280d2af4377b72f29c52f693955f370d6a1025c35aei0";
    //     let isUseInscriptionPayFeeParam = true;
    //     let feeRatePerByte = 6;
    //     let sendAmount = new BigNumber(3000);

    //     let utxos: UTXO[] = [
    //         // normal UTXOs
    //         {
    //             tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
    //             tx_output_n: 1,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
    //             tx_output_n: 2,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
    //             tx_output_n: 3,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
    //             tx_output_n: 4,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
    //             tx_output_n: 5,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
    //             tx_output_n: 6,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
    //             tx_output_n: 7,
    //             value: new BigNumber(1000)
    //         },
    //         {
    //             tx_hash: "228a956320c18970c71e44ba1185b2a0e810127be0328b8e3668bd4691a069e5",
    //             tx_output_n: 8,
    //             value: new BigNumber(1000)
    //         },
    //         // inscription UTXOs
    //         // real
    //         {
    //             tx_hash: "fecd11d6da5404af3574db4d4fd87aa2d4e2a4d4c3d7d6a767474eeea34e55f3",
    //             tx_output_n: 0,
    //             value: new BigNumber(5274)
    //         },

    //         {
    //             tx_hash: "dd1d3dfce672ccdeabf0b4d96de95045760e465ab359171132fb3dbff232ab09",
    //             tx_output_n: 0,  // offset != 0
    //             value: new BigNumber(1234)
    //         },
    //     ];



    //     const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //         utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);


    //     console.log("changeAmount: ", changeAmount);

    //     let actualTxIDKey = selectedUTXOs[0].tx_hash.concat(":");
    //     actualTxIDKey = actualTxIDKey.concat(selectedUTXOs[0].tx_output_n.toString());

    //     let actualInscriptionInfos = inscriptions[actualTxIDKey];
    //     let actualInscriptionID = actualInscriptionInfos[0].id;

    //     assert.equal(selectedUTXOs.length, 8);
    //     assert.equal(actualInscriptionID, sendInscriptionID);

    //     assert.equal(selectedUTXOs[1].value.toNumber(), 1000);
    //     assert.equal(selectedUTXOs[2].value.toNumber(), 1000);
    //     assert.equal(selectedUTXOs[3].value.toNumber(), 1000);
    //     assert.equal(selectedUTXOs[4].value.toNumber(), 1000);
    //     assert.equal(selectedUTXOs[5].value.toNumber(), 1000);
    //     assert.equal(selectedUTXOs[6].value.toNumber(), 1000);
    //     assert.equal(selectedUTXOs[7].value.toNumber(), 1000);
    //     // assert.equal(selectedUTXOs[5].value.toNumber(), 1000);
    //     assert.equal(fee.toNumber(), 4000);
    //     assert.equal(isUseInscriptionPayFee, false);
    //     assert.equal(valueOutInscription.toNumber(), 5274);
    //     assert.equal(changeAmount.eq(new BigNumber(7000).minus(fee).minus(sendAmount)), true);

    // });


    // it("send BTC - should return 1 selected UTXO - isUseInscriptionPayFeeParam = true", () => {
    //     let sendInscriptionID = "";
    //     let sendAmount = new BigNumber(24000);

    //     // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //     //   UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);

    //     const { txID, txHex, fee: feeRes } = createTx(buyerPrivateKey, UTXOs, inscriptions, sendInscriptionID, "bc1pgvzr6m0cxv488prlzxcr7myk22pfewzq0vtyryx7uvna9mgnh9hsecq0lx", sendAmount, 4, true);
    //     console.log(txID, txHex, feeRes);
    // });


    // for creating real tx

    // it("insciption offset = 0 : should return 2 selected UTXOs (insciption & medium UTXO) - isUseInscriptionPayFeeParam = false", () => {
    //   let sendInscriptionID = "759227f04721a0f3d097826fa7b66a34228dd2ed61e89a77d51a50d3cd7ab6dci0"; // 1311874707106021
    //   let isUseInscriptionPayFeeParam = false;
    //   let sendAmount = 0;

    //   const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //     UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
    //   console.log("selectedUTXOs ", selectedUTXOs);

    //   const { txID, txHex, fee: feeRes } = createTx(
    //     senderPrivateKey, UTXOs, inscriptions, sendInscriptionID, receiverAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
    //   console.log(txID, txHex, feeRes);
    // });

    // it("create insciption offset != 0 : tx contains 2 inputs (the first one is cardinal UTXO and the second is inscription UTXO", () => {
    //   let sendInscriptionID = "759227f04721a0f3d097826fa7b66a34228dd2ed61e89a77d51a50d3cd7ab6dci0"; // 1311874707106021
    //   let isUseInscriptionPayFeeParam = false;
    //   let sendAmount = 0;

    //   // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //   //   UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
    //   // console.log("selectedUTXOs ", selectedUTXOs);


    //   let selectedUTXOs: UTXO[] = [
    //     // cardinal
    //     {
    //       tx_hash: "d8c0ecee609df95a5413e98b9f178199127edb7136a9faa016bf8229d625aae3",
    //       // "sat_ranges": [
    //       //   [
    //       //   486840414824861,
    //       //   486840414826751
    //       //   ]
    //       //   ]
    //       block_height: 777754,
    //       tx_input_n: -1,
    //       tx_output_n: 1,
    //       value: 558
    //     },

    //     // inscription
    //     {
    //       tx_hash: "d8c0ecee609df95a5413e98b9f178199127edb7136a9faa016bf8229d625aae3",
    //       block_height: 777933,
    //       tx_input_n: -1,
    //       tx_output_n: 0,
    //       value: 5893
    //     },

    //   ];

    //   let valueOutIns = 5198;
    //   let changeAmount = 0;
    //   let fee = 1253;

    //   const { txID, txHex, fee: feeRes } = createTxWithSpecificUTXOs(
    //     senderPrivateKey, selectedUTXOs, sendInscriptionID, receiverAddress, sendAmount, valueOutIns, changeAmount, fee);
    //   console.log(txID, txHex, feeRes);
    // });

    it("send insciption offset != 0 : should use inscription to pay fee", async () => {
        let sendInscriptionID = "759227f04721a0f3d097826fa7b66a34228dd2ed61e89a77d51a50d3cd7ab6dci0"; // 1311874707106021
        let isUseInscriptionPayFeeParam = true;
        let sendAmount = 0;
        let receiverAddress = "bcrt1pj2t2szx6rqzcyv63t3xepgdnhuj2zd3kfggrqmd9qwlg3vsx37fq7lj7tn";

        let utxos: UTXO[] = [
            {
                tx_hash: "585fc4effe595f4c240ceafb7f5bb22430afe009c26730a7e30131e1928ce17f",
                tx_output_n: 0,
                value: new BigNumber(10000000)
            },
            {
                tx_hash: "585fc4effe595f4c240ceafb7f5bb22430afe009c26730a7e30131e1928ce17f",
                tx_output_n: 1,
                value: new BigNumber(50000)
            },
            {
                tx_hash: "585fc4effe595f4c240ceafb7f5bb22430afe009c26730a7e30131e1928ce17f",
                tx_output_n: 2,
                value: new BigNumber(80000)
            },
            {
                tx_hash: "fbdc92c0b3860d3282166dcab67f194ef35abe24fd8227792fb9098550e7b0a5",
                tx_output_n: 0,
                value: new BigNumber(10000000)
            },
            {
                tx_hash: "fbdc92c0b3860d3282166dcab67f194ef35abe24fd8227792fb9098550e7b0a5",
                tx_output_n: 1,
                value: new BigNumber(50000)
            },
            {
                tx_hash: "91f136ed61203cf84ba23d99eaab68ba4e06d346ead4ee7d0d91037326797f2f",
                tx_output_n: 0,
                value: new BigNumber(50000)
            },
            {
                tx_hash: "91f136ed61203cf84ba23d99eaab68ba4e06d346ead4ee7d0d91037326797f2f",
                tx_output_n: 1,
                value: new BigNumber(29230)
            },
            {
                tx_hash: "fbdc92c0b3860d3282166dcab67f194ef35abe24fd8227792fb9098550e7b0a5",
                tx_output_n: 3,
                value: new BigNumber(77849369)
            },
        ];
        setBTCNetwork(NetworkType.Regtest);

        // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
        //   UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
        // console.log("selectedUTXOs ", selectedUTXOs);

        const { txID, txHex, fee: feeRes } = createTxSendBTC({
            senderPrivateKey: buyerPrivateKey,
            utxos,
            inscriptions,
            paymentInfos: [
                // { address: receiverAddress, amount: new BigNumber(10000000) },
                { address: receiverAddress, amount: new BigNumber(50000) },
                // { address: receiverAddress, amount: new BigNumber(80000) }
            ],
            feeRatePerByte: 5,
            sequence: 5,
        });

        const finalTXID = await broadcastTx(txHex);
        console.log("finalTXID: ", finalTXID);
        console.log(txID, txHex, feeRes);
    });
});