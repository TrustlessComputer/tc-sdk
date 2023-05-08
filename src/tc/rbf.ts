import { BNZero, InputSize, MinSats, OutputSize } from "../bitcoin/constants";
import {
    BatchInscribeTxResp,
    Inscription,
    SDKError,
    TCTxDetail,
    TcClient,
    UTXO,
    createInscribeTx,
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

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { ERROR_CODE } from "../constants/error";
import { Network } from "../bitcoin/network";
import { getUTXOsFromBlockStream } from "./blockstream";
import { handleSignPsbtWithSpecificWallet } from "../bitcoin/xverse";
import { witnessStackToScriptWitness } from "./witness_stack_to_script_witness";

const replaceByFeeInscribeTx = async (
    {
        senderPrivateKey,
        utxos,
        inscriptions,
        revealTxID,
        feeRatePerByte,
        tcClient,
        tcAddress,
        btcAddress,

    }: {
        senderPrivateKey: Buffer,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        revealTxID: string,
        feeRatePerByte: number,
        tcClient: TcClient,
        tcAddress: string,
        btcAddress: string,
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

    // need to inscribe tx

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

    for (const vin of oldCommitVins) {
        oldCommitUTXOs.push({
            tx_hash: vin.txid,
            tx_output_n: vin.vout,
            value: BNZero,   // TODO: 2525
        });
    }


    const utxoFromBlockStream = await getUTXOsFromBlockStream(btcAddress);
    for (let i = 0; i < oldCommitUTXOs.length; i++) {
        const tmpUTXO = utxoFromBlockStream.find(utxo => {
            return utxo.tx_hash === oldCommitUTXOs[i].tx_hash && utxo.tx_output_n === oldCommitUTXOs[i].tx_output_n;
        });
        if (tmpUTXO === null || tmpUTXO === undefined) {
            throw new SDKError(ERROR_CODE.GET_UTXO_VALUE_ERR, oldCommitUTXOs[i].tx_hash + ":" + oldCommitUTXOs[i].tx_output_n);
        }

        oldCommitUTXOs[i].value = tmpUTXO?.value;
    }

    // get old fee rate, old fee of commit tx
    let totalCommitVin = BNZero;
    for (const vout of oldCommitUTXOs) {
        totalCommitVin = totalCommitVin.plus(new BigNumber(vout.value));
    }


    let totalCommitVOut = BNZero;
    for (const vout of oldCommitVouts) {
        totalCommitVOut = totalCommitVOut.plus(new BigNumber(vout.value));
    }

    const oldCommitFee = totalCommitVOut.minus(totalCommitVin);
    const oldCommitTxSize = estimateTxSize(oldCommitUTXOs.length, oldCommitVouts.length);
    const oldCommitFeeRate = oldCommitFee.toNumber() / oldCommitTxSize;

    console.log("oldCommitFee: ", oldCommitFee);
    console.log("oldCommitTxSize: ", oldCommitTxSize);
    console.log("oldCommitFeeRate: ", oldCommitFeeRate);


    // get old fee rate, old fee of reveal tx 
    const totalRevealVin = oldCommitVouts[0].value;
    const totalRevealVout = oldRevealTx.Vout[0].value;

    const oldRevealFee = totalRevealVin - totalRevealVout;
    const revealTxSize = oldRevealFee / oldCommitFeeRate;
    console.log("oldRevealFee: ", oldRevealFee);
    console.log("revealTxSize: ", revealTxSize);


    // estimate new fee with new fee rate
    if (feeRatePerByte < oldCommitFeeRate) {
        throw new SDKError(ERROR_CODE.INVALID_NEW_FEE_RBF, "Old fee: " + oldCommitFeeRate + " New fee: " + feeRatePerByte);
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


    return createInscribeTx({
        senderPrivateKey,
        utxos: utxosForRBFTx,
        inscriptions,
        tcTxIDs: needToRBFTCTxIDs,
        feeRatePerByte,
        tcClient,
    });



    // return {
    //     commitTxHex,
    //     commitTxID,
    //     revealTxHex,
    //     revealTxID,
    //     totalFee: new BigNumber(totalFee),
    //     selectedUTXOs: selectedUTXOs,
    //     newUTXOs: newUTXOs,
    // };



    // return null


};



export {
    replaceByFeeInscribeTx
};