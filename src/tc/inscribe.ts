import { BNZero, DefaultSequence, DefaultSequenceRBF, InputSize, MinSats, OutputSize } from "../bitcoin/constants";
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
} from "../";
import { ECPair, generateTaprootAddressFromPubKey, generateTaprootKeyPair, getKeyPairInfo, toXOnly } from "../bitcoin/wallet";
import { Psbt, address, opcodes, payments, script } from "bitcoinjs-lib";
import { Tapleaf, Taptree } from "bitcoinjs-lib/src/types";

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { ERROR_CODE } from "../constants/error";
import { Hash } from "crypto";
import { Network } from "../bitcoin/network";
import { handleSignPsbtWithSpecificWallet } from "../bitcoin/xverse";
import { hash256 } from "bitcoinjs-lib/src/crypto";
import { witnessStackToScriptWitness } from "./witness_stack_to_script_witness";

const remove0x = (data: string): string => {
    if (data.startsWith("0x")) data = data.slice(2);
    return data;
};

const createRawRevealTx = ({
    commitTxID,
    hashLockKeyPair,
    hashLockRedeem,
    script_p2tr,
    revealTxFee,
    sequence = 0,
}: {
    commitTxID: string,
    hashLockKeyPair: ECPairInterface,
    hashLockRedeem: any,
    script_p2tr: payments.Payment,
    revealTxFee: number,
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
        witnessUtxo: { value: revealTxFee, script: script_p2tr.output! },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });

    // output has OP_RETURN zero value
    const data = Buffer.from("https://trustless.computer", "utf-8");
    const scriptEmbed = script.compile([
        opcodes.OP_RETURN,
        data,
    ]);
    psbt.addOutput({
        value: 0,
        script: scriptEmbed,
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
        witnessUtxo: { value: 1, script: script_p2tr.output! },
        tapLeafScript: [
            tapLeafScript
        ]
    });

    // output has OP_RETURN zero value
    const data = Buffer.from("https://trustless.computer", "utf-8");
    const scriptEmbed = script.compile([
        opcodes.OP_RETURN,
        data,
    ]);
    psbt.addOutput({
        value: 0,
        script: scriptEmbed,
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

function getCommitVirtualSize(p2pk_p2tr: any, keypair: any, script_addr: any, tweakedSigner: any, utxos: any, numberUTXO: any, revealVByte: any, fee_rate: any) {
    //select output
    let inputValue = BNZero;
    const useUTXO: UTXO[] = [];
    for (let i = 0; i < numberUTXO; i++) {
        inputValue = inputValue.plus(utxos[i].value);
        useUTXO.push(utxos[i]);
    }
    const p2pk_psbt = new Psbt({ network: tcBTCNetwork });
    p2pk_psbt.addOutput({
        address: script_addr,
        value: inputValue.minus(1).toNumber(),
    });
    p2pk_psbt.addOutput({
        address: script_addr,
        value: 1
    });
    for (let i = 0; i < useUTXO.length; i++) {
        p2pk_psbt.addInput({
            hash: useUTXO[i].tx_hash,
            index: useUTXO[i].tx_output_n,
            witnessUtxo: { value: useUTXO[i].value.toNumber(), script: p2pk_p2tr.output! },
            tapInternalKey: toXOnly(keypair.publicKey)
        });
    }

    for (let i = 0; i < useUTXO.length; i++) {
        p2pk_psbt.signInput(i, tweakedSigner);
    }

    p2pk_psbt.finalizeAllInputs();

    const commitTX = p2pk_psbt.extractTransaction();
    return commitTX.virtualSize();
}

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
const createInscribeTx = async ({
    senderPrivateKey,
    senderAddress,
    utxos,
    inscriptions,
    tcTxIDs,
    feeRatePerByte,
    sequence = DefaultSequenceRBF,
    isSelectUTXOs = true,
}: {
    senderPrivateKey: Buffer,
    senderAddress: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    tcTxIDs: string[],
    feeRatePerByte: number,
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
    // const internalPubKey = toXOnly(keyPair.publicKey);

    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = await createLockScript({
        // internalPubKey,
        tcTxIDs,
        tcClient
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
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee) }],
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
        sequence: 0,
    });

    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);
    console.log("commitTxID: ", commitTxID);
    console.log("revealTxID: ", revealTxID);

    const { btcTxID } = await tcClient.submitInscribeTx([commitTxHex, revealTxHex]);
    console.log("btcTxID: ", btcTxID);

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

const splitBatchInscribeTx = ({
    tcTxDetails
}: {
    tcTxDetails: TCTxDetail[]
}): string[][] => {
    // sort tc tx by inscreasing nonce
    tcTxDetails = tcTxDetails.sort(
        (a: TCTxDetail, b: TCTxDetail): number => {
            if (a.Nonce > b.Nonce) {
                return 1;
            }
            if (a.Nonce < b.Nonce) {
                return -1;
            }
            return 0;
        }
    );

    console.log("tcTxDetails after sort: ", tcTxDetails);

    // create inscribe tx 
    if (tcTxDetails.length === 0) {
        console.log("There is no transaction to inscribe");
        return [];
    }

    const batchInscribeTxIDs: string[][] = [];
    let inscribeableTxIDs: string[] = [tcTxDetails[0].Hash];
    let prevNonce = tcTxDetails[0].Nonce;
    for (let i = 1; i < tcTxDetails.length; i++) {
        if (prevNonce + 1 === tcTxDetails[i].Nonce) {
            inscribeableTxIDs.push(tcTxDetails[i].Hash);
        } else {
            batchInscribeTxIDs.push([...inscribeableTxIDs]);
            inscribeableTxIDs = [tcTxDetails[i].Hash];
        }
        prevNonce = tcTxDetails[i].Nonce;
    }
    batchInscribeTxIDs.push([...inscribeableTxIDs]);
    console.log("batchInscribeTxIDs: ", batchInscribeTxIDs);
    return batchInscribeTxIDs;
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
const createBatchInscribeTxs = async ({
    senderPrivateKey,
    senderAddress,
    utxos,
    inscriptions,
    tcTxDetails,
    feeRatePerByte,
    sequence = DefaultSequenceRBF,
}: {
    senderPrivateKey: Buffer,
    senderAddress: string,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    tcTxDetails: TCTxDetail[],
    feeRatePerByte: number,
    sequence?: number,
}): Promise<BatchInscribeTxResp[]> => {

    const batchInscribeTxIDs = splitBatchInscribeTx({ tcTxDetails });

    const result: BatchInscribeTxResp[] = [];

    const newUTXOs = [...utxos];

    for (const batch of batchInscribeTxIDs) {
        console.log("[BatchInscribe] New UTXOs for creating new tx: ", newUTXOs);
        try {
            const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee, newUTXOs: newUTXOsTmp, selectedUTXOs } = await createInscribeTx({
                senderPrivateKey,
                senderAddress,
                utxos: newUTXOs,
                inscriptions,
                tcTxIDs: batch,
                feeRatePerByte,
                sequence,
            });

            if (sequence < DefaultSequence) {
                sequence += 1;
            }

            result.push({
                tcTxIDs: batch,
                commitTxHex,
                commitTxID,
                revealTxHex,
                revealTxID,
                totalFee,
            });

            // remove selected UTXOs to create next txs
            if (selectedUTXOs.length > 0) {
                for (const selectedUtxo of selectedUTXOs) {
                    const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
                    newUTXOs.splice(index, 1);
                }
            }

            // append change UTXOs to create next txs
            if (newUTXOsTmp.length > 0) {
                newUTXOs.push(...newUTXOsTmp);
            }
        } catch (e) {
            console.log("Error when create inscribe batch txs: ", e);
            if (result.length === 0) {
                throw e;
            }
            return result;
        }
    }
    return result;

};

/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword. 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param data list of hex data need to inscribe
* @param reImbursementTCAddress TC address of the inscriber to receive gas.
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
const createInscribeTxFromAnyWallet = async ({
    pubKey,
    utxos,
    inscriptions,
    tcTxIDs,
    feeRatePerByte,
    tcClient,
    cancelFn
}: {
    pubKey: Buffer,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    tcTxIDs: string[],
    feeRatePerByte: number,
    tcClient: TcClient,
    cancelFn: () => void
}): Promise<{
    commitTxHex: string,
    commitTxID: string,
    revealTxHex: string,
    revealTxID: string,
    totalFee: BigNumber,
}> => {

    // const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    // const internalPubKey = toXOnly(keyPair.publicKey);
    const { address: senderAddress } = generateTaprootAddressFromPubKey(pubKey);

    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = await createLockScript({
        // internalPubKey: pubKey,
        tcTxIDs,
        tcClient,
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

    const { base64Psbt: commitPsbtB64, fee: commitTxFee, changeAmount, selectedUTXOs, indicesToSign } = createRawTxSendBTC({
        pubKey,
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee) }],
        feeRatePerByte,
    });

    // sign transaction 
    const { msgTx: commitTx, msgTxID: commitTxID, msgTxHex: commitTxHex } = await handleSignPsbtWithSpecificWallet({
        base64Psbt: commitPsbtB64,
        indicesToSign: indicesToSign,
        address: senderAddress,
        isGetMsgTx: true,
        cancelFn
    });


    console.log("commitTX: ", commitTx);
    console.log("COMMITTX selectedUTXOs: ", selectedUTXOs);

    // create and sign reveal tx
    const { revealTxHex, revealTxID } = createRawRevealTx({
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
        sequence: 0,
    });

    return {
        commitTxHex,
        commitTxID,
        revealTxHex,
        revealTxID,
        totalFee: new BigNumber(totalFee),
    };
};

const createLockScript = async ({
    // privateKey,
    // internalPubKey,
    tcTxIDs,
    tcClient,
}: {
    // privateKey: Buffer,
    // internalPubKey: Buffer,
    tcTxIDs: string[],
    tcClient: TcClient,
}): Promise<{
    hashLockKeyPair: ECPairInterface,
    hashLockScript: Buffer,
    hashLockRedeem: Tapleaf,
    script_p2tr: payments.Payment,
}> => {
    // Create a tap tree with two spend paths
    // One path should allow spending using secret
    // The other path should pay to another pubkey

    // Make random key pair for hash_lock script
    const hashLockKeyPair = ECPair.makeRandom({ network: tcBTCNetwork });
    const internalPubKey = toXOnly(hashLockKeyPair.publicKey);

    // TODO:
    // const hashLockPrivateKey = hash256(privateKey);
    // const hashLockKeyPair = ECPair.fromPrivateKey(hashLockPrivateKey, { network: Network });
    // console.log("REMOVE hashLockPrivateKey: ", hashLockPrivateKey);

    // call TC node to get Tapscript and hash lock redeem
    const { hashLockScriptHex } = await tcClient.getTapScriptInfo(hashLockKeyPair.publicKey.toString("hex"), tcTxIDs);
    const hashLockScript = Buffer.from(hashLockScriptHex, "hex");

    const hashLockRedeem = {
        output: hashLockScript,
        redeemVersion: 192,
    };

    const scriptTree: Taptree = hashLockRedeem;
    const script_p2tr = payments.p2tr({
        internalPubkey: internalPubKey,
        scriptTree,
        redeem: hashLockRedeem,
        network: tcBTCNetwork
    });

    return {
        hashLockKeyPair,
        hashLockScript,
        hashLockRedeem,
        script_p2tr
    };
};

const getRevealVirtualSizeByDataSize = (dataSize: number): number => {
    const inputSize = InputSize + dataSize;
    return inputSize + OutputSize;
};

/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project. 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param tcTxSizeByte size of tc tx (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
const estimateInscribeFee = ({
    tcTxSizeByte,
    feeRatePerByte,
}: {
    tcTxSizeByte: number,
    feeRatePerByte: number,
}): {
    totalFee: BigNumber,
} => {

    const estCommitTxFee = estimateTxFee(2, 2, feeRatePerByte);
    const revealVByte = getRevealVirtualSizeByDataSize(tcTxSizeByte / 4);
    const estRevealTxFee = revealVByte * feeRatePerByte;
    const totalFee = estCommitTxFee + estRevealTxFee;
    return { totalFee: new BigNumber(totalFee) };
};

/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project. 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param tcTxSizeByte size of tc tx (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
const aggregateUTXOsV0 = async ({
    tcAddress,
    btcAddress,
    utxos,
    tcClient,
}: {
    tcAddress: string,
    btcAddress: string,
    utxos: UTXO[],
    tcClient: TcClient,
}): Promise<UTXO[]> => {

    const txs = await tcClient.getPendingInscribeTxs(tcAddress);

    const pendingUTXOs: UTXO[] = [];
    for (const tx of txs) {
        for (const vin of tx.Vin) {
            pendingUTXOs.push({
                tx_hash: vin.txid,
                tx_output_n: vin.vout,
                value: BNZero
            });
        }
    }

    console.log("pendingUTXOs: ", pendingUTXOs);

    const newUTXOs: UTXO[] = [];
    for (const tx of txs) {
        const btcTxID = tx.BTCHash;
        for (let i = 0; i < tx.Vout.length; i++) {
            const vout = tx.Vout[i];

            try {
                const receiverAddress = address.fromOutputScript(Buffer.from(vout.scriptPubKey?.hex, "hex"), tcBTCNetwork);
                if (receiverAddress === btcAddress) {
                    newUTXOs.push({
                        tx_hash: btcTxID,
                        tx_output_n: i,
                        value: new BigNumber(toSat(vout.value))
                    });
                }
            } catch (e) {
                continue;
            }
        }
    }
    console.log("newUTXOs: ", newUTXOs);

    const tmpUTXOs = [...utxos, ...newUTXOs];

    console.log("tmpUTXOs: ", tmpUTXOs);
    const ids: string[] = [];
    const tmpUniqUTXOs: UTXO[] = [];

    for (const utxo of tmpUTXOs) {
        const id = utxo.tx_hash + ":" + utxo.tx_output_n;
        console.log("id: ", id);
        if (ids.findIndex((idTmp) => idTmp === id) !== -1) {
            continue;
        } else {
            tmpUniqUTXOs.push(utxo);
            ids.push(id);
        }
    }

    console.log("tmpUniqUTXOs ", tmpUniqUTXOs);

    const result: UTXO[] = [];
    for (const utxo of tmpUniqUTXOs) {
        const foundIndex = pendingUTXOs.findIndex((pendingUTXO) => {
            return pendingUTXO.tx_hash === utxo.tx_hash && pendingUTXO.tx_output_n === utxo.tx_output_n;
        });
        if (foundIndex === -1) {
            result.push(utxo);
        }
    }

    console.log("result: ", result);

    return result;
};


/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project. 
* NOTE: Currently, the function only supports sending from Taproot address. 
* @param tcTxSizeByte size of tc tx (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
const aggregateUTXOs = async ({
    tcAddress,
    utxos,
}: {
    tcAddress: string,
    btcAddress: string,
    utxos: UTXO[],
}): Promise<UTXO[]> => {

    const txs = await tcClient.getPendingInscribeTxs(tcAddress);

    const pendingUTXOs: UTXO[] = [];
    for (const tx of txs) {
        for (const vin of tx.Vin) {
            pendingUTXOs.push({
                tx_hash: vin.txid,
                tx_output_n: vin.vout,
                value: BNZero
            });
        }
    }

    console.log("pendingUTXOs: ", pendingUTXOs);

    // const newUTXOs: UTXO[] = [];
    // for (const tx of txs) {
    //     const btcTxID = tx.BTCHash;
    //     for (let i = 0; i < tx.Vout.length; i++) {
    //         const vout = tx.Vout[i];

    //         try {
    //             const receiverAddress = address.fromOutputScript(Buffer.from(vout.scriptPubKey?.hex, "hex"), Network);
    //             if (receiverAddress === btcAddress) {
    //                 newUTXOs.push({
    //                     tx_hash: btcTxID,
    //                     tx_output_n: i,
    //                     value: new BigNumber(toSat(vout.value))
    //                 });
    //             }
    //         } catch (e) {
    //             continue;
    //         }
    //     }
    // }
    // console.log("newUTXOs: ", newUTXOs);

    const tmpUTXOs = [...utxos];

    // console.log("tmpUTXOs: ", tmpUTXOs);
    // const ids: string[] = [];
    // const tmpUniqUTXOs: UTXO[] = [];

    // for (const utxo of tmpUTXOs) {
    //     const id = utxo.tx_hash + ":" + utxo.tx_output_n;
    //     console.log("id: ", id);
    //     if (ids.findIndex((idTmp) => idTmp === id) !== -1) {
    //         continue;
    //     } else {
    //         tmpUniqUTXOs.push(utxo);
    //         ids.push(id);
    //     }
    // }

    // console.log("tmpUniqUTXOs ", tmpUniqUTXOs);

    const result: UTXO[] = [];
    for (const utxo of tmpUTXOs) {
        const foundIndex = pendingUTXOs.findIndex((pendingUTXO) => {
            return pendingUTXO.tx_hash === utxo.tx_hash && pendingUTXO.tx_output_n === utxo.tx_output_n;
        });
        if (foundIndex === -1) {
            result.push(utxo);
        }
    }

    console.log("result: ", result);

    return result;
};

export {
    createRawRevealTx,
    createInscribeTx,
    createInscribeTxFromAnyWallet,
    estimateInscribeFee,
    createLockScript,
    createBatchInscribeTxs,
    aggregateUTXOs,
    splitBatchInscribeTx
};