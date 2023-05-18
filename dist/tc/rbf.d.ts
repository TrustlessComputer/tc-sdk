import { Inscription, UTXO } from "..";
import BigNumber from "bignumber.js";
declare const replaceByFeeInscribeTx: ({ senderPrivateKey, senderAddress, utxos, inscriptions, revealTxID, feeRatePerByte, tcAddress, btcAddress, sequence, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    revealTxID: string;
    feeRatePerByte: number;
    tcAddress: string;
    btcAddress: string;
    sequence?: number | undefined;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    newUTXOs: UTXO[];
}>;
declare const isRBFable: ({ revealTxID, tcAddress, btcAddress, }: {
    revealTxID: string;
    tcAddress: string;
    btcAddress: string;
}) => Promise<{
    isRBFable: boolean;
    oldFeeRate: number;
    minSat: number;
}>;
export { replaceByFeeInscribeTx, isRBFable, };
