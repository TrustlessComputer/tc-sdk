import BigNumber from "bignumber.js";
declare const createScripts: (data: Buffer, encodeVersion: number, protocolID: string) => Buffer[];
declare const createInscribeTxs: ({ senderSeed, receiverAddress, amount, data, encodeVersion, protocolID, fee, rpcEndpoint, }: {
    senderSeed: string;
    receiverAddress: string;
    amount: BigNumber;
    data: Buffer;
    encodeVersion: number;
    protocolID: string;
    fee?: BigNumber | undefined;
    rpcEndpoint: string;
}) => Promise<{
    txIDs: string[];
    totalNetworkFee: BigNumber;
}>;
export { createScripts, createInscribeTxs, };
