import BigNumber from "bignumber.js";
import { TcClient } from "./tcclient";
import { UTXO } from "../bitcoin/types";
declare const ServiceGetUTXOType: {
    BlockStream: number;
    Mempool: number;
};
/**
* getUTXOs get UTXOs to create txs.
* the result was filtered spending UTXOs in Bitcoin mempool and spending UTXOs was used for pending txs in TC node.
* dont include incomming UTXOs
* @param btcAddress bitcoin address
* @param serviceType service is used to get UTXOs, default is BlockStream
* @returns list of UTXOs
*/
declare const getUTXOs: ({ btcAddress, tcAddress, tcClient, serviceType, }: {
    btcAddress: string;
    tcAddress: string;
    tcClient: TcClient;
    serviceType?: number | undefined;
}) => Promise<{
    availableUTXOs: UTXO[];
    incomingUTXOs: UTXO[];
    availableBalance: BigNumber;
    incomingBalance: BigNumber;
}>;
export { ServiceGetUTXOType, getUTXOs, };
