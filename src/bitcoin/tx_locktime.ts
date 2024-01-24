import { BNZero, DefaultSequence, DefaultSequenceRBF, DummyUTXOValue, MinSats, MinSats2 } from "./constants";
import { BTCAddressType, ECPair, convertPrivateKeyFromStr, generateP2PKHKeyPair, generateP2WPKHKeyPair, generateP2WPKHKeyPairFromPubKey, generateTaprootAddressFromPubKey, generateTaprootKeyPair, getAddressType, getKeyPairInfo, toXOnly, tweakSigner } from "./wallet";
import { BlockStreamURL, Network } from "./network";
import { BuyReqFullInfo, ICreateRawTxResp, ICreateTxResp, ICreateTxSplitInscriptionResp, IKeyPairInfo, ISignPSBTResp, Inscription, NeedPaymentUTXO, PaymentInfo, UTXO } from "./types";
import { Psbt, Transaction, address, opcodes, payments, script, crypto, } from 'bitcoinjs-lib';
const bitcoin = require('bitcoinjs-lib');

import SDKError, { ERROR_CODE } from "../constants/error";
import axios, { AxiosResponse } from "axios";
import { estimateTxFee, fromSat } from "./utils";
import { filterAndSortCardinalUTXOs, findExactValueUTXO, selectInscriptionUTXO, selectTheSmallestUTXO, selectUTXOs } from "./selectcoin";

import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
import { handleSignPsbtWithSpecificWallet } from "./xverse";
import { Script } from "bsv-wasm";

import { addInputs, signPSBT } from "./tx";
import { Taptree } from "bitcoinjs-lib/src/types";
import { witnessStackToScriptWitness } from "@/tc/witness_stack_to_script_witness";

import { LEAF_VERSION_TAPSCRIPT } from 'bitcoinjs-lib/src/payments/bip341';
import { from } from "form-data";


const createScriptLockTime = ({
    lockTime,
    pubKeyHash
}: {
    lockTime: number,
    pubKeyHash: Buffer,
}): Buffer => {
    // let pkh = pubKeyHash;
    // if (typeof pubKeyHash === 'string')
    //     pkh = Buffer.from(pubKeyHash);
    // else pkh = pubKeyHash;
    // assert(Buffer.isBuffer(pkh), 'publicKey must be a Buffer');
    // assert(
    //     locktime,
    //     'Must pass in a locktime argument, either block height or UNIX epoch time'
    // );

    console.log("createScriptLockTime lockTime ", lockTime);
    // const asm = `
    //   OP_IF
    //       ${script.number.encode(lockTime).toString('hex')}
    //       OP_CHECKLOCKTIMEVERIFY
    //       OP_DROP
    //   OP_ELSE
    //       ${pubKeyHash.toString('hex')}
    //       OP_CHECKSIGVERIFY
    //   OP_ENDIF
    //   ${pubKeyHash.toString('hex')}
    //   OP_CHECKSIG
    // `
    //     .trim()
    //     .replace(/\s+/g, ' ');



    // const asm = `
    // ${script.number.encode(lockTime).toString('hex')} OP_CHECKLOCKTIMEVERIFY OP_DROP OP_DUP OP_HASH160 ${pubKeyHash.toString('hex')} OP_EQUALVERIFY OP_CHECKSIG
    // `.trim()
    //     .replace(/\s+/g, ' ');

    const asm = `
    ${script.number.encode(lockTime).toString('hex')} OP_CHECKLOCKTIMEVERIFY OP_DROP OP_DUP ${pubKeyHash.toString('hex')} OP_CHECKSIG
    `.trim()
        .replace(/\s+/g, ' ');

    console.log("createScriptLockTime asm : ", asm);


    return script.fromASM(asm);

    // const script = new Script();
    // // lock the transactions until
    // // the locktime has been reached
    // script.pushNum(ScriptNum.fromString(locktime.toString(), 10));
    // // check the locktime
    // script.pushSym('CHECKLOCKTIMEVERIFY');
    // // if verifies, drop time from the stack
    // script.pushSym('drop');
    // // duplicate item on the top of the stack
    // // which should be.the public key
    // script.pushSym('dup');
    // // hash the top item from the stack (the public key)
    // script.pushSym('hash160')
    // // push the hash to the top of the stack
    // script.pushData(pkh);
    // // confirm they match
    // script.pushSym('equalverify');
    // // confirm the signature matches
    // script.pushSym('checksig');
    // // Compile the script to its binary representation
    // // (you must do this if you change something!).
    // script.compile();
    // return script;


}
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
const createRawTxWithLockTime = ({
    keyPairInfo,
    utxos,
    inscriptions,
    sendInscriptionID = "",
    receiverInsAddress,
    receiverPubKey,
    sendAmount,
    feeRatePerByte,
    isUseInscriptionPayFeeParam = true, // default is true
    lockTime,
    sequence = DefaultSequenceRBF,

}: {
    keyPairInfo: IKeyPairInfo,
    utxos: UTXO[],
    inscriptions: { [key: string]: Inscription[] },
    sendInscriptionID: string,
    receiverInsAddress: string,
    receiverPubKey: string,
    sendAmount: BigNumber,
    feeRatePerByte: number,
    isUseInscriptionPayFeeParam: boolean,
    lockTime: number,
    sequence?: number,
}): ICreateRawTxResp => {
    const { keyPair, payment, address: senderAddress, addressType } = keyPairInfo;

    // validation
    if (sendAmount.gt(BNZero) && sendAmount.lt(MinSats2)) {
        throw new SDKError(ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats2) + " BTC.");
    }
    // select UTXOs
    const { selectedUTXOs, valueOutInscription, changeAmount, fee } = selectUTXOs(utxos, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, true);
    let feeRes = fee;

    let psbt = new Psbt({ network: tcBTCNetwork });
    // add inputs
    psbt = addInputs({ psbt, addressType, inputs: selectedUTXOs, payment, sequence, keyPair });



    // create script lock time output
    const receiverPubKeyBuffer = Buffer.from(receiverPubKey, "hex");
    console.log("receiverPubKeyBuffer: ", receiverPubKeyBuffer, receiverPubKeyBuffer.length);
    // const pkh = crypto.hash160(toXOnly(receiverPubKeyBuffer))
    const pkh = toXOnly(receiverPubKeyBuffer)
    const scriptLockTime = createScriptLockTime({ lockTime: lockTime, pubKeyHash: pkh });



    // const scriptLockRedeem = {
    //     output: scriptLockTime,
    //     network: Network,
    //     // redeemVersion: 192,
    // };

    // const script_p2tr = payments.p2wsh({
    //     redeem: scriptLockRedeem,
    //     network: Network,

    // })

    const scriptLockRedeem = {
        output: scriptLockTime,
        redeemVersion: 192,
    };

    const scriptTree: Taptree = scriptLockRedeem;
    const script_p2tr = payments.p2tr({
        internalPubkey: toXOnly(receiverPubKeyBuffer),
        scriptTree,
        redeem: scriptLockRedeem,
        network: Network
    });

    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError(ERROR_CODE.INVALID_TAPSCRIPT_ADDRESS, "");
    }


    // add outputs
    if (sendInscriptionID !== "") {
        // add output inscription
        psbt.addOutput({
            address: script_p2tr.address || "",
            value: valueOutInscription.toNumber(),
        });
    }
    // add output send BTC
    if (sendAmount.gt(BNZero)) {
        psbt.addOutput({
            address: script_p2tr.address || "",
            // address: receiverInsAddress,
            value: sendAmount.toNumber(),
        });
    }

    // add change output
    if (changeAmount.gt(BNZero)) {
        if (changeAmount.gte(MinSats2)) {
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


const createTxSpendLockTimeOutput = (
    {
        keyPairInfo,
        utxo,
        utxos,
        lockTime,
        receiverAddress,
        sequence = 0,
    }: {
        keyPairInfo: IKeyPairInfo,
        utxo: UTXO,
        utxos: UTXO[],
        lockTime: number,
        receiverAddress: string,
        sequence?: number,
    }
) => {

    const { addressType, keyPair, payment, address: senderAddress } = keyPairInfo

    const fee = estimateTxFee(2, 2, 100);
    // select UTXOs

    let totalInputAmount = new BigNumber(0);
    for (let i = 0; i < utxos.length; i++) {
        const utxo = utxos[i];
        totalInputAmount = totalInputAmount.plus(utxo.value);
    }

    const changeAmount = totalInputAmount.minus(fee);


    const internalPubKey = toXOnly(keyPairInfo.signer.publicKey);
    // const receiverPubKeyBuffer = Buffer.from(receiverPubKey, "hex");
    // console.log("receiverPubKeyBuffer: ", receiverPubKeyBuffer, receiverPubKeyBuffer.length);
    // const pkh = crypto.hash160(internalPubKey)
    const pkh = internalPubKey;
    const scriptLockTime = createScriptLockTime({ lockTime: lockTime, pubKeyHash: pkh });

    // const scriptLockRedeem = {
    //     output: scriptLockTime,
    //     network: Network,s
    //     // redeemVersion: 192,
    // };

    // const script_p2tr = payments.p2wsh({
    //     redeem: scriptLockRedeem,
    //     network: Network,

    // })


    const scriptLockRedeem = {
        output: scriptLockTime,
        redeemVersion: 192,
    };

    const scriptTree: Taptree = scriptLockRedeem;
    const script_p2tr = payments.p2tr({
        internalPubkey: internalPubKey,
        scriptTree,
        redeem: scriptLockRedeem,
        network: Network
    });
    console.log("unlock script_p2tr: ", script_p2tr.address);

    if (script_p2tr.address === undefined || script_p2tr.address === "") {
        throw new SDKError(ERROR_CODE.INVALID_TAPSCRIPT_ADDRESS, "");
    }

    const tapLeafScript = {
        leafVersion: scriptLockRedeem?.redeemVersion,
        script: scriptLockRedeem?.output,
        controlBlock: script_p2tr.witness![script_p2tr.witness!.length - 1],
    };

    let psbt = new Psbt({ network: tcBTCNetwork });
    psbt.setLocktime(lockTime);
    psbt.addInput({
        hash: utxo.tx_hash,
        index: utxo.tx_output_n,
        witnessUtxo: { value: utxo.value.toNumber(), script: script_p2tr.output! },
        tapLeafScript: [
            tapLeafScript
        ],
        sequence,
    });

    // add inputs
    psbt = addInputs({ psbt, addressType, inputs: utxos, payment, sequence, keyPair });




    console.log("unlock script_p2tr.output:", script_p2tr.output, script_p2tr.output?.length);
    console.log("unlock scriptLockRedeem?.output:", scriptLockRedeem?.output, scriptLockRedeem?.output.length);
    console.log("unlock script_p2tr.witness:", script_p2tr.witness, script_p2tr.witness?.length);
    // psbt.addInput({
    //     hash: utxo.tx_hash,
    //     index: utxo.tx_output_n,
    //     // nonWitnessUtxo: Buffer.from(txHex, "hex"),
    //     redeemScript: scriptLockRedeem?.output,
    //     sequence,
    // });

    psbt.addOutput({
        value: MinSats2,
        address: receiverAddress,
    });

    psbt.addOutput({
        value: changeAmount.toNumber(),
        address: senderAddress,
    });


    // const signatureHash = tx.hashForSignature(0, redeemScript, hashType)




    console.log("key pair public key: ", keyPairInfo.keyPair.publicKey.toString("hex"));

    // const hash_lock_keypair = ECPair.fromWIF(hashLockPriKey);

    for (let i = 0; i < psbt.txInputs.length; i++) {
        psbt.signInput(i, keyPairInfo.signer, [keyPairInfo.sigHashTypeDefault]);
    }



    // psbt.finalizeInput(0, getFinalScripts)

    // psbt.finalizeAllInputs();

    // psbt.finalizeInput(0);

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

    for (let i = 0; i < psbt.txInputs.length; i++) {
        psbt.finalizeInput(i, customFinalizer);
    }


    const revealTX = psbt.extractTransaction();

    console.log("Script hex: ", revealTX.ins[0].script.toString("hex"));
    console.log("Witness hex: ", revealTX.ins[0].witness[0].toString("hex"));

    console.log("revealTX: ", revealTX);

    return { txHex: revealTX.toHex(), txID: revealTX.getId() };
}

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
const createTxWithLockTime = (
    {
        senderPrivateKey,
        senderAddress,
        utxos,
        inscriptions,
        sendInscriptionID = "",
        receiverInsAddress,
        receiverPubKey,
        sendAmount,
        feeRatePerByte,
        lockTime,
        isUseInscriptionPayFeeParam = true, // default is true
        sequence = DefaultSequenceRBF,
    }: {
        senderPrivateKey: Buffer,
        senderAddress: string,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        sendInscriptionID: string,
        receiverInsAddress: string,
        receiverPubKey: string,
        sendAmount: BigNumber,
        feeRatePerByte: number,
        lockTime: number,
        isUseInscriptionPayFeeParam?: boolean,
        sequence?: number,
    }
): ICreateTxResp => {
    console.log("createTx utxos: ", { utxos: utxos, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte, sendAmount: sendAmount, isUseInscriptionPayFeeParam: isUseInscriptionPayFeeParam });
    // init key pair and tweakedSigner from senderPrivateKey
    // TODO: 
    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });

    // const keyPairInfo: IKeyPairInfo = generateP2WSHKeyPair(senderPrivateKey);

    const { base64Psbt, fee, changeAmount, selectedUTXOs, indicesToSign } = createRawTxWithLockTime({
        keyPairInfo,
        utxos,
        inscriptions,
        sendInscriptionID,
        receiverInsAddress,
        receiverPubKey,
        sendAmount,
        feeRatePerByte,
        isUseInscriptionPayFeeParam,
        lockTime,
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
const createTxSpendInputWithLockTime = (
    {
        senderPrivateKey,
        senderAddress,
        utxo,
        utxos,
        inscriptions,
        receiverAddress,
        sendAmount,
        feeRatePerByte,
        lockTime,
        isUseInscriptionPayFeeParam = true, // default is true
        sequence = DefaultSequenceRBF,
    }: {
        senderPrivateKey: Buffer,
        senderAddress: string,
        utxo: UTXO,
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
        receiverAddress: string,
        sendAmount: BigNumber,
        feeRatePerByte: number,
        lockTime: number,
        isUseInscriptionPayFeeParam?: boolean,
        sequence?: number,
    }
) => {
    console.log("createTx utxos: ", { utxo: utxo, inscriptions: inscriptions, feeRatePerByte: feeRatePerByte, sendAmount: sendAmount, isUseInscriptionPayFeeParam: isUseInscriptionPayFeeParam });
    // init key pair and tweakedSigner from senderPrivateKey
    const keyPairInfo: IKeyPairInfo = getKeyPairInfo({ privateKey: senderPrivateKey, address: senderAddress });

    // const keyPairInfo: IKeyPairInfo = generateP2WSHKeyPair(senderPrivateKey);

    const { txHex, txID } = createTxSpendLockTimeOutput({
        keyPairInfo,
        utxo,
        utxos,
        lockTime,
        receiverAddress: receiverAddress,
        // feeRatePerByte,
        sequence,
    });

    // const { signedBase64PSBT, msgTx, msgTxID, msgTxHex } = signPSBT({
    //     keyPairInfo,
    //     psbtB64: base64Psbt,
    //     indicesToSign,
    //     sigHashType: keyPairInfo.sigHashTypeDefault,
    // });

    return { txID: txID, txHex: txHex, };
};

function TestTx() {
    // Define your private key and address for spending
    const privateKeyHex = 'KzKrrdQWyzCsXQt8HZHtTkDm5tj6kqypNgPjBSfJ5eBEKvRtCiXK';
    const privateKeyBuffer = convertPrivateKeyFromStr(privateKeyHex);

    const keyPair = generateP2PKHKeyPair(privateKeyBuffer);
    const pubKeyBytes = keyPair.keyPair.publicKey;
    const publicKeyHex = pubKeyBytes.toString("hex");
    const fromAddress = keyPair.address;

    console.log("Address:", fromAddress);
    console.log("publicKeyHex: ", publicKeyHex);

    // Initialize a Bitcoin network (mainnet or testnet)
    const network = bitcoin.networks.testnet; // Use testnet for testing

    // Create a new PSBT
    const psbt = new bitcoin.Psbt({ network });

    // Define the recipient address and amount for the locktime output
    const toAddress = 'RECIPIENT_BITCOIN_ADDRESS';
    const amount = 1000; // Amount in satoshis (0.001 BTC)

    // Create a locktime for the output (in blocks from the current block height)
    const lockTimeBlocks = 100; // Replace with your desired lock time in blocks

    // Calculate the unlock time by adding the lock time to the current block height
    // const currentBlockHeight = 200000; // Replace with the actual current block height
    // const unlockTime = currentBlockHeight + lockTimeBlocks;

    const lockTime = 889575;

    // Create the locking script with OP_CLTV
    const lockingScript = [
        bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY, // OP_CLTV opcode
        bitcoin.script.number.encode(lockTime), // Lock time
        bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY, // OP_CSV opcode (optional, for relative time locks)
        bitcoin.opcodes.OP_DROP, // Remove the locktime from the stack
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        Buffer.from(bitcoin.payments.p2pkh({ pubkey: pubKeyBytes }).hash),
        bitcoin.opcodes.OP_EQUALVERIFY,
        bitcoin.opcodes.OP_CHECKSIG
    ];



    psbt.addInput({
        hash: "9322af07884cdfcb98f08ce63495ff42d7cbcdeb3ffed56cd0821c962bd7861f",
        index: 0,
        nonWitnessUtxo: Buffer.from("020000000001017cb5961f1747fadd3d7c5fb788955c09076e16d01cc9897e4bdc952caf938b1e0100000000fdffffff0280969800000000001976a914ef261c3387ab5d32988032adde0878f14f1579a188ac8143e71600000000225120d5254f2c52e2672daea941a86c99232693149fd0423ef523fe4e0dcb12a68d53014015c343ea31e750a27051c7d90a75bebffc8aed1937be692f070a9fed9bdbc7be2d7915723311f15ab2b24e0d3d9dc8faaf8cb3dfcb3875c7731be0736f47741600000000", "hex"),

        // nonWitnessUtxo: {
        //     script: Buffer.from(lockingScript),
        //     value: 10000000
        // },
        // redeemScript: unlockingScriptForSpending
    })
    // Add the output with the locking script and amount to the PSBT
    psbt.addOutput({
        address: lockingScript,
        value: amount
    });


    psbt.sign(0, privateKeyBuffer);
    psbt.finalizeAllInputs();
    const msgTx = psbt.extractTransaction()
    console.log("msgTx:", msgTx);


    // // Create a locktime for the output (in blocks from the current block height)
    // const lockTimeBlocksForSpending = 200; // Replace with your desired lock time for spending in blocks

    // // Calculate the unlock time for spending by adding the lock time to the current block height
    // const unlockTimeForSpending = currentBlockHeight + lockTimeBlocksForSpending;

    // Create the unlocking script for spending with OP_CLTV
    const unlockingScriptForSpending = [
        bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY, // OP_CLTV opcode
        bitcoin.script.number.encode(lockTime), // Lock time
        bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY, // OP_CSV opcode (optional, for relative time locks)
        bitcoin.opcodes.OP_DROP, // Remove the locktime from the stack
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        Buffer.from(bitcoin.payments.p2pkh({ pubkey: pubKeyBytes }).hash),
        bitcoin.opcodes.OP_EQUALVERIFY,
        bitcoin.opcodes.OP_CHECKSIG
    ];

    // Add the input that references the output from the PSBT
    psbt.addInput({
        hash: psbt.data.outputs[0].hash,
        index: psbt.data.outputs[0].index,
        witnessUtxo: {
            script: Buffer.from(lockingScript),
            value: amount
        },
        redeemScript: unlockingScriptForSpending
    });

    // Sign the transaction with your private key
    const privateKey = bitcoin.ECPair.fromHex(privateKeyHex, network);
    psbt.signInput(0, privateKey);

    // Finalize the PSBT
    psbt.finalizeAllInputs();


    // Serialize the PSBT
    const psbtBase64 = psbt.toBase64();

    console.log('Signed PSBT Base64:', psbtBase64);
}

export {
    createRawTxWithLockTime, createTxSpendLockTimeOutput, createTxWithLockTime, createTxSpendInputWithLockTime,
    TestTx,
}