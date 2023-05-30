import { Psbt, Transaction, payments } from "bitcoinjs-lib";
import BigNumber from "bignumber.js";
import { ECPairInterface } from "ecpair";
interface UTXO {
    tx_hash: string;
    tx_output_n: number;
    value: BigNumber;
}
interface Inscription {
    offset: BigNumber;
    id: string;
}
interface ICreateTxResp {
    tx: Transaction;
    txID: string;
    txHex: string;
    fee: BigNumber;
    selectedUTXOs: UTXO[];
    changeAmount: BigNumber;
}
interface ICreateRawTxResp {
    base64Psbt: string;
    fee: BigNumber;
    selectedUTXOs: UTXO[];
    changeAmount: BigNumber;
    indicesToSign: number[];
}
interface ICreateTxBuyResp {
    tx: Transaction;
    txID: string;
    txHex: string;
    fee: BigNumber;
    selectedUTXOs: UTXO[];
    splitTxID: string;
    splitUTXOs: UTXO[];
    splitTxRaw: string;
}
interface ICreateTxSellResp {
    base64Psbt: string;
    selectedUTXOs: UTXO[];
    splitTxID: string;
    splitUTXOs: UTXO[];
    splitTxRaw: string;
}
interface ICreateTxSplitInscriptionResp {
    txID: string;
    txHex: string;
    fee: BigNumber;
    selectedUTXOs: UTXO[];
    newValueInscription: BigNumber;
}
interface BuyReqInfo {
    sellerSignedPsbtB64: string;
    receiverInscriptionAddress: string;
    price: BigNumber;
}
interface BuyReqFullInfo extends BuyReqInfo {
    sellerSignedPsbt: Psbt;
    valueInscription: BigNumber;
    paymentUTXO: any;
}
interface PaymentInfo {
    address: string;
    amount: BigNumber;
}
interface Wallet {
    privKey: string;
}
interface ISignPSBTResp {
    signedBase64PSBT: string;
    msgTxHex: string;
    msgTxID: string;
    msgTx: Transaction;
}
interface NeedPaymentUTXO {
    buyInfoIndex: number;
    amount: BigNumber;
}
interface IKeyPairInfo {
    address: string;
    addressType: number;
    keyPair: ECPairInterface;
    payment: payments.Payment;
    signer: any;
    sigHashTypeDefault: number;
}
export { UTXO, Inscription, ICreateTxResp, ICreateRawTxResp, ICreateTxSplitInscriptionResp, ICreateTxBuyResp, ICreateTxSellResp, BuyReqInfo, PaymentInfo, BuyReqFullInfo, Wallet, ISignPSBTResp, NeedPaymentUTXO, IKeyPairInfo, };
