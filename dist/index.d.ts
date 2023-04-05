/// <reference types="node" />
import BigNumber from 'bignumber.js';
import { Transaction, Psbt, Signer, payments, networks } from 'bitcoinjs-lib';
import * as ecpair from 'ecpair';
import { ECPairAPI, ECPairInterface } from 'ecpair';
import { ethers } from 'ethers';
import { BIP32Interface } from 'bip32';

declare const BlockStreamURL = "https://blockstream.info/api";
declare const MinSats = 1000;
declare const DummyUTXOValue = 1000;
declare const InputSize = 68;
declare const OutputSize = 43;
declare const BNZero: BigNumber;
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
}, sendInscriptionID: string, sendAmount: BigNumber, feeRatePerByte: number, isUseInscriptionPayFee: boolean) => {
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
declare const createTxSendBTC: ({ senderPrivateKey, utxos, inscriptions, paymentInfos, feeRatePerByte, }: {
    senderPrivateKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    paymentInfos: PaymentInfo[];
    feeRatePerByte: number;
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

/**
* estimateTxFee estimates the transaction fee
* @param numIns number of inputs in the transaction
* @param numOuts number of outputs in the transaction
* @param feeRatePerByte fee rate per byte (in satoshi)
* @returns returns the estimated transaction fee in satoshi
*/
declare const estimateTxFee: (numIns: number, numOuts: number, feeRatePerByte: number) => number;
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
    keyPair: ecpair.ECPairInterface;
    senderAddress: string;
    tweakedSigner: Signer;
    p2pktr: payments.Payment;
};
declare const generateP2PKHKeyPair: (privateKey: Buffer) => {
    keyPair: ecpair.ECPairInterface;
    address: string;
    p2pkh: payments.Payment;
    privateKey: Buffer;
};
declare const generateP2PKHKeyFromRoot: (root: BIP32Interface) => {
    keyPair: ecpair.ECPairInterface;
    address: string;
    p2pkh: payments.Payment;
    privateKey: Buffer;
};
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

/**
* createPSBTToSell creates the partially signed bitcoin transaction to sale the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param sellerAddress payment address of the seller to recieve BTC from buyer
* @param ordinalInput ordinal input coin to sell
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @returns the encoded base64 partially signed transaction
*/
declare const createPSBTToSell: (params: {
    sellerPrivateKey: Buffer;
    receiverBTCAddress: string;
    inscriptionUTXO: UTXO;
    amountPayToSeller: BigNumber;
    feePayToCreator: BigNumber;
    creatorAddress: string;
    dummyUTXO: UTXO;
}) => string;
/**
* createPSBTToSell creates the partially signed bitcoin transaction to sale the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param sellerAddress payment address of the seller to recieve BTC from buyer
* @param ordinalInput ordinal input coin to sell
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @returns the encoded base64 partially signed transaction
*/
declare const createRawPSBTToSell: (params: {
    internalPubKey: Buffer;
    receiverBTCAddress: string;
    inscriptionUTXO: UTXO;
    amountPayToSeller: BigNumber;
    feePayToCreator: BigNumber;
    creatorAddress: string;
    dummyUTXO: UTXO;
}) => ICreateRawTxResp;
/**
* createPSBTToBuy creates the partially signed bitcoin transaction to buy the inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbt PSBT from seller
* @param buyerPrivateKey buffer private key of the buyer
* @param buyerAddress payment address of the buy to receive inscription
* @param valueInscription value in inscription
* @param price price of the inscription that the seller wants to sell (in satoshi)
* @param paymentUtxos cardinal input coins to payment
* @param dummyUtxo cardinal dummy input coin
* @returns the encoded base64 partially signed transaction
*/
declare const createPSBTToBuy: (params: {
    sellerSignedPsbt: Psbt;
    buyerPrivateKey: Buffer;
    receiverInscriptionAddress: string;
    valueInscription: BigNumber;
    price: BigNumber;
    paymentUtxos: UTXO[];
    dummyUtxo: UTXO;
    feeRate: number;
}) => ICreateTxResp;
/**
* reqListForSaleInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param amountPayToSeller BTC amount to pay to seller
* @param feePayToCreator BTC fee to pay to creator
* @param creatorAddress address of creator
* amountPayToSeller + feePayToCreator = price that is showed on UI
* @returns the base64 encode Psbt
*/
declare const reqListForSaleInscription: (params: {
    sellerPrivateKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sellInscriptionID: string;
    receiverBTCAddress: string;
    amountPayToSeller: BigNumber;
    feePayToCreator: BigNumber;
    creatorAddress: string;
    feeRatePerByte: number;
}) => Promise<ICreateTxSellResp>;
/**
* reqListForSaleInscFromAnyWallet creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerPrivateKey buffer private key of the seller
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param amountPayToSeller BTC amount to pay to seller
* @param feePayToCreator BTC fee to pay to creator
* @param creatorAddress address of creator
* amountPayToSeller + feePayToCreator = price that is showed on UI
* @returns the base64 encode Psbt
*/
declare const reqListForSaleInscFromAnyWallet: ({ pubKey, utxos, inscriptions, sellInscriptionID, receiverBTCAddress, amountPayToSeller, feePayToCreator, creatorAddress, feeRatePerByte, walletType, cancelFn, }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    sellInscriptionID: string;
    receiverBTCAddress: string;
    amountPayToSeller: BigNumber;
    feePayToCreator: BigNumber;
    creatorAddress: string;
    feeRatePerByte: number;
    walletType?: number | undefined;
    cancelFn: () => void;
}) => Promise<ICreateTxSellResp>;
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
declare const reqBuyInscription: (params: {
    sellerSignedPsbtB64: string;
    buyerPrivateKey: Buffer;
    receiverInscriptionAddress: string;
    price: BigNumber;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
}) => Promise<ICreateTxBuyResp>;
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
declare const reqBuyInscriptionFromAnyWallet: ({ sellerSignedPsbtB64, pubKey, receiverInscriptionAddress, price, utxos, inscriptions, feeRatePerByte, walletType, cancelFn, }: {
    sellerSignedPsbtB64: string;
    pubKey: Buffer;
    receiverInscriptionAddress: string;
    price: BigNumber;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    walletType?: number | undefined;
    cancelFn: () => void;
}) => Promise<ICreateTxBuyResp>;
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
declare const reqBuyMultiInscriptions: (params: {
    buyReqInfos: BuyReqInfo[];
    buyerPrivateKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
}) => ICreateTxBuyResp;
/**
* reqBuyInscription creates the PSBT of the seller to list for sale inscription.
* NOTE: Currently, the function only supports sending from Taproot address.
* @param sellerSignedPsbtB64 buffer private key of the buyer
* @param buyerPrivateKey buffer private key of the buyer
* @param utxos list of utxos (include non-inscription and inscription utxos)
* @param inscriptions list of inscription infos of the seller
* @param sellInscriptionID id of inscription to sell
* @param receiverBTCAddress the seller's address to receive BTC
* @param price  = amount pay to seller + fee pay to creator
* @returns the base64 encode Psbt
*/
declare const reqBuyMultiInscriptionsFromAnyWallet: ({ buyReqInfos, pubKey, utxos, inscriptions, feeRatePerByte, walletType, cancelFn, }: {
    buyReqInfos: BuyReqInfo[];
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    feeRatePerByte: number;
    walletType?: number | undefined;
    cancelFn: () => void;
}) => Promise<ICreateTxBuyResp>;

declare let Network: networks.Network;
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
}

declare function generateInscribeContent(protocolID: string, reimbursementAddr: string, datas: string[]): string;
declare const createRawRevealTx: ({ internalPubKey, commitTxID, hashLockKeyPair, hashLockRedeem, script_p2tr, revealTxFee }: {
    internalPubKey: Buffer;
    commitTxID: string;
    hashLockKeyPair: ECPairInterface;
    hashLockRedeem: any;
    script_p2tr: payments.Payment;
    revealTxFee: number;
}) => {
    revealTxHex: string;
    revealTxID: string;
};
declare const start_taptree: ({ privateKey, data, utxos, feeRatePerByte, reImbursementTCAddress, }: {
    privateKey: Buffer;
    data: string[];
    utxos: UTXO[];
    feeRatePerByte: number;
    reImbursementTCAddress: string;
}) => (Promise<{
    commitTxHex: string;
    revealTxHex: string;
}>);
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
declare const createInscribeTx: ({ senderPrivateKey, utxos, inscriptions, data, reImbursementTCAddress, feeRatePerByte, }: {
    senderPrivateKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    data: string[];
    reImbursementTCAddress: string;
    feeRatePerByte: number;
}) => {
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
};
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
declare const createInscribeTxFromAnyWallet: ({ pubKey, utxos, inscriptions, data, reImbursementTCAddress, feeRatePerByte, cancelFn }: {
    pubKey: Buffer;
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
    data: string[];
    reImbursementTCAddress: string;
    feeRatePerByte: number;
    cancelFn: () => void;
}) => Promise<{
    commitTxHex: string;
    commitTxID: string;
    revealTxHex: string;
    revealTxID: string;
    totalFee: BigNumber;
}>;

declare const Mainnet = "mainnet";
declare const Testnet = "testnet";
declare const Regtest = "regtest";
declare class TcClient {
    url: string;
    network: string;
    constructor(network: string, url: string);
    constructor(network: string);
    callRequest: (payload: any, methodType: string, method: string) => Promise<any>;
    getNonceInscribeable: (tcAddress: string) => Promise<{
        nonce: number;
        gasPrice: number;
    }>;
    submitInscribeTx: (btcTxHex: string) => Promise<{
        btcTxID: string;
    }>;
}

export { BNZero, BlockStreamURL, BuyReqFullInfo, BuyReqInfo, DummyUTXOValue, ECPair, ERROR_CODE, ERROR_MESSAGE, ICreateRawTxResp, ICreateTxBuyResp, ICreateTxResp, ICreateTxSellResp, ICreateTxSplitInscriptionResp, ISignPSBTResp, InputSize, Inscription, Mainnet, MinSats, NeedPaymentUTXO, Network, NetworkType, OutputSize, PaymentInfo, Regtest, SDKError, TcClient, Testnet, UTXO, Validator, Wallet, WalletType, broadcastTx, convertPrivateKey, convertPrivateKeyFromStr, createDummyUTXOFromCardinal, createInscribeTx, createInscribeTxFromAnyWallet, createPSBTToBuy, createPSBTToSell, createRawPSBTToSell, createRawRevealTx, createRawTx, createRawTxDummyUTXOForSale, createRawTxDummyUTXOFromCardinal, createRawTxSendBTC, createRawTxSplitFundFromOrdinalUTXO, createRawTxToPrepareUTXOsToBuyMultiInscs, createTx, createTxFromAnyWallet, createTxSendBTC, createTxSplitFundFromOrdinalUTXO, createTxWithSpecificUTXOs, decryptWallet, deriveETHWallet, derivePasswordWallet, deriveSegwitWallet, encryptWallet, estimateNumInOutputs, estimateNumInOutputsForBuyInscription, estimateTxFee, filterAndSortCardinalUTXOs, findExactValueUTXO, fromSat, generateInscribeContent, generateP2PKHKeyFromRoot, generateP2PKHKeyPair, generateTaprootAddress, generateTaprootAddressFromPubKey, generateTaprootKeyPair, getBTCBalance, getBitcoinKeySignContent, handleSignPsbtWithSpecificWallet, importBTCPrivateKey, prepareUTXOsToBuyMultiInscriptions, reqBuyInscription, reqBuyInscriptionFromAnyWallet, reqBuyMultiInscriptions, reqBuyMultiInscriptionsFromAnyWallet, reqListForSaleInscFromAnyWallet, reqListForSaleInscription, selectCardinalUTXOs, selectInscriptionUTXO, selectTheSmallestUTXO, selectUTXOs, selectUTXOsToCreateBuyTx, setBTCNetwork, signByETHPrivKey, signPSBT, signPSBT2, start_taptree, tapTweakHash, toXOnly, tweakSigner };
