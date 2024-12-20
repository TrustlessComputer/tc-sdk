import { Client, Memo } from "xrpl";
import BigNumber from 'bignumber.js';
declare const XRPL_WSC_TESTNET = "wss://s.altnet.rippletest.net:51233";
declare const XRPL_WSC_MAINNET = "wss://xrpl.ws";
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
declare const createRawRippleTransaction: ({ client, wallet, receiverAddress, amount, memos, fee, sequence, curLedgerHeight, }: {
    client: Client;
    wallet: any;
    receiverAddress: string;
    amount: BigNumber;
    memos?: Memo[] | undefined;
    fee?: BigNumber | undefined;
    sequence?: number | undefined;
    curLedgerHeight: number;
}) => Promise<any>;
export { generateXRPWallet, createRippleTransaction, createRawRippleTransaction, XRPL_WSC_TESTNET, XRPL_WSC_MAINNET, };
