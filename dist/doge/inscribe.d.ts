import BigNumber from "bignumber.js";
import { DUTXO } from "./types";
declare function broadcastDogeTx(txHex: string): Promise<any>;
declare const createInscribeTxs: ({ network, senderPrivKey, senderAddress, receiverAddress, data, contentType, utxos, feeRate, rpcEndpoint, }: {
    network: number;
    senderPrivKey: string;
    senderAddress: string;
    receiverAddress: string;
    data: Buffer;
    contentType: string;
    utxos: DUTXO[];
    feeRate?: number | undefined;
    rpcEndpoint?: string | undefined;
}) => Promise<{
    txIDs: string[];
    txHexes: string[];
    totalNetworkFee: BigNumber;
}>;
export { createInscribeTxs as dogeCreateInscribeTxs, broadcastDogeTx, };
