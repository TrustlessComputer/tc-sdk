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
    createTxSendBTC_MintRunes,
} from "../";
import { ECPair, generateTaprootAddressFromPubKey, generateTaprootKeyPair, getKeyPairInfo, toXOnly } from "../bitcoin/wallet";
import { Psbt, address, opcodes, payments, script } from "bitcoinjs-lib";
import { Tapleaf, Taptree } from "bitcoinjs-lib/src/types";

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { ERROR_CODE } from "../constants/error";
import { witnessStackToScriptWitness } from "../tc/witness_stack_to_script_witness";

import { RuneId, Runestone, SpacedRune, Symbol } from "./lib";
import { U32, U64, U128 } from "big-varuint-js";

const createRune = ({
    runeIDBlockHeight,
    runeIDTxIndex,
    runeName,
}: {
    runeIDBlockHeight: bigint,
    runeIDTxIndex: bigint,
    runeName: string,
}) => {
    const spacedRune = SpacedRune.fromString(runeName);

    const runestone = new Runestone({
        edicts: [],
        pointer: new U32(0n),
        // etching: {
        //     rune: spacedRune.rune,
        //     // spacers: spacedRune.spacers,
        //     // premine: new U128(1000_000n),
        //     // symbol: Symbol.fromString("R"),
        //     // terms: {
        //     //     amount: new U128(1000n),
        //     //     cap: new U128(100n),
        //     // },
        // },
        mint: new RuneId(new U64(runeIDBlockHeight), new U32(runeIDTxIndex))
    });

    let buffer = runestone.enchiper();  // remove first 2-byte 
    buffer = buffer.slice(2)

    return { buffer, commitBuffer: spacedRune?.rune?.commitBuffer() };
}


const createRuneToEtch = ({
    runeName,
    symbol,
}: {
    runeName: string,
    symbol: string,
}) => {

    console.log("createRuneToEtch symbol: ", symbol, symbol.length);
    const spacedRune = SpacedRune.fromString(runeName);


    // 100000000
    // 10000

    const runestone = new Runestone({
        edicts: [],
        pointer: new U32(0n),
        etching: {
            rune: spacedRune.rune,
            spacers: spacedRune.spacers,
            premine: new U128(0n),
            symbol: Symbol.fromString(symbol),
            terms: {
                amount: new U128(10000n),  // amount per mint
                cap: new U128(10000n),  // number mints
            },
        },
        // mint: new RuneId(new U64(runeIDBlockHeight), new U32(runeIDTxIndex))
    });

    let buffer = runestone.enchiper();  // remove first 2-byte 
    // buffer = buffer.slice(2)

    return { buffer, commitBuffer: spacedRune?.rune?.commitBuffer() };
}

const getNumberHex = (n: number): string => {
    // Convert the number to a hexadecimal string
    const hex = n.toString(16);
    // Ensure it's at least 2 characters by padding with a leading zero
    return hex.padStart(2, '0');
}

const createEtchLockScript = (commitBuffer: Buffer, pubKeyXonly: Buffer): {
    // hashLockKeyPair: ECPairInterface,
    // hashScriptAsm: string,
    hashLockScript: Buffer,
    hashLockRedeem: Tapleaf,
    script_p2tr: payments.Payment,
} => {
    // example witness + text inscription
    // *commit buffer is required
    // const ordinalStacks = [
    //     pubKeyXonly,
    //     opcodes.OP_CHECKSIG,
    //     opcodes.OP_FALSE,
    //     opcodes.OP_IF,
    //     Buffer.from("ord", "utf8"),
    //     1,
    //     1,
    //     Buffer.concat([Buffer.from("text/plain;charset=utf-8", "utf8")]),
    //     1,
    //     2,
    //     opcodes.OP_0,
    //     1,
    //     13,
    //     commitBuffer,
    //     // opcodes.OP_0,
    //     // Buffer.concat([Buffer.from("Chainwave", "utf8")]),
    //     opcodes.OP_ENDIF,
    // ];


    const protocolID = "ord";
    const protocolIDHex = Buffer.from(protocolID, "utf-8").toString("hex");

    // const contentType = "text/plain;charset=utf-8";
    // const contentTypeHex = Buffer.from(contentType, "utf-8").toString("hex");
    const contentStrHex = commitBuffer.toString("hex");
    const lenHex = getNumberHex(commitBuffer.length);
    console.log("lenHex: ", lenHex);
    console.log("contentStrHex: ", contentStrHex);


    let hexStr = "20"; // 32 - len public key
    hexStr += pubKeyXonly.toString("hex");
    hexStr += "ac0063";  // OP_CHECKSIG OP_0 OP_IF

    hexStr += "03";  // len protocol
    hexStr += protocolIDHex;
    hexStr += "0102";
    // hexStr += "18";  // len content type
    // hexStr += contentTypeHex;
    hexStr += "00"; // op_0
    hexStr += "010d"  // 
    hexStr += lenHex;
    hexStr += contentStrHex;
    hexStr += "68"; // OP_ENDIF

    console.log("hexStr: ", hexStr);


    // const hexStr = "207022ae3ead9927479c920d24b29249e97ed905ad5865439f962ba765147ee038ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800367b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a227a626974222c22616d74223a2231227d68";
    const hashLockScript = Buffer.from(hexStr, "hex");

    const scriptTree = {
        output: hashLockScript,
    };

    const redeem = {
        output: hashLockScript,
        redeemVersion: 192,
    };

    const payment = payments.p2tr({
        internalPubkey: pubKeyXonly,
        network: tcBTCNetwork,
        scriptTree,
        redeem,
    });

    return {
        hashLockScript: hashLockScript,
        hashLockRedeem: redeem,
        script_p2tr: payment
    };
}

/**
* createInscribeTxEtchRunes creates commit and reveal tx to inscribe data on Bitcoin netword. 
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
const createInscribeTxEtchRunes = async ({
    senderPrivateKey,
    senderAddress,
    utxos,
    inscriptions,
    feeRatePerByte,
    runeName,
    symbol,
    receiverInsc,
    receiverRune,
    sequence = DefaultSequenceRBF,
    isSelectUTXOs = true,
}: {
    senderPrivateKey: Buffer,
    senderAddress: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
    runeName: string,
    symbol: string,
    receiverInsc: string,
    receiverRune: string,
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

    const rune = createRuneToEtch({ runeName, symbol });

    console.log("Rune commit buffer: ", rune.commitBuffer?.toString("hex"));
    console.log("Rune buffer: ", rune.buffer?.toString("hex"));

    const { hashLockRedeem, script_p2tr } = createEtchLockScript(rune.commitBuffer!, internalPubKey);
    const hashLockKeyPair = keyPair  // use the same key pair

    console.log(`createInscribeTxEtchRunes ${hashLockKeyPair}, ${hashLockRedeem}`)
    // const arr = decompile(script_p2tr.output!);
    // console.log(`createInscribeTx ${arr}`);

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
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats2 * 2) }],
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
        runeBuffer: rune.buffer,
        receiverInsc,
        receiverRune,
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
const createInscribeTxMintRunes = async ({
    senderPrivateKey,
    senderAddress,
    utxos,
    inscriptions,
    feeRatePerByte,
    runeIDBlockHeight,
    runeIDTxIndex,
    runeName,
    sequence = DefaultSequenceRBF,
    isSelectUTXOs = true,
}: {
    senderPrivateKey: Buffer,
    senderAddress: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    feeRatePerByte: number,
    runeIDBlockHeight: bigint,
    runeIDTxIndex: bigint,
    runeName: string,
    sequence?: number;
    isSelectUTXOs?: boolean,
}): Promise<{
    txHex: string,
    txID: string,
    totalFee: BigNumber,
    selectedUTXOs: UTXO[],
    changeAmount: BigNumber,
}> => {

    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });
    const { addressType, payment, keyPair, signer, sigHashTypeDefault } = keyPairInfo;
    const internalPubKey = toXOnly(keyPair.publicKey);

    // create lock script for commit tx
    const rune = createRune({ runeIDBlockHeight, runeIDTxIndex, runeName });
    console.log("Rune commit buffer: ", rune.commitBuffer?.toString("hex"));
    console.log("Rune buffer: ", rune.buffer?.toString("hex"));


    // the second output: OP_RETURN
    const runeScript = script.compile([
        opcodes.OP_RETURN,
        opcodes.OP_13,
        rune.buffer,
    ]);

    const { txHex, txID, fee, changeAmount, selectedUTXOs, tx } = createTxSendBTC_MintRunes({
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        // paymentInfos: [{ address: senderAddress || "", amount: new BigNumber(MinSats2) }],
        paymentInfos: [],
        paymentScripts: [{ amount: new BigNumber(0), script: runeScript }],
        feeRatePerByte,
        sequence,
        isSelectUTXOs
    });

    console.log("mintTxHex: ", txHex);
    console.log("mintTxID: ", txID);

    return {
        txHex,
        txID,
        totalFee: fee,
        selectedUTXOs: selectedUTXOs,
        changeAmount: changeAmount,
    };
};

const createRawRevealTx = ({
    commitTxID,
    hashLockKeyPair,
    hashLockRedeem,
    script_p2tr,
    revealTxFee,
    runeBuffer,
    receiverInsc,
    receiverRune,
    sequence = 0,
}: {
    commitTxID: string,
    hashLockKeyPair: ECPairInterface,
    hashLockRedeem: any,
    script_p2tr: payments.Payment,
    revealTxFee: number,
    runeBuffer: Buffer,
    receiverInsc: string,
    receiverRune: string,
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
        witnessUtxo: { value: revealTxFee + MinSats2 * 2, script: script_p2tr.output! },
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

    // the first output: runes receiver address
    psbt.addOutput({
        value: MinSats2,
        address: receiverInsc,
    });

    psbt.addOutput({
        value: MinSats2,
        address: receiverRune,
    });

    // the second output: OP_RETURN
    const runeScript = script.compile([
        opcodes.OP_RETURN,
        opcodes.OP_13,
        runeBuffer,
    ]);
    psbt.addOutput({
        script: runeScript,
        value: 0,
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
    createInscribeTxMintRunes,
    createInscribeTxEtchRunes,
};