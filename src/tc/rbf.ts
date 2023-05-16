import { BNZero, DefaultSequence, DefaultSequenceRBF, InputSize, MinSats, OutputSize } from "../bitcoin/constants";
import {
    BTCVinVout,
    BatchInscribeTxResp,
    GetPendingInscribeTxsResp,
    Inscription,
    SDKError,
    TCTxDetail,
    TcClient,
    UTXO,
    Vin,
    Vout,
    createRawTxSendBTC,
    createTxSendBTC,
    estimateTxFee,
    estimateTxSize,
    selectCardinalUTXOs,
    toSat,
} from "..";
import { ECPair, generateTaprootAddressFromPubKey, generateTaprootKeyPair, toXOnly } from "../bitcoin/wallet";
import { Psbt, address, payments, script } from "bitcoinjs-lib";
import { Tapleaf, Taptree } from "bitcoinjs-lib/src/types";
import { getOutputCoinValue, getUTXOsFromBlockStream } from "./blockstream";

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { ERROR_CODE } from "../constants/error";
import { Network } from "../bitcoin/network";
import {
    createInscribeTx
} from "./inscribe";
import { handleSignPsbtWithSpecificWallet } from "../bitcoin/xverse";
import { witnessStackToScriptWitness } from "./witness_stack_to_script_witness";

const extractOldTxInfo = async (
    {
        revealTxID,
        tcClient,
        tcAddress,
        btcAddress,
    }: {
        revealTxID: string,
        tcClient: TcClient,
        tcAddress: string,
        btcAddress: string,
    }
): Promise<{
    oldCommitVouts: Vout[],
    oldCommitVins: Vin[],
    oldCommitUTXOs: UTXO[],
    oldCommitFee: BigNumber,
    oldCommitTxSize: number,
    oldCommitFeeRate: number,
    needToRBFTCTxIDs: string[],
    needToRBFTxInfos: GetPendingInscribeTxsResp[],
    totalCommitVin: BigNumber,
    totalCommitVOut: BigNumber,
    oldRevealTx: BTCVinVout,
    isRBFable: boolean,
    revealTxSize: number,
    minSat: number,
}> => {

    const txs = await tcClient.getPendingInscribeTxsDetail(tcAddress);

    const needToRBFTxInfos = txs.filter((tx) => {
        return tx.Reveal.BTCHash === revealTxID;
    });

    if (needToRBFTxInfos.length == 0) {
        throw new SDKError(ERROR_CODE.NOT_FOUND_TX_TO_RBF, revealTxID);
    }

    const needToRBFTCTxIDs = [];
    for (const tx of needToRBFTxInfos) {
        needToRBFTCTxIDs.push(tx.TCHash);
    }
    if (needToRBFTxInfos.length == 0) {
        throw new SDKError(ERROR_CODE.NOT_FOUND_TX_TO_RBF, revealTxID);
    }
    // parse vin from old tx info
    const oldCommitUTXOs: UTXO[] = [];
    const oldCommitTx = needToRBFTxInfos[0].Commit;
    const oldRevealTx = needToRBFTxInfos[0].Reveal;
    if (oldCommitTx === null || oldCommitTx === undefined) {
        throw new SDKError(ERROR_CODE.COMMIT_TX_EMPTY, revealTxID);
    }
    if (oldRevealTx === null || oldRevealTx === undefined) {
        throw new SDKError(ERROR_CODE.REVEAL_TX_EMPTY, revealTxID);
    }

    const oldCommitVins = oldCommitTx.Vin;
    const oldCommitVouts = oldCommitTx.Vout;
    if (oldCommitVins.length === 0) {
        throw new SDKError(ERROR_CODE.OLD_VIN_EMPTY, revealTxID);
    }

    let isRBFable = true;
    for (const vin of oldCommitVins) {
        oldCommitUTXOs.push({
            tx_hash: vin.txid,
            tx_output_n: vin.vout,
            value: BNZero,   // TODO: 2525
        });

        if (vin.Sequence === DefaultSequence) {
            isRBFable = false;
        }
    }

    console.log(
        "HHH  oldCommitUTXOs: ", oldCommitUTXOs
    );


    // const utxoFromBlockStream = await getUTXOsFromBlockStream(btcAddress);
    for (let i = 0; i < oldCommitUTXOs.length; i++) {
        const utxoValue = await getOutputCoinValue(oldCommitUTXOs[i].tx_hash, oldCommitUTXOs[i].tx_output_n);
        oldCommitUTXOs[i].value = utxoValue;
    }

    // get old fee rate, old fee of commit tx
    let totalCommitVin = BNZero;
    for (const vout of oldCommitUTXOs) {
        totalCommitVin = totalCommitVin.plus(new BigNumber(vout.value));
    }


    let totalCommitVOut = BNZero;
    for (const vout of oldCommitVouts) {
        totalCommitVOut = totalCommitVOut.plus(new BigNumber(toSat(vout.value)));
    }

    console.log("HHH oldCommitUTXOs: ", oldCommitUTXOs);
    console.log("HHH oldCommitVouts: ", oldCommitVouts);

    console.log("HHH totalCommitVin: ", totalCommitVin.toNumber());
    console.log("HHH totalCommitVOut: ", totalCommitVOut.toNumber());

    const oldCommitFee = totalCommitVin.minus(totalCommitVOut);
    const oldCommitTxSize = estimateTxSize(oldCommitUTXOs.length, oldCommitVouts.length);
    const oldCommitFeeRate = oldCommitFee.toNumber() / oldCommitTxSize;

    console.log("HHH oldCommitFee: ", oldCommitFee);
    console.log("HHH oldCommitTxSize: ", oldCommitTxSize);
    console.log("HHH oldCommitFeeRate: ", oldCommitFeeRate);

    // get old fee rate, old fee of reveal tx 
    const totalRevealVin = toSat(oldCommitVouts[0].value);
    const totalRevealVout = toSat(oldRevealTx.Vout[0].value);

    const oldRevealFee = totalRevealVin - totalRevealVout;
    const revealTxSize = oldRevealFee / oldCommitFeeRate;
    console.log("oldRevealFee: ", oldRevealFee);
    console.log("revealTxSize: ", revealTxSize);

    const totalOldFee = oldCommitFee.plus(new BigNumber(oldRevealFee));
    const newCommitFee = totalOldFee.plus(new BigNumber(1000)); // extra
    const minSat = Math.round(newCommitFee.toNumber() / oldCommitTxSize) + 1;


    return {
        oldCommitUTXOs,
        oldCommitVouts,
        oldCommitVins,
        oldCommitFee,
        oldCommitTxSize,
        oldCommitFeeRate,
        needToRBFTCTxIDs,
        needToRBFTxInfos,
        totalCommitVin,
        totalCommitVOut,
        oldRevealTx,
        revealTxSize,
        isRBFable,
        minSat,

    };
};

const replaceByFeeInscribeTx = async (
    {
        senderPrivateKey,
        utxos,
        inscriptions,
        revealTxID,
        feeRatePerByte,
        tcAddress,
        btcAddress,
        sequence = DefaultSequenceRBF,

    }: {
        senderPrivateKey: Buffer,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        revealTxID: string,
        feeRatePerByte: number,
        tcAddress: string,
        btcAddress: string,
        sequence?: number,
    }
): Promise<{
    commitTxHex: string,
    commitTxID: string,
    revealTxHex: string,
    revealTxID: string,
    totalFee: BigNumber,
    selectedUTXOs: UTXO[],
    newUTXOs: UTXO[],
}> => {

    const {
        oldCommitVouts,
        oldCommitUTXOs,
        oldCommitVins,
        oldCommitFee,
        oldCommitTxSize,
        oldCommitFeeRate,
        needToRBFTCTxIDs,
        needToRBFTxInfos,
        totalCommitVin,
        totalCommitVOut,
        isRBFable,
        oldRevealTx,
        minSat,
        revealTxSize,
    } = await extractOldTxInfo({
        revealTxID,
        tcClient,
        tcAddress,
        btcAddress,
    });

    if (!isRBFable) {
        throw new SDKError(ERROR_CODE.IS_NOT_RBFABLE, revealTxID);
    }

    console.log("HHH min sat: ", minSat);

    // estimate new fee with new fee rate
    if (feeRatePerByte < minSat) {
        throw new SDKError(ERROR_CODE.INVALID_NEW_FEE_RBF, "Require new fee: " + minSat + " New fee: " + feeRatePerByte);
    }

    const estCommitTxFee = estimateTxFee(oldCommitVins.length, oldCommitVouts.length, feeRatePerByte);
    const estRevealTxFee = revealTxSize * feeRatePerByte;
    const totalAmtNeedToInscribe = estCommitTxFee + estRevealTxFee;


    // select extra UTXO if needed
    let extraUTXOs: UTXO[] = [];
    if (new BigNumber(totalAmtNeedToInscribe).gt(totalCommitVin)) {
        const extraAmt = new BigNumber(totalAmtNeedToInscribe).minus(totalCommitVin);

        const { selectedUTXOs } = selectCardinalUTXOs(utxos, inscriptions, extraAmt);
        extraUTXOs = selectedUTXOs;
    }

    const utxosForRBFTx = [...oldCommitUTXOs, ...extraUTXOs];
    console.log("utxosForRBFTx: ", utxosForRBFTx);


    console.log("createInscribeTx: ", createInscribeTx);
    const resp = await createInscribeTx({
        senderPrivateKey,
        utxos: utxosForRBFTx,
        inscriptions,
        tcTxIDs: needToRBFTCTxIDs,
        feeRatePerByte,
        sequence,
        isSelectUTXOs: false,
    });
    return resp;
};


const isRBFable = async ({
    revealTxID,
    tcAddress,
    btcAddress,
}: {
    revealTxID: string,
    tcAddress: string,
    btcAddress: string,
}): Promise<{
    isRBFable: boolean,
    oldFeeRate: number,
    minSat: number,
}> => {

    const { isRBFable, oldCommitFeeRate, minSat } = await extractOldTxInfo({
        revealTxID,
        tcClient,
        tcAddress,
        btcAddress
    });

    return {
        isRBFable,
        oldFeeRate: oldCommitFeeRate,
        minSat,
    };
};


export {
    replaceByFeeInscribeTx,
    isRBFable,
};