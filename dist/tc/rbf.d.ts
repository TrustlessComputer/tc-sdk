import { Inscription, TcClient, UTXO } from "..";
import BigNumber from "bignumber.js";
declare const replaceByFeeInscribeTx: ({ senderPrivateKey, utxos, inscriptions, revealTxID, feeRatePerByte, tcClient, tcAddress, btcAddress, }: {
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
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    newUTXOs: UTXO[];
}>;
export { replaceByFeeInscribeTx };
