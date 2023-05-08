import { BlockStreamURL, UTXO } from "../bitcoin";

import axios from "axios";

export const getUTXOsFromBlockStream = async (btcAddress: string): Promise<UTXO[]> => {
    if (!btcAddress) return [];
    try {
        // https://blockstream.regtest.trustless.computer/regtest/api/address/bcrt1p7vs2w9cyeqpc7ktzuqnm9qxmtng5cethgh66ykjz9uhdaz0arpfq93cr3a/txs
        const res: any = await axios.get(`${BlockStreamURL}/address/${btcAddress}/txs`);
        console.log(res);

        const utxos: UTXO[] = [];
        for (const item of res) {
            // utxos.push({
            //     tx_hash: item.
            // })

        }

        return utxos;
    } catch (err) {
        return [];
    }
};