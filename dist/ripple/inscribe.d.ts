import BigNumber from "bignumber.js";
declare const createScripts: (data: Buffer) => Buffer[];
declare const createInscribeTxs: ({ senderSeed, receiverAddress, amount, data, fee, }: {
    senderSeed: string;
    receiverAddress: string;
    amount: BigNumber;
    data: Buffer;
    fee?: BigNumber | undefined;
}) => Promise<{
    txIDs: string[];
    totalNetworkFee: BigNumber;
}>;
export { createScripts, createInscribeTxs, };
