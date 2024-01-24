import { ICreateRawTxResp, ICreateTxResp, IKeyPairInfo, Inscription, UTXO } from "./types";
import BigNumber from "bignumber.js";
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
declare const createRawTxWithLockTime: ({ keyPairInfo, utxos, inscriptions, sendInscriptionID, receiverInsAddress, receiverPubKey, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, lockTime, sequence, }: {
    keyPairInfo: IKeyPairInfo;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    receiverPubKey: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    isUseInscriptionPayFeeParam: boolean;
    lockTime: number;
    sequence?: number | undefined;
}) => ICreateRawTxResp;
declare const createTxSpendLockTimeOutput: ({ keyPairInfo, utxo, utxos, lockTime, receiverAddress, sequence, }: {
    keyPairInfo: IKeyPairInfo;
    utxo: UTXO;
    utxos: UTXO[];
    lockTime: number;
    receiverAddress: string;
    sequence?: number | undefined;
}) => {
    txHex: string;
    txID: string;
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
declare const createTxWithLockTime: ({ senderPrivateKey, senderAddress, utxos, inscriptions, sendInscriptionID, receiverInsAddress, receiverPubKey, sendAmount, feeRatePerByte, lockTime, isUseInscriptionPayFeeParam, sequence, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    receiverPubKey: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    lockTime: number;
    isUseInscriptionPayFeeParam?: boolean | undefined;
    sequence?: number | undefined;
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
declare const createTxSpendInputWithLockTime: ({ senderPrivateKey, senderAddress, utxo, utxos, inscriptions, receiverAddress, sendAmount, feeRatePerByte, lockTime, isUseInscriptionPayFeeParam, sequence, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxo: UTXO;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    receiverAddress: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    lockTime: number;
    isUseInscriptionPayFeeParam?: boolean | undefined;
    sequence?: number | undefined;
}) => {
    txID: string;
    txHex: string;
};
declare function TestTx(): void;
export { createRawTxWithLockTime, createTxSpendLockTimeOutput, createTxWithLockTime, createTxSpendInputWithLockTime, TestTx, };
