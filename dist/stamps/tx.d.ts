import { Inscription, UTXO } from "../";
import BigNumber from "bignumber.js";
/**
* createTransferSRC20Tx creates commit and reveal tx to inscribe data on Bitcoin netword.
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
declare const createTransferSRC20Tx: ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, receiverAddress, data, sequence, isSelectUTXOs, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    receiverAddress: string;
    data: string;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
}) => Promise<{
    txHex: string;
    txID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    changeAmount: BigNumber;
}>;
declare const addZeroTrail: (hexStr: string) => string;
/**
* createTransferSRC20Script creates multisig for transfer src20.
* @param secretKey tx ID of vin[0]
* @returns scripts
*/
declare const createTransferSRC20Script: ({ secretKey, data, }: {
    secretKey: string;
    data: string;
}) => Buffer[];
export { createTransferSRC20Tx, createTransferSRC20Script, addZeroTrail, };
