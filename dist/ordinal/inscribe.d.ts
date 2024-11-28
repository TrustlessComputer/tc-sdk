import { Inscription, UTXO } from "../";
import { payments } from "bitcoinjs-lib";
import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
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
declare const createInscribeTx: ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, data, sequence, isSelectUTXOs, metaProtocol, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    data: string;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
    metaProtocol?: string | undefined;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    newUTXOs: UTXO[];
}>;
declare const createRawRevealTx: ({ commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee, address, sequence, }: {
    commitTxID: string;
    hashLockKeyPair: ECPairInterface;
    hashLockRedeem: any;
    script_p2tr: payments.Payment;
    revealTxFee: number;
    address: string;
    sequence?: number | undefined;
}) => {
    revealTxHex: string;
    revealTxID: string;
};
declare const getNumberHex: ({ n, expectedLen, }: {
    n: number;
    expectedLen?: number | undefined;
}) => string;
declare function getRevealVirtualSize(hash_lock_redeem: any, script_p2tr: any, p2pktr_addr: any, hash_lock_keypair: any): number;
export { createInscribeTx, getNumberHex, createRawRevealTx, getRevealVirtualSize, };
