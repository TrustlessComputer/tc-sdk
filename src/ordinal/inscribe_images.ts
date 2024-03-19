import { BNZero, DefaultSequence, DefaultSequenceRBF, InputSize, MinSats, MinSats2, OutputSize } from "../bitcoin/constants";
import {
    BatchInscribeTxResp,
    IKeyPairInfo,
    Inscription,
    SDKError,
    TCTxDetail,
    TcClient,
    UTXO,
    createRawTxSendBTC,
    createTxSendBTC,
    estimateTxFee,
    toSat,
} from "..";
import { ECPair, generateTaprootAddressFromPubKey, generateTaprootKeyPair, getKeyPairInfo, toXOnly } from "../bitcoin/wallet";
import { Psbt, address, opcodes, payments, script } from "bitcoinjs-lib";
import { Tapleaf, Taptree } from "bitcoinjs-lib/src/types";

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { ERROR_CODE } from "../constants/error";
import { Network } from "../bitcoin/network";
import { witnessStackToScriptWitness } from "../tc/witness_stack_to_script_witness";

/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword. 
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
const createInscribeImgTx = async ({
    senderPrivateKey,
    senderAddress,
    utxos,
    inscriptions,
    feeRatePerByte,
    data,
    contentType,
    sequence = DefaultSequenceRBF,
    isSelectUTXOs = true,
}: {
    senderPrivateKey: Buffer,
    senderAddress: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
    data: Buffer,
    contentType: string,   // image/png; image/jpeg
    sequence?: number;
    isSelectUTXOs?: boolean,
}): Promise<{
    commitTxHex: string,
    commitTxID: string,
    revealTxHex: string,
    revealTxID: string,
    totalFee: BigNumber,
    selectedUTXOs: UTXO[],
    newUTXOs: UTXO[],
}> => {

    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;

    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly(keyPair.publicKey);

    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = await createLockScriptForImageInsc({
        internalPubKey,
        data,
        contentType,
    });

    // estimate fee and select UTXOs

    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);

    const revealVByte = getRevealVirtualSize(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    // const totalAmount = new BigNumber(totalFee + MinSats); // MinSats for new output in the reveal tx

    // const { selectedUTXOs, totalInputAmount } = selectCardinalUTXOs(utxos, inscriptions, totalAmount);

    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError(ERROR_CODE.INVALID_TAPSCRIPT_ADDRESS, "");
    }

    const { txHex: commitTxHex, txID: commitTxID, fee: commitTxFee, changeAmount, selectedUTXOs, tx } = createTxSendBTC({
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats2) }],
        feeRatePerByte,
        sequence,
        isSelectUTXOs
    });

    const newUTXOs: UTXO[] = [];
    if (changeAmount.gt(BNZero)) {
        newUTXOs.push({
            tx_hash: commitTxID,
            tx_output_n: 1,
            value: changeAmount
        });
    }

    console.log("commitTX: ", tx);
    console.log("COMMITTX selectedUTXOs: ", selectedUTXOs);

    // create and sign reveal tx
    const { revealTxHex, revealTxID } = createRawRevealTx({
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
        address: senderAddress,
        sequence: 0,
    });

    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);
    console.log("commitTxID: ", commitTxID);
    console.log("revealTxID: ", revealTxID);

    // const { btcTxID } = await tcClient.submitInscribeTx([commitTxHex, revealTxHex]);
    // console.log("btcTxID: ", btcTxID);

    return {
        commitTxHex,
        commitTxID,
        revealTxHex,
        revealTxID,
        totalFee: new BigNumber(totalFee),
        selectedUTXOs: selectedUTXOs,
        newUTXOs: newUTXOs,
    };
};

const createRawRevealTx = ({
    commitTxID,
    hashLockKeyPair,
    hashLockRedeem,
    script_p2tr,
    revealTxFee,
    address,
    sequence = 0,
}: {
    commitTxID: string,
    hashLockKeyPair: ECPairInterface,
    hashLockRedeem: any,
    script_p2tr: payments.Payment,
    revealTxFee: number,
    address: string,
    sequence?: number,
}): { revealTxHex: string, revealTxID: string } => {

    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness![script_p2tr.witness!.length - 1],
    };

    const psbt = new Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee + MinSats2, script: script_p2tr.output! },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });

    // output has OP_RETURN zero value
    // const data = Buffer.from("https://trustless.computer", "utf-8");
    // const scriptEmbed = script.compile([
    //     opcodes.OP_RETURN,
    //     data,
    // ]);
    // psbt.addOutput({
    //     value: 0,
    //     script: scriptEmbed,
    // });

    psbt.addOutput({
        value: MinSats2,
        address: address,
    });

    // const hash_lock_keypair = ECPair.fromWIF(hashLockPriKey);
    psbt.signInput(0, hashLockKeyPair);

    // We have to construct our witness script in a custom finalizer
    const customFinalizer = (_inputIndex: number, input: any) => {
        const scriptSolution = [
            input.tapScriptSig[0].signature,
        ];
        const witness = scriptSolution
            .concat(tapLeafScript.script)
            .concat(tapLeafScript.controlBlock);

        return {
            finalScriptWitness: witnessStackToScriptWitness(witness)
        };
    };

    psbt.finalizeInput(0, customFinalizer);
    const revealTX = psbt.extractTransaction();

    console.log("revealTX: ", revealTX);

    return { revealTxHex: revealTX.toHex(), revealTxID: revealTX.getId() };

};

const ProtocolID = "bvmv1";

const remove0x = (data: string): string => {
    if (data.startsWith("0x")) data = data.slice(2);
    return data;
};

function generateInscribeContent(datas: string[]): string {
    // let content = Buffer.from(protocolID);
    // reimbursementAddr = remove0x(reimbursementAddr);
    // const addressBytes = Buffer.from(reimbursementAddr, "hex");
    // content = Buffer.concat([content, addressBytes]);

    let content = Buffer.from("");

    for (let data of datas) {
        data = remove0x(data);
        const len = data.length;

        const lenBuf = Buffer.allocUnsafe(4);
        lenBuf[0] = len >> 24;
        lenBuf[1] = len >> 16;
        lenBuf[2] = len >> 8;
        lenBuf[3] = len;

        content = Buffer.concat([content, lenBuf, Buffer.from(data, "hex")]);
    }

    const chunkSize = 520;
    let dataHex = "";
    for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.subarray(i, i + chunkSize);
        dataHex += chunk.toString("hex") + " ";
    }

    return dataHex.trim();
}

const toHex = (asciiStr: string) => {
    const arr1: string[] = [];
    for (let n = 0, l = asciiStr.length; n < l; n++) {
        const hex = Number(asciiStr.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join("");
};


const createLockScriptForImageInsc = ({
    internalPubKey,
    data,
    contentType,
}: {
    internalPubKey: Buffer,
    data: Buffer,
    contentType: string,
}): {
    hashLockKeyPair: ECPairInterface,
    hashScriptAsm: string,
    hashLockScript: Buffer,
    hashLockRedeem: Tapleaf,
    script_p2tr: payments.Payment,
} => {
    // Create a tap tree with two spend paths
    // One path should allow spending using secret
    // The other path should pay to another pubkey

    // Make random key pair for hash_lock script
    const hashLockKeyPair = ECPair.makeRandom({ network: Network });

    // TODO: comment
    // const hashLockPrivKey = hashLockKeyPair.toWIF();
    // console.log("hashLockPrivKey wif : ", hashLockPrivKey);


    // Note: for debug and test
    // const hashLockPrivKey = "";
    // const hashLockKeyPair = ECPair.fromWIF(hashLockPrivKey);
    // console.log("newKeyPair: ", hashLockKeyPair.privateKey);

    const protocolID = "ord";
    const protocolIDHex = Buffer.from(protocolID, "utf-8").toString("hex");
    // const protocolIDHex = toHex(protocolID);
    // console.log("protocolIDHex: ", protocolIDHex);

    // const contentType = "image/png";  // TODO: update to image
    const contentTypeHex = Buffer.from(contentType, "utf-8").toString("hex");
    const contentTypeLenHex = contentType.length.toString(16);
    // const contentTypeHex = toHex(contentType);
    // console.log("contentTypeHex0: ", contentTypeHex0);
    // console.log("contentTypeHex: ", contentTypeHex);

    // P    string`json:"p"`
    // Op   string`json:"op"`
    // Tick string`json:"tick"`
    // Amt  string`json:"amt"`

    const contentStrHex = data.toString("hex");
    // const contentStrHex = toHex(data);
    // console.log("contentStrHex: ", contentStrHex);

    // Construct script to pay to hash_lock_keypair if the correct preimage/secret is provided

    const hashScriptAsm = `${toXOnly(hashLockKeyPair.publicKey).toString("hex")} OP_CHECKSIG OP_0 OP_IF ${protocolIDHex} OP_1 ${contentTypeHex} OP_0 ${contentStrHex} OP_ENDIF`;
    console.log("InscribeOrd hashScriptAsm: ", hashScriptAsm);
    const hashLockScript = script.fromASM(hashScriptAsm);
    console.log({ hashLockScript });


    // const len = contentStrHex.length / 2;
    // const lenHex = len.toString(16);
    // console.log("lenHex: ", lenHex);


    // let hexStr = "20"; // 32 - len public key
    // hexStr += toXOnly(hashLockKeyPair.publicKey).toString("hex");
    // hexStr += "ac0063";  // OP_CHECKSIG OP_0 OP_IF
    // hexStr += "03";  // len protocol
    // hexStr += protocolIDHex;
    // hexStr += "0101";
    // hexStr += contentTypeLenHex;  // len content type = 9
    // hexStr += contentTypeHex;
    // hexStr += "00"; // op_0
    // hexStr += lenHex;
    // hexStr += contentStrHex;
    // hexStr += "68"; // OP_ENDIF

    // console.log("hexStr: ", hexStr);
    // const hashLockScript = Buffer.from(hexStr, "hex");

    console.log("hashLockScript: ", hashLockScript.toString("hex"));

    const asm2 = script.toASM(hashLockScript);
    console.log("script asm2 form : ", asm2);

    const hashLockRedeem = {
        output: hashLockScript,
        redeemVersion: 192,
    };

    const scriptTree: Taptree = hashLockRedeem;
    const script_p2tr = payments.p2tr({
        internalPubkey: internalPubKey,
        scriptTree,
        redeem: hashLockRedeem,
        network: Network
    });

    console.log("InscribeOrd script_p2tr: ", script_p2tr.address);

    return {
        hashLockKeyPair,
        hashScriptAsm: "",
        hashLockScript,
        hashLockRedeem,
        script_p2tr
    };
};

function getRevealVirtualSize(hash_lock_redeem: any, script_p2tr: any, p2pktr_addr: any, hash_lock_keypair: any) {
    const tapLeafScript = {
        leafVersion: hash_lock_redeem.redeemVersion,
        script: hash_lock_redeem.output,
        controlBlock: script_p2tr.witness![script_p2tr.witness!.length - 1]
    };

    const psbt = new Psbt({ network: tcBTCNetwork });
    psbt.addInput({
        hash: "00".repeat(32),
        index: 0,
        witnessUtxo: { value: MinSats2 * 2, script: script_p2tr.output! },
        tapLeafScript: [
            tapLeafScript
        ]
    });


    const decompliledPubKey = script.decompile(hash_lock_redeem.output);
    console.log({ script: hash_lock_redeem.output, decompliledPubKey });

    // output has OP_RETURN zero value
    // const data = Buffer.from("https://trustless.computer", "utf-8");
    // const scriptEmbed = script.compile([
    //     opcodes.OP_RETURN,
    //     data,
    // ]);
    // psbt.addOutput({
    //     value: 0,
    //     script: scriptEmbed,
    // });


    psbt.addOutput({
        value: MinSats2,
        address: p2pktr_addr,
    });
    psbt.signInput(0, hash_lock_keypair);

    // We have to construct our witness script in a custom finalizer

    const customFinalizer = (_inputIndex: number, input: any) => {
        const scriptSolution = [
            input.tapScriptSig[0].signature,
        ];
        const witness = scriptSolution
            .concat(tapLeafScript.script)
            .concat(tapLeafScript.controlBlock);

        return {
            finalScriptWitness: witnessStackToScriptWitness(witness)
        };
    };

    psbt.finalizeInput(0, customFinalizer);

    const tx = psbt.extractTransaction();
    return tx.virtualSize();
}


export {
    createInscribeImgTx
};