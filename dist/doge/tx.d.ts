import BigNumber from "bignumber.js";
import { DUTXO } from "./types";
declare const createSendDogeTx: ({ network, senderPrivKey, senderAddress, receiverAddress, amount, utxos, feeRate, rpcEndpoint, }: {
    network: number;
    senderPrivKey: string;
    senderAddress: string;
    receiverAddress: string;
    amount: BigNumber;
    utxos: DUTXO[];
    feeRate?: number | undefined;
    rpcEndpoint?: string | undefined;
}) => Promise<{
    txID: string;
    txHex: string;
    networkFee: BigNumber;
}>;
declare const createSendDogeTxV2: ({ network, senderPrivKey, senderAddress, receiverAddress, amount, utxos, feeRate, rpcEndpoint, }: {
    network: number;
    senderPrivKey: string;
    senderAddress: string;
    receiverAddress: string;
    amount: BigNumber;
    utxos: DUTXO[];
    feeRate?: number | undefined;
    rpcEndpoint?: string | undefined;
}) => Promise<{
    txID: string;
    txHex: string;
    networkFee: BigNumber;
}>;
export { createSendDogeTx, createSendDogeTxV2, };
