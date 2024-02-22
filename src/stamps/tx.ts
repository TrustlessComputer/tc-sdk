import { BNZero, DefaultSequence, DefaultSequenceRBF, InputSize, MinSats, MinSats2, OutputSize } from "../bitcoin/constants";
import {
    ARC4Encrypt,
    BatchInscribeTxResp,
    ERROR_CODE,
    ICreateTxResp,
    IKeyPairInfo,
    Inscription,
    PaymentInfo,
    PaymentScript,
    SDKError,
    TCTxDetail,
    TcClient,
    UTXO,
    createRawTxSendBTC,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    estimateTxFee,
    fromSat,
    selectCardinalUTXOs,
    selectUTXOs,
    toSat,
    createRawTxSendBTCFromMultisig,
    ICreateRawTxResp,
} from "../";
import { ECPair, generateTaprootAddressFromPubKey, generateTaprootKeyPair, getKeyPairInfo, toXOnly } from "../bitcoin/wallet";

import BigNumber from "bignumber.js";

import * as CryptoJS from "crypto-js";
import { script } from "bitcoinjs-lib";


/**
* createTransferSRC20RawTx creates raw tx to transfer src20 (don't include signing)
* sender address is P2WSH
* @param senderPubKey buffer public key of the inscriber 
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the raw transaction
* @returns the total network fee
*/
const createTransferSRC20RawTx = async ({
    senderPubKey,
    senderAddress,
    utxos,
    inscriptions,
    feeRatePerByte,
    receiverAddress,
    data,
    sequence = DefaultSequenceRBF,
}: {
    senderPubKey: Buffer,
    senderAddress: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
    receiverAddress: string,
    data: string,
    sequence?: number;
}): Promise<ICreateRawTxResp> => {

    /* NOTE: 
    TX structure: 
        Input: cardinal utxos for network fee
        Output: 
            0: destination address
            1: multisig address : ScriptPubKeys : 1 encodedJsonData encodedJsonData burnPubkey 3 OP_CHECKMULTISIG
            2: additional multisig address for remain data (if then)
            3: change utxo
    */


    // const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    // const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;

    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    // const internalPubKey = toXOnly(senderPubKey);

    // estimate fee and select UTXOs
    const estTxFee = estimateTxFee(1, 4, feeRatePerByte);
    // TODO: adjust amount
    const totalBTC = 333 + 801 * 2 + estTxFee;

    const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, new BigNumber(totalBTC));

    // create multisig scripts for  tx
    const scripts = await createTransferSRC20Script({
        secretKey: selectedUTXOs[0].tx_hash,
        data: data,
    });

    // only btc
    const paymentInfos: PaymentInfo[] = [];
    paymentInfos.push({
        address: receiverAddress,
        amount: new BigNumber(333)

    });

    // multisigs
    const paymentScripts: PaymentScript[] = [];
    for (const m of scripts) {
        paymentScripts.push({
            script: m,
            amount: new BigNumber(801)
        });
    }

    const res: ICreateRawTxResp = createRawTxSendBTCFromMultisig({
        senderPublicKey: senderPubKey,
        senderAddress,
        utxos: selectedUTXOs,
        inscriptions: {},
        paymentInfos: paymentInfos,
        paymentScripts: paymentScripts,
        feeRatePerByte,
        sequence,
        isSelectUTXOs: false
    });

    console.log("createTransferSRC20Tx tx : ", { res });

    return res;
};


/**
* createTransferSRC20Tx creates commit and reveal tx to inscribe data on Bitcoin netword. 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
const createTransferSRC20Tx = async ({
    senderPrivateKey,
    senderAddress,
    utxos,
    inscriptions,
    feeRatePerByte,
    receiverAddress,
    data,
    sequence = DefaultSequenceRBF,
    isSelectUTXOs = true,
}: {
    senderPrivateKey: Buffer,
    senderAddress: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
    receiverAddress: string,
    data: string,
    sequence?: number;
    isSelectUTXOs?: boolean,
}): Promise<{
    txHex: string,
    txID: string,
    totalFee: BigNumber,
    selectedUTXOs: UTXO[],
    changeAmount: BigNumber
}> => {

    /* NOTE: 
    TX structure: 
        Input: cardinal utxos for network fee
        Output: 
            0: destination address
            1: multisig address : ScriptPubKeys : 1 encodedJsonData encodedJsonData burnPubkey 3 OP_CHECKMULTISIG
            2: additional multisig address for remain data (if then)
            3: change utxo
    */


    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;

    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly(keyPair.publicKey);

    // estimate fee and select UTXOs
    const estTxFee = estimateTxFee(1, 4, feeRatePerByte);
    // TODO: adjust amount
    const totalBTC = 333 + 801 * 2 + estTxFee;

    const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, new BigNumber(totalBTC));

    // create multisig scripts for  tx
    const scripts = await createTransferSRC20Script({
        secretKey: selectedUTXOs[0].tx_hash,
        data: data,
    });

    // only btc
    const paymentInfos: PaymentInfo[] = [];
    paymentInfos.push({
        address: receiverAddress,
        amount: new BigNumber(333)

    });

    // multisigs
    const paymentScripts: PaymentScript[] = [];
    for (const m of scripts) {
        paymentScripts.push({
            script: m,
            amount: new BigNumber(801)
        });
    }

    const { txHex, txID, fee, changeAmount, tx } = createTxSendBTC({
        senderPrivateKey,
        senderAddress,
        utxos: selectedUTXOs,
        inscriptions: {},
        paymentInfos: paymentInfos,
        paymentScripts: paymentScripts,
        feeRatePerByte,
        sequence,
        isSelectUTXOs: false
    });

    console.log("createTransferSRC20Tx tx : ", { txHex, txID, fee, changeAmount, tx });

    return {
        txHex, txID, totalFee: fee, changeAmount, selectedUTXOs
    };
};

// make sure length of multiple of 124 = 62 * 2 (31*2 * 2)
const addZeroTrail = (hexStr: string) => {
    const lenStr = hexStr.length;
    const r = lenStr % 124;

    console.log({ lenStr });

    let addStr = "";
    if (r > 0) {
        const numAdd = (Math.floor(lenStr / 124) + 1) * 124 - lenStr;
        addStr = addStr.padEnd(numAdd, "0");

        console.log({ numAdd, addStr })
    }
    return hexStr + addStr;

}


/**
* createTransferSRC20Script creates multisig for transfer src20.  
* @param secretKey tx ID of vin[0]
* @returns scripts
*/
const createTransferSRC20Script = ({
    secretKey,
    data,
}: {
    secretKey: string,
    data: string,
}): Buffer[] => {

    /*
        Script structure:
            2 bytes: length of decoded data in hex
            7374616d703a: `stamp:` in lowercase
            remain: SRC-20 JSON data
    */

    const str = "stamp:" + data;
    const len = str.length; //NOTE: len include `stamp:`
    const contentStrHex = Buffer.from(str, "utf-8").toString("hex");


    // const contentStrHex = Buffer.from(data, "utf-8").toString("hex");
    // get length of decode data in hex
    // let len = contentStrHex.length / 2;
    // len += 6 //NOTE: len include `stamp:`
    let lenHex = len.toString(16);
    console.log("lenHex: ", lenHex);
    if (lenHex.length === 2) {
        lenHex = "00" + lenHex;
    }

    const rawDataHex = lenHex + contentStrHex;
    // add zero trailing (if then)
    const rawDataHexWithTrail = addZeroTrail(rawDataHex);

    // arc4 encode rawDataHexWithTrail
    const cipherParams = ARC4Encrypt(secretKey, rawDataHexWithTrail);
    const cipherTextHex = cipherParams.toString(CryptoJS.format.Hex);
    console.log({ cipherTextHex, len: cipherTextHex.length });


    // split batch 31-byte (62 chars) into script pubkey, append the sign and nonce byte for each batch
    const pubkeyHex: string[] = [];

    for (let i = 0; i <= cipherTextHex.length - 62;) {
        const str = cipherTextHex.slice(i, i + 62);
        pubkeyHex.push(str);
        i = i + 62;
    }

    console.log({ pubkeyHex });

    const sign = "02";
    const nonce = "dd";

    let scripts: Buffer[] = [];
    for (let i = 0; i <= pubkeyHex.length - 2; i = i + 2) {
        const pubkeys = [
            sign + pubkeyHex[i] + nonce,  // 33 bytes
            sign + pubkeyHex[i + 1] + nonce,
            '020202020202020202020202020202020202020202020202020202020202020202',
        ]

        let script = "51"; // OP_PUSHNUM_1
        script = script + "21" + pubkeys[0]; // OP_PUSHBYTES_33 + pubkey[0]
        script = script + "21" + pubkeys[1]; // OP_PUSHBYTES_33 + pubkey[1]
        script = script + "21" + pubkeys[2]; // OP_PUSHBYTES_33 + pubkey[2]
        script = script + "53ae"; // OP_PUSHNUM_3 OP_CHECKMULTISIG

        const scriptBytes = Buffer.from(script, "hex");


        // const scriptAsm = `OP_PUSHNUM_1 OP_PUSHBYTES_33 ${pubkeys[0]} OP_PUSHBYTES_33 ${pubkeys[1]} OP_PUSHBYTES_33 ${pubkeys[2]} OP_PUSHNUM_3 OP_CHECKMULTISIG`;
        // console.log("InscribeOrd hashScriptAsm: ", scriptAsm);
        // const scriptBytes = script.fromASM(scriptAsm);

        scripts.push(scriptBytes!);
    }

    console.log({ scripts });

    return scripts;
}

export {
    createTransferSRC20Tx,
    createTransferSRC20Script,
    addZeroTrail,
    createTransferSRC20RawTx,
};