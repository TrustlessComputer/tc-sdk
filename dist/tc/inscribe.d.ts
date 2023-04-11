import { Inscription, TcClient, UTXO } from "..";
import { payments } from "bitcoinjs-lib";
import { Tapleaf } from "bitcoinjs-lib/src/types";
import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
declare const createRawRevealTx: ({ internalPubKey, commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee }: {
    internalPubKey: Buffer;
    commitTxID: string;
    hashLockKeyPair: ECPairInterface;
    hashLockRedeem: any;
    script_p2tr: payments.Payment;
    revealTxFee: number;
}) => {
    revealTxHex: string;
    revealTxID: string;
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
declare const createInscribeTx: ({ senderPrivateKey, utxos, inscriptions, tcTxIDs, feeRatePerByte, tcClient, }: {
    senderPrivateKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    tcTxIDs: string[];
    feeRatePerByte: number;
    tcClient: TcClient;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
}>;
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
declare const createInscribeTxFromAnyWallet: ({ pubKey, utxos, inscriptions, tcTxIDs, feeRatePerByte, tcClient, cancelFn }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    tcTxIDs: string[];
    feeRatePerByte: number;
    tcClient: TcClient;
    cancelFn: () => void;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
}>;
declare const createLockScript: ({ internalPubKey, tcTxIDs, tcClient, }: {
    internalPubKey: Buffer;
    tcTxIDs: string[];
    tcClient: TcClient;
}) => Promise<{
    hashLockKeyPair: ECPairInterface;
    hashLockScript: Buffer;
    hashLockRedeem: Tapleaf;
    script_p2tr: payments.Payment;
}>;
/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param tcTxSizeByte size of tc tx (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
declare const estimateInscribeFee: ({ tcTxSizeByte, feeRatePerByte, }: {
    tcTxSizeByte: number;
    feeRatePerByte: number;
}) => {
    totalFee: BigNumber;
};
export { createRawRevealTx, createInscribeTx, createInscribeTxFromAnyWallet, estimateInscribeFee, createLockScript };
