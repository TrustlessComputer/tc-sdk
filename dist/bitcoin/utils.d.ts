import BigNumber from "bignumber.js";
import { Psbt } from "bitcoinjs-lib";
/**
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
declare const estimateTxFee: (numIns: number, numOuts: number, feeRatePerByte: number) => number;
/**
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction, only normal outputs
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
declare const estimateTxTransferSRC20Fee: (numIns: number, numOuts: number, feeRatePerByte: number) => number;
/**
* estimateTxSize estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @returns returns the estimated transaction size in byte
*/
declare const estimateTxSize: (numIns: number, numOuts: number) => number;
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
declare const estimateNumInOutputs: (inscriptionID: string, sendAmount: BigNumber, isUseInscriptionPayFee: boolean) => {
    numIns: number;
    numOuts: number;
};
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
declare const estimateNumInOutputsForBuyInscription: (estNumInputsFromBuyer: number, estNumOutputsFromBuyer: number, sellerSignedPsbt: Psbt) => {
    numIns: number;
    numOuts: number;
};
declare const fromSat: (sat: number) => number;
declare const toSat: (value: number) => number;
export { estimateTxFee, estimateTxSize, estimateNumInOutputs, estimateNumInOutputsForBuyInscription, fromSat, toSat, estimateTxTransferSRC20Fee, };
