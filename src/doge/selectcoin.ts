// import { BNZero, MinSats, InputSize, OutputSize } from "./constants";
// import { Inscription, UTXO, PaymentInfo, InscPaymentInfo } from "./types";
// import BigNumber from "bignumber.js";
// import SDKError, { ERROR_CODE } from "../constants/error";

// /**
// * selectUTXOs selects the most reasonable UTXOs to create the transaction. 
// * if sending inscription, the first selected UTXO is always the UTXO contain inscription.
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the sender
// * @param sendInscriptionInfos list of inscription IDs and receiver addresses 
// * @param sendAmount satoshi amount need to send 
// * @param feeRatePerByte fee rate per byte (in satoshi)
// * @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
// * @returns the list of selected UTXOs
// * @returns the actual flag using inscription coin to pay fee
// * @returns the value of inscription outputs, and the change amount (if any)
// * @returns the network fee
// */
// const selectUTXOs = (
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     sendInscriptionInfos: InscPaymentInfo[],
//     sendBTCInfos: PaymentInfo[],
//     feeRatePerByte: number,
// ): { selectedUTXOs: UTXO[], selectedInscUTXOs: UTXO[], changeAmount: BigNumber, fee: BigNumber } => {
//     let resultUTXOs: UTXO[] = [];
//     let normalUTXOs: UTXO[] = [];
//     let changeAmount = BNZero;
//     let totalInputAmount = BNZero;

//     // convert feeRate to interger
//     feeRatePerByte = Math.round(feeRatePerByte);
//     console.log("selectUTXOs utxos: ", { utxos: utxos, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte });

//     // estimate fee
//     const numIns = sendInscriptionInfos.length + 1;
//     const numOuts = sendInscriptionInfos.length + sendBTCInfos.length + 1;
//     const estFee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
//     console.log("selectUTXOs estFee: ", { estFee: estFee, numIns: numIns, numOuts: numOuts, feeRatePerByte: feeRatePerByte });


//     // filter normal UTXO and inscription UTXO to send
//     const { cardinalUTXOs, inscriptionUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
//     normalUTXOs = cardinalUTXOs;

//     // select inscription utxos
//     const selectedInscUTXOs: UTXO[] = [];
//     for (const info of sendInscriptionInfos) {
//         const res = selectInscriptionUTXO(inscriptionUTXOs, inscriptions, info.inscID);

//         // NOTE: don't use inscription to pay network fee
//         // // maxAmountInsTransfer = (inscriptionUTXO.value - inscriptionInfo.offset - 1) - MinSats;
//         // maxAmountInsTransfer = inscriptionUTXO.value.
//         //     minus(inscriptionInfo.offset).
//         //     minus(1).minus(MinSats);
//         // console.log("maxAmountInsTransfer: ", maxAmountInsTransfer.toNumber());


//         selectedInscUTXOs.push(res.inscriptionUTXO);
//     }
//     resultUTXOs.push(...selectedInscUTXOs);


//     // calculate total btc amount
//     let totalSendAmount = new BigNumber(0);
//     for (const info of sendBTCInfos) {
//         totalSendAmount = totalSendAmount.plus(info.amount);
//     }
//     let totalPaymentAmount = totalSendAmount.plus(estFee);
//     console.log("selectUTXOs totalPaymentAmount (include estimated fee): ", totalPaymentAmount);

//     let feeRes = estFee;

//     // select normal UTXOs
//     if (totalPaymentAmount.gt(BNZero)) {
//         const { selectedUTXOs, remainUTXOs, totalInputAmount: amt } = selectCardinalUTXOs(normalUTXOs, {}, totalPaymentAmount);
//         resultUTXOs.push(...selectedUTXOs);
//         totalInputAmount = amt;
//         console.log("selectedUTXOs: ", selectedUTXOs);
//         console.log("totalInputAmount: ", totalInputAmount.toNumber());


//         // re-estimate fee with exact number of inputs and outputs
//         feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, numOuts, feeRatePerByte));
//         console.log("feeRes: ", feeRes);

//         if (totalSendAmount.plus(feeRes).gt(totalInputAmount)) {
//             // need to select extra UTXOs
//             const { selectedUTXOs: extraUTXOs, totalInputAmount: extraAmt } = selectCardinalUTXOs(remainUTXOs, {}, totalSendAmount.plus(feeRes).minus(totalInputAmount));
//             resultUTXOs.push(...extraUTXOs);
//             console.log("extraUTXOs: ", extraUTXOs);

//             totalInputAmount = totalInputAmount.plus(extraAmt);
//         }
//     }



//     // calculate output amount
//     if (totalInputAmount.lt(totalSendAmount.plus(feeRes))) {
//         feeRes = totalInputAmount.minus(totalSendAmount);
//     }
//     changeAmount = totalInputAmount.minus(totalSendAmount).minus(feeRes);


//     return { selectedUTXOs: resultUTXOs, selectedInscUTXOs, changeAmount: changeAmount, fee: feeRes };
// };

// /**
// * estimateTxFee estimates the transaction fee
// * @param numIns number of inputs in the transaction
// * @param numOuts number of outputs in the transaction
// * @param feeRatePerByte fee rate per byte (in satoshi)
// * @returns returns the estimated transaction fee in satoshi
// */
// const estimateTxFee = (numIns: number, numOuts: number, feeRatePerByte: number): number => {
//     const fee = estimateTxSize(numIns, numOuts) * feeRatePerByte;
//     return fee;
// };

// /**
// * estimateTxSize estimates the transaction fee
// * @param numIns number of inputs in the transaction
// * @param numOuts number of outputs in the transaction
// * @returns returns the estimated transaction size in byte
// */
// const estimateTxSize = (numIns: number, numOuts: number): number => {
//     const size = (InputSize * numIns + OutputSize * numOuts);
//     return size;
// };

// /**
// * selectUTXOs selects the most reasonable UTXOs to create the transaction. 
// * if sending inscription, the first selected UTXO is always the UTXO contain inscription.
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the sender
// * @param sendInscriptionID id of inscription to send
// * @returns the ordinal UTXO
// * @returns the actual flag using inscription coin to pay fee
// * @returns the value of inscription outputs, and the change amount (if any)
// * @returns the network fee
// */
// const selectInscriptionUTXO = (
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     inscriptionID: string,
// ): { inscriptionUTXO: UTXO, inscriptionInfo: Inscription } => {
//     if (inscriptionID === "") {
//         throw new Error("InscriptionID must not be an empty string");
//     }

//     // filter normal UTXO and inscription UTXO to send
//     for (const utxo of utxos) {
//         // txIDKey = tx_hash:tx_output_n
//         let txIDKey = utxo.tx_hash.concat(":");
//         txIDKey = txIDKey.concat(utxo.tx_output_n.toString());

//         // try to get inscriptionInfos
//         const inscriptionInfos = inscriptions[txIDKey];
//         if (inscriptionInfos !== undefined && inscriptionInfos !== null && inscriptionInfos.length > 0) {
//             const inscription = inscriptionInfos.find(ins => ins.id === inscriptionID);
//             if (inscription !== undefined) {
//                 // don't support send tx with outcoin that includes more than one inscription
//                 if (inscriptionInfos.length > 1) {
//                     throw new SDKError(ERROR_CODE.NOT_SUPPORT_SEND);
//                 }
//                 return { inscriptionUTXO: utxo, inscriptionInfo: inscription };
//             }
//         }
//     }
//     throw new SDKError(ERROR_CODE.NOT_FOUND_INSCRIPTION);
// };

// /**
// * selectCardinalUTXOs selects the most reasonable UTXOs to create the transaction. 
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the sender
// * @param sendAmount satoshi amount need to send 
// * @returns the list of selected UTXOs
// * @returns the actual flag using inscription coin to pay fee
// * @returns the value of inscription outputs, and the change amount (if any)
// * @returns the network fee
// */
// const selectCardinalUTXOs = (
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     sendAmount: BigNumber,
// ): { selectedUTXOs: UTXO[], remainUTXOs: UTXO[], totalInputAmount: BigNumber } => {
//     const resultUTXOs: UTXO[] = [];
//     let remainUTXOs: UTXO[] = [];

//     // filter normal UTXO and inscription UTXO to send
//     const { cardinalUTXOs: normalUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);

//     let totalInputAmount = BNZero;
//     const cloneUTXOs = [...normalUTXOs];
//     const totalSendAmount = sendAmount;
//     if (totalSendAmount.gt(BNZero)) {
//         if (normalUTXOs.length === 0) {
//             throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
//         }
//         if (normalUTXOs[normalUTXOs.length - 1].value.gte(totalSendAmount)) {
//             // select the smallest utxo
//             resultUTXOs.push(normalUTXOs[normalUTXOs.length - 1]);
//             totalInputAmount = normalUTXOs[normalUTXOs.length - 1].value;
//             remainUTXOs = cloneUTXOs.splice(0, normalUTXOs.length - 1);
//         } else if (normalUTXOs[0].value.lt(totalSendAmount)) {
//             // select multiple UTXOs
//             for (let i = 0; i < normalUTXOs.length; i++) {
//                 const utxo = normalUTXOs[i];
//                 resultUTXOs.push(utxo);
//                 totalInputAmount = totalInputAmount.plus(utxo.value);
//                 if (totalInputAmount.gte(totalSendAmount)) {
//                     remainUTXOs = cloneUTXOs.splice(i + 1, normalUTXOs.length - i - 1);
//                     break;
//                 }
//             }
//             if (totalInputAmount.lt(totalSendAmount)) {
//                 throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
//             }
//         } else {
//             // select the nearest UTXO
//             let selectedUTXO = normalUTXOs[0];
//             let selectedIndex = 0;
//             for (let i = 1; i < normalUTXOs.length; i++) {
//                 if (normalUTXOs[i].value.lt(totalSendAmount)) {
//                     resultUTXOs.push(selectedUTXO);
//                     totalInputAmount = selectedUTXO.value;
//                     remainUTXOs = [...cloneUTXOs];
//                     remainUTXOs.splice(selectedIndex, 1);
//                     break;
//                 }

//                 selectedUTXO = normalUTXOs[i];
//                 selectedIndex = i;
//             }
//         }
//     }

//     return { selectedUTXOs: resultUTXOs, remainUTXOs, totalInputAmount };
// };

// /**
// * filterAndSortCardinalUTXOs filter cardinal utxos and inscription utxos.
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the sender
// * @returns the list of cardinal UTXOs which is sorted descending by value
// * @returns the list of inscription UTXOs
// * @returns total amount of cardinal UTXOs
// */
// const filterAndSortCardinalUTXOs = (
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
// ): { cardinalUTXOs: UTXO[], inscriptionUTXOs: UTXO[], totalCardinalAmount: BigNumber } => {
//     let cardinalUTXOs: UTXO[] = [];
//     const inscriptionUTXOs: UTXO[] = [];
//     let totalCardinalAmount = BNZero;

//     // filter normal UTXO and inscription UTXO to send
//     for (const utxo of utxos) {
//         // txIDKey = tx_hash:tx_output_n
//         let txIDKey = utxo.tx_hash.concat(":");
//         txIDKey = txIDKey.concat(utxo.tx_output_n.toString());

//         // try to get inscriptionInfos
//         const inscriptionInfos = inscriptions[txIDKey];

//         if (inscriptionInfos === undefined || inscriptionInfos === null || inscriptionInfos.length == 0) {
//             // normal UTXO
//             cardinalUTXOs.push(utxo);
//             totalCardinalAmount = totalCardinalAmount.plus(utxo.value);
//         } else {
//             inscriptionUTXOs.push(utxo);
//         }
//     }

//     cardinalUTXOs = cardinalUTXOs.sort(
//         (a: UTXO, b: UTXO): number => {
//             if (a.value.gt(b.value)) {
//                 return -1;
//             }
//             if (a.value.lt(b.value)) {
//                 return 1;
//             }
//             return 0;
//         }
//     );

//     return { cardinalUTXOs, inscriptionUTXOs, totalCardinalAmount };
// };

// export {
//     selectUTXOs,

// }
