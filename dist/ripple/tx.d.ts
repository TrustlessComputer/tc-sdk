import { Memo } from "xrpl";
import BigNumber from 'bignumber.js';
declare const generateXRPWallet: (seed: string) => void;
declare const createRippleTransaction: ({ wallet, receiverAddress, amount, memos, fee, }: {
    wallet: any;
    receiverAddress: string;
    amount: BigNumber;
    memos?: Memo[] | undefined;
    fee?: BigNumber | undefined;
}) => Promise<{
    txID: string;
    txFee: string;
}>;
export { generateXRPWallet, createRippleTransaction, };
