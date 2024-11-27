import { Inscription, UTXO } from "../";
import BigNumber from "bignumber.js";
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
declare const createInscribeTxGeneral: ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, data, contentType, sequence, isSelectUTXOs, metaProtocol, parentInscTxID, parentInscTxIndex, parentUTXO, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    data: Buffer;
    contentType: string;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
    metaProtocol?: string | undefined;
    parentInscTxID?: string | undefined;
    parentInscTxIndex?: number | undefined;
    parentUTXO?: UTXO | undefined;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    newUTXOs: UTXO[];
}>;
export { createInscribeTxGeneral };
