import { UTXO } from "../bitcoin";
import BigNumber from "bignumber.js";
export declare const getUTXOsFromBlockStream: (btcAddress: string) => Promise<UTXO[]>;
export declare const getTxFromBlockStream: (txID: string) => Promise<any>;
export declare const getOutputCoinValue: (txID: string, voutIndex: number) => Promise<BigNumber>;
