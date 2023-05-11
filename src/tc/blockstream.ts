import { BlockStreamURL, UTXO } from "../bitcoin";
import SDKError, { ERROR_CODE } from "../constants/error";

import BigNumber from "bignumber.js";
import { UTXOFromBlockStream } from "./types";
import axios from "axios";

/**
* getUTXOsFromBlockStream get UTXOs from Blockstream service. 
* the result was filtered spending UTXOs in Bitcoin mempool.
* @param btcAddress bitcoin address
* @param isConfirmed filter UTXOs by confirmed or not
* @returns list of UTXOs
*/
export const getUTXOsFromBlockStream = async (btcAddress: string, isConfirmed: boolean): Promise<UTXO[]> => {
    // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
    const res = await axios.get(`${BlockStreamURL}/address/${btcAddress}/utxo`);
    const data: UTXOFromBlockStream[] = res.data;

    const utxos: UTXO[] = [];
    for (const item of data) {
        if ((isConfirmed && !item.status?.confirmed) || (!isConfirmed && item.status?.confirmed)) {
            continue;
        }
        utxos.push({
            tx_hash: item.txid,
            tx_output_n: item.vout,
            value: new BigNumber(item.value)
        });
    }

    return utxos;

};

export const getTxFromBlockStream = async (txID: string) => {
    // if (!txID) return [];
    // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs


    const res: any = await axios.get(`${BlockStreamURL}/tx/${txID}`);
    return res.data;
};


export const getOutputCoinValue = async (txID: string, voutIndex: number): Promise<BigNumber> => {
    const tx = await getTxFromBlockStream(txID);
    if (voutIndex >= tx.vout.length) {
        throw new SDKError(ERROR_CODE.INVALID_PARAMS);
    }

    return new BigNumber(tx.vout[voutIndex].value);
};
