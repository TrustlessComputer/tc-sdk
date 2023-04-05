import { ERROR_CODE, ERROR_MESSAGE } from "../constants/error";
import axios, { AxiosResponse } from "axios";

import SDKError from "../constants/error";
import { stringify } from "json5";

const Mainnet = "mainnet";
const Testnet = "testnet";
const Regtest = "regtest";

const SupportedTCNetworkType = [Mainnet, Testnet, Regtest];

const DefaultEndpointTCNodeTestnet = "";
const DefaultEndpointTCNodeMainnet = "";
const DefaultEndpointTCNodeRegtest = "http://139.162.54.236:22225";

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

    // client: any = new JSONRPCClient((jsonRPCRequest) =>
    //     fetch(this.url, {
    //         method: "POST",
    //         headers: {
    //             "content-type": "application/json",
    //         },
    //         body: JSON.stringify(jsonRPCRequest),
    //     }).then((response) => {
    //         console.log("response: ", response);
    //         if (response.status === 200) {
    //             // Use client.receive when you received a JSON-RPC response.
    //             return response
    //                 .json()
    //                 .then((jsonRPCResponse) => this.client.receive(jsonRPCResponse));
    //         } else if (jsonRPCRequest.id !== undefined) {
    //             return Promise.reject(new Error(response.statusText));
    //         }
    //     })
    // );

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

        const response: AxiosResponse = await client.post("",
            JSON.stringify(dataReq),
            {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
            });


        const { status, data } = response;
        if (status !== 200) {
            throw new SDKError(ERROR_CODE.RPC_ERROR, data);
        }

        console.log("data: ", typeof (data));
        console.log("data: ", data.result);

        const dataResp = JSON.parse(data);
        console.log("dataResp: ", dataResp);

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

        let gasPrice = Number(strs[1]);
        if (gasPrice !== -1) {
            gasPrice++;
        }

        return {
            nonce: Number(strs[0]),
            gasPrice,
        };
    };

    // submitInscribeTx submits btc tx into TC node and then it will broadcast txs to Bitcoin fullnode
    submitInscribeTx = async (btcTxHex: string): Promise<{ btcTxID: string }> => {
        const payload = {
            btcTx: btcTxHex
        };
        const resp = await this.callRequest(payload, MethodPost, "eth_submitBitcoinTx");
        console.log("Resp eth_submitBitcoinTx: ", resp);

        if (resp === "") {
            throw new SDKError(ERROR_CODE.RPC_GET_INSCRIBEABLE_INFO_ERROR, "response is empty");
        }

        return {
            btcTxID: resp,
        };
    };
}


export {
    TcClient,
    Mainnet,
    Testnet,
    Regtest,
};

// function fetch(arg0: string, arg1: { method: string; headers: { "content-type": string; }; body: string; }) {
//     throw new Error("Function not implemented.");
// }
