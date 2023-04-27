import { BNZero, BlockStreamURL, DummyUTXOValue, MinSats } from "./constants";
import { BuyReqFullInfo, ICreateRawTxResp, ICreateTxResp, ICreateTxSplitInscriptionResp, ISignPSBTResp, Inscription, NeedPaymentUTXO, PaymentInfo, UTXO } from "./types";
import { ECPair, generateTaprootAddressFromPubKey, generateTaprootKeyPair, toXOnly, tweakSigner } from "./wallet";
import { Psbt, Transaction, payments } from "bitcoinjs-lib";
import SDKError, { ERROR_CODE } from "../constants/error";
import axios, { AxiosResponse } from "axios";
import { estimateTxFee, fromSat } from "./utils";
import { filterAndSortCardinalUTXOs, findExactValueUTXO, selectInscriptionUTXO, selectTheSmallestUTXO, selectUTXOs } from "./selectcoin";

import BigNumber from "bignumber.js";
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
    const { tweakedSigner } = generateTaprootKeyPair(senderPrivateKey);


    // sign inputs
    for (let i = 0; i < rawPsbt.txInputs.length; i++) {
        if (indicesToSign.findIndex(value => value === i) !== -1) {
            rawPsbt.signInput(i, tweakedSigner, [sigHashType]);
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

const createRawTxDummyUTXOForSale = ({
    pubKey,
    utxos,
    inscriptions,
    sellInscriptionID,
    feeRatePerByte,
}: {
    pubKey: Buffer,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sellInscriptionID: string,
    feeRatePerByte: number,
}): { dummyUTXO: any, splitPsbtB64: string, indicesToSign: number[], selectedUTXOs: UTXO[], newValueInscription: BigNumber } => {

    // select dummy UTXO 
    // if there is no dummy UTXO, we have to create raw tx to split dummy UTXO
    let dummyUTXORes: any;
    let selectedUTXOs: UTXO[] = [];
    let splitPsbtB64 = "";
    let indicesToSign = [];
    let newValueInscriptionRes = BNZero;

    try {
        // create dummy UTXO from cardinal UTXOs
        const res = createRawTxDummyUTXOFromCardinal(pubKey, utxos, inscriptions, feeRatePerByte);
        dummyUTXORes = res.dummyUTXO;
        selectedUTXOs = res.selectedUTXOs;
        splitPsbtB64 = res.splitPsbtB64;
        indicesToSign = res.indicesToSign;
    } catch (e) {
        // select inscription UTXO
        const { inscriptionUTXO, inscriptionInfo } = selectInscriptionUTXO(utxos, inscriptions, sellInscriptionID);

        // create dummy UTXO from inscription UTXO
        const { resRawTx, newValueInscription } = createRawTxSplitFundFromOrdinalUTXO({
            pubKey, inscriptionUTXO, inscriptionInfo, sendAmount: new BigNumber(DummyUTXOValue), feeRatePerByte
        });

        selectedUTXOs = resRawTx.selectedUTXOs;
        splitPsbtB64 = resRawTx.base64Psbt;
        indicesToSign = resRawTx.indicesToSign;
        newValueInscriptionRes = newValueInscription;

        // TODO: 0xkraken

        // newInscriptionUTXO = {
        //     tx_hash: txID,
        //     tx_output_n: 0,
        //     value: newValueInscription,
        // };
        // dummyUTXORes = {
        //     tx_hash: txID,
        //     tx_output_n: 1,
        //     value: new BigNumber(DummyUTXOValue),
        // };
    }

    return {
        dummyUTXO: dummyUTXORes,
        splitPsbtB64,
        indicesToSign,
        selectedUTXOs,
        newValueInscription: newValueInscriptionRes
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
const createTx = (
    senderPrivateKey: Buffer,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sendInscriptionID = "",
    receiverInsAddress: string,
    sendAmount: BigNumber,
    feeRatePerByte: number,
    isUseInscriptionPayFeeParam = true, // default is true
): ICreateTxResp => {
    // init key pair and tweakedSigner from senderPrivateKey
    const { keyPair } = generateTaprootKeyPair(senderPrivateKey);

    const { base64Psbt, fee, changeAmount, selectedUTXOs, indicesToSign } = createRawTx({
        pubKey: toXOnly(keyPair.publicKey),
        utxos,
        inscriptions,
        sendInscriptionID,
        receiverInsAddress,
        sendAmount,
        feeRatePerByte,
        isUseInscriptionPayFeeParam,
    });

    const { signedBase64PSBT, msgTx, msgTxID, msgTxHex } = signPSBT({
        senderPrivateKey,
        psbtB64: base64Psbt,
        indicesToSign,
        sigHashType: Transaction.SIGHASH_DEFAULT
    });

    return { txID: msgTxID, txHex: msgTxHex, fee, selectedUTXOs, changeAmount, tx: msgTx };
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
    pubKey,
    utxos,
    inscriptions,
    sendInscriptionID = "",
    receiverInsAddress,
    sendAmount,
    feeRatePerByte,
    isUseInscriptionPayFeeParam = true, // default is true
}: {
    pubKey: Buffer,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sendInscriptionID: string,
    receiverInsAddress: string,
    sendAmount: BigNumber,
    feeRatePerByte: number,
    isUseInscriptionPayFeeParam: boolean,
}): ICreateRawTxResp => {
    // validation
    if (sendAmount.gt(BNZero) && sendAmount.lt(MinSats)) {
        throw new SDKError(ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
    }
    // select UTXOs
    const { selectedUTXOs, valueOutInscription, changeAmount, fee } = selectUTXOs(utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
    let feeRes = fee;

    // init key pair and tweakedSigner from senderPrivateKey
    // const { keyPair, senderAddress, tweakedSigner, p2pktr } = generateTaprootKeyPair(senderPrivateKey);

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
    pubKey,
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
    pubKey: Buffer,
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

    const { address } = generateTaprootAddressFromPubKey(pubKey);

    const { base64Psbt, indicesToSign, selectedUTXOs, fee, changeAmount } = createRawTx({
        pubKey,
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
        address: address,
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
        utxos,
        inscriptions,
        paymentInfos,
        feeRatePerByte,
    }: {
        senderPrivateKey: Buffer,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        paymentInfos: PaymentInfo[],
        feeRatePerByte: number,
    }
): ICreateTxResp => {
    // validation
    let totalPaymentAmount = BNZero;

    for (const info of paymentInfos) {
        if (info.amount.gt(BNZero) && info.amount.lt(MinSats)) {
            throw new SDKError(ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
        }
        totalPaymentAmount = totalPaymentAmount.plus(info.amount);
    }

    // select UTXOs
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false);
    let feeRes = fee;

    // init key pair and tweakedSigner from senderPrivateKey
    const { keyPair, senderAddress, tweakedSigner, p2pktr } = generateTaprootKeyPair(senderPrivateKey);

    const psbt = new Psbt({ network: tcBTCNetwork });
    // add inputs

    for (const input of selectedUTXOs) {
        psbt.addInput({
            hash: input.tx_hash,
            index: input.tx_output_n,
            witnessUtxo: { value: input.value.toNumber(), script: p2pktr.output as Buffer },
            tapInternalKey: toXOnly(keyPair.publicKey),
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
        psbt.signInput(i, tweakedSigner);
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
    const { selectedUTXOs, changeAmount, fee } = selectUTXOs(utxos, inscriptions, "", totalPaymentAmount, feeRatePerByte, false);
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

const createTxSplitFundFromOrdinalUTXO = (
    senderPrivateKey: Buffer,
    inscriptionUTXO: UTXO,
    inscriptionInfo: Inscription,
    sendAmount: BigNumber,
    feeRatePerByte: number,
): ICreateTxSplitInscriptionResp => {
    const { keyPair } = generateTaprootKeyPair(senderPrivateKey);

    const { resRawTx, newValueInscription } = createRawTxSplitFundFromOrdinalUTXO({
        pubKey: toXOnly(keyPair.publicKey),
        inscriptionUTXO, inscriptionInfo,
        sendAmount,
        feeRatePerByte,
    });

    // sign tx
    const { signedBase64PSBT, msgTx, msgTxID, msgTxHex } = signPSBT({
        senderPrivateKey,
        psbtB64: resRawTx.base64Psbt,
        indicesToSign: resRawTx.indicesToSign,
        sigHashType: Transaction.SIGHASH_DEFAULT,
    });

    return { txID: msgTxID, txHex: msgTxHex, fee: resRawTx.fee, selectedUTXOs: resRawTx.selectedUTXOs, newValueInscription };
};

/**
* createRawTxSplitFundFromOrdinalUTXO creates the Bitcoin transaction (including sending inscriptions). 
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

const createRawTxSplitFundFromOrdinalUTXO = ({
    pubKey,
    inscriptionUTXO,
    inscriptionInfo,
    sendAmount,
    feeRatePerByte,
}: {
    pubKey: Buffer,
    inscriptionUTXO: UTXO,
    inscriptionInfo: Inscription,
    sendAmount: BigNumber,
    feeRatePerByte: number,
}): { resRawTx: ICreateRawTxResp, newValueInscription: BigNumber } => {
    // validation
    if (sendAmount.gt(BNZero) && sendAmount.lt(MinSats)) {
        throw new SDKError(ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
    }

    const { address: senderAddress, p2pktr } = generateTaprootAddressFromPubKey(pubKey);

    const maxAmountInsSpend = inscriptionUTXO.value.minus(inscriptionInfo.offset).minus(1).minus(MinSats);

    const fee = new BigNumber(estimateTxFee(1, 2, feeRatePerByte));

    const totalAmountSpend = sendAmount.plus(fee);
    if (totalAmountSpend.gt(maxAmountInsSpend)) {
        throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE);
    }

    const newValueInscription = inscriptionUTXO.value.minus(totalAmountSpend);

    const psbt = new Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt.addInput({
        hash: inscriptionUTXO.tx_hash,
        index: inscriptionUTXO.tx_output_n,
        witnessUtxo: { value: inscriptionUTXO.value.toNumber(), script: p2pktr.output as Buffer },
        tapInternalKey: pubKey,
    });

    // add outputs
    // add output inscription: must be at index 0
    psbt.addOutput({
        address: senderAddress,
        value: newValueInscription.toNumber(),
    });

    // add output send BTC
    psbt.addOutput({
        address: senderAddress,
        value: sendAmount.toNumber(),
    });

    const indicesToSign: number[] = [];
    for (let i = 0; i < psbt.txInputs.length; i++) {
        indicesToSign.push(i);
    }

    return {
        resRawTx: { base64Psbt: psbt.toBase64(), fee, changeAmount: BNZero, selectedUTXOs: [inscriptionUTXO], indicesToSign },
        newValueInscription: newValueInscription
    };
};

const selectDummyUTXO = (
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
): UTXO => {
    const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
    if (smallestUTXO.value.lte(DummyUTXOValue)) {
        return smallestUTXO;
    }
    throw new SDKError(ERROR_CODE.NOT_FOUND_DUMMY_UTXO);
};

const createDummyUTXOFromCardinal = (
    senderPrivateKey: Buffer,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
): { dummyUTXO: UTXO, splitTxID: string, selectedUTXOs: UTXO[], newUTXO: any, fee: BigNumber, txHex: string } => {

    // create dummy UTXO from cardinal UTXOs
    let dummyUTXO;
    let newUTXO = null;
    const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
    if (smallestUTXO.value.lte(DummyUTXOValue)) {
        dummyUTXO = smallestUTXO;
        return { dummyUTXO: dummyUTXO, splitTxID: "", selectedUTXOs: [], newUTXO: newUTXO, fee: BNZero, txHex: "" };
    } else {
        const { senderAddress } = generateTaprootKeyPair(senderPrivateKey);

        const { txID, txHex, fee, selectedUTXOs, changeAmount } = createTx(senderPrivateKey, utxos, inscriptions, "", senderAddress, new BigNumber(DummyUTXOValue), feeRatePerByte, false);

        // init dummy UTXO rely on the result of the split tx
        dummyUTXO = {
            tx_hash: txID,
            tx_output_n: 0,
            value: new BigNumber(DummyUTXOValue),
        };

        if (changeAmount.gt(BNZero)) {
            newUTXO = {
                tx_hash: txID,
                tx_output_n: 1,
                value: changeAmount,
            };
        }

        return { dummyUTXO: dummyUTXO, splitTxID: txID, selectedUTXOs, newUTXO: newUTXO, fee, txHex };
    }
};


const createRawTxDummyUTXOFromCardinal = (
    pubKey: Buffer,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
): { dummyUTXO: any, splitPsbtB64: string, indicesToSign: number[], changeAmount: BigNumber, selectedUTXOs: UTXO[], fee: BigNumber } => {

    // create dummy UTXO from cardinal UTXOs
    let dummyUTXO;
    const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
    if (smallestUTXO.value.lte(DummyUTXOValue)) {
        dummyUTXO = smallestUTXO;
        return { dummyUTXO: dummyUTXO, splitPsbtB64: "", indicesToSign: [], changeAmount: BNZero, selectedUTXOs: [], fee: BNZero };
    } else {
        const { address: senderAddress } = generateTaprootAddressFromPubKey(pubKey);

        const { base64Psbt, fee, changeAmount, selectedUTXOs, indicesToSign } = createRawTx({
            pubKey: pubKey,
            utxos: utxos,
            inscriptions: inscriptions,
            sendInscriptionID: "",
            receiverInsAddress: senderAddress,
            sendAmount: new BigNumber(DummyUTXOValue),
            feeRatePerByte,
            isUseInscriptionPayFeeParam: false,

        });



        // TODO: 0x2525

        // init dummy UTXO rely on the result of the split tx
        // dummyUTXO = {
        //     tx_hash: txID,
        //     tx_output_n: 0,
        //     value: new BigNumber(DummyUTXOValue),
        // };

        // if (changeAmount.gt(BNZero)) {
        //     newUTXO = {
        //         tx_hash: txID,
        //         tx_output_n: 1,
        //         value: changeAmount,
        //     };
        // }

        return { dummyUTXO: dummyUTXO, splitPsbtB64: base64Psbt, indicesToSign, selectedUTXOs, fee, changeAmount };
    }
};

const prepareUTXOsToBuyMultiInscriptions = ({
    privateKey,
    address,
    utxos,
    inscriptions,
    feeRatePerByte,
    buyReqFullInfos,
}: {
    privateKey: Buffer,
    address: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
    buyReqFullInfos: BuyReqFullInfo[],
}): { buyReqFullInfos: BuyReqFullInfo[], dummyUTXO: any, splitTxID: string, selectedUTXOs: UTXO[], newUTXO: any, fee: BigNumber, splitTxHex: string } => {
    let splitTxID = "";
    let splitTxHex = "";
    let newUTXO: any;
    let dummyUTXO: any;
    let selectedUTXOs: UTXO[] = [];
    let fee = BNZero;

    // filter to get cardinal utxos
    const { cardinalUTXOs, totalCardinalAmount } = filterAndSortCardinalUTXOs(utxos, inscriptions);

    // select dummy utxo
    let needCreateDummyUTXO = false;
    try {
        dummyUTXO = selectDummyUTXO(cardinalUTXOs, {});
    } catch (e) {
        console.log("Can not find dummy UTXO, need to create it.");
        needCreateDummyUTXO = true;
    }

    // find payment utxos for each buy info
    interface needPayment {
        buyInfoIndex: number,
        amount: BigNumber,
    }
    const needPaymentUTXOs: needPayment[] = [];

    for (let i = 0; i < buyReqFullInfos.length; i++) {
        const info = buyReqFullInfos[i];
        try {
            const { utxo } = findExactValueUTXO(cardinalUTXOs, info.price);
            buyReqFullInfos[i].paymentUTXO = utxo;
        } catch (e) {
            needPaymentUTXOs.push({ buyInfoIndex: i, amount: info.price });
        }
    }

    console.log("buyReqFullInfos: ", buyReqFullInfos);

    // create split tx to create enough payment uxtos (if needed)
    if (needPaymentUTXOs.length > 0 || needCreateDummyUTXO) {
        const paymentInfos: PaymentInfo[] = [];

        for (const info of needPaymentUTXOs) {
            paymentInfos.push({ address: address, amount: info.amount });
        }
        if (needCreateDummyUTXO) {
            paymentInfos.push({ address: address, amount: new BigNumber(DummyUTXOValue) });
        }

        const res = createTxSendBTC({ senderPrivateKey: privateKey, utxos: cardinalUTXOs, inscriptions: {}, paymentInfos, feeRatePerByte });
        splitTxID = res.txID;
        splitTxHex = res.txHex;
        selectedUTXOs = res.selectedUTXOs;
        fee = res.fee;


        for (let i = 0; i < needPaymentUTXOs.length; i++) {
            const info = needPaymentUTXOs[i];
            const buyInfoIndex = info.buyInfoIndex;
            if (buyReqFullInfos[buyInfoIndex].paymentUTXO != null) {
                throw new SDKError(ERROR_CODE.INVALID_CODE);
            }
            const newUTXO: UTXO = {
                tx_hash: splitTxID,
                tx_output_n: i,
                value: info.amount,
            };
            buyReqFullInfos[buyInfoIndex].paymentUTXO = newUTXO;
        }

        if (needCreateDummyUTXO) {
            dummyUTXO = {
                tx_hash: splitTxID,
                tx_output_n: needPaymentUTXOs.length,  // dummy utxo is the last (last - 1) output in the split tx
                value: new BigNumber(DummyUTXOValue),
            };
        }

        if (res.changeAmount.gt(BNZero)) {
            const indexChangeUTXO = needCreateDummyUTXO ? needPaymentUTXOs.length + 1 : needPaymentUTXOs.length;
            newUTXO = {
                tx_hash: splitTxID,
                tx_output_n: indexChangeUTXO,  // change utxo is the last output in the split tx
                value: res.changeAmount,
            };
        }

    }
    return { buyReqFullInfos, dummyUTXO, splitTxID, selectedUTXOs, newUTXO, fee, splitTxHex };
};


const createRawTxToPrepareUTXOsToBuyMultiInscs = ({
    pubKey,
    address,
    utxos,
    inscriptions,
    feeRatePerByte,
    buyReqFullInfos,
}: {
    pubKey: Buffer,
    address: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
    buyReqFullInfos: BuyReqFullInfo[],
}): {
    buyReqFullInfos: BuyReqFullInfo[],
    dummyUTXO: any,
    selectedUTXOs: UTXO[],
    fee: BigNumber,
    changeAmount: BigNumber,
    needPaymentUTXOs: NeedPaymentUTXO[],
    needCreateDummyUTXO: boolean,
    splitPsbtB64: string,
    indicesToSign: number[]
} => {

    let splitPsbtB64 = "";
    let dummyUTXO: any;
    let selectedUTXOs: UTXO[] = [];
    let fee = BNZero;
    let changeAmount = BNZero;
    let indicesToSign: number[] = [];

    // filter to get cardinal utxos
    const { cardinalUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);

    // select dummy utxo
    let needCreateDummyUTXO = false;
    try {
        dummyUTXO = selectDummyUTXO(cardinalUTXOs, {});
    } catch (e) {
        console.log("Can not find dummy UTXO, need to create it.");
        needCreateDummyUTXO = true;
    }

    // find payment utxos for each buy info
    const needPaymentUTXOs: NeedPaymentUTXO[] = [];

    for (let i = 0; i < buyReqFullInfos.length; i++) {
        const info = buyReqFullInfos[i];
        try {
            const { utxo } = findExactValueUTXO(cardinalUTXOs, info.price);
            buyReqFullInfos[i].paymentUTXO = utxo;
        } catch (e) {
            needPaymentUTXOs.push({ buyInfoIndex: i, amount: info.price });
        }
    }

    console.log("buyReqFullInfos: ", buyReqFullInfos);

    // create split tx to create enough payment uxtos (if needed)
    if (needPaymentUTXOs.length > 0 || needCreateDummyUTXO) {
        const paymentInfos: PaymentInfo[] = [];

        for (const info of needPaymentUTXOs) {
            paymentInfos.push({ address: address, amount: info.amount });
        }
        if (needCreateDummyUTXO) {
            paymentInfos.push({ address: address, amount: new BigNumber(DummyUTXOValue) });
        }

        const res = createRawTxSendBTC({ pubKey: pubKey, utxos: cardinalUTXOs, inscriptions: {}, paymentInfos, feeRatePerByte });

        selectedUTXOs = res.selectedUTXOs;
        fee = res.fee;
        splitPsbtB64 = res.base64Psbt;
        changeAmount = res.changeAmount;
        indicesToSign = res.indicesToSign;

    }
    return { buyReqFullInfos, dummyUTXO, needPaymentUTXOs, splitPsbtB64, selectedUTXOs, fee, changeAmount: changeAmount, needCreateDummyUTXO, indicesToSign };
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
    createRawTxDummyUTXOForSale,
    createTxSplitFundFromOrdinalUTXO,
    createRawTxSplitFundFromOrdinalUTXO,
    createDummyUTXOFromCardinal,
    createRawTxDummyUTXOFromCardinal,
    createTxSendBTC,
    createRawTxSendBTC,
    prepareUTXOsToBuyMultiInscriptions,
    createRawTxToPrepareUTXOsToBuyMultiInscs,
    signPSBT,
    signPSBT2,
};