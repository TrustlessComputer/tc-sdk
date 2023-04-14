import { BNZero, InputSize, MinSats, OutputSize } from "../bitcoin/constants";
import {
    BatchInscribeTxResp,
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
import { ECPair, generateTaprootAddressFromPubKey, generateTaprootKeyPair, toXOnly } from "../bitcoin/wallet";
import { Psbt, address, payments, script } from "bitcoinjs-lib";
import { Tapleaf, Taptree } from "bitcoinjs-lib/src/types";

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { ERROR_CODE } from "../constants/error";
import { Network } from "../bitcoin/network";
import { handleSignPsbtWithSpecificWallet } from "../bitcoin/xverse";
import { witnessStackToScriptWitness } from "./witness_stack_to_script_witness";

const _ = require("underscore");

const remove0x = (data: string): string => {
    if (data.startsWith("0x")) data = data.slice(2);
    return data;
};

const createRawRevealTx = ({
    internalPubKey,
    commitTxID,
    hashLockKeyPair,
    hashLockRedeem,
    script_p2tr,
    revealTxFee
}: {
    internalPubKey: Buffer,
    commitTxID: string,
    hashLockKeyPair: ECPairInterface,
    hashLockRedeem: any,
    script_p2tr: payments.Payment,
    revealTxFee: number,
}): { revealTxHex: string, revealTxID: string } => {
    const { p2pktr, address: p2pktr_addr } = generateTaprootAddressFromPubKey(internalPubKey);

    const tapLeafScript = {
        leafVersion: hashLockRedeem?.redeemVersion,
        script: hashLockRedeem?.output,
        controlBlock: script_p2tr.witness![script_p2tr.witness!.length - 1],
    };

    const psbt = new Psbt({ network: Network });
    psbt.addInput({
        hash: commitTxID,
        index: 0,
        witnessUtxo: { value: revealTxFee + MinSats, script: script_p2tr.output! },
        tapLeafScript: [
            tapLeafScript
        ]
    });

    psbt.addOutput({
        address: p2pktr_addr,
        value: MinSats
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

    const psbt = new Psbt({ network: Network });
    psbt.addInput({
        hash: "00".repeat(32),
        index: 0,
        witnessUtxo: { value: 1, script: script_p2tr.output! },
        tapLeafScript: [
            tapLeafScript
        ]
    });

    psbt.addOutput({
        address: p2pktr_addr,
        value: 1
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
    const p2pk_psbt = new Psbt({ network: Network });
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
    utxos,
    inscriptions,
    tcTxIDs,
    feeRatePerByte,
    tcClient,
}: {
    senderPrivateKey: Buffer,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    tcTxIDs: string[],
    feeRatePerByte: number,
    tcClient: TcClient,
}): Promise<{
    commitTxHex: string,
    commitTxID: string,
    revealTxHex: string,
    revealTxID: string,
    totalFee: BigNumber,
}> => {
    const { keyPair, p2pktr, senderAddress } = generateTaprootKeyPair(senderPrivateKey);
    const internalPubKey = toXOnly(keyPair.publicKey);

    // create lock script for commit tx
    const { hashLockKeyPair, hashLockRedeem, script_p2tr } = await createLockScript({
        internalPubKey,
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
        utxos,
        inscriptions,
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats) }],
        feeRatePerByte,
    });

    console.log("commitTX: ", tx);
    console.log("COMMITTX selectedUTXOs: ", selectedUTXOs);

    // create and sign reveal tx
    const { revealTxHex, revealTxID } = createRawRevealTx({
        internalPubKey,
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
    });

    console.log("commitTxHex: ", commitTxHex);
    console.log("revealTxHex: ", revealTxHex);

    const { btcTxID } = await tcClient.submitInscribeTx([commitTxHex, revealTxHex]);
    console.log("btcTxID: ", btcTxID);

    return {
        commitTxHex,
        commitTxID,
        revealTxHex,
        revealTxID,
        totalFee: new BigNumber(totalFee),
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
const createBatchInscribeTxs = async ({
    senderPrivateKey,
    utxos,
    inscriptions,
    tcTxDetails,
    feeRatePerByte,
    tcClient,
}: {
    senderPrivateKey: Buffer,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    tcTxDetails: TCTxDetail[],
    feeRatePerByte: number,
    tcClient: TcClient,
}): Promise<BatchInscribeTxResp[]> => {

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

    const inscribeableTxIDs: string[] = [tcTxDetails[0].Hash];
    let prevNonce = tcTxDetails[0].Nonce;
    for (let i = 1; i < tcTxDetails.length; i++) {
        if (prevNonce + 1 === tcTxDetails[i].Nonce) {
            inscribeableTxIDs.push(tcTxDetails[i].Hash);
            prevNonce = tcTxDetails[i].Nonce;
        } else {
            break;
        }
    }
    console.log("inscribeableTxIDs: ", inscribeableTxIDs);

    const { commitTxHex, commitTxID, revealTxHex, revealTxID, totalFee } = await createInscribeTx({
        senderPrivateKey,
        utxos,
        inscriptions,
        tcTxIDs: inscribeableTxIDs,
        feeRatePerByte,
        tcClient,
    });

    return [{
        tcTxIDs: inscribeableTxIDs,
        commitTxHex,
        commitTxID,
        revealTxHex,
        revealTxID,
        totalFee,
    }];

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
        internalPubKey: pubKey,
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
        paymentInfos: [{ address: script_p2tr.address || "", amount: new BigNumber(estRevealTxFee + MinSats) }],
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
        internalPubKey: pubKey,
        commitTxID,
        hashLockKeyPair,
        hashLockRedeem,
        script_p2tr,
        revealTxFee: estRevealTxFee,
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
    internalPubKey,
    tcTxIDs,
    tcClient,
}: {
    internalPubKey: Buffer,
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
    const hashLockKeyPair = ECPair.makeRandom({ network: Network });

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
        network: Network
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
const aggregateUTXOs = async ({
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
                const receiverAddress = address.fromOutputScript(Buffer.from(vout.scriptPubKey?.hex, "hex"), Network);
                console.log("receiverAddress: ", receiverAddress);
                if (receiverAddress === btcAddress) {
                    newUTXOs.push({
                        tx_hash: btcTxID,
                        tx_output_n: i,
                        value: new BigNumber(toSat(vout.value))
                    });

                    console.log("value bn: ", toSat(vout.value));
                }
            } catch (e) {
                continue;
            }
        }
    }

    const tmpUTXOs = _.uniq([...utxos, ...newUTXOs]);

    console.log("tmpUTXOs ", tmpUTXOs);

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
    aggregateUTXOs
};