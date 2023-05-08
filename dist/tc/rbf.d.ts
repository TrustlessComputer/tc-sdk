import { Inscription, TcClient, UTXO } from "..";
import BigNumber from "bignumber.js";
declare const replaceByFeeInscribeTx: ({ senderPrivateKey, utxos, inscriptions, revealTxID, feeRatePerByte, tcClient, tcAddress, btcAddress, sequence, }: {
    senderPrivateKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    revealTxID: string;
    feeRatePerByte: number;
    tcClient: TcClient;
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
declare const isRBFable: ({ revealTxID, tcClient, tcAddress, btcAddress, }: {
    revealTxID: string;
    tcClient: TcClient;
    tcAddress: string;
    btcAddress: string;
}) => Promise<{
    isRBFable: boolean;
    oldFeeRate: number;
    minSat: number;
}>;
export { replaceByFeeInscribeTx, isRBFable, };
