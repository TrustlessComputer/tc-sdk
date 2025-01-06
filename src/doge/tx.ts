const dogecore = require('bitcore-lib-doge')
const fs = require('fs')
const dotenv = require('dotenv')
const mime = require('mime-types')
const express = require('express')
const { PrivateKey, Address, Transaction, Script, Opcode } = dogecore;
const { Hash, Signature } = dogecore.crypto
import BigNumber from "bignumber.js";
import { DUTXO, DWallet } from "./types"
import { MinSats } from "./constants"
import axios, { AxiosResponse } from "axios";
import { address } from "bitcoinjs-lib"
import { fund2 } from "./inscribe";

const createSendDogeTx = async ({
    network,
    senderPrivKey,
    senderAddress,
    receiverAddress,
    amount,
    utxos,
    feeRate = 0,
    rpcEndpoint,
}: {
    network: number,
    senderPrivKey: string,
    senderAddress: string,
    receiverAddress: string,
    amount: BigNumber,
    utxos: DUTXO[],
    feeRate?: number,
    rpcEndpoint?: string,
}): Promise<{
    txID: string,
    txHex: string,
    networkFee: BigNumber,
}> => {

    const wallet: DWallet = {
        privKey: senderPrivKey,
        address: senderAddress,
        utxos: utxos,
    };

    let tx = new Transaction();
    console.log("receiverAddress: ", receiverAddress);
    // let receiverAddressType = new Address(receiverAddress);
    // console.log("receiverAddressType: ", receiverAddressType);

    // tx.to(receiverAddress, amount.toNumber());

    console.log("Script receiver:", Script(new Address(receiverAddress)));
    console.log("Script sender:", Script(new Address(senderAddress)));

    tx.from(utxos[0]);


    tx = tx.addOutput(new Transaction.Output({
        script: Script(new Address(receiverAddress)),
        satoshis: amount.toNumber(),
    }));

    tx.change(senderAddress);
    tx.sign(senderPrivKey)

    // const tx2 = tx;

    // console.log("tx before fund: ", tx2);

    // fund2(wallet, tx)  // add utxo to pay network fee

    console.log("createSendDogeTx: ", tx);

    return {
        txID: tx.hash,
        txHex: tx.toString(),
        networkFee: tx.getFee(),
    }
}


const createSendDogeTxV2 = async ({
    network,
    senderPrivKey,
    senderAddress,
    receiverAddress,
    amount,
    utxos,
    feeRate = 0,
    rpcEndpoint,
}: {
    network: number,
    senderPrivKey: string,
    senderAddress: string,
    receiverAddress: string,
    amount: BigNumber,
    utxos: DUTXO[],
    feeRate?: number,
    rpcEndpoint?: string,
}): Promise<{
    txID: string,
    txHex: string,
    networkFee: BigNumber,
}> => {
    // Fetch UTXOs for the sender's address
    // const utxos = await getUTXOs(senderAddress);

    if (utxos.length === 0) {
        throw new Error('No UTXOs found for this address.');
    }

    // Create a new transaction
    const transaction = new Transaction();


    // Add UTXOs as inputs
    let totalInput = 0;
    for (const utxo of utxos) {
        transaction.from({
            txId: utxo.txid,
            outputIndex: utxo.vout,
            address: senderAddress,
            script: utxo.script,
            // script: Script.buildPublicKeyHashOut(senderAddress),
            satoshis: utxo.satoshis
        });
        totalInput += utxo.satoshis; // Accumulate total input

    }

    // Add output for the recipient
    transaction.to(receiverAddress, amount.toNumber());

    console.log(`${totalInput} - ${amount.toNumber()} - ${transaction._estimateFee()}`)

    // Calculate change and add it back to the sender's address
    const change = totalInput - amount.toNumber() - transaction._estimateFee();
    console.log("Change amount: ", change);
    console.log("Change  address: ", senderAddress);
    if (change > 0) {
        transaction.change(senderAddress);
    }

    // Sign the transaction
    const privateKey = PrivateKey.fromWIF(senderPrivKey);
    transaction.sign(privateKey);

    // Serialize the transaction
    const txHex = transaction.serialize();

    console.log('Raw Transaction Hex:', txHex);

    // Broadcast the transaction
    // await broadcastTransaction(txHex);
    return {
        txID: transaction.hash,
        txHex: txHex,
        networkFee: transaction.getFee(),
    }
}

export {
    createSendDogeTx,
    createSendDogeTxV2,
}