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
    addInputs,
} from "../";
import { ECPair, generateTaprootAddressFromPubKey, generateTaprootKeyPair, getKeyPairInfo, toXOnly } from "../bitcoin/wallet";
import {
    P2PKHAddress,
    PrivateKey,
    Script,
    SigHash,
    Transaction,
    TxIn,
    TxOut,
} from "bsv-wasm";
import { Psbt, address, opcodes, payments, script } from "bitcoinjs-lib";
import { Tapleaf, Taptree } from "bitcoinjs-lib/src/types";

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { ERROR_CODE } from "../constants/error";
import { Hash } from "crypto";
import { Network } from "../bitcoin/network";
import { handleSignPsbtWithSpecificWallet } from "../bitcoin/xverse";
import { hash256 } from "bitcoinjs-lib/src/crypto";
import { witnessStackToScriptWitness } from "../tc/witness_stack_to_script_witness";

import { getNumberHex, createRawRevealTx, getRevealVirtualSize } from "./inscribe";
import { chunkSlice } from "./inscribe_images";


const getMetaProtocolScript = (metaProtocol: string): string => {
    if (metaProtocol === "") {
        return "";
    }

    const metaProtocolHex = Buffer.from(metaProtocol, "utf-8").toString("hex");
    const lenMetaProtocolHex = getNumberHex({ n: metaProtocol.length });

    // tag meta protocol + len + metaprotocol
    return "0107" + lenMetaProtocolHex + metaProtocolHex;
}

const getParentInscriptionScript = (parentInscTxID: string, parentInscTxIndex: number): string => {
    if (parentInscTxID === "") {
        return "";
    }

    const txIDBytes = Buffer.from(parentInscTxID, "hex");
    const txIDBytesRev = txIDBytes.reverse();
    const txIDHex = txIDBytesRev.toString("hex");

    let txIndexHex = "";
    if (parentInscTxIndex > 0) {
        txIndexHex = getNumberHex({ n: parentInscTxIndex });
    } else {
        // omit
    }
    const lenParent = getNumberHex({ n: (txIDHex.length + txIndexHex.length) / 2 });

    // tag parent + len + parent id
    return "0103" + lenParent + txIDHex + txIndexHex;
}

const toLittleEndianHexStr = (n: number, byteLength: number): string => {
    const buffer = Buffer.alloc(byteLength); // Allocate a buffer of the desired byte length
    buffer.writeUIntLE(n, 0, byteLength); // Write the number in little-endian format
    return buffer.toString("hex");
}

const getContentScript = (data: Buffer): string => {
    if (data.length <= 75) {
        // use OP_PUSHBYTES
        const contentStrHex = data.toString("hex");
        const lenContentHex = getNumberHex({ n: data.length });

        console.log("getContentScript lenContentHex: ", lenContentHex, "contentStrHex: ", contentStrHex);

        const script = lenContentHex + contentStrHex;  // len + content
        return script;
    }

    // use OP_PUSHDATA2


    // content 
    const dataChunks = chunkSlice(0, data);
    console.log({ dataChunks });

    let script = "";
    for (const chunk of dataChunks) {
        const chunkLenHex = toLittleEndianHexStr(chunk.length, 2);
        const chunkHex = chunk.toString("hex");

        script = script + "4d" + chunkLenHex + chunkHex; // OP_PUSHDATA2

        console.log(`getContentScript push data ${chunkLenHex} - ${chunkHex}`);
    }

    return script;
}





const createLockScriptGeneral = ({
    internalPubKey,
    data,
    contentType,
    metaProtocol = "",
    parentInscTxID = "",
    parentInscTxIndex = 0,
}: {
    internalPubKey: Buffer,
    data: Buffer,
    contentType: string,
    metaProtocol?: string,
    parentInscTxID?: string,
    parentInscTxIndex?: number,
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

    const contentTypeHex = Buffer.from(contentType, "utf-8").toString("hex");
    const contentStrHex = data.toString("hex");

    const lenContentTypeHex = getNumberHex({ n: contentType.length });
    const lenContentHex = getNumberHex({ n: data.length });
    console.log("createLockScriptGeneral lenContentHex: ", lenContentHex);

    const metaProtocolScript = getMetaProtocolScript(metaProtocol);
    const parentInscScript = getParentInscriptionScript(parentInscTxID, parentInscTxIndex);
    console.log(`createLockScriptGeneral ${metaProtocolScript} ${parentInscScript}`);

    const contentScript = getContentScript(data);

    console.log(`createLockScriptGeneral content ${contentTypeHex} ${contentStrHex}`);
    console.log(`createLockScriptGeneral contentScript ${contentScript}`);


    let hexStr = "20"; // 32 - len public key
    hexStr += toXOnly(hashLockKeyPair.publicKey).toString("hex");
    hexStr += "ac0063";  // OP_CHECKSIG OP_0 OP_IF

    hexStr += "03";  // len protocol
    hexStr += protocolIDHex;

    hexStr += "0101";
    hexStr += lenContentTypeHex;  // len content type
    hexStr += contentTypeHex;  // content type
    hexStr += metaProtocolScript;  // meta protocol script (if any)
    hexStr += parentInscScript; // parent insc script (if any)

    hexStr += "00"; // OP_0

    hexStr += getContentScript(data);

    // if (data.length < 520) {

    // }


    // // content 
    // const dataChunks = chunkSlice(0, data);
    // console.log({ dataChunks });

    // for (const chunk of dataChunks) {
    //     hexStr += getNumberHex(chunk.length);
    //     hexStr += chunk.toString("hex")
    // }

    // hexStr += lenContentHex;  // len content
    // hexStr += contentStrHex; // content
    hexStr += "68"; // OP_ENDIF

    console.log("hexStr: ", hexStr);



    // const hexStr = "207022ae3ead9927479c920d24b29249e97ed905ad5865439f962ba765147ee038ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800367b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a227a626974222c22616d74223a2231227d68";
    const hashLockScript = Buffer.from(hexStr, "hex");

    console.log("hashLockScript: ", hashLockScript.toString("hex"));

    // const asm2 = script.toASM(hashLockScript);
    // console.log("asm2: ", asm2);

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

// make sure the sender of tx create parent insc must be same as the sender of tx create child inscs
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
const createInscribeTxGeneral = async ({
    senderPrivateKey,
    senderAddress,
    utxos,
    inscriptions,
    feeRatePerByte,
    data,
    contentType,
    sequence = DefaultSequenceRBF,
    isSelectUTXOs = true,
    metaProtocol = "",
    parentInscTxID = "",
    parentInscTxIndex = 0,
    parentUTXO = undefined,
}: {
    senderPrivateKey: Buffer,
    senderAddress: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
    data: Buffer,
    contentType: string,
    sequence?: number;
    isSelectUTXOs?: boolean,
    metaProtocol?: string,
    parentInscTxID?: string,
    parentInscTxIndex?: number,
    parentUTXO?: UTXO,
}): Promise<{
    commitTxHex: string,
    commitTxID: string,
    revealTxHex: string,
    revealTxID: string,
    totalFee: BigNumber,
    selectedUTXOs: UTXO[],
    newUTXOs: UTXO[],
}> => {

    // validate inputs
    if (parentInscTxID !== "") {
        if (!parentUTXO) {
            throw new Error(`Required parent UTXO with parent inscription id: ${parentInscTxID}:${parentInscTxIndex}`);
        }
    }

    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;

    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly(keyPair.publicKey);

    // create lock script for commit tx

    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = createLockScriptGeneral({
        internalPubKey,
        data,
        contentType,
        metaProtocol,
        parentInscTxID,
        parentInscTxIndex,
    });

    console.log(`createInscribeTx ${hashLockKeyPair}, ${hashLockRedeem}`)
    // const arr = decompile(script_p2tr.output!);
    // console.log(`createInscribeTx ${arr}`);

    // estimate fee and select UTXOs

    const estCommitTxFee = estimateTxFee(1, 2, feeRatePerByte);
    let revealVByte = getRevealVirtualSize(hashLockRedeem, script_p2tr, senderAddress, hashLockKeyPair);
    if (parentUTXO) {
        // extra fee
        revealVByte = revealVByte + 68 + 43; // add more one in, one out
    }
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

    let res: any;

    if (parentUTXO) {
        console.log("Create tx reveal with parent uxto");
        res = createRawRevealTxWithParentUTXO({
            commitTxID,
            hashLockKeyPair,
            hashLockRedeem,
            script_p2tr,
            revealTxFee: estRevealTxFee,
            receiverAddress: senderAddress,
            parentUTXO: parentUTXO,
            parentAddress: senderAddress,
            parentPrivateKey: senderPrivateKey,
            sequence: 0,
        });

    } else {
        // create and sign reveal tx
        res = createRawRevealTx({
            commitTxID,
            hashLockKeyPair,
            hashLockRedeem,
            script_p2tr,
            revealTxFee: estRevealTxFee,
            address: senderAddress,
            sequence: 0,
        });

    }

    const revealTxHex = res.revealTxHex;
    const revealTxID = res.revealTxID;

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

const createRawRevealTxWithParentUTXO = ({
    commitTxID,
    hashLockKeyPair,
    hashLockRedeem,
    script_p2tr,
    revealTxFee,
    receiverAddress,
    parentUTXO,
    parentPrivateKey,
    parentAddress,
    sequence = 0,
}: {
    commitTxID: string,
    hashLockKeyPair: ECPairInterface,
    hashLockRedeem: any,
    script_p2tr: payments.Payment,
    revealTxFee: number,
    receiverAddress: string,
    parentUTXO: UTXO,
    parentPrivateKey: Buffer,
    parentAddress: string,
    sequence?: number,
}): { revealTxHex: string, revealTxID: string } => {


    // get key info iof parent utxo to sign
    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: parentPrivateKey, address: parentAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;

    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness![script_p2tr.witness!.length - 1],
    };

    let psbt = new Psbt({ network: tcBTCNetwork });

    // the first input is parent utxos
    psbt = addInputs({
        psbt,
        addressType: addressType,
        inputs: [parentUTXO],
        payment: payment,
        sequence,
        keyPair: keyPair,
    })

    // add input to reveal
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee + MinSats2, script: script_p2tr.output! },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });

    // the first output: return to parent
    psbt.addOutput({
        value: parentUTXO.value.toNumber(),
        address: parentAddress,
    });

    // the second output: receiver child inscription
    psbt.addOutput({
        value: MinSats2,
        address: receiverAddress,
    });

    // const hash_lock_keypair = ECPair.fromWIF(hashLockPriKey);

    psbt.signInput(0, signer, [sigHashTypeDefault]);
    psbt.signInput(1, hashLockKeyPair);

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

    psbt.finalizeInput(0);
    psbt.finalizeInput(1, customFinalizer);
    const revealTX = psbt.extractTransaction();

    console.log("revealTX: ", revealTX);

    return { revealTxHex: revealTX.toHex(), revealTxID: revealTX.getId() };

};

export {
    createInscribeTxGeneral
}