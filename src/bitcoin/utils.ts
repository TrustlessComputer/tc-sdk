import { BNZero } from "./constants";
import BigNumber from "bignumber.js";
import { Psbt } from "bitcoinjs-lib";

/**
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
const estimateTxFee = (numIns: number, numOuts: number, feeRatePerByte: number): number => {
    const fee = (68 * numIns + 43 * numOuts) * feeRatePerByte;
    return fee;
};

/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters: 
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send 
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
const estimateNumInOutputs = (inscriptionID: string, sendAmount: BigNumber, isUseInscriptionPayFee: boolean): { numIns: number, numOuts: number } => {
    let numOuts = 0;
    let numIns = 0;
    if (inscriptionID !== "") {
        numOuts++;
        numIns++;
    }
    if (sendAmount.gt(BNZero)) {
        numOuts++;
    }

    if (sendAmount.gt(BNZero) || !isUseInscriptionPayFee) {
        numIns++;
        numOuts++; // for change BTC output
    }
    return { numIns, numOuts };
};

/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters: 
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send 
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
const estimateNumInOutputsForBuyInscription = (
    estNumInputsFromBuyer: number,
    estNumOutputsFromBuyer: number,
    sellerSignedPsbt: Psbt,
): { numIns: number, numOuts: number } => {
    const numIns = sellerSignedPsbt.txInputs.length + estNumInputsFromBuyer;
    const numOuts = sellerSignedPsbt.txOutputs.length + estNumOutputsFromBuyer;
    return { numIns, numOuts };
};

const fromSat = (sat: number): number => {
    return sat / 1e8;
};

export {
    estimateTxFee,
    estimateNumInOutputs,
    estimateNumInOutputsForBuyInscription,
    fromSat,
};