import SDKError, { ERROR_CODE } from "../constants/error";

import { BNZero } from "../bitcoin";
import BigNumber from "bignumber.js";
import { TcClient } from "./tcclient";
import { UTXO } from "../bitcoin/types";
import { getUTXOsFromBlockStream } from "./blockstream";

const ServiceGetUTXOType = {
    BlockStream: 1,
    Mempool: 2,
};

/**
* getUTXOs get UTXOs to create txs. 
* the result was filtered spending UTXOs in Bitcoin mempool and spending UTXOs was used for pending txs in TC node.
* dont include incomming UTXOs
* @param btcAddress bitcoin address
* @param serviceType service is used to get UTXOs, default is BlockStream
* @returns list of UTXOs
*/
const getUTXOs = async ({
    btcAddress,
    tcAddress,
    tcClient,
    serviceType = ServiceGetUTXOType.BlockStream,
}: {
    btcAddress: string,
    tcAddress: string,
    tcClient: TcClient,
    serviceType?: number,
}): Promise<{ availableUTXOs: UTXO[], incomingUTXOs: UTXO[], availableBalance: BigNumber, incomingBalance: BigNumber }> => {
    let availableUTXOs: UTXO[] = [];
    const incomingUTXOs: UTXO[] = [];
    let incomingUTXOsTmp: UTXO[] = [];

    switch (serviceType) {
        case ServiceGetUTXOType.BlockStream: {
            availableUTXOs = await getUTXOsFromBlockStream(btcAddress, true);
            // get list incoming utxos
            incomingUTXOsTmp = await getUTXOsFromBlockStream(btcAddress, false);

            break;
            // utxos = await aggregateUTXOs({ tcAddress, btcAddress, utxos, tcClient });
            // let availableBalance = BNZero;
            // for (const utxo of utxos) {
            //     availableBalance = availableBalance.plus(utxo.value);
            // }


            // const incomingBalance = BNZero;
            // return { utxos, availableBalance, incomingBalance };
        }
        case ServiceGetUTXOType.Mempool: {
            // TODO: 2525
            availableUTXOs = await getUTXOsFromBlockStream(btcAddress, true);
            // get list incoming utxos
            incomingUTXOsTmp = await getUTXOsFromBlockStream(btcAddress, false);
            break;
            // utxos = await aggregateUTXOs({ tcAddress, btcAddress, utxos, tcClient });
            // let availableBalance = BNZero;
            // for (const utxo of utxos) {
            //     availableBalance = availableBalance.plus(utxo.value);
            // }
            // const incomingBalance = BNZero;
            // return { utxos, availableBalance, incomingBalance };
        }
        default: {
            throw new SDKError(ERROR_CODE.INVALID_CODE, "Invalid service type");
        }
    }

    // get utxo info from tc node of tc address
    const { pendingUTXOs, incomingUTXOs: incommingUTXOsFromTCNode } = await tcClient.getUTXOsInfoByTcAddress({ tcAddress, btcAddress, tcClient });

    // filter pending UTXOs from TC node
    for (const utxo of availableUTXOs) {
        const foundIndex = pendingUTXOs.findIndex((pendingUTXO) => {
            return pendingUTXO.tx_hash === utxo.tx_hash && pendingUTXO.tx_output_n === utxo.tx_output_n;
        });
        if (foundIndex !== -1) {
            availableUTXOs.splice(foundIndex, 1);
        }
    }

    incomingUTXOsTmp.push(...incommingUTXOsFromTCNode);

    const ids: string[] = [];
    for (const utxo of incomingUTXOsTmp) {
        const id = utxo.tx_hash + ":" + utxo.tx_output_n;
        if (
            // duplicate incoming utxos
            ids.findIndex((idTmp) => idTmp === id) !== -1 ||
            // found in pending UTXOs
            pendingUTXOs.findIndex((pendingUTXO) => {
                return pendingUTXO.tx_hash === utxo.tx_hash && pendingUTXO.tx_output_n === utxo.tx_output_n;
            }) !== -1
        ) {
            continue;
        } else {
            incomingUTXOs.push(utxo);
            ids.push(id);
        }
    }

    // calculate balance
    let availableBalance = BNZero;
    for (const utxo of availableUTXOs) {
        availableBalance = availableBalance.plus(utxo.value);
    }
    let incomingBalance = BNZero;
    for (const utxo of incomingUTXOs) {
        incomingBalance = incomingBalance.plus(utxo.value);
    }

    return { availableUTXOs, incomingUTXOs, availableBalance, incomingBalance };
};

export {
    ServiceGetUTXOType,
    getUTXOs,
};