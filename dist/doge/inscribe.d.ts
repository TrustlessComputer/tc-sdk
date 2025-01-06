import BigNumber from "bignumber.js";
import { DUTXO, DWallet } from "./types";
declare const setDogeNetwork: (netType: number) => void;
declare const fund: (wallet: DWallet, tx: any) => void;
declare const fund2: (wallet: DWallet, tx: any) => void;
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
    feeRate: number;
}>;
export { createInscribeTxs as dogeCreateInscribeTxs, broadcastDogeTx, setDogeNetwork, fund, fund2, };
