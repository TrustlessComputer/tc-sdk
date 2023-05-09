import { BlockStreamURL, UTXO } from "../bitcoin";
import SDKError, { ERROR_CODE } from "../constants/error";

import BigNumber from "bignumber.js";
import axios from "axios";
import varuint from 'varuint-bitcoin';

export const getUTXOsFromBlockStream = async (btcAddress: string): Promise<UTXO[]> => {
    if (!btcAddress) return [];
    try {
        // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
        const res: any = await axios.get(`${BlockStreamURL}/address/${btcAddress}/utxo`);
        console.log(res);

        const utxos: UTXO[] = [];
        for (const item of res) {

            utxos.push({
                tx_hash: item.txid,
                tx_output_n: item.vout,
                value: new BigNumber(item.value)
            });

        }

        return utxos;
    } catch (err) {
        return [];
    }
};

export const getTxFromBlockStream = async (txID: string) => {
    // if (!txID) return [];
    // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
    console.log("URL: ", `${BlockStreamURL}/tx/${txID}`);

    const res: any = await axios.get(`${BlockStreamURL}/tx/${txID}`);

    console.log(res);

    // const utxos: UTXO[] = [];
    // for (const item of res) {

    //     utxos.push({
    //         tx_hash: item.txid,
    //         tx_output_n: item.vout,
    //         value: new BigNumber(item.value)
    //     });

    // }

    return res.data;
};


export const getOutputCoinValue = async (txID: string, voutIndex: number): Promise<BigNumber> => {
    // if (!txID) return [];
    // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
    // console.log("URL: ", `${BlockStreamURL}/tx/${txID}`);

    // const res: any = await axios.get(`${BlockStreamURL}/tx/${txID}`);

    // console.log(res);


    const tx = await getTxFromBlockStream(txID);
    if (voutIndex >= tx.vout.length) {
        throw new SDKError(ERROR_CODE.INVALID_PARAMS);
    }
    // console.log("HHH: ", tx.vout[voutIndex]);

    // const utxos: UTXO[] = [];
    // for (const item of res) {

    //     utxos.push({
    //         tx_hash: item.txid,
    //         tx_output_n: item.vout,
    //         value: new BigNumber(item.value)
    //     });

    // }

    return new BigNumber(tx.vout[voutIndex].value);
};
