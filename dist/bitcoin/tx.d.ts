import { ICreateRawTxResp, ICreateTxResp, IKeyPairInfo, ISignPSBTResp, Inscription, PaymentInfo, UTXO, InscPaymentInfo, PaymentScript } from "./types";
import { Psbt, payments } from 'bitcoinjs-lib';
import { selectUTXOs } from "./selectcoin";
import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
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
declare const signPSBT: ({ keyPairInfo, psbtB64, indicesToSign, sigHashType, }: {
    keyPairInfo: IKeyPairInfo;
    psbtB64: string;
    indicesToSign: number[];
    sigHashType?: number | undefined;
}) => ISignPSBTResp;
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
declare const signPSBT2: ({ senderPrivateKey, psbtB64, indicesToSign, sigHashType }: {
    senderPrivateKey: Buffer;
    psbtB64: string;
    indicesToSign: number[];
    sigHashType?: number | undefined;
}) => string;
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
declare const createTx: ({ senderPrivateKey, senderAddress, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, sequence, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    isUseInscriptionPayFeeParam?: boolean | undefined;
    sequence?: number | undefined;
}) => ICreateTxResp;
declare const addInputs: ({ psbt, addressType, inputs, payment, sequence, keyPair, }: {
    psbt: Psbt;
    addressType: number;
    inputs: UTXO[];
    payment: payments.Payment;
    sequence: number;
    keyPair: ECPairInterface;
}) => Psbt;
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
declare const createRawTx: ({ keyPairInfo, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, sequence, }: {
    keyPairInfo: IKeyPairInfo;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    isUseInscriptionPayFeeParam: boolean;
    sequence?: number | undefined;
}) => ICreateRawTxResp;
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
declare const createTxFromAnyWallet: ({ keyPairInfo, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, walletType, cancelFn, }: {
    keyPairInfo: IKeyPairInfo;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    isUseInscriptionPayFeeParam: boolean;
    walletType?: number | undefined;
    cancelFn: () => void;
}) => Promise<ICreateTxResp>;
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
declare const createTxSendBTC: ({ senderPrivateKey, senderAddress, utxos, inscriptions, paymentInfos, paymentScripts, feeRatePerByte, sequence, isSelectUTXOs, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    paymentInfos: PaymentInfo[];
    paymentScripts?: PaymentScript[] | undefined;
    feeRatePerByte: number;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
}) => ICreateTxResp;
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
declare const createRawTxSendBTC: ({ pubKey, utxos, inscriptions, paymentInfos, feeRatePerByte, }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    paymentInfos: PaymentInfo[];
    feeRatePerByte: number;
}) => ICreateRawTxResp;
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
declare const createTxWithSpecificUTXOs: (senderPrivateKey: Buffer, utxos: UTXO[], sendInscriptionID: string | undefined, receiverInsAddress: string, sendAmount: BigNumber, valueOutInscription: BigNumber, changeAmount: BigNumber, fee: BigNumber) => {
    txID: string;
    txHex: string;
    fee: BigNumber;
};
/**
* createTxSendMultiReceivers creates the Bitcoin transaction that can both BTC and inscriptions to multiple receiver addresses.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param inscPaymentInfos list of inscription IDs and receiver addresses
* @param paymentInfos list of btc amount and receiver addresses
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createTxSendMultiReceivers: ({ senderPrivateKey, senderAddress, utxos, inscriptions, inscPaymentInfos, paymentInfos, feeRatePerByte, sequence, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    inscPaymentInfos: InscPaymentInfo[];
    paymentInfos: PaymentInfo[];
    feeRatePerByte: number;
    sequence?: number | undefined;
}) => ICreateTxResp;
declare const broadcastTx: (txHex: string) => Promise<string>;
export { selectUTXOs, createTx, createRawTx, createTxFromAnyWallet, broadcastTx, createTxWithSpecificUTXOs, createTxSendBTC, createRawTxSendBTC, signPSBT, signPSBT2, addInputs, createTxSendMultiReceivers, };
