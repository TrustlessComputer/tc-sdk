import BigNumber from "bignumber.js";
interface TCTxDetail {
    Nonce: number;
    GasPrice: number;
    Gas: number;
    To: string;
    Value: number;
    Input: any;
    V: number;
    R: BigNumber;
    S: BigNumber;
    Hash: string;
    From: string;
    Type: number;
}
interface BatchInscribeTxResp {
    tcTxIDs: string[];
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
}
interface GetTxByHashResp {
    blockHash: string;
    blockNumber: string;
    transactionIndex: string;
    hash: string;
}
export { TCTxDetail, BatchInscribeTxResp, GetTxByHashResp };
