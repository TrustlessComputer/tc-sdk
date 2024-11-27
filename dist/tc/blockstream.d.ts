import { UTXO } from "../bitcoin";
import BigNumber from "bignumber.js";
/**
* getUTXOsFromBlockStream get UTXOs from Blockstream service.
* the result was filtered spending UTXOs in Bitcoin mempool.
* @param btcAddress bitcoin address
* @param isConfirmed filter UTXOs by confirmed or not
* @returns list of UTXOs
*/
export declare const getUTXOsFromBlockStream: (btcAddress: string, isConfirmed: boolean) => Promise<UTXO[]>;
export declare const getTxFromBlockStream: (txID: string) => Promise<any>;
export declare const getOutputCoinValue: (txID: string, voutIndex: number) => Promise<BigNumber>;
export declare const getRuneBalance: (btcAddress: string) => Promise<BigNumber>;
export declare const getRuneBalanceByRuneID: (btcAddress: string, runeID: string) => Promise<BigNumber>;
