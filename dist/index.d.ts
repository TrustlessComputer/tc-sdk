/// <reference types="node" />
import BigNumber from 'bignumber.js';
import { Transaction, Psbt, payments, Signer, networks } from 'bitcoinjs-lib';
import { ECPairInterface, ECPairAPI } from 'ecpair';
import { ethers } from 'ethers';
import { BIP32Interface } from 'bip32';
import { StorageService as StorageService$1 } from '@/utils/storage';
import { TcClient as TcClient$1 } from '@/tc';
import { Tapleaf } from 'bitcoinjs-lib/src/types';
import { HDWallet as HDWallet$1, Masterless as Masterless$1, IMasterless as IMasterless$1, IDeriveKey as IDeriveKey$2, IDeriveReq as IDeriveReq$1, IHDWallet as IHDWallet$2, IDeriveMasterlessReq as IDeriveMasterlessReq$1 } from '@/wallet';
import { IDeriveKey as IDeriveKey$1, IHDWallet as IHDWallet$1 } from '@/wallet/types';
import * as CryptoJS from 'crypto-js';

declare const MinSats = 1000;
declare const DummyUTXOValue = 1000;
declare const InputSize = 68;
declare const OutputSize = 43;
declare const BNZero: BigNumber;
declare const MinSats2 = 546;
declare const MinSats3 = 796;
declare const DefaultSequence = 4294967295;
declare const DefaultSequenceRBF = 4294967293;
declare const MaxTxSize = 357376;
declare const WalletType: {
    Xverse: number;
    Hiro: number;
};

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
interface PaymentScript {
    script: Buffer;
    amount: BigNumber;
}
interface InscPaymentInfo {
    address: string;
    inscID: string;
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

/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction.
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
declare const selectUTXOs: (utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}, sendInscriptionID: string, sendAmount: BigNumber, feeRatePerByte: number, isUseInscriptionPayFee: boolean, isSelectUTXOs: boolean) => {
    selectedUTXOs: UTXO[];
    isUseInscriptionPayFee: boolean;
    valueOutInscription: BigNumber;
    changeAmount: BigNumber;
    fee: BigNumber;
};
/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction.
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionInfos list of inscription IDs and receiver addresses
* @param sendAmount satoshi amount need to send
* @param feeRatePerByte fee rate per byte (in satoshi)
* @param isUseInscriptionPayFee flag defines using inscription coin to pay fee
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
declare const selectUTXOsV2: (utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}, sendInscriptionInfos: InscPaymentInfo[], sendBTCInfos: PaymentInfo[], feeRatePerByte: number) => {
    selectedUTXOs: UTXO[];
    selectedInscUTXOs: UTXO[];
    changeAmount: BigNumber;
    fee: BigNumber;
};
/**
* selectUTXOs selects the most reasonable UTXOs to create the transaction.
* if sending inscription, the first selected UTXO is always the UTXO contain inscription.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendInscriptionID id of inscription to send
* @returns the ordinal UTXO
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
declare const selectInscriptionUTXO: (utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}, inscriptionID: string) => {
    inscriptionUTXO: UTXO;
    inscriptionInfo: Inscription;
};
/**
* selectCardinalUTXOs selects the most reasonable UTXOs to create the transaction.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendAmount satoshi amount need to send
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
declare const selectCardinalUTXOs: (utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}, sendAmount: BigNumber) => {
    selectedUTXOs: UTXO[];
    remainUTXOs: UTXO[];
    totalInputAmount: BigNumber;
};
declare const selectUTXOsToCreateBuyTx: (params: {
    sellerSignedPsbt: Psbt;
    price: BigNumber;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRate: number;
}) => {
    selectedUTXOs: UTXO[];
};
/**
* selectTheSmallestUTXO selects the most reasonable UTXOs to create the transaction.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param sendAmount satoshi amount need to send
* @param isSelectDummyUTXO need to select dummy UTXO or not
* @returns the list of selected UTXOs
* @returns the actual flag using inscription coin to pay fee
* @returns the value of inscription outputs, and the change amount (if any)
* @returns the network fee
*/
declare const selectTheSmallestUTXO: (utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}) => UTXO;
/**
* filterAndSortCardinalUTXOs filter cardinal utxos and inscription utxos.
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @returns the list of cardinal UTXOs which is sorted descending by value
* @returns the list of inscription UTXOs
* @returns total amount of cardinal UTXOs
*/
declare const filterAndSortCardinalUTXOs: (utxos: UTXO[], inscriptions: {
    [key: string]: Inscription[];
}) => {
    cardinalUTXOs: UTXO[];
    inscriptionUTXOs: UTXO[];
    totalCardinalAmount: BigNumber;
};
/**
* findExactValueUTXO returns the cardinal utxos with exact value.
* @param cardinalUTXOs list of utxos (only non-inscription  utxos)
* @param value value of utxo
* @returns the cardinal UTXO
*/
declare const findExactValueUTXO: (cardinalUTXOs: UTXO[], value: BigNumber) => {
    utxo: UTXO;
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
declare const signPSBT: ({ keyPairInfo, psbtB64, indicesToSign, sigHashType, }: {
    keyPairInfo: IKeyPairInfo;
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
declare const createTx: ({ senderPrivateKey, senderAddress, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, sequence, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    isUseInscriptionPayFeeParam?: boolean | undefined;
    sequence?: number | undefined;
}) => ICreateTxResp;
declare const addInputs: ({ psbt, addressType, inputs, payment, sequence, keyPair, }: {
    psbt: Psbt;
    addressType: number;
    inputs: UTXO[];
    payment: payments.Payment;
    sequence: number;
    keyPair: ECPairInterface;
}) => Psbt;
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
declare const createRawTx: ({ keyPairInfo, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, sequence, }: {
    keyPairInfo: IKeyPairInfo;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sendInscriptionID: string;
    receiverInsAddress: string;
    sendAmount: BigNumber;
    feeRatePerByte: number;
    isUseInscriptionPayFeeParam: boolean;
    sequence?: number | undefined;
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
declare const createTxFromAnyWallet: ({ keyPairInfo, utxos, inscriptions, sendInscriptionID, receiverInsAddress, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, walletType, cancelFn, }: {
    keyPairInfo: IKeyPairInfo;
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
declare const createRawTxSendBTCFromMultisig: ({ senderPublicKey, senderAddress, utxos, inscriptions, paymentInfos, paymentScripts, feeRatePerByte, sequence, isSelectUTXOs, }: {
    senderPublicKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    paymentInfos: PaymentInfo[];
    paymentScripts?: PaymentScript[] | undefined;
    feeRatePerByte: number;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
}) => ICreateRawTxResp;
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
declare const createTxSendBTC: ({ senderPrivateKey, senderAddress, utxos, inscriptions, paymentInfos, paymentScripts, feeRatePerByte, sequence, isSelectUTXOs, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    paymentInfos: PaymentInfo[];
    paymentScripts?: PaymentScript[] | undefined;
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
* createTxSendMultiReceivers creates the Bitcoin transaction that can both BTC and inscriptions to multiple receiver addresses.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the sender
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param inscPaymentInfos list of inscription IDs and receiver addresses
* @param paymentInfos list of btc amount and receiver addresses
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the transaction id
* @returns the hex signed transaction
* @returns the network fee
*/
declare const createTxSendMultiReceivers: ({ senderPrivateKey, senderAddress, utxos, inscriptions, inscPaymentInfos, paymentInfos, feeRatePerByte, sequence, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    inscPaymentInfos: InscPaymentInfo[];
    paymentInfos: PaymentInfo[];
    feeRatePerByte: number;
    sequence?: number | undefined;
}) => ICreateTxResp;
declare const broadcastTx: (txHex: string) => Promise<string>;

/**
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
declare const estimateTxFee: (numIns: number, numOuts: number, feeRatePerByte: number) => number;
/**
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction, only normal outputs
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
declare const estimateTxTransferSRC20Fee: (numIns: number, numOuts: number, feeRatePerByte: number) => number;
/**
* estimateTxSize estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @returns returns the estimated transaction size in byte
*/
declare const estimateTxSize: (numIns: number, numOuts: number) => number;
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
declare const estimateNumInOutputs: (inscriptionID: string, sendAmount: BigNumber, isUseInscriptionPayFee: boolean) => {
    numIns: number;
    numOuts: number;
};
/**
* estimateNumInOutputs estimates number of inputs and outputs by parameters:
* @param inscriptionID id of inscription to send (if any)
* @param sendAmount satoshi amount need to send
* @param isUseInscriptionPayFee use inscription output coin to pay fee or not
* @returns returns the estimated number of inputs and outputs in the transaction
*/
declare const estimateNumInOutputsForBuyInscription: (estNumInputsFromBuyer: number, estNumOutputsFromBuyer: number, sellerSignedPsbt: Psbt) => {
    numIns: number;
    numOuts: number;
};
declare const fromSat: (sat: number) => number;
declare const toSat: (value: number) => number;

declare const ECPair: ECPairAPI;
/**
* convertPrivateKey converts buffer private key to WIF private key string
* @param bytes buffer private key
* @returns the WIF private key string
*/
declare const convertPrivateKey: (bytes: Buffer) => string;
/**
* convertPrivateKeyFromStr converts private key WIF string to Buffer
* @param str private key string
* @returns buffer private key
*/
declare const convertPrivateKeyFromStr: (str: string) => Buffer;
declare function toXOnly(pubkey: Buffer): Buffer;
declare function tweakSigner(signer: Signer, opts?: any): Signer;
declare function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer;
declare const generateTaprootAddress: (privateKey: Buffer) => string;
declare const generateTaprootAddressFromPubKey: (pubKey: Buffer) => {
    address: string;
    p2pktr: payments.Payment;
};
declare const generateTaprootKeyPair: (privateKey: Buffer) => {
    keyPair: ECPairInterface;
    senderAddress: string;
    tweakedSigner: Signer;
    p2pktr: payments.Payment;
};
declare const generateP2PKHKeyPair: (privateKey: Buffer) => {
    keyPair: ECPairInterface;
    address: string;
    p2pkh: payments.Payment;
    privateKey: Buffer;
};
declare const generateP2PKHKeyFromRoot: (root: BIP32Interface) => {
    keyPair: ECPairInterface;
    address: string;
    p2pkh: payments.Payment;
    privateKey: Buffer;
};
declare const generateP2WPKHKeyPair: (privateKey: Buffer) => {
    keyPair: ECPairInterface;
    address: string;
    p2wpkh: payments.Payment;
    privateKey: Buffer;
};
declare const generateP2WPKHKeyPairFromPubKey: (pubKey: Buffer) => {
    address: string;
    p2wpkh: payments.Payment;
};
declare const getKeyPairInfo: ({ privateKey, address, }: {
    privateKey: Buffer;
    address: string;
}) => IKeyPairInfo;
/**
* getBTCBalance returns the Bitcoin balance from cardinal utxos.
*/
declare const getBTCBalance: (params: {
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
}) => BigNumber;
/**
* importBTCPrivateKey returns the bitcoin private key and the corresponding taproot address.
*/
declare const importBTCPrivateKey: (wifPrivKey: string) => {
    taprootPrivKeyBuffer: Buffer;
    taprootAddress: string;
};
/**
* deriveSegwitWallet derives bitcoin segwit wallet from private key taproot.
* @param privKeyTaproot private key taproot is used to a seed to generate segwit wall
* @returns the segwit private key and the segwit address
*/
declare const deriveSegwitWallet: (privKeyTaproot: Buffer) => {
    segwitPrivKeyBuffer: Buffer;
    segwitAddress: string;
};
/**
* deriveETHWallet derives eth wallet from private key taproot.
* @param privKeyTaproot private key taproot is used to a seed to generate eth wallet
* @returns the eth private key and the eth address
*/
declare const deriveETHWallet: (privKeyTaproot: Buffer) => {
    ethPrivKey: string;
    ethAddress: string;
};
/**
* signByETHPrivKey creates the signature on the data by ethPrivKey.
* @param ethPrivKey private key with either prefix "0x" or non-prefix
* @param data data toSign is a hex string, MUST hash prefix "0x"
* @returns the signature with prefix "0x"
*/
declare const signByETHPrivKey: (ethPrivKey: string, data: string) => string;
declare const getBitcoinKeySignContent: (message: string) => Buffer;
/**
* derivePasswordWallet derive the password from ONE SPECIFIC evm address.
* This password is used to encrypt and decrypt the imported BTC wallet.
* NOTE: The client should save the corresponding evm address to retrieve the same BTC wallet.
* @param provider ETH provider
* @param evmAddress evm address is chosen to create the valid signature on IMPORT_MESSAGE
* @returns the password string
*/
declare const derivePasswordWallet: (evmAddress: string, provider: ethers.providers.Web3Provider) => Promise<string>;
/**
* encryptWallet encrypts Wallet object by AES algorithm.
* @param wallet includes the plaintext private key need to encrypt
* @param password the password to encrypt
* @returns the signature with prefix "0x"
*/
declare const encryptWallet: (wallet: Wallet, password: string) => string;
/**
* decryptWallet decrypts ciphertext to Wallet object by AES algorithm.
* @param ciphertext ciphertext
* @param password the password to decrypt
* @returns the Wallet object
*/
declare const decryptWallet: (ciphertext: string, password: string) => Wallet;
declare const BTCAddressType: {
    P2TR: number;
    P2WPKH: number;
};
/**
* getAddressType return the type of btc address.
* @param address Bitcoin address. Currently, only support Taproot and Segwit (P2WPKH)
* @returns the address type
*/
declare const getAddressType: ({ btcAddress, pubKey, }: {
    btcAddress: string;
    pubKey: Buffer;
}) => number;

declare let Network: networks.Network;
declare let BlockStreamURL: string;
declare const NetworkType: {
    Mainnet: number;
    Testnet: number;
    Regtest: number;
};
declare const setBTCNetwork: (netType: number) => void;

/**
* handleSignPsbtWithXverse calls Xverse signTransaction and finalizes signed raw psbt.
* extract to msgTx (if isGetMsgTx is true)
* @param base64Psbt the base64 encoded psbt need to sign
* @param indicesToSign indices of inputs need to sign
* @param address address of signer
* @param sigHashType default is SIGHASH_DEFAULT
* @param isGetMsgTx flag used to extract to msgTx or not
* @param cancelFn callback function for handling cancel signing
* @returns the base64 encode signed Psbt
*/
declare const handleSignPsbtWithSpecificWallet: ({ base64Psbt, indicesToSign, address, sigHashType, isGetMsgTx, walletType, cancelFn, }: {
    base64Psbt: string;
    indicesToSign: number[];
    address: string;
    sigHashType?: number | undefined;
    isGetMsgTx?: boolean | undefined;
    walletType?: number | undefined;
    cancelFn: () => void;
}) => Promise<{
    base64SignedPsbt: string;
    msgTx: Transaction;
    msgTxID: string;
    msgTxHex: string;
}>;

declare const ERROR_CODE: {
    INVALID_CODE: string;
    INVALID_PARAMS: string;
    NOT_SUPPORT_SEND: string;
    NOT_FOUND_INSCRIPTION: string;
    NOT_ENOUGH_BTC_TO_SEND: string;
    NOT_ENOUGH_BTC_TO_PAY_FEE: string;
    ERR_BROADCAST_TX: string;
    INVALID_SIG: string;
    INVALID_VALIDATOR_LABEL: string;
    NOT_FOUND_UTXO: string;
    NOT_FOUND_DUMMY_UTXO: string;
    WALLET_NOT_SUPPORT: string;
    SIGN_XVERSE_ERROR: string;
    CREATE_COMMIT_TX_ERR: string;
    INVALID_TAPSCRIPT_ADDRESS: string;
    INVALID_NETWORK_TYPE: string;
    RPC_ERROR: string;
    RPC_GET_INSCRIBEABLE_INFO_ERROR: string;
    RPC_SUBMIT_BTCTX_ERROR: string;
    RPC_GET_TAPSCRIPT_INFO: string;
    RESTORE_HD_WALLET: string;
    DECRYPT: string;
    TAPROOT_FROM_MNEMONIC: string;
    MNEMONIC_GEN_TAPROOT: string;
    CANNOT_FIND_ACCOUNT: string;
    NOT_FOUND_TX_TO_RBF: string;
    COMMIT_TX_EMPTY: string;
    REVEAL_TX_EMPTY: string;
    OLD_VIN_EMPTY: string;
    INVALID_NEW_FEE_RBF: string;
    GET_UTXO_VALUE_ERR: string;
    IS_NOT_RBFABLE: string;
    INVALID_BTC_ADDRESS_TYPE: string;
    MNEMONIC_GEN_SEGWIT: string;
    SEGWIT_FROM_MNEMONIC: string;
    RESTORE_MASTERLESS_WALLET: string;
    CANNOT_CREATE_ACCOUNT: string;
    HEX_TX_IS_EMPTY: string;
    EXCEED_TX_SIZE: string;
};
declare const ERROR_MESSAGE: {
    [x: string]: {
        message: string;
        desc: string;
    };
};
declare class SDKError extends Error {
    message: string;
    code: string;
    desc: string;
    constructor(code: string, desc?: string);
    getMessage(): string;
}

declare enum StorageKeys {
    HDWallet = "hd-wallet-cipher",
    Masterless = "masterless-cipher"
}

declare class Validator {
    value: any;
    label: string;
    isRequired: boolean;
    constructor(label: string, value: any);
    _throwError(message: string): void;
    _isDefined(): boolean;
    _onCondition(condition: () => any, message: string): this;
    required(message?: string): this;
    string(message?: string): this;
    buffer(message?: string): this;
    function(message?: string): this;
    boolean(message?: string): this;
    number(message?: string): this;
    array(message?: string): this;
    privateKey(message?: string): this;
    mnemonic(message?: string): this;
}

declare const encryptAES: (text: string, key: string) => string;
declare const decryptAES: (cipherText: string, key: string) => string;

interface ImplementInterface {
    namespace: string | undefined;
    setMethod(key: string, data: string): Promise<any>;
    getMethod(key: string): Promise<any>;
    removeMethod(key: string): Promise<any>;
}
declare class StorageService {
    namespace: string | undefined;
    setMethod: ((key: string, data: string) => any) | undefined;
    getMethod: ((key: string) => any) | undefined;
    removeMethod: ((key: string) => any) | undefined;
    constructor(namespace?: string);
    implement({ setMethod, getMethod, removeMethod, namespace }: ImplementInterface): void;
    _getKey(key: string): string;
    set(key: string, data: any): Promise<any>;
    get(key: string): Promise<any>;
    remove(key: string): Promise<any>;
}

interface ISetupPayload {
    storage: StorageService$1;
    tcClient: TcClient$1;
    netType: number;
}
declare const setupConfig: ({ storage, tcClient, netType }: ISetupPayload) => void;

declare const createRawRevealTx: ({ commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee, sequence, }: {
    commitTxID: string;
    hashLockKeyPair: ECPairInterface;
    hashLockRedeem: any;
    script_p2tr: payments.Payment;
    revealTxFee: number;
    sequence?: number | undefined;
}) => {
    revealTxHex: string;
    revealTxID: string;
};
/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
declare const createInscribeTx$1: ({ senderPrivateKey, senderAddress, utxos, inscriptions, tcTxIDs, feeRatePerByte, sequence, isSelectUTXOs, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    tcTxIDs: string[];
    feeRatePerByte: number;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    newUTXOs: UTXO[];
}>;
declare const splitBatchInscribeTx: ({ tcTxDetails }: {
    tcTxDetails: TCTxDetail[];
}) => Promise<string[][]>;
/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
declare const createBatchInscribeTxs: ({ senderPrivateKey, senderAddress, utxos, inscriptions, tcTxDetails, feeRatePerByte, sequence, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    tcTxDetails: TCTxDetail[];
    feeRatePerByte: number;
    sequence?: number | undefined;
}) => Promise<BatchInscribeTxResp[]>;
/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param data list of hex data need to inscribe
* @param reImbursementTCAddress TC address of the inscriber to receive gas.
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
declare const createInscribeTxFromAnyWallet: ({ pubKey, utxos, inscriptions, tcTxIDs, feeRatePerByte, tcClient, cancelFn }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    tcTxIDs: string[];
    feeRatePerByte: number;
    tcClient: TcClient;
    cancelFn: () => void;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
}>;
declare const createLockScript: ({ tcTxIDs, tcClient, }: {
    tcTxIDs: string[];
    tcClient: TcClient;
}) => Promise<{
    hashLockKeyPair: ECPairInterface;
    hashLockScript: Buffer;
    hashLockRedeem: Tapleaf;
    script_p2tr: payments.Payment;
}>;
/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param tcTxSizeByte size of tc tx (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
declare const estimateInscribeFee: ({ tcTxSizeByte, feeRatePerByte, }: {
    tcTxSizeByte: number;
    feeRatePerByte: number;
}) => {
    totalFee: BigNumber;
};
/**
* estimateInscribeFee estimate BTC amount need to inscribe for creating project.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param tcTxSizeByte size of tc tx (in byte)
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the total BTC fee
*/
declare const aggregateUTXOs: ({ tcAddress, utxos, }: {
    tcAddress: string;
    btcAddress: string;
    utxos: UTXO[];
}) => Promise<UTXO[]>;

interface TCTxDetail {
    Nonce: number;
    GasPrice: number;
    Gas: number;
    To: string;
    Value: number;
    Input: any;
    V: number;
    R: BigNumber;
    S: BigNumber;
    Hash: string;
    From: string;
    Type: number;
}
interface BatchInscribeTxResp {
    tcTxIDs: string[];
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
}
interface GetTxByHashResp {
    blockHash: string;
    blockNumber: string;
    transactionIndex: string;
    hash: string;
    status: string;
    Hex: string;
}
interface GetPendingInscribeTxsResp {
    TCHash: string;
    OnHold: boolean;
    Commit: BTCVinVout;
    Reveal: BTCVinVout;
}
interface Vin {
    coinbase: string;
    txid: string;
    vout: number;
    Sequence: number;
    Witness: string[];
}
interface Vout {
    value: number;
    n: number;
    scriptPubKey: ScriptPubKeyResult;
}
interface ScriptPubKeyResult {
    asm: string;
    hex: string;
    type: string;
    addresses: string[];
}
interface BTCVinVout {
    BTCHash: string;
    Vin: Vin[];
    Vout: Vout[];
}
interface UTXOFromBlockStream {
    txid: string;
    vout: number;
    status: UTXOStatusFromBlockStream;
    value: number;
}
interface UTXOStatusFromBlockStream {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
}

declare const Mainnet = "mainnet";
declare const Testnet = "testnet";
declare const Regtest = "regtest";
declare const DefaultEndpointTCNodeMainnet = "https://tc-node.trustless.computer";
declare class TcClient {
    url: string;
    network: string;
    constructor(network: string, url: string);
    constructor(network: string);
    callRequest: (payload: any, methodType: string, method: string) => Promise<any>;
    getInscribeableNonce: (tcAddress: string) => Promise<number>;
    submitInscribeTx: (btcTxHex: string[]) => Promise<{
        btcTxID: string[];
    }>;
    getTapScriptInfo: (hashLockPubKey: string, tcTxIDs: string[]) => Promise<{
        hashLockScriptHex: string;
    }>;
    getUnInscribedTransactionByAddress: (tcAddress: string) => Promise<{
        unInscribedTxIDs: string[];
    }>;
    getUnInscribedTransactionDetailByAddress: (tcAddress: string) => Promise<{
        unInscribedTxDetails: TCTxDetail[];
    }>;
    getTCTxByHash: (tcTxID: string) => Promise<GetTxByHashResp>;
    getTCTxReceipt: (tcTxID: string) => Promise<any>;
    getPendingInscribeTxs: (tcAddress: string) => Promise<any[]>;
    getPendingInscribeTxsDetail: (tcAddress: string) => Promise<GetPendingInscribeTxsResp[]>;
    getUTXOsInfoByTcAddress: ({ tcAddress, btcAddress, tcClient, }: {
        tcAddress: string;
        btcAddress: string;
        tcClient: TcClient;
    }) => Promise<{
        pendingUTXOs: UTXO[];
        incomingUTXOs: UTXO[];
    }>;
    getBalance: (tcAddress: string) => Promise<any>;
    getCountTx: (tcAddress: string) => Promise<any>;
}

declare const increaseGasPrice: (wei: BigNumber) => BigNumber;

declare const replaceByFeeInscribeTx: ({ senderPrivateKey, utxos, inscriptions, revealTxID, feeRatePerByte, tcAddress, btcAddress, sequence, }: {
    senderPrivateKey: Buffer;
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

declare const ServiceGetUTXOType: {
    BlockStream: number;
    Mempool: number;
};
/**
* getUTXOs get UTXOs to create txs.
* the result was filtered spending UTXOs in Bitcoin mempool and spending UTXOs was used for pending txs in TC node.
* dont include incomming UTXOs
* @param btcAddress bitcoin address
* @param serviceType service is used to get UTXOs, default is BlockStream
* @returns list of UTXOs
*/
declare const getUTXOs: ({ btcAddress, tcAddress, serviceType, }: {
    btcAddress: string;
    tcAddress: string;
    serviceType?: number | undefined;
}) => Promise<{
    availableUTXOs: UTXO[];
    incomingUTXOs: UTXO[];
    availableBalance: BigNumber;
    incomingBalance: BigNumber;
}>;

/**
* getUTXOsFromBlockStream get UTXOs from Blockstream service.
* the result was filtered spending UTXOs in Bitcoin mempool.
* @param btcAddress bitcoin address
* @param isConfirmed filter UTXOs by confirmed or not
* @returns list of UTXOs
*/
declare const getUTXOsFromBlockStream: (btcAddress: string, isConfirmed: boolean) => Promise<UTXO[]>;
declare const getTxFromBlockStream: (txID: string) => Promise<any>;
declare const getOutputCoinValue: (txID: string, voutIndex: number) => Promise<BigNumber>;

type Target = "_blank" | "_parent" | "_self" | "_top";
declare enum RequestFunction {
    sign = "sign",
    request = "request"
}
interface CallWalletPayload {
    method: string;
    hash: string;
    dappURL: string;
    isRedirect: boolean;
    target?: Target;
    isMainnet: boolean;
}
declare enum RequestMethod {
    account = "account"
}
interface RequestPayload {
    isMainnet: boolean;
    method: RequestMethod;
    redirectURL: string;
    target?: Target;
}
interface RequestAccountResponse {
    redirectURL: string;
    target?: Target;
    tcAddress: string;
    tpAddress: string;
}

declare const signTransaction: (payload: CallWalletPayload) => void;
declare const actionRequest: (payload: RequestPayload) => Promise<void>;
declare const requestAccountResponse: (payload: RequestAccountResponse) => Promise<void>;

declare const URL_MAINNET = "https://trustlesswallet.io";
declare const URL_REGTEST = "https://dev.trustlesswallet.io";

interface IDeriveKey {
    name: string;
    index: number;
    privateKey: string;
    address: string;
}
interface IHDWallet {
    name: string;
    mnemonic: string;
    nodes: Array<IDeriveKey>;
    deletedIndexs: Array<number>;
    btcPrivateKey: string;
}
type IMasterless = IDeriveKey;
interface IDeriveReq {
    mnemonic: string;
    index: number;
    name?: string;
}
interface IDeriveMasterlessReq {
    name: string;
    privateKey: string;
}

declare class MasterWallet {
    private _hdWallet;
    private _masterless;
    constructor();
    private restoreHDWallet;
    private restoreMasterless;
    load: (password: string) => Promise<{
        hdWallet: IHDWallet | undefined;
        masterless: IDeriveKey[];
    }>;
    getHDWallet: () => HDWallet$1;
    getMasterless: () => Masterless$1;
    getBTCPrivateKey: () => string | undefined;
}

declare class HDWallet {
    name: string | undefined;
    mnemonic: string | undefined;
    nodes: Array<IDeriveKey$1> | undefined;
    deletedIndexs: Array<number> | undefined;
    btcPrivateKey: string | undefined;
    constructor();
    set: (wallet: IHDWallet$1) => void;
    saveWallet: (wallet: IHDWallet$1, password: string) => Promise<void>;
    createNewAccount: ({ password, name, accounts }: {
        password: string;
        name: string;
        accounts: IDeriveKey$1[];
    }) => Promise<IDeriveKey$1 | undefined>;
    deletedAccount: ({ password, address }: {
        password: string;
        address: string;
    }) => Promise<void>;
    restore: (password: string) => Promise<IHDWallet$1 | undefined>;
}

declare class Masterless {
    nodes: Array<IMasterless$1> | undefined;
    constructor();
    set: (listMasterless: Array<IMasterless$1>) => void;
    saveWallet: (listMasterless: Array<IMasterless$1>, password: string) => Promise<void>;
    importNewAccount: ({ password, name, privateKey, nodes }: {
        password: string;
        name: string;
        privateKey: string;
        nodes: IDeriveKey$2[];
    }) => Promise<IDeriveKey$2 | undefined>;
    deletedMasterless: ({ password, address }: {
        password: string;
        address: string;
    }) => Promise<void>;
    restore: (password: string) => Promise<IMasterless$1[]>;
}

declare const ETHDerivationPath = "m/44'/60'/0'/0";
declare const BTCTaprootDerivationPath = "m/86'/0'/0'/0/0";
declare const BTCSegwitDerivationPath = "m/84'/0'/0'/0/0";

declare const deriveHDNodeByIndex: (payload: IDeriveReq$1) => IDeriveKey$2;
declare const generateHDWalletFromMnemonic: (mnemonic: string) => Promise<IHDWallet$2>;
declare const randomMnemonic: () => Promise<IHDWallet$2>;
declare const validateHDWallet: (wallet: IHDWallet$2 | undefined, methodName: string) => void;
declare const getStorageHDWalletCipherText: () => Promise<any>;
declare const getStorageHDWallet: (password: string) => Promise<IHDWallet$2 | undefined>;
declare const setStorageHDWallet: (wallet: IHDWallet$2, password: string) => Promise<void>;

declare const validateMnemonicBTC: (mnemonic: string) => boolean;
declare const generateTaprootHDNodeFromMnemonic: (mnemonic: string) => Promise<string>;

declare const generateSegwitHDNodeFromMnemonic: (mnemonic: string) => Promise<string>;

declare const validateMasterless: (listMasterless: Array<IMasterless$1> | undefined, methodName: string) => void;
declare const deriveMasterless: (payload: IDeriveMasterlessReq$1) => IMasterless$1;
declare const getStorageMasterlessCipherText: () => Promise<any>;
declare const getStorageMasterless: (password: string) => Promise<Array<IMasterless$1>>;
declare const setStorageMasterless: (wallet: Array<IMasterless$1>, password: string) => Promise<void>;

/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
declare const createInscribeTx: ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, data, sequence, isSelectUTXOs, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    data: string;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    newUTXOs: UTXO[];
}>;

/**
* createInscribeTx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
declare const createInscribeImgTx: ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, data, contentType, receiverAddress, sequence, isSelectUTXOs, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    data: Buffer;
    contentType: string;
    receiverAddress: string;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    newUTXOs: UTXO[];
}>;

/**
* createTransferSRC20RawTx creates raw tx to transfer src20 (don't include signing)
* sender address is P2WSH
* @param senderPubKey buffer public key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the raw transaction
* @returns the total network fee
*/
declare const createTransferSRC20RawTx: ({ senderPubKey, senderAddress, utxos, inscriptions, feeRatePerByte, receiverAddress, data, sequence, }: {
    senderPubKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    receiverAddress: string;
    data: string;
    sequence?: number | undefined;
}) => Promise<ICreateRawTxResp>;
/**
* createTransferSRC20Tx creates commit and reveal tx to inscribe data on Bitcoin netword.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param senderPrivateKey buffer private key of the inscriber
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the sender
* @param tcTxID TC txID need to be inscribed
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns the hex commit transaction
* @returns the commit transaction id
* @returns the hex reveal transaction
* @returns the reveal transaction id
* @returns the total network fee
*/
declare const createTransferSRC20Tx: ({ senderPrivateKey, senderAddress, utxos, inscriptions, feeRatePerByte, receiverAddress, data, sequence, isSelectUTXOs, }: {
    senderPrivateKey: Buffer;
    senderAddress: string;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    receiverAddress: string;
    data: string;
    sequence?: number | undefined;
    isSelectUTXOs?: boolean | undefined;
}) => Promise<{
    txHex: string;
    txID: string;
    totalFee: BigNumber;
    selectedUTXOs: UTXO[];
    changeAmount: BigNumber;
}>;
declare const addZeroTrail: (hexStr: string) => string;
/**
* createTransferSRC20Script creates multisig for transfer src20.
* @param secretKey tx ID of vin[0]
* @returns scripts
*/
declare const createTransferSRC20Script: ({ secretKey, data, }: {
    secretKey: string;
    data: string;
}) => Buffer[];

declare const ARC4Encrypt: (secretKey: string, msg: string) => CryptoJS.lib.CipherParams;
declare const ARC4Decrypt: (secretKey: string, ciphertext: CryptoJS.lib.CipherParams) => string;

export { ARC4Decrypt, ARC4Encrypt, BNZero, BTCAddressType, BTCSegwitDerivationPath, BTCTaprootDerivationPath, BTCVinVout, BatchInscribeTxResp, BlockStreamURL, BuyReqFullInfo, BuyReqInfo, CallWalletPayload, DefaultEndpointTCNodeMainnet, DefaultSequence, DefaultSequenceRBF, DummyUTXOValue, ECPair, ERROR_CODE, ERROR_MESSAGE, ETHDerivationPath, GetPendingInscribeTxsResp, GetTxByHashResp, HDWallet, ICreateRawTxResp, ICreateTxBuyResp, ICreateTxResp, ICreateTxSellResp, ICreateTxSplitInscriptionResp, IDeriveKey, IDeriveMasterlessReq, IDeriveReq, IHDWallet, IKeyPairInfo, IMasterless, ISignPSBTResp, InputSize, InscPaymentInfo, Inscription, Mainnet, MasterWallet, Masterless, MaxTxSize, MinSats, MinSats2, MinSats3, NeedPaymentUTXO, Network, NetworkType, OutputSize, PaymentInfo, PaymentScript, Regtest, RequestAccountResponse, RequestFunction, RequestMethod, RequestPayload, SDKError, ScriptPubKeyResult, ServiceGetUTXOType, StorageKeys, StorageService, TCTxDetail, Target, TcClient, Testnet, URL_MAINNET, URL_REGTEST, UTXO, UTXOFromBlockStream, UTXOStatusFromBlockStream, Validator, Vin, Vout, Wallet, WalletType, actionRequest, addInputs, addZeroTrail, aggregateUTXOs, broadcastTx, convertPrivateKey, convertPrivateKeyFromStr, createBatchInscribeTxs, createInscribeImgTx, createInscribeTx$1 as createInscribeTx, createInscribeTxFromAnyWallet, createLockScript, createRawRevealTx, createRawTx, createRawTxSendBTC, createRawTxSendBTCFromMultisig, createTransferSRC20RawTx, createTransferSRC20Script, createTransferSRC20Tx, createTx, createTxFromAnyWallet, createTxSendBTC, createTxSendMultiReceivers, createTxWithSpecificUTXOs, decryptAES, decryptWallet, deriveETHWallet, deriveHDNodeByIndex, deriveMasterless, derivePasswordWallet, deriveSegwitWallet, encryptAES, encryptWallet, estimateInscribeFee, estimateNumInOutputs, estimateNumInOutputsForBuyInscription, estimateTxFee, estimateTxSize, estimateTxTransferSRC20Fee, filterAndSortCardinalUTXOs, findExactValueUTXO, fromSat, generateHDWalletFromMnemonic, generateP2PKHKeyFromRoot, generateP2PKHKeyPair, generateP2WPKHKeyPair, generateP2WPKHKeyPairFromPubKey, generateSegwitHDNodeFromMnemonic, generateTaprootAddress, generateTaprootAddressFromPubKey, generateTaprootHDNodeFromMnemonic, generateTaprootKeyPair, getAddressType, getBTCBalance, getBitcoinKeySignContent, getKeyPairInfo, getOutputCoinValue, getStorageHDWallet, getStorageHDWalletCipherText, getStorageMasterless, getStorageMasterlessCipherText, getTxFromBlockStream, getUTXOs, getUTXOsFromBlockStream, handleSignPsbtWithSpecificWallet, importBTCPrivateKey, increaseGasPrice, isRBFable, createInscribeTx as ordCreateInscribeTx, randomMnemonic, replaceByFeeInscribeTx, requestAccountResponse, selectCardinalUTXOs, selectInscriptionUTXO, selectTheSmallestUTXO, selectUTXOs, selectUTXOsToCreateBuyTx, selectUTXOsV2, setBTCNetwork, setStorageHDWallet, setStorageMasterless, setupConfig, signByETHPrivKey, signPSBT, signPSBT2, signTransaction, splitBatchInscribeTx, tapTweakHash, toSat, toXOnly, tweakSigner, validateHDWallet, validateMasterless, validateMnemonicBTC };
