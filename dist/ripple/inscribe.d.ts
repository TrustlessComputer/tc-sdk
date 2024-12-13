import BigNumber from "bignumber.js";
declare const createScripts: (data: Buffer, encodeVersion: number) => Buffer[];
declare const createInscribeTxs: ({ senderSeed, receiverAddress, amount, data, encodeVersion, fee, }: {
    senderSeed: string;
    receiverAddress: string;
    amount: BigNumber;
    data: Buffer;
    encodeVersion: number;
    fee?: BigNumber | undefined;
}) => Promise<{
    txIDs: string[];
    totalNetworkFee: BigNumber;
}>;
export { createScripts, createInscribeTxs, };
