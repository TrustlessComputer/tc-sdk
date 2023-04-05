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
    submitInscribeTx: (btcTxHex: string) => Promise<{
        btcTxID: string;
    }>;
}
export { TcClient, Mainnet, Testnet, Regtest, };
