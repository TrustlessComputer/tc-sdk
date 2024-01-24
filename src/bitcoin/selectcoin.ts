import { BNZero, MinSats } from "./constants";
import { InscPaymentInfo, Inscription, PaymentInfo, UTXO } from "./types";
import SDKError, { ERROR_CODE } from "../constants/error";
import {
    estimateNumInOutputs,
    estimateNumInOutputsForBuyInscription,
    estimateTxFee
} from "./utils";

import BigNumber from "bignumber.js";
import { Psbt } from "bitcoinjs-lib";

/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction. 
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectUTXOs = (
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sendInscriptionID: string,
    sendAmount: BigNumber,
    feeRatePerByte: number,
    isUseInscriptionPayFee: boolean,
    isSelectUTXOs: boolean,
): { selectedUTXOs: UTXO[], isUseInscriptionPayFee: boolean, valueOutInscription: BigNumber, changeAmount: BigNumber, fee: BigNumber } => {
    let resultUTXOs: UTXO[] = [];
    let normalUTXOs: UTXO[] = [];
    let inscriptionUTXO: any = null;
    let inscriptionInfo: any = null;
    let valueOutInscription = BNZero;
    let changeAmount = BNZero;
    let maxAmountInsTransfer = BNZero;
    let totalInputAmount = BNZero;

    // convert feeRate to interger
    feeRatePerByte = Math.round(feeRatePerByte);
    console.log("selectUTXOs utxos: ", { utxos: utxos, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte, sendAmount: sendAmount, isUseInscriptionPayFeeParam: isUseInscriptionPayFee });

    // isSelectUTXOs is able is false only when sendInscriptionID is empty
    if (sendInscriptionID !== "") {
        isSelectUTXOs = true;
    }

    if (!isSelectUTXOs) {
        resultUTXOs = [...utxos];
        for (const utxo of utxos) {
            totalInputAmount = totalInputAmount.plus(utxo.value);
        }

    } else {
        // estimate fee
        const { numIns, numOuts } = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee);
        const estFee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
        console.log("selectUTXOs estFee: ", { estFee: estFee, numIns: numIns, numOuts: numOuts, feeRatePerByte: feeRatePerByte });

        // when BTC amount need to send is greater than 0, 
        // we should use normal BTC to pay fee
        if (isUseInscriptionPayFee && sendAmount.gt(BNZero)) {
            isUseInscriptionPayFee = false;
        }

        // filter normal UTXO and inscription UTXO to send
        const { cardinalUTXOs, inscriptionUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
        normalUTXOs = cardinalUTXOs;

        if (sendInscriptionID !== "") {
            const res = selectInscriptionUTXO(inscriptionUTXOs, inscriptions, sendInscriptionID);
            inscriptionUTXO = res.inscriptionUTXO;
            inscriptionInfo = res.inscriptionInfo;
            // maxAmountInsTransfer = (inscriptionUTXO.value - inscriptionInfo.offset - 1) - MinSats;
            maxAmountInsTransfer = inscriptionUTXO.value.
                minus(inscriptionInfo.offset).
                minus(1).minus(MinSats);

            console.log("maxAmountInsTransfer: ", maxAmountInsTransfer.toNumber());
        }

        if (sendInscriptionID !== "") {
            if (inscriptionUTXO === null || inscriptionInfo == null) {
                throw new SDKError(ERROR_CODE.NOT_FOUND_INSCRIPTION);
            }
            // if value is not enough to pay fee, MUST use normal UTXOs to pay fee
            if (isUseInscriptionPayFee && maxAmountInsTransfer.lt(estFee)) {
                isUseInscriptionPayFee = false;
            }

            // push inscription UTXO to create tx
            resultUTXOs.push(inscriptionUTXO);
        }

        // select normal UTXOs
        let totalSendAmount = sendAmount;
        if (!isUseInscriptionPayFee) {
            totalSendAmount = totalSendAmount.plus(estFee);
        }
        console.log("selectUTXOs totalSendAmount: ", totalSendAmount);


        if (totalSendAmount.gt(BNZero)) {
            const { selectedUTXOs, remainUTXOs, totalInputAmount: amt } = selectCardinalUTXOs(normalUTXOs, {}, totalSendAmount);
            resultUTXOs.push(...selectedUTXOs);
            totalInputAmount = amt;
            console.log("selectedUTXOs: ", selectedUTXOs);
            console.log("isUseInscriptionPayFee: ", isUseInscriptionPayFee);
            console.log("totalInputAmount: ", totalInputAmount.toNumber());

            if (!isUseInscriptionPayFee) {
                // re-estimate fee with exact number of inputs and outputs
                const { numOuts: reNumOuts } = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee);
                const feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, reNumOuts, feeRatePerByte));

                console.log("feeRes: ", feeRes);

                if (sendAmount.plus(feeRes).gt(totalInputAmount)) {
                    // need to select extra UTXOs
                    const { selectedUTXOs: extraUTXOs, totalInputAmount: extraAmt } = selectCardinalUTXOs(remainUTXOs, {}, sendAmount.plus(feeRes).minus(totalInputAmount));
                    resultUTXOs.push(...extraUTXOs);
                    console.log("extraUTXOs: ", extraUTXOs);

                    totalInputAmount = totalInputAmount.plus(extraAmt);
                }
            }
        }


    }

    // re-estimate fee with exact number of inputs and outputs
    const { numOuts: reNumOuts } = estimateNumInOutputs(sendInscriptionID, sendAmount, isUseInscriptionPayFee);
    let feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, reNumOuts, feeRatePerByte));

    // calculate output amount
    if (isUseInscriptionPayFee) {
        if (maxAmountInsTransfer.lt(feeRes)) {
            feeRes = maxAmountInsTransfer;
        }
        valueOutInscription = inscriptionUTXO.value.minus(feeRes);
        changeAmount = totalInputAmount.minus(sendAmount);
    } else {

        if (totalInputAmount.lt(sendAmount.plus(feeRes))) {
            feeRes = totalInputAmount.minus(sendAmount);
        }
        valueOutInscription = inscriptionUTXO?.value || BNZero;
        changeAmount = totalInputAmount.minus(sendAmount).minus(feeRes);
    }

    return { selectedUTXOs: resultUTXOs, isUseInscriptionPayFee: isUseInscriptionPayFee, valueOutInscription: valueOutInscription, changeAmount: changeAmount, fee: feeRes };
};

/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction. 
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionInfos list of inscription IDs and receiver addresses 
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectUTXOsV2 = (
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sendInscriptionInfos: InscPaymentInfo[],
    sendBTCInfos: PaymentInfo[],
    feeRatePerByte: number,
): { selectedUTXOs: UTXO[], selectedInscUTXOs: UTXO[], changeAmount: BigNumber, fee: BigNumber } => {
    let resultUTXOs: UTXO[] = [];
    let normalUTXOs: UTXO[] = [];
    let changeAmount = BNZero;
    let totalInputAmount = BNZero;

    // convert feeRate to interger
    feeRatePerByte = Math.round(feeRatePerByte);
    console.log("selectUTXOs utxos: ", { utxos: utxos, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte });

    // estimate fee
    const numIns = sendInscriptionInfos.length + 1;
    const numOuts = sendInscriptionInfos.length + sendBTCInfos.length + 1;
    const estFee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
    console.log("selectUTXOs estFee: ", { estFee: estFee, numIns: numIns, numOuts: numOuts, feeRatePerByte: feeRatePerByte });


    // filter normal UTXO and inscription UTXO to send
    const { cardinalUTXOs, inscriptionUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    normalUTXOs = cardinalUTXOs;

    // select inscription utxos
    const selectedInscUTXOs: UTXO[] = [];
    for (const info of sendInscriptionInfos) {
        const res = selectInscriptionUTXO(inscriptionUTXOs, inscriptions, info.inscID);

        // NOTE: don't use inscription to pay network fee
        // // maxAmountInsTransfer = (inscriptionUTXO.value - inscriptionInfo.offset - 1) - MinSats;
        // maxAmountInsTransfer = inscriptionUTXO.value.
        //     minus(inscriptionInfo.offset).
        //     minus(1).minus(MinSats);
        // console.log("maxAmountInsTransfer: ", maxAmountInsTransfer.toNumber());


        selectedInscUTXOs.push(res.inscriptionUTXO);
    }
    resultUTXOs.push(...selectedInscUTXOs);


    // calculate total btc amount
    let totalSendAmount = new BigNumber(0);
    for (const info of sendBTCInfos) {
        totalSendAmount = totalSendAmount.plus(info.amount);
    }
    let totalPaymentAmount = totalSendAmount.plus(estFee);
    console.log("selectUTXOs totalPaymentAmount (include estimated fee): ", totalPaymentAmount);

    let feeRes = estFee;

    // select normal UTXOs
    if (totalPaymentAmount.gt(BNZero)) {
        const { selectedUTXOs, remainUTXOs, totalInputAmount: amt } = selectCardinalUTXOs(normalUTXOs, {}, totalPaymentAmount);
        resultUTXOs.push(...selectedUTXOs);
        totalInputAmount = amt;
        console.log("selectedUTXOs: ", selectedUTXOs);
        console.log("totalInputAmount: ", totalInputAmount.toNumber());


        // re-estimate fee with exact number of inputs and outputs
        feeRes = new BigNumber(estimateTxFee(resultUTXOs.length, numOuts, feeRatePerByte));
        console.log("feeRes: ", feeRes);

        if (totalSendAmount.plus(feeRes).gt(totalInputAmount)) {
            // need to select extra UTXOs
            const { selectedUTXOs: extraUTXOs, totalInputAmount: extraAmt } = selectCardinalUTXOs(remainUTXOs, {}, totalSendAmount.plus(feeRes).minus(totalInputAmount));
            resultUTXOs.push(...extraUTXOs);
            console.log("extraUTXOs: ", extraUTXOs);

            totalInputAmount = totalInputAmount.plus(extraAmt);
        }
    }



    // calculate output amount
    if (totalInputAmount.lt(totalSendAmount.plus(feeRes))) {
        feeRes = totalInputAmount.minus(totalSendAmount);
    }
    changeAmount = totalInputAmount.minus(totalSendAmount).minus(feeRes);


    return { selectedUTXOs: resultUTXOs, selectedInscUTXOs, changeAmount: changeAmount, fee: feeRes };
};

/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction. 
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @returns the ordinal UTXO
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectInscriptionUTXO = (
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    inscriptionID: string,
): { inscriptionUTXO: UTXO, inscriptionInfo: Inscription } => {
    if (inscriptionID === "") {
        throw new SDKError(ERROR_CODE.INVALID_PARAMS, "InscriptionID must not be an empty string");
    }

    // filter normal UTXO and inscription UTXO to send
    for (const utxo of utxos) {
        // txIDKey = tx_hash:tx_output_n
        let txIDKey = utxo.tx_hash.concat(":");
        txIDKey = txIDKey.concat(utxo.tx_output_n.toString());

        // try to get inscriptionInfos
        const inscriptionInfos = inscriptions[txIDKey];
        if (inscriptionInfos !== undefined && inscriptionInfos !== null && inscriptionInfos.length > 0) {
            const inscription = inscriptionInfos.find(ins => ins.id === inscriptionID);
            if (inscription !== undefined) {
                // don't support send tx with outcoin that includes more than one inscription
                if (inscriptionInfos.length > 1) {
                    throw new SDKError(ERROR_CODE.NOT_SUPPORT_SEND);
                }
                return { inscriptionUTXO: utxo, inscriptionInfo: inscription };
            }
        }
    }
    throw new SDKError(ERROR_CODE.NOT_FOUND_INSCRIPTION);
};

/**
* selectCardinalUTXOs selects the most reasonable UTXOs to create the transaction. 
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendAmount satoshi amount need to send 
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectCardinalUTXOs = (
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sendAmount: BigNumber,
): { selectedUTXOs: UTXO[], remainUTXOs: UTXO[], totalInputAmount: BigNumber } => {
    const resultUTXOs: UTXO[] = [];
    let remainUTXOs: UTXO[] = [];

    // filter normal UTXO and inscription UTXO to send
    const { cardinalUTXOs: normalUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);

    let totalInputAmount = BNZero;
    const cloneUTXOs = [...normalUTXOs];
    const totalSendAmount = sendAmount;
    if (totalSendAmount.gt(BNZero)) {
        if (normalUTXOs.length === 0) {
            throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
        }
        if (normalUTXOs[normalUTXOs.length - 1].value.gte(totalSendAmount)) {
            // select the smallest utxo
            resultUTXOs.push(normalUTXOs[normalUTXOs.length - 1]);
            totalInputAmount = normalUTXOs[normalUTXOs.length - 1].value;
            remainUTXOs = cloneUTXOs.splice(0, normalUTXOs.length - 1);
        } else if (normalUTXOs[0].value.lt(totalSendAmount)) {
            // select multiple UTXOs
            for (let i = 0; i < normalUTXOs.length; i++) {
                const utxo = normalUTXOs[i];
                resultUTXOs.push(utxo);
                totalInputAmount = totalInputAmount.plus(utxo.value);
                if (totalInputAmount.gte(totalSendAmount)) {
                    remainUTXOs = cloneUTXOs.splice(i + 1, normalUTXOs.length - i - 1);
                    break;
                }
            }
            if (totalInputAmount.lt(totalSendAmount)) {
                throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
            }
        } else {
            // select the nearest UTXO
            let selectedUTXO = normalUTXOs[0];
            let selectedIndex = 0;
            for (let i = 1; i < normalUTXOs.length; i++) {
                if (normalUTXOs[i].value.lt(totalSendAmount)) {
                    resultUTXOs.push(selectedUTXO);
                    totalInputAmount = selectedUTXO.value;
                    remainUTXOs = [...cloneUTXOs];
                    remainUTXOs.splice(selectedIndex, 1);
                    break;
                }

                selectedUTXO = normalUTXOs[i];
                selectedIndex = i;
            }
        }
    }

    return { selectedUTXOs: resultUTXOs, remainUTXOs, totalInputAmount };
};

const selectUTXOsToCreateBuyTx = (
    params: {
        sellerSignedPsbt: Psbt,
        price: BigNumber,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        feeRate: number,
    }
): { selectedUTXOs: UTXO[] } => {

    const {
        sellerSignedPsbt,
        price,
        utxos,
        inscriptions,
        feeRate
    } = params;

    // estimate network fee
    const { numIns, numOuts } = estimateNumInOutputsForBuyInscription(3, 3, sellerSignedPsbt);
    const estTotalPaymentAmount = price.plus(new BigNumber(estimateTxFee(numIns, numOuts, feeRate)));

    const { selectedUTXOs, remainUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, estTotalPaymentAmount);
    let paymentUTXOs = selectedUTXOs;

    // re-estimate network fee
    const { numIns: finalNumIns, numOuts: finalNumOuts } = estimateNumInOutputsForBuyInscription(paymentUTXOs.length, 3, sellerSignedPsbt);
    const finalTotalPaymentAmount = price.plus(new BigNumber(estimateTxFee(finalNumIns, finalNumOuts, feeRate)));

    if (finalTotalPaymentAmount > totalInputAmount) {
        // need to select extra UTXOs
        const { selectedUTXOs: extraUTXOs } = selectCardinalUTXOs(remainUTXOs, {}, finalTotalPaymentAmount.minus(totalInputAmount));
        paymentUTXOs = paymentUTXOs.concat(extraUTXOs);
    }

    return { selectedUTXOs: paymentUTXOs };
};


/**
* selectTheSmallestUTXO selects the most reasonable UTXOs to create the transaction. 
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendAmount satoshi amount need to send 
* @param isSelectDummyUTXO need to select dummy UTXO or not
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
const selectTheSmallestUTXO = (
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
): UTXO => {
    const { cardinalUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    if (cardinalUTXOs.length === 0) {
        throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
    }
    return cardinalUTXOs[cardinalUTXOs.length - 1];
};

/**
* filterAndSortCardinalUTXOs filter cardinal utxos and inscription utxos.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @returns the list of cardinal UTXOs which is sorted descending by value
* @returns the list of inscription UTXOs
* @returns total amount of cardinal UTXOs
*/
const filterAndSortCardinalUTXOs = (
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
): { cardinalUTXOs: UTXO[], inscriptionUTXOs: UTXO[], totalCardinalAmount: BigNumber } => {
    let cardinalUTXOs: UTXO[] = [];
    const inscriptionUTXOs: UTXO[] = [];
    let totalCardinalAmount = BNZero;

    // filter normal UTXO and inscription UTXO to send
    for (const utxo of utxos) {
        // txIDKey = tx_hash:tx_output_n
        let txIDKey = utxo.tx_hash.concat(":");
        txIDKey = txIDKey.concat(utxo.tx_output_n.toString());

        // try to get inscriptionInfos
        const inscriptionInfos = inscriptions[txIDKey];

        if (inscriptionInfos === undefined || inscriptionInfos === null || inscriptionInfos.length == 0) {
            // normal UTXO
            cardinalUTXOs.push(utxo);
            totalCardinalAmount = totalCardinalAmount.plus(utxo.value);
        } else {
            inscriptionUTXOs.push(utxo);
        }
    }

    cardinalUTXOs = cardinalUTXOs.sort(
        (a: UTXO, b: UTXO): number => {
            if (a.value.gt(b.value)) {
                return -1;
            }
            if (a.value.lt(b.value)) {
                return 1;
            }
            return 0;
        }
    );

    return { cardinalUTXOs, inscriptionUTXOs, totalCardinalAmount };
};

/**
* findExactValueUTXO returns the cardinal utxos with exact value.
* @param cardinalUTXOs list of utxos (only non-inscription  utxos)
* @param value value of utxo 
* @returns the cardinal UTXO
*/
const findExactValueUTXO = (
    cardinalUTXOs: UTXO[],
    value: BigNumber,
): { utxo: UTXO } => {
    for (const utxo of cardinalUTXOs) {
        if (utxo.value.eq(value)) {
            return { utxo };
        }
    }

    throw new SDKError(ERROR_CODE.NOT_FOUND_UTXO, value.toString());
};

export {
    selectUTXOs,
    selectInscriptionUTXO,
    selectCardinalUTXOs,
    selectTheSmallestUTXO,
    selectUTXOsToCreateBuyTx,
    findExactValueUTXO,
    filterAndSortCardinalUTXOs,
    selectUTXOsV2,
};