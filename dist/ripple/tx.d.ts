import { Client, Memo } from "xrpl";
import BigNumber from 'bignumber.js';
declare const generateXRPWallet: (seed: string) => void;
declare const createRippleTransaction: ({ client, wallet, receiverAddress, amount, memos, fee, rpcEndpoint, sequence, isWait, }: {
    client: Client;
    wallet: any;
    receiverAddress: string;
    amount: BigNumber;
    memos?: Memo[] | undefined;
    fee?: BigNumber | undefined;
    rpcEndpoint: string;
    sequence?: number | undefined;
    isWait?: boolean | undefined;
}) => Promise<{
    txID: string;
    txFee: string;
}>;
declare const createRawRippleTransaction: ({ client, wallet, receiverAddress, amount, memos, fee, sequence, }: {
    client: Client;
    wallet: any;
    receiverAddress: string;
    amount: BigNumber;
    memos?: Memo[] | undefined;
    fee?: BigNumber | undefined;
    sequence?: number | undefined;
}) => Promise<any>;
export { generateXRPWallet, createRippleTransaction, createRawRippleTransaction, };
