import { BNZero, DefaultSequence, DefaultSequenceRBF, DummyUTXOValue, MinSats } from "./constants";
import { BTCAddressType, ECPair, generateP2WPKHKeyPair, generateP2WPKHKeyPairFromPubKey, generateTaprootAddressFromPubKey, generateTaprootKeyPair, getAddressType, getKeyPairInfo, toXOnly, tweakSigner } from "./wallet";
import { BlockStreamURL, Network } from "./network";
import { BuyReqFullInfo, ICreateRawTxResp, ICreateTxResp, ICreateTxSplitInscriptionResp, IKeyPairInfo, ISignPSBTResp, Inscription, NeedPaymentUTXO, PaymentInfo, UTXO } from "./types";
import { Psbt, Transaction, address, payments } from 'bitcoinjs-lib';
import SDKError, { ERROR_CODE } from "../constants/error";
import axios, { AxiosResponse } from "axios";
import { estimateTxFee, fromSat } from "./utils";
import { filterAndSortCardinalUTXOs, findExactValueUTXO, selectInscriptionUTXO, selectTheSmallestUTXO, selectUTXOs } from "./selectcoin";

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { handleSignPsbtWithSpecificWallet } from "./xverse";

/**
* createTx creates the Bitcoin transaction (including sending inscriptions). 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const signPSBT = (
    {
        keyPairInfo, psbtB64, indicesToSign, sigHashType = Transaction.SIGHASH_DEFAULT,
    }: {
        keyPairInfo: IKeyPairInfo,
        psbtB64: string,
        indicesToSign: number[],
        sigHashType?: number,
    }
): ISignPSBTResp => {

    // parse psbt string 
    const rawPsbt = Psbt.fromBase64(psbtB64);

    // sign inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            rawPsbt.signInput(i, keyPairInfo.signer, [sigHashType]);
        }
    }

    // finalize inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            rawPsbt.finalizeInput(i);
        }
    }

    // extract psbt to get msgTx
    const msgTx = rawPsbt.extractTransaction();

    return {
        signedBase64PSBT: rawPsbt.toBase64(),
        msgTx: msgTx,
        msgTxHex: msgTx.toHex(),
        msgTxID: msgTx.getId(),
    };
};

/**
* createTx creates the Bitcoin transaction (including sending inscriptions). 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const signPSBTFromP2WPKH = (
    {
        senderPrivateKey, psbtB64, indicesToSign, sigHashType = Transaction.SIGHASH_DEFAULT
    }: {
        senderPrivateKey: Buffer,
        psbtB64: string,
        indicesToSign: number[],
        sigHashType?: number,
    }
): ISignPSBTResp => {

    // parse psbt string 
    const rawPsbt = Psbt.fromBase64(psbtB64);

    // init key pair and tweakedSigner from senderPrivateKey
    const { keyPair } = generateP2WPKHKeyPair(senderPrivateKey);


    // sign inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            rawPsbt.signInput(i, keyPair, [sigHashType, Transaction.SIGHASH_ALL]);
        }
    }

    // finalize inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            rawPsbt.finalizeInput(i);
        }
    }

    // extract psbt to get msgTx
    const msgTx = rawPsbt.extractTransaction();

    return {
        signedBase64PSBT: rawPsbt.toBase64(),
        msgTx: msgTx,
        msgTxHex: msgTx.toHex(),
        msgTxID: msgTx.getId(),
    };
};

/**
* createTx creates the Bitcoin transaction (including sending inscriptions). 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const signPSBT2 = (
    {
        senderPrivateKey, psbtB64, indicesToSign, sigHashType = Transaction.SIGHASH_DEFAULT
    }: {
        senderPrivateKey: Buffer,
        psbtB64: string,
        indicesToSign: number[],
        sigHashType?: number,
    }
): string => {

    // parse psbt string 
    const rawPsbt = Psbt.fromBase64(psbtB64);

    // init key pair and tweakedSigner from senderPrivateKey
    const { tweakedSigner } = generateTaprootKeyPair(senderPrivateKey);


    // sign inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        // if (indicesToSign.findIndex(value => value === i) !== -1) {
        try {
            rawPsbt.signInput(i, tweakedSigner, [sigHashType]);
        } catch (e) {
            console.log("Sign index error: ", i, e);
        }
        // }
    }

    // finalize inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        // if (indicesToSign.findIndex(value => value === i) !== -1) {
        try {
            rawPsbt.finalizeInput(i);
        } catch (e) {
            console.log("Finalize index error: ", i, e);
        }

        // }
    }

    // extract psbt to get msgTx
    // const msgTx = rawPsbt.extractTransaction();

    console.log("hex psbt: ", rawPsbt.toHex());

    return rawPsbt.toBase64();
};

/**
* createTx creates the Bitcoin transaction (including sending inscriptions). 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
// const signMsgTx = (
//     {
//         senderPrivateKey, hexMsgTx, indicesToSign, sigHashType = Transaction.SIGHASH_DEFAULT
//     }: {
//         senderPrivateKey: Buffer,
//         hexMsgTx: string,
//         indicesToSign?: number[],
//         sigHashType?: number,
//     }
// ): ISignPSBTResp => {

//     // parse msgTx string 
//     const psbt = Psbt.fromHex(hexMsgTx);

//     for (const input of msgTx.ins) {
//         // TODO
//         psbt.addInput({
//             ...input
//         });
//     }

//     for (const output of msgTx.outs) {
//         // TODO
//         psbt.addOutput({
//             ...output
//         });
//     }

//     // init key pair and tweakedSigner from senderPrivateKey
//     const { tweakedSigner } = generateTaprootKeyPair(senderPrivateKey);


//     // sign inputs
//     for (let i = 0; i < msgTx.ins.length; i++) {
//         // if (indicesToSign.findIndex(value => value === i) !== -1) {
//         // msgTx.ins[i](i, tweakedSigner, [sigHashType]);
//         psbt.signInput(i, tweakedSigner);
//         // }
//     }

//     // finalize inputs
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         // if (indicesToSign.findIndex(value => value === i) !== -1) {
//         psbt.finalizeInput(i);
//         // }
//     }

//     // extract psbt to get msgTx
//     const finalMsgTx = psbt.extractTransaction();

//     return {
//         signedBase64PSBT: psbt.toBase64(),
//         msgTx: finalMsgTx,
//         msgTxHex: finalMsgTx.toHex(),
//         msgTxID: finalMsgTx.getId(),
//     };
// };

// const createRawTxDummyUTXOForSale = ({
//     pubKey,
//     utxos,
//     inscriptions,
//     sellInscriptionID,
//     feeRatePerByte,
// }: {
//     pubKey: Buffer,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     sellInscriptionID: string,
//     feeRatePerByte: number,
// }): { dummyUTXO: any, splitPsbtB64: string, indicesToSign: number[], selectedUTXOs: UTXO[], newValueInscription: BigNumber } => {

//     // select dummy UTXO 
//     // if there is no dummy UTXO, we have to create raw tx to split dummy UTXO
//     let dummyUTXORes: any;
//     let selectedUTXOs: UTXO[] = [];
//     let splitPsbtB64 = "";
//     let indicesToSign = [];
//     let newValueInscriptionRes = BNZero;

//     try {
//         // create dummy UTXO from cardinal UTXOs
//         const res = createRawTxDummyUTXOFromCardinal(pubKey, utxos, inscriptions, feeRatePerByte);
//         dummyUTXORes = res.dummyUTXO;
//         selectedUTXOs = res.selectedUTXOs;
//         splitPsbtB64 = res.splitPsbtB64;
//         indicesToSign = res.indicesToSign;
//     } catch (e) {
//         // select inscription UTXO
//         const { inscriptionUTXO, inscriptionInfo } = selectInscriptionUTXO(utxos, inscriptions, sellInscriptionID);

//         // create dummy UTXO from inscription UTXO
//         const { resRawTx, newValueInscription } = createRawTxSplitFundFromOrdinalUTXO({
//             pubKey, inscriptionUTXO, inscriptionInfo, sendAmount: new BigNumber(DummyUTXOValue), feeRatePerByte
//         });

//         selectedUTXOs = resRawTx.selectedUTXOs;
//         splitPsbtB64 = resRawTx.base64Psbt;
//         indicesToSign = resRawTx.indicesToSign;
//         newValueInscriptionRes = newValueInscription;

//         // TODO: 0xkraken

//         // newInscriptionUTXO = {
//         //     tx_hash: txID,
//         //     tx_output_n: 0,
//         //     value: newValueInscription,
//         // };
//         // dummyUTXORes = {
//         //     tx_hash: txID,
//         //     tx_output_n: 1,
//         //     value: new BigNumber(DummyUTXOValue),
//         // };
//     }

//     return {
//         dummyUTXO: dummyUTXORes,
//         splitPsbtB64,
//         indicesToSign,
//         selectedUTXOs,
//         newValueInscription: newValueInscriptionRes
//     };
// };


/**
* createTx creates the Bitcoin transaction (including sending inscriptions). 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTx = (
    {
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        sendInscriptionID = "",
        receiverInsAddress,
        sendAmount,
        feeRatePerByte,
        isUseInscriptionPayFeeParam = true, // default is true
        sequence = DefaultSequenceRBF,
    }: {
        senderPrivateKey: Buffer,
        senderAddress: string,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        sendInscriptionID: string,
        receiverInsAddress: string,
        sendAmount: BigNumber,
        feeRatePerByte: number,
        isUseInscriptionPayFeeParam?: boolean,
        sequence?: number,
    }
): ICreateTxResp => {
    // init key pair and tweakedSigner from senderPrivateKey
    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });

    const { base64Psbt, fee, changeAmount, selectedUTXOs, indicesToSign } = createRawTx({
        keyPairInfo,
        utxos,
        inscriptions,
        sendInscriptionID,
        receiverInsAddress,
        sendAmount,
        feeRatePerByte,
        isUseInscriptionPayFeeParam,
        sequence,
    });

    const { signedBase64PSBT, msgTx, msgTxID, msgTxHex } = signPSBT({
        keyPairInfo,
        psbtB64: base64Psbt,
        indicesToSign,
        sigHashType: keyPairInfo.sigHashTypeDefault,
    });

    return { txID: msgTxID, txHex: msgTxHex, fee, selectedUTXOs, changeAmount, tx: msgTx };
};


const addInputs = ({
    psbt,
    addressType,
    inputs,
    payment,
    sequence,
    keyPair,
}: {
    psbt: Psbt,
    addressType: number,
    inputs: UTXO[],
    payment: payments.Payment,
    sequence: number,
    keyPair: ECPairInterface,

}): Psbt => {
    for (const input of inputs) {
        const inputData: any = {
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: payment.output as Buffer },
            sequence,
        };

        if (addressType === BTCAddressType.P2TR) {
            inputData.tapInternalKey = toXOnly(keyPair.publicKey);
        }

        psbt.addInput(inputData);
    }

    return psbt;
};



/**
* createRawTx creates the raw Bitcoin transaction (including sending inscriptions), but don't sign tx. 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param pubKey buffer public key of the sender (It is the internal pubkey for Taproot address)
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createRawTx = ({
    keyPairInfo,
    utxos,
    inscriptions,
    sendInscriptionID = "",
    receiverInsAddress,
    sendAmount,
    feeRatePerByte,
    isUseInscriptionPayFeeParam = true, // default is true
    sequence = DefaultSequenceRBF,
}: {
    keyPairInfo: IKeyPairInfo,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sendInscriptionID: string,
    receiverInsAddress: string,
    sendAmount: BigNumber,
    feeRatePerByte: number,
    isUseInscriptionPayFeeParam: boolean,
    sequence?: number,
}): ICreateRawTxResp => {
    const { keyPair, payment, address: senderAddress, addressType } = keyPairInfo;

    // validation
    if (sendAmount.gt(BNZero) && sendAmount.lt(MinSats)) {
        throw new SDKError(ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
    }
    // select UTXOs
    const { selectedUTXOs, valueOutInscription, changeAmount, fee } = selectUTXOs(utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, true);
    let feeRes = fee;

    let psbt = new Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt = addInputs({ psbt, addressType, inputs: selectedUTXOs, payment, sequence, keyPair });

    // add outputs
    if (sendInscriptionID !== "") {
        // add output inscription
        psbt.addOutput({
            address: receiverInsAddress,
            value: valueOutInscription.toNumber(),
        });
    }
    // add output send BTC
    if (sendAmount.gt(BNZero)) {
        psbt.addOutput({
            address: receiverInsAddress,
            value: sendAmount.toNumber(),
        });
    }

    // add change output
    if (changeAmount.gt(BNZero)) {
        if (changeAmount.gte(MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmount.toNumber(),
            });
        } else {
            feeRes = feeRes.plus(changeAmount);
        }
    }

    const indicesToSign: number[] = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }

    return { base64Psbt: psbt.toBase64(), fee: feeRes, changeAmount, selectedUTXOs, indicesToSign };
};


/**
* createTxFromAnyWallet creates the raw Bitcoin transaction (including sending inscriptions), but don't sign tx. 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param pubKey buffer public key of the sender (It is the internal pubkey for Taproot address)
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTxFromAnyWallet = async ({
    keyPairInfo,
    utxos,
    inscriptions,
    sendInscriptionID = "",
    receiverInsAddress,
    sendAmount,
    feeRatePerByte,
    isUseInscriptionPayFeeParam = true, // default is true,
    walletType = Transaction.SIGHASH_DEFAULT,
    cancelFn,
}: {
    keyPairInfo: IKeyPairInfo,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sendInscriptionID: string,
    receiverInsAddress: string,
    sendAmount: BigNumber,
    feeRatePerByte: number,
    isUseInscriptionPayFeeParam: boolean,
    walletType?: number,
    cancelFn: () => void
}): Promise<ICreateTxResp> => {

    const { base64Psbt, indicesToSign, selectedUTXOs, fee, changeAmount } = createRawTx({
        keyPairInfo,
        utxos,
        inscriptions,
        sendInscriptionID,
        receiverInsAddress,
        sendAmount,
        feeRatePerByte,
        isUseInscriptionPayFeeParam,
    });

    // sign transaction 
    const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
        base64Psbt: base64Psbt,
        indicesToSign: indicesToSign,
        address: keyPairInfo.address,
        isGetMsgTx: true,
        walletType,
        cancelFn
    });


    return {
        tx: msgTx,
        txID: msgTxID,
        txHex: msgTxHex,
        fee,
        selectedUTXOs,
        changeAmount,
    };
};

/**
* createTx creates the Bitcoin transaction (including sending inscriptions). 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTxSendBTC = (
    {
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        paymentInfos,
        feeRatePerByte,
        sequence = DefaultSequenceRBF,
        isSelectUTXOs = true,
    }: {
        senderPrivateKey: Buffer,
        senderAddress: string,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        paymentInfos: PaymentInfo[],
        feeRatePerByte: number,
        sequence?: number,
        isSelectUTXOs?: boolean,
    }
): ICreateTxResp => {
    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;

    console.log("isSelectUTXOs createTxSendBTC: ", isSelectUTXOs);
    // validation
    let totalPaymentAmount = BNZero;

    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats)) {
            throw new SDKError(ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }

    // select UTXOs
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false, isSelectUTXOs);
    let feeRes = fee;

    let psbt = new Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt = addInputs({
        psbt,
        addressType: addressType,
        inputs: selectedUTXOs,
        payment: payment,
        sequence,
        keyPair: keyPair,
    });

    // add outputs send BTC
    for (const info of paymentInfos) {
        psbt.addOutput({
            address: info.address,
            value: info.amount.toNumber(),
        });
    }

    // add change output
    if (changeAmount.gt(BNZero)) {
        if (changeAmount.gte(MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmount.toNumber(),
            });
        } else {
            feeRes = feeRes.plus(changeAmount);
        }
    }

    // sign tx
    for (let i = 0; i < selectedUTXOs.length; i++) {
        psbt.signInput(i, signer, [sigHashTypeDefault]);
    }

    psbt.finalizeAllInputs();

    // get tx hex
    const tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    const txHex = tx.toHex();
    return { txID: tx.getId(), txHex, fee: feeRes, selectedUTXOs, changeAmount, tx };
};

/**
* createTx creates the Bitcoin transaction (including sending inscriptions). 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send 
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createRawTxSendBTC = (
    {
        pubKey,
        utxos,
        inscriptions,
        paymentInfos,
        feeRatePerByte,
    }: {
        pubKey: Buffer,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        paymentInfos: PaymentInfo[],
        feeRatePerByte: number,
    }
): ICreateRawTxResp => {
    // validation
    let totalPaymentAmount = BNZero;

    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats)) {
            throw new SDKError(ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }

    // select UTXOs
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false, true);
    let feeRes = fee;
    let changeAmountRes = changeAmount;

    // init key pair and tweakedSigner from senderPrivateKey
    const { address: senderAddress, p2pktr } = generateTaprootAddressFromPubKey(pubKey);

    const psbt = new Psbt({ network: tcBTCNetwork });
    // add inputs

    for (const input of selectedUTXOs) {
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output as Buffer },
            tapInternalKey: pubKey,
        });
    }

    // add outputs send BTC
    for (const info of paymentInfos) {
        psbt.addOutput({
            address: info.address,
            value: info.amount.toNumber(),
        });
    }

    // add change output
    if (changeAmountRes.gt(BNZero)) {
        if (changeAmountRes.gte(MinSats)) {
            psbt.addOutput({
                address: senderAddress,
                value: changeAmountRes.toNumber(),
            });
        } else {
            feeRes = feeRes.plus(changeAmountRes);
            changeAmountRes = BNZero;
        }
    }

    const indicesToSign: number[] = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }

    return { base64Psbt: psbt.toBase64(), fee: feeRes, changeAmount: changeAmountRes, selectedUTXOs, indicesToSign };
};

/**
* createTxWithSpecificUTXOs creates the Bitcoin transaction with specific UTXOs (including sending inscriptions). 
* NOTE: Currently, the function only supports sending from Taproot address. 
* This function is used for testing.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount amount need to send (in sat)
* @param valueOutInscription inscription output's value (in sat)
* @param changeAmount cardinal change amount (in sat)
* @param fee transaction fee (in sat) 
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
const createTxWithSpecificUTXOs = (
    senderPrivateKey: Buffer,
    utxos: UTXO[],
    sendInscriptionID = "",
    receiverInsAddress: string,
    sendAmount: BigNumber,
    valueOutInscription: BigNumber,
    changeAmount: BigNumber,
    fee: BigNumber,
): { txID: string, txHex: string, fee: BigNumber } => {

    const selectedUTXOs = utxos;

    // init key pair from senderPrivateKey
    const keypair = ECPair.fromPrivateKey(senderPrivateKey, { network: tcBTCNetwork });
    // Tweak the original keypair
    const tweakedSigner = tweakSigner(keypair, { network: tcBTCNetwork });

    // Generate an address from the tweaked public key
    const p2pktr = payments.p2tr({
        pubkey: toXOnly(tweakedSigner.publicKey),
        network: tcBTCNetwork,
    });
    const senderAddress = p2pktr.address ? p2pktr.address : "";
    if (senderAddress === "") {
        throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Can not get the sender address from the private key");
    }

    const psbt = new Psbt({ network: tcBTCNetwork });
    // add inputs

    for (const input of selectedUTXOs) {
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output as Buffer },
            tapInternalKey: toXOnly(keypair.publicKey),
        });
    }

    // add outputs
    if (sendInscriptionID !== "") {
        // add output inscription
        psbt.addOutput({
            address: receiverInsAddress,
            value: valueOutInscription.toNumber(),
        });
    }
    // add output send BTC
    if (sendAmount.gt(BNZero)) {
        psbt.addOutput({
            address: receiverInsAddress,
            value: sendAmount.toNumber(),
        });
    }

    // add change output
    if (changeAmount.gt(BNZero)) {
        psbt.addOutput({
            address: senderAddress,
            value: changeAmount.toNumber(),
        });
    }

    // sign tx
    for (let i = 0; i < selectedUTXOs.length; i++) {
        psbt.signInput(i, tweakedSigner);
    }
    psbt.finalizeAllInputs();

    // get tx hex
    const tx = psbt.extractTransaction();
    console.log("Transaction : ", tx);
    const txHex = tx.toHex();
    return { txID: tx.getId(), txHex, fee };
};


const broadcastTx = async (txHex: string): Promise<string> => {
    const blockstream = new axios.Axios({
        baseURL: BlockStreamURL
    });
    const response: AxiosResponse = await blockstream.post("/tx", txHex);
    const { status, data } = response;
    if (status !== 200) {
        throw new SDKError(ERROR_CODE.ERR_BROADCAST_TX, data);
    }
    return response.data;
};

export {
    selectUTXOs,
    createTx,
    createRawTx,
    createTxFromAnyWallet,
    broadcastTx,
    createTxWithSpecificUTXOs,
    createTxSendBTC,
    createRawTxSendBTC,
    signPSBT,
    signPSBT2,
};