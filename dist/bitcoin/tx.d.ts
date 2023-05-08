import { BuyReqFullInfo, ICreateRawTxResp, ICreateTxResp, ICreateTxSplitInscriptionResp, ISignPSBTResp, Inscription, NeedPaymentUTXO, PaymentInfo, UTXO } from "./types";
import { selectUTXOs } from "./selectcoin";
import BigNumber from "bignumber.js";
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const signPSBT: ({ senderPrivateKey, psbtB64, indicesToSign, sigHashType }: {
    senderPrivateKey: Buffer;
    psbtB64: string;
    indicesToSign: number[];
    sigHashType?: number | undefined;
}) => ISignPSBTResp;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const signPSBT2: ({ senderPrivateKey, psbtB64, indicesToSign, sigHashType }: {
    senderPrivateKey: Buffer;
    psbtB64: string;
    indicesToSign: number[];
    sigHashType?: number | undefined;
}) => string;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createRawTxDummyUTXOForSale: ({ pubKey, utxos, inscriptions, sellInscriptionID, feeRatePerByte, }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sellInscriptionID: string;
    feeRatePerByte: number;
}) => {
    dummyUTXO: any;
    splitPsbtB64: string;
    indicesToSign: number[];
    selectedUTXOs: UTXO[];
    newValueInscription: BigNumber;
};
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createTx: (senderPrivateKey: Buffer, utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}, sendInscriptionID: string | undefined, receiverInsAddress: string, sendAmount: BigNumber, feeRatePerByte: number, isUseInscriptionPayFeeParam?: boolean) => ICreateTxResp;
/**
* createRawTx creates the raw Bitcoin transaction (including sending inscriptions), but don't sign tx.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param pubKey buffer public key of the sender (It is the internal pubkey for Taproot address)
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createRawTx: ({ pubKey, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    isUseInscriptionPayFeeParam: boolean;
}) => ICreateRawTxResp;
/**
* createTxFromAnyWallet creates the raw Bitcoin transaction (including sending inscriptions), but don't sign tx.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param pubKey buffer public key of the sender (It is the internal pubkey for Taproot address)
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createTxFromAnyWallet: ({ pubKey, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, walletType, cancelFn, }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    isUseInscriptionPayFeeParam: boolean;
    walletType?: number | undefined;
    cancelFn: () => void;
}) => Promise<ICreateTxResp>;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createTxSendBTC: ({ senderPrivateKey, utxos, inscriptions, paymentInfos, feeRatePerByte, sequence, isSelectUTXOs, }: {
    senderPrivateKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    paymentInfos: PaymentInfo[];
    feeRatePerByte: number;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
}) => ICreateTxResp;
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createRawTxSendBTC: ({ pubKey, utxos, inscriptions, paymentInfos, feeRatePerByte, }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    paymentInfos: PaymentInfo[];
    feeRatePerByte: number;
}) => ICreateRawTxResp;
/**
* createTxWithSpecificUTXOs creates the Bitcoin transaction with specific UTXOs (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* This function is used for testing.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount amount need to send (in sat)
* @param valueOutInscription inscription output's value (in sat)
* @param changeAmount cardinal change amount (in sat)
* @param fee transaction fee (in sat)
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createTxWithSpecificUTXOs: (senderPrivateKey: Buffer, utxos: UTXO[], sendInscriptionID: string | undefined, receiverInsAddress: string, sendAmount: BigNumber, valueOutInscription: BigNumber, changeAmount: BigNumber, fee: BigNumber) => {
    txID: string;
    txHex: string;
    fee: BigNumber;
};
/**
* createTx creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createTxSplitFundFromOrdinalUTXO: (senderPrivateKey: Buffer, inscriptionUTXO: UTXO, inscriptionInfo: Inscription, sendAmount: BigNumber, feeRatePerByte: number) => ICreateTxSplitInscriptionResp;
/**
* createRawTxSplitFundFromOrdinalUTXO creates the Bitcoin transaction (including sending inscriptions).
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param receiverInsAddress the address of the inscription receiver
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createRawTxSplitFundFromOrdinalUTXO: ({ pubKey, inscriptionUTXO, inscriptionInfo, sendAmount, feeRatePerByte, }: {
    pubKey: Buffer;
    inscriptionUTXO: UTXO;
    inscriptionInfo: Inscription;
    sendAmount: BigNumber;
    feeRatePerByte: number;
}) => {
    resRawTx: ICreateRawTxResp;
    newValueInscription: BigNumber;
};
declare const createDummyUTXOFromCardinal: (senderPrivateKey: Buffer, utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}, feeRatePerByte: number) => {
    dummyUTXO: UTXO;
    splitTxID: string;
    selectedUTXOs: UTXO[];
    newUTXO: any;
    fee: BigNumber;
    txHex: string;
};
declare const createRawTxDummyUTXOFromCardinal: (pubKey: Buffer, utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}, feeRatePerByte: number) => {
    dummyUTXO: any;
    splitPsbtB64: string;
    indicesToSign: number[];
    changeAmount: BigNumber;
    selectedUTXOs: UTXO[];
    fee: BigNumber;
};
declare const prepareUTXOsToBuyMultiInscriptions: ({ privateKey, address, utxos, inscriptions, feeRatePerByte, buyReqFullInfos, }: {
    privateKey: Buffer;
    address: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    buyReqFullInfos: BuyReqFullInfo[];
}) => {
    buyReqFullInfos: BuyReqFullInfo[];
    dummyUTXO: any;
    splitTxID: string;
    selectedUTXOs: UTXO[];
    newUTXO: any;
    fee: BigNumber;
    splitTxHex: string;
};
declare const createRawTxToPrepareUTXOsToBuyMultiInscs: ({ pubKey, address, utxos, inscriptions, feeRatePerByte, buyReqFullInfos, }: {
    pubKey: Buffer;
    address: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    buyReqFullInfos: BuyReqFullInfo[];
}) => {
    buyReqFullInfos: BuyReqFullInfo[];
    dummyUTXO: any;
    selectedUTXOs: UTXO[];
    fee: BigNumber;
    changeAmount: BigNumber;
    needPaymentUTXOs: NeedPaymentUTXO[];
    needCreateDummyUTXO: boolean;
    splitPsbtB64: string;
    indicesToSign: number[];
};
declare const broadcastTx: (txHex: string) => Promise<string>;
export { selectUTXOs, createTx, createRawTx, createTxFromAnyWallet, broadcastTx, createTxWithSpecificUTXOs, createRawTxDummyUTXOForSale, createTxSplitFundFromOrdinalUTXO, createRawTxSplitFundFromOrdinalUTXO, createDummyUTXOFromCardinal, createRawTxDummyUTXOFromCardinal, createTxSendBTC, createRawTxSendBTC, prepareUTXOsToBuyMultiInscriptions, createRawTxToPrepareUTXOsToBuyMultiInscs, signPSBT, signPSBT2, };
