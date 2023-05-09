import { BuyReqInfo, ICreateRawTxResp, ICreateTxBuyResp, ICreateTxResp, ICreateTxSellResp, Inscription, UTXO } from "./types";
import { Psbt } from "bitcoinjs-lib";
import BigNumber from "bignumber.js";
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
export { createRawPSBTToSell, createPSBTToSell, createPSBTToBuy, reqListForSaleInscription, reqBuyInscription, reqBuyMultiInscriptions, reqListForSaleInscFromAnyWallet, reqBuyInscriptionFromAnyWallet, reqBuyMultiInscriptionsFromAnyWallet };
