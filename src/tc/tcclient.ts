import { BNZero, UTXO } from "../bitcoin";
import { ERROR_CODE, ERROR_MESSAGE } from "../constants/error";
import { GetPendingInscribeTxsResp, GetTxByHashResp, TCTxDetail } from "./types";
import axios, { AxiosResponse } from "axios";

import BigNumber from "bignumber.js";
import SDKError from "../constants/error";
import { increaseGasPrice } from "./utils";

const Mainnet = "mainnet";
const Testnet = "testnet";
const Regtest = "regtest";

const SupportedTCNetworkType = [Mainnet, Testnet, Regtest];

const DefaultEndpointTCNodeTestnet = "http://139.162.54.236:22225";
const DefaultEndpointTCNodeMainnet = "https://tc-node.trustless.computer";
const DefaultEndpointTCNodeRegtest = "https://tc-node-manual.regtest.trustless.computer";

const MethodGet = "GET";
const MethodPost = "POST";


class TcClient {
    url: string = DefaultEndpointTCNodeMainnet;
    network: string = Mainnet;

    public constructor(network: string, url: string);
    public constructor(network: string);

    constructor(...params: any[]) {
        if (params.length === 0) {
            throw new SDKError(ERROR_CODE.INVALID_PARAMS);
        }

        // check network type
        if (!SupportedTCNetworkType.includes(params[0])) {
            throw new SDKError(ERROR_CODE.INVALID_NETWORK_TYPE);
        }
        this.network = params[0];

        if (params.length === 2) {
            this.url = params[1];
            return this;
        } else if (params.length === 1) {
            switch (this.network) {
                case Mainnet: {
                    this.url = DefaultEndpointTCNodeMainnet;
                    return this;
                }
                case Testnet: {
                    this.url = DefaultEndpointTCNodeTestnet;
                    return this;
                }
                case Regtest: {
                    this.url = DefaultEndpointTCNodeRegtest;
                    return this;
                }
            }
        }
    }

    callRequest = async (payload: any, methodType: string, method: string) => {
        // JSONRPCClient needs to know how to send a JSON-RPC request.
        // Tell it by passing a function to its constructor. The function must take a JSON-RPC request and send it.

        const client = new axios.Axios({
            baseURL: this.url
        });

        const dataReq = {
            jsonrpc: "2.0",
            id: + new Date(),
            method: method,
            params: payload,
        };

        console.log("Data req: ", dataReq);

        const response: AxiosResponse = await client.post("",
            JSON.stringify(dataReq),
            {
                headers: {
                    "Content-Type": "application/json",
                },
            });

        const { status, data } = response;
        console.log("data from response: ", data);
        if (status !== 200) {
            throw new SDKError(ERROR_CODE.RPC_ERROR, data);
        }

        const dataResp = JSON.parse(data);
        console.log("Data resp: ", dataResp);


        if (dataResp.error || !dataResp.result) {
            throw new SDKError(ERROR_CODE.RPC_ERROR, data.error);
        }

        return dataResp.result;
    };

    // call to tc node to get inscribeable nonce and gas price (if need to replace previous orphan tx(s))
    getNonceInscribeable = async (tcAddress: string): Promise<{ nonce: number, gasPrice: number }> => {
        const payload = [tcAddress];

        const resp = await this.callRequest(payload, MethodPost, "eth_getInscribableInfo");
        console.log("Resp getNonceInscribeable: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_INSCRIBEABLE_INFO_ERROR, "response is empty");
        }

        const strs = resp.split(":");
        console.log("strs: ", strs);
        if (strs.length !== 2) {
            throw new SDKError(ERROR_CODE.RPC_GET_INSCRIBEABLE_INFO_ERROR, "response is invalid");
        }

        const gasPrice = new BigNumber(strs[1]);

        let gasPriceRes: number;
        if (gasPrice.eq(BNZero)) {
            gasPriceRes = -1;
        } else {
            gasPriceRes = increaseGasPrice(gasPrice).toNumber();
        }
        return {
            nonce: Number(strs[0]),
            gasPrice: gasPriceRes,
        };
    };

    // submitInscribeTx submits btc tx into TC node and then it will broadcast txs to Bitcoin fullnode
    submitInscribeTx = async (btcTxHex: string[],): Promise<{ btcTxID: string[] }> => {
        const payload = [btcTxHex];
        const resp = await this.callRequest(payload, MethodPost, "eth_submitBitcoinTx");
        console.log("Resp eth_submitBitcoinTx: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_INSCRIBEABLE_INFO_ERROR, "response is empty");
        }

        return {
            btcTxID: resp,
        };
    };

    // submitInscribeTx submits btc tx into TC node and then it will broadcast txs to Bitcoin fullnode
    getTapScriptInfo = async (hashLockPubKey: string, tcTxIDs: string[]): Promise<{ hashLockScriptHex: string, }> => {
        const payload = [hashLockPubKey, tcTxIDs];

        const resp = await this.callRequest(payload, MethodPost, "eth_getHashLockScript");
        console.log("Resp eth_getHashLockScript: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_TAPSCRIPT_INFO, "response is empty");
        }

        return {
            hashLockScriptHex: resp,
        };
    };

    // submitInscribeTx submits btc tx into TC node and then it will broadcast txs to Bitcoin fullnode
    getUnInscribedTransactionByAddress = async (tcAddress: string): Promise<{ unInscribedTxIDs: string[] }> => {
        const payload = [tcAddress];

        const resp = await this.callRequest(payload, MethodPost, "eth_getUnInscribedTransactionByAddress");
        console.log("Resp eth_getUnInscribedTransactionByAddress: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_TAPSCRIPT_INFO, "response is empty");
        }

        return {
            unInscribedTxIDs: resp,
        };
    };

    getUnInscribedTransactionDetailByAddress = async (tcAddress: string): Promise<{ unInscribedTxDetails: TCTxDetail[] }> => {
        const payload = [tcAddress];

        const resp = await this.callRequest(payload, MethodPost, "eth_getUnInscribedTransactionDetailByAddress");
        console.log("Resp getUnInscribedTransactionDetailByAddress: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_TAPSCRIPT_INFO, "response is empty");
        }
        const txDetails: TCTxDetail[] = [];

        console.log("resp: ", resp);

        for (const tx of resp) {
            txDetails.push({
                Nonce: tx.Nonce,
                GasPrice: tx.GasPrice,
                Gas: tx.Gas,
                To: tx.To,
                Value: tx.Value,
                Input: tx.Input,
                V: tx.V,
                R: new BigNumber(tx.R),
                S: new BigNumber(tx.S),
                Hash: tx.Hash,
                From: tx.From,
                Type: tx.Type,
            });
        }

        return {
            unInscribedTxDetails: txDetails,
        };
    };

    // getTCTxByHash get TC tx 
    getTCTxByHash = async (tcTxID: string): Promise<GetTxByHashResp> => {
        const payload = [tcTxID];

        const resp = await this.callRequest(payload, MethodPost, "eth_getTransactionByHash");
        console.log("Resp eth_getTransactionByHash: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_TAPSCRIPT_INFO, "response is empty");
        }

        if (resp.blockHash) {
            const receipt = await this.getTCTxReceipt(tcTxID);
            resp.status = receipt.status;
        }

        return resp;
    };

    // getTCTxReceipt get TC tx receipt
    getTCTxReceipt = async (tcTxID: string) => {
        const payload = [tcTxID];

        const resp = await this.callRequest(payload, MethodPost, "eth_getTransactionReceipt");
        console.log("Resp eth_getTransactionByHash: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_TAPSCRIPT_INFO, "response is empty");
        }

        return resp;
    };

    // getPendingInscribeTxs returns pending BTC inscribe txs in TC node (both broadcasted and holding)
    getPendingInscribeTxs = async (tcAddress: string) => {
        const payload = [tcAddress];

        const resp = await this.callRequest(payload, MethodPost, "eth_getPendingInscribedUTXOByAddress");
        console.log("Resp eth_getPendingInscribedUTXOByAddress: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_TAPSCRIPT_INFO, "response is empty");
        }

        const btcTx = [];
        for (const info of resp) {
            btcTx.push(info.Commit);
            btcTx.push(info.Reveal);
        }

        return btcTx;
    };

    // getPendingInscribeTxs returns pending BTC inscribe txs in TC node (both broadcasted and holding)
    getPendingInscribeTxsDetail = async (tcAddress: string): Promise<GetPendingInscribeTxsResp[]> => {
        const payload = [tcAddress];

        const resp = await this.callRequest(payload, MethodPost, "eth_getPendingInscribedUTXOByAddress");
        console.log("Resp eth_getPendingInscribedUTXOByAddress detail: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_TAPSCRIPT_INFO, "response is empty");
        }

        return resp;
    };
}


export {
    TcClient,
    Mainnet,
    Testnet,
    Regtest,
};
