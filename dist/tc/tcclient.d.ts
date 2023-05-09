import { GetPendingInscribeTxsResp, GetTxByHashResp, TCTxDetail } from "./types";
declare const Mainnet = "mainnet";
declare const Testnet = "testnet";
declare const Regtest = "regtest";
declare class TcClient {
    url: string;
    network: string;
    constructor(network: string, url: string);
    constructor(network: string);
    callRequest: (payload: any, methodType: string, method: string) => Promise<any>;
    getNonceInscribeable: (tcAddress: string) => Promise<{
        nonce: number;
        gasPrice: number;
    }>;
    submitInscribeTx: (btcTxHex: string[]) => Promise<{
        btcTxID: string[];
    }>;
    getTapScriptInfo: (hashLockPubKey: string, tcTxIDs: string[]) => Promise<{
        hashLockScriptHex: string;
    }>;
    getUnInscribedTransactionByAddress: (tcAddress: string) => Promise<{
        unInscribedTxIDs: string[];
    }>;
    getUnInscribedTransactionDetailByAddress: (tcAddress: string) => Promise<{
        unInscribedTxDetails: TCTxDetail[];
    }>;
    getTCTxByHash: (tcTxID: string) => Promise<GetTxByHashResp>;
    getTCTxReceipt: (tcTxID: string) => Promise<any>;
    getPendingInscribeTxs: (tcAddress: string) => Promise<any[]>;
    getPendingInscribeTxsDetail: (tcAddress: string) => Promise<GetPendingInscribeTxsResp[]>;
}
export { TcClient, Mainnet, Testnet, Regtest, };
