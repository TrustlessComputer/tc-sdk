// import { BNZero, DummyUTXOValue, MinSats, OutputSize, WalletType } from "./constants";
// import {
//     BuyReqFullInfo,
//     BuyReqInfo,
//     ICreateRawTxResp,
//     ICreateTxBuyResp,
//     ICreateTxResp,
//     ICreateTxSellResp,
//     Inscription,
//     UTXO
// } from "./types";
// import {
//     Psbt,
//     Transaction
// } from "bitcoinjs-lib";
// import SDKError, { ERROR_CODE } from "../constants/error";
// import {
//     estimateTxFee,
//     fromSat,
// } from "./utils";
// import {
//     generateTaprootAddressFromPubKey,
//     generateTaprootKeyPair,
//     toXOnly,
// } from "./wallet";
// import {
//     selectCardinalUTXOs,
//     selectInscriptionUTXO,
//     selectUTXOsToCreateBuyTx
// } from "./selectcoin";

// import BigNumber from "bignumber.js";
// import { handleSignPsbtWithSpecificWallet } from "./xverse";
// import { verifySchnorr } from "@bitcoinerlab/secp256k1";

// const SigHashTypeForSale = Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY;

// /**
// * createPSBTToSell creates the partially signed bitcoin transaction to sale the inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerPrivateKey buffer private key of the seller
// * @param sellerAddress payment address of the seller to recieve BTC from buyer
// * @param ordinalInput ordinal input coin to sell
// * @param price price of the inscription that the seller wants to sell (in satoshi)
// * @returns the encoded base64 partially signed transaction
// */
// const createPSBTToSell = (
//     params: {
//         sellerPrivateKey: Buffer,
//         receiverBTCAddress: string,  // default is seller address
//         inscriptionUTXO: UTXO,
//         amountPayToSeller: BigNumber,
//         feePayToCreator: BigNumber,
//         creatorAddress: string,
//         dummyUTXO: UTXO,
//     },
// ): string => {
//     const psbt = new Psbt({ network: tcBTCNetwork });
//     const { inscriptionUTXO: ordinalInput, amountPayToSeller, receiverBTCAddress, sellerPrivateKey, dummyUTXO, creatorAddress, feePayToCreator } = params;

//     const { keyPair, tweakedSigner, p2pktr } = generateTaprootKeyPair(sellerPrivateKey);

//     // add ordinal input into the first input coins with 
//     // sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY

//     psbt.addInput({
//         hash: ordinalInput.tx_hash,
//         index: ordinalInput.tx_output_n,
//         witnessUtxo: { value: ordinalInput.value.toNumber(), script: p2pktr.output as Buffer },
//         tapInternalKey: toXOnly(keyPair.publicKey),
//         sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY,
//     });

//     if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.value.gt(BNZero)) {
//         psbt.addOutput({
//             address: receiverBTCAddress,
//             value: amountPayToSeller.plus(dummyUTXO.value).toNumber(),
//         });
//     } else {
//         psbt.addOutput({
//             address: receiverBTCAddress,
//             value: amountPayToSeller.toNumber(),
//         });
//     }

//     // the second input and output
//     // add dummy UTXO and output for paying to creator

//     if (feePayToCreator.gt(BNZero) && creatorAddress !== "") {
//         psbt.addInput({
//             hash: dummyUTXO.tx_hash,
//             index: dummyUTXO.tx_output_n,
//             witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output as Buffer },
//             tapInternalKey: toXOnly(keyPair.publicKey),
//             sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY,
//         });

//         psbt.addOutput({
//             address: creatorAddress,
//             value: feePayToCreator.toNumber()
//         });
//     }

//     // sign tx
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         psbt.signInput(i, tweakedSigner, [Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY]);
//         let isValid = true;
//         try {
//             isValid = psbt.validateSignaturesOfInput(i, verifySchnorr, tweakedSigner.publicKey);
//         } catch (e) {
//             isValid = false;
//         }
//         if (!isValid) {
//             throw new SDKError(ERROR_CODE.INVALID_SIG);
//         }
//     }

//     psbt.finalizeAllInputs();

//     return psbt.toBase64();
// };

// /**
// * createPSBTToSell creates the partially signed bitcoin transaction to sale the inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerPrivateKey buffer private key of the seller
// * @param sellerAddress payment address of the seller to recieve BTC from buyer
// * @param ordinalInput ordinal input coin to sell
// * @param price price of the inscription that the seller wants to sell (in satoshi)
// * @returns the encoded base64 partially signed transaction
// */
// const createRawPSBTToSell = (
//     params: {
//         internalPubKey: Buffer,
//         receiverBTCAddress: string,  // default is seller address
//         inscriptionUTXO: UTXO,
//         amountPayToSeller: BigNumber,
//         feePayToCreator: BigNumber,
//         creatorAddress: string,
//         dummyUTXO: UTXO,
//     },
// ): ICreateRawTxResp => {
//     const psbt = new Psbt({ network: tcBTCNetwork });
//     const { inscriptionUTXO: ordinalInput, amountPayToSeller, receiverBTCAddress, internalPubKey, dummyUTXO, creatorAddress, feePayToCreator } = params;

//     const { address, p2pktr } = generateTaprootAddressFromPubKey(internalPubKey);

//     // add ordinal input into the first input coins with 
//     // sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY

//     psbt.addInput({
//         hash: ordinalInput.tx_hash,
//         index: ordinalInput.tx_output_n,
//         witnessUtxo: { value: ordinalInput.value.toNumber(), script: p2pktr.output as Buffer },
//         tapInternalKey: internalPubKey,
//         sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY,
//     });
//     const selectedUTXOs: UTXO[] = [ordinalInput];

//     if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.value.gt(BNZero)) {
//         psbt.addOutput({
//             address: receiverBTCAddress,
//             value: amountPayToSeller.plus(dummyUTXO.value).toNumber(),
//         });
//     } else {
//         psbt.addOutput({
//             address: receiverBTCAddress,
//             value: amountPayToSeller.toNumber(),
//         });
//     }

//     // the second input and output
//     // add dummy UTXO and output for paying to creator
//     if (feePayToCreator.gt(BNZero) && creatorAddress !== "") {
//         psbt.addInput({
//             hash: dummyUTXO.tx_hash,
//             index: dummyUTXO.tx_output_n,
//             witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output as Buffer },
//             tapInternalKey: internalPubKey,
//             sighashType: Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY | Transaction.SIGHASH_DEFAULT,
//         });

//         selectedUTXOs.push(dummyUTXO);

//         psbt.addOutput({
//             address: creatorAddress,
//             value: feePayToCreator.toNumber()
//         });
//     }

//     const indicesToSign: number[] = [];
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         indicesToSign.push(i);
//     }

//     return { base64Psbt: psbt.toBase64(), selectedUTXOs, indicesToSign, fee: BNZero, changeAmount: BNZero };
// };

// /**
// * createPSBTToBuy creates the partially signed bitcoin transaction to buy the inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerSignedPsbt PSBT from seller
// * @param buyerPrivateKey buffer private key of the buyer
// * @param buyerAddress payment address of the buy to receive inscription
// * @param valueInscription value in inscription
// * @param price price of the inscription that the seller wants to sell (in satoshi)
// * @param paymentUtxos cardinal input coins to payment
// * @param dummyUtxo cardinal dummy input coin
// * @returns the encoded base64 partially signed transaction
// */
// const createPSBTToBuy = (
//     params: {
//         sellerSignedPsbt: Psbt,
//         buyerPrivateKey: Buffer,
//         receiverInscriptionAddress: string,
//         valueInscription: BigNumber,
//         price: BigNumber,
//         paymentUtxos: UTXO[],
//         dummyUtxo: UTXO,
//         feeRate: number,
//     }
// ): ICreateTxResp => {
//     const psbt = new Psbt({ network: tcBTCNetwork });
//     const {
//         sellerSignedPsbt,
//         buyerPrivateKey,
//         price,
//         receiverInscriptionAddress,
//         valueInscription,
//         paymentUtxos,
//         dummyUtxo,
//         feeRate
//     } = params;
//     let totalValue = BNZero;

//     const { keyPair, tweakedSigner, p2pktr, senderAddress: buyerAddress } = generateTaprootKeyPair(buyerPrivateKey);

//     // Add dummy utxo to the first input coin
//     psbt.addInput({
//         hash: dummyUtxo.tx_hash,
//         index: dummyUtxo.tx_output_n,
//         witnessUtxo: { value: dummyUtxo.value.toNumber(), script: p2pktr.output as Buffer },
//         tapInternalKey: toXOnly(keyPair.publicKey),
//     });

//     // Add inscription output
//     // the frist output coin has value equal to the sum of dummy value and value inscription
//     // this makes sure the first output coin is inscription outcoin 
//     psbt.addOutput({
//         address: receiverInscriptionAddress,
//         value: dummyUtxo.value.plus(valueInscription).toNumber(),
//     });

//     if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
//     }

//     for (let i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
//         // Add seller signed input
//         psbt.addInput({
//             ...sellerSignedPsbt.txInputs[i],
//             ...sellerSignedPsbt.data.inputs[i]
//         });
//         // Add seller output
//         psbt.addOutput({
//             ...sellerSignedPsbt.txOutputs[i],
//         });
//     }

//     // Add payment utxo inputs
//     for (const utxo of paymentUtxos) {
//         psbt.addInput({
//             hash: utxo.tx_hash,
//             index: utxo.tx_output_n,
//             witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output as Buffer },
//             tapInternalKey: toXOnly(keyPair.publicKey),
//         });

//         totalValue = totalValue.plus(utxo.value);
//     }

//     let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
//     if (fee.plus(price).gt(totalValue)) {
//         fee = totalValue.minus(price);   // maximum fee can paid
//         if (fee.lt(BNZero)) {
//             throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE);
//         }
//     }
//     let changeValue = totalValue.minus(price).minus(fee);

//     if (changeValue.gte(DummyUTXOValue)) {
//         // Create a new dummy utxo output for the next purchase
//         psbt.addOutput({
//             address: buyerAddress,
//             value: DummyUTXOValue,
//         });
//         changeValue = changeValue.minus(DummyUTXOValue);

//         const extraFee = new BigNumber(OutputSize * feeRate);
//         if (changeValue.gte(extraFee)) {
//             changeValue = changeValue.minus(extraFee);
//             fee = fee.plus(extraFee);
//         }
//     }

//     if (changeValue.lt(BNZero)) {
//         throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
//     }

//     // Change utxo
//     if (changeValue.gt(BNZero)) {
//         if (changeValue.gte(MinSats)) {
//             psbt.addOutput({
//                 address: buyerAddress,
//                 value: changeValue.toNumber(),
//             });
//         } else {
//             fee = fee.plus(changeValue);
//         }
//     }

//     // sign tx
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
//             psbt.signInput(i, tweakedSigner);
//         }
//     }

//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
//             psbt.finalizeInput(i);
//             try {
//                 const isValid = psbt.validateSignaturesOfInput(i, verifySchnorr, tweakedSigner.publicKey);
//                 if (!isValid) {
//                     console.log("Tx signature is invalid " + i);
//                 }
//             } catch (e) {
//                 console.log("Tx signature is invalid " + i);
//             }
//         }
//     }

//     // get tx hex
//     const tx = psbt.extractTransaction();
//     console.log("Transaction : ", tx);
//     const txHex = tx.toHex();
//     return { txID: tx.getId(), txHex, fee, selectedUTXOs: [...paymentUtxos, dummyUtxo], changeAmount: changeValue, tx };
// };

// /**
// * createRawPSBTToBuy creates the raw partially signed bitcoin transaction to buy the inscription (not signed yet). 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerSignedPsbt PSBT from seller
// * @param internalPubKey buffer public key of the buyer
// * @param receiverInscriptionAddress payment address of the buyer to receive inscription
// * @param valueInscription value in inscription
// * @param price price of the inscription that the seller wants to sell (in satoshi)
// * @param paymentUtxos cardinal input coins to payment
// * @param dummyUtxo cardinal dummy input coin
// * @returns the encoded base64 psbt
// */
// const createRawPSBTToBuy = ({
//     sellerSignedPsbt,
//     internalPubKey,
//     receiverInscriptionAddress,
//     valueInscription,
//     price,
//     paymentUtxos,
//     dummyUtxo,
//     feeRate,
// }: {
//     sellerSignedPsbt: Psbt,
//     internalPubKey: Buffer,
//     receiverInscriptionAddress: string,
//     valueInscription: BigNumber,
//     price: BigNumber,
//     paymentUtxos: UTXO[],
//     dummyUtxo: UTXO,
//     feeRate: number,
// }

// ): ICreateRawTxResp => {
//     const psbt = new Psbt({ network: tcBTCNetwork });

//     let totalValue = BNZero;

//     const { p2pktr, address: buyerAddress } = generateTaprootAddressFromPubKey(internalPubKey);

//     // Add dummy utxo to the first input coin
//     psbt.addInput({
//         hash: dummyUtxo.tx_hash,
//         index: dummyUtxo.tx_output_n,
//         witnessUtxo: { value: dummyUtxo.value.toNumber(), script: p2pktr.output as Buffer },
//         tapInternalKey: internalPubKey,
//     });

//     // Add inscription output
//     // the frist output coin has value equal to the sum of dummy value and value inscription
//     // this makes sure the first output coin is inscription outcoin 
//     psbt.addOutput({
//         address: receiverInscriptionAddress,
//         value: dummyUtxo.value.plus(valueInscription).toNumber(),
//     });

//     if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
//     }

//     for (let i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
//         // Add seller signed input
//         psbt.addInput({
//             ...sellerSignedPsbt.txInputs[i],
//             ...sellerSignedPsbt.data.inputs[i]
//         });
//         // Add seller output
//         psbt.addOutput({
//             ...sellerSignedPsbt.txOutputs[i],
//         });
//     }

//     // Add payment utxo inputs
//     for (const utxo of paymentUtxos) {
//         psbt.addInput({
//             hash: utxo.tx_hash,
//             index: utxo.tx_output_n,
//             witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output as Buffer },
//             tapInternalKey: internalPubKey,
//         });

//         totalValue = totalValue.plus(utxo.value);
//     }

//     let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));
//     if (fee.plus(price).gt(totalValue)) {
//         fee = totalValue.minus(price);   // maximum fee can paid
//         if (fee.lt(BNZero)) {
//             throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE);
//         }
//     }
//     let changeValue = totalValue.minus(price).minus(fee);

//     if (changeValue.gte(DummyUTXOValue)) {
//         // Create a new dummy utxo output for the next purchase
//         psbt.addOutput({
//             address: buyerAddress,
//             value: DummyUTXOValue,
//         });
//         changeValue = changeValue.minus(DummyUTXOValue);

//         const extraFee = new BigNumber(OutputSize * feeRate);
//         if (changeValue.gte(extraFee)) {
//             changeValue = changeValue.minus(extraFee);
//             fee = fee.plus(extraFee);
//         }
//     }

//     if (changeValue.lt(BNZero)) {
//         throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
//     }

//     // Change utxo
//     if (changeValue.gt(BNZero)) {
//         if (changeValue.gte(MinSats)) {
//             psbt.addOutput({
//                 address: buyerAddress,
//                 value: changeValue.toNumber(),
//             });
//         } else {
//             fee = fee.plus(changeValue);
//             changeValue = BNZero;
//         }
//     }

//     const indicesToSign: number[] = [];
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         if (i === 0 || i > sellerSignedPsbt.txInputs.length) {
//             indicesToSign.push(i);
//         }
//     }

//     return { base64Psbt: psbt.toBase64(), selectedUTXOs: [...paymentUtxos, dummyUtxo], indicesToSign, fee: fee, changeAmount: changeValue };
// };

// /**
// * createPSBTToBuy creates the partially signed bitcoin transaction to buy the inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerSignedPsbt PSBT from seller
// * @param buyerPrivateKey buffer private key of the buyer
// * @param buyerAddress payment address of the buy to receive inscription
// * @param valueInscription value in inscription
// * @param price price of the inscription that the seller wants to sell (in satoshi)
// * @param paymentUtxos cardinal input coins to payment
// * @param dummyUtxo cardinal dummy input coin
// * @returns the encoded base64 partially signed transaction
// */
// const createPSBTToBuyMultiInscriptions = (
//     {
//         buyReqFullInfos,
//         buyerPrivateKey,
//         feeUTXOs,
//         fee,
//         dummyUTXO,
//         feeRatePerByte,

//     }: {
//         buyReqFullInfos: BuyReqFullInfo[],
//         buyerPrivateKey: Buffer,
//         feeUTXOs: UTXO[],
//         fee: BigNumber,
//         dummyUTXO: UTXO,
//         feeRatePerByte: number,
//     }
// ): ICreateTxResp => {

//     // validation
//     if (buyReqFullInfos.length === 0) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "buyReqFullInfos is empty");
//     }

//     const psbt = new Psbt({ network: tcBTCNetwork });
//     const indexInputNeedToSign: number[] = [];
//     const selectedUTXOs: UTXO[] = [];

//     const { keyPair, tweakedSigner, p2pktr, senderAddress: buyerAddress } = generateTaprootKeyPair(buyerPrivateKey);

//     // Add dummy utxo to the first input coin
//     psbt.addInput({
//         hash: dummyUTXO.tx_hash,
//         index: dummyUTXO.tx_output_n,
//         witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output as Buffer },
//         tapInternalKey: toXOnly(keyPair.publicKey),
//     });
//     indexInputNeedToSign.push(0);
//     selectedUTXOs.push(dummyUTXO);

//     // Add the first inscription output
//     // the frist output coin has value equal to the sum of dummy value and value inscription
//     // this makes sure the first output coin is inscription outcoin 
//     const theFirstBuyReq = buyReqFullInfos[0];
//     psbt.addOutput({
//         address: theFirstBuyReq.receiverInscriptionAddress,
//         value: dummyUTXO.value.plus(theFirstBuyReq.valueInscription).toNumber(),
//     });

//     for (let i = 0; i < buyReqFullInfos.length; i++) {
//         const info = buyReqFullInfos[i];
//         const sellerSignedPsbt = info.sellerSignedPsbt;
//         const paymentUTXO = info.paymentUTXO;
//         if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
//             throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
//         }

//         for (let i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
//             // Add seller signed input
//             psbt.addInput({
//                 ...sellerSignedPsbt.txInputs[i],
//                 ...sellerSignedPsbt.data.inputs[i]
//             });
//             // Add seller output
//             psbt.addOutput({
//                 ...sellerSignedPsbt.txOutputs[i],
//             });
//         }

//         // add payment utxo input
//         psbt.addInput({
//             hash: paymentUTXO.tx_hash,
//             index: paymentUTXO.tx_output_n,
//             witnessUtxo: { value: paymentUTXO.value.toNumber(), script: p2pktr.output as Buffer },
//             tapInternalKey: toXOnly(keyPair.publicKey),
//         });
//         indexInputNeedToSign.push(psbt.txInputs.length - 1);
//         selectedUTXOs.push(paymentUTXO);

//         // add receiver next inscription output
//         if (i < buyReqFullInfos.length - 1) {
//             const theNextBuyReq = buyReqFullInfos[i + 1];
//             psbt.addOutput({
//                 address: theNextBuyReq.receiverInscriptionAddress,
//                 value: theNextBuyReq.valueInscription.toNumber(),
//             });
//         }
//     }

//     // add utxo for pay fee
//     let totalAmountFeeUTXOs = BNZero;
//     for (const utxo of feeUTXOs) {
//         psbt.addInput({
//             hash: utxo.tx_hash,
//             index: utxo.tx_output_n,
//             witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output as Buffer },
//             tapInternalKey: toXOnly(keyPair.publicKey),
//         });
//         indexInputNeedToSign.push(psbt.txInputs.length - 1);
//         totalAmountFeeUTXOs = totalAmountFeeUTXOs.plus(utxo.value);
//     }
//     selectedUTXOs.push(...feeUTXOs);

//     // let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));

//     if (fee.gt(totalAmountFeeUTXOs)) {
//         fee = totalAmountFeeUTXOs;   // maximum fee can paid
//     }
//     let changeValue = totalAmountFeeUTXOs.minus(fee);

//     if (changeValue.gte(DummyUTXOValue)) {
//         // Create a new dummy utxo output for the next purchase
//         psbt.addOutput({
//             address: buyerAddress,
//             value: DummyUTXOValue,
//         });
//         changeValue = changeValue.minus(DummyUTXOValue);

//         const extraFee = new BigNumber(OutputSize * feeRatePerByte);
//         if (changeValue.gte(extraFee)) {
//             changeValue = changeValue.minus(extraFee);
//             fee = fee.plus(extraFee);
//         }
//     }

//     if (changeValue.lt(BNZero)) {
//         throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
//     }

//     // Change utxo
//     if (changeValue.gt(BNZero)) {
//         if (changeValue.gte(MinSats)) {
//             psbt.addOutput({
//                 address: buyerAddress,
//                 value: changeValue.toNumber(),
//             });
//         } else {
//             fee = fee.plus(changeValue);
//             changeValue = BNZero;
//         }
//     }

//     console.log("indexInputNeedToSign: ", indexInputNeedToSign);

//     // sign tx
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         if (indexInputNeedToSign.findIndex(value => value === i) !== -1) {
//             psbt.signInput(i, tweakedSigner);
//         }
//     }

//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         if (indexInputNeedToSign.findIndex(value => value === i) !== -1) {
//             psbt.finalizeInput(i);
//             try {
//                 const isValid = psbt.validateSignaturesOfInput(i, verifySchnorr, tweakedSigner.publicKey);
//                 if (!isValid) {
//                     console.log("Tx signature is invalid " + i);
//                 }
//             } catch (e) {
//                 console.log("Tx signature is invalid " + i);
//             }
//         }
//     }

//     // get tx hex
//     const tx = psbt.extractTransaction();
//     console.log("Transaction : ", tx);
//     const txHex = tx.toHex();
//     return { txID: tx.getId(), txHex, fee, selectedUTXOs, changeAmount: changeValue, tx, };
// };


// /**
// * createRawPSBTToBuyMultiInscriptions creates the partially signed bitcoin transaction to buy multiple inscriptions. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerSignedPsbt PSBT from seller
// * @param internalPubKey buffer public key of the buyer
// * @param buyerAddress payment address of the buy to receive inscription
// * @param valueInscription value in inscription
// * @param price price of the inscription that the seller wants to sell (in satoshi)
// * @param paymentUtxos cardinal input coins to payment
// * @param dummyUtxo cardinal dummy input coin
// * @returns the encoded base64 partially signed transaction
// */
// const createRawPSBTToBuyMultiInscriptions = (
//     {
//         buyReqFullInfos,
//         internalPubKey,
//         feeUTXOs,
//         fee,
//         dummyUTXO,
//         feeRatePerByte,

//     }: {
//         buyReqFullInfos: BuyReqFullInfo[],
//         internalPubKey: Buffer,
//         feeUTXOs: UTXO[],
//         fee: BigNumber,
//         dummyUTXO: UTXO,
//         feeRatePerByte: number,
//     }
// ): ICreateRawTxResp => {

//     // validation
//     if (buyReqFullInfos.length === 0) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "buyReqFullInfos is empty");
//     }

//     const psbt = new Psbt({ network: tcBTCNetwork });
//     const indexInputNeedToSign: number[] = [];
//     const selectedUTXOs: UTXO[] = [];

//     const { p2pktr, address: buyerAddress } = generateTaprootAddressFromPubKey(internalPubKey);

//     // Add dummy utxo to the first input coin
//     psbt.addInput({
//         hash: dummyUTXO.tx_hash,
//         index: dummyUTXO.tx_output_n,
//         witnessUtxo: { value: dummyUTXO.value.toNumber(), script: p2pktr.output as Buffer },
//         tapInternalKey: internalPubKey,
//     });
//     indexInputNeedToSign.push(0);
//     selectedUTXOs.push(dummyUTXO);

//     // Add the first inscription output
//     // the frist output coin has value equal to the sum of dummy value and value inscription
//     // this makes sure the first output coin is inscription outcoin 
//     const theFirstBuyReq = buyReqFullInfos[0];
//     psbt.addOutput({
//         address: theFirstBuyReq.receiverInscriptionAddress,
//         value: dummyUTXO.value.plus(theFirstBuyReq.valueInscription).toNumber(),
//     });

//     for (let i = 0; i < buyReqFullInfos.length; i++) {
//         const info = buyReqFullInfos[i];
//         const sellerSignedPsbt = info.sellerSignedPsbt;
//         const paymentUTXO = info.paymentUTXO;
//         if (sellerSignedPsbt.txInputs.length !== sellerSignedPsbt.txOutputs.length) {
//             throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Length of inputs and outputs in seller psbt must not be different.");
//         }

//         for (let i = 0; i < sellerSignedPsbt.txInputs.length; i++) {
//             // Add seller signed input
//             psbt.addInput({
//                 ...sellerSignedPsbt.txInputs[i],
//                 ...sellerSignedPsbt.data.inputs[i]
//             });
//             // Add seller output
//             psbt.addOutput({
//                 ...sellerSignedPsbt.txOutputs[i],
//             });
//         }

//         // add payment utxo input
//         psbt.addInput({
//             hash: paymentUTXO.tx_hash,
//             index: paymentUTXO.tx_output_n,
//             witnessUtxo: { value: paymentUTXO.value.toNumber(), script: p2pktr.output as Buffer },
//             tapInternalKey: internalPubKey,
//         });
//         indexInputNeedToSign.push(psbt.txInputs.length - 1);
//         selectedUTXOs.push(paymentUTXO);

//         // add receiver next inscription output
//         if (i < buyReqFullInfos.length - 1) {
//             const theNextBuyReq = buyReqFullInfos[i + 1];
//             psbt.addOutput({
//                 address: theNextBuyReq.receiverInscriptionAddress,
//                 value: theNextBuyReq.valueInscription.toNumber(),
//             });
//         }
//     }

//     // add utxo for pay fee
//     let totalAmountFeeUTXOs = BNZero;
//     for (const utxo of feeUTXOs) {
//         psbt.addInput({
//             hash: utxo.tx_hash,
//             index: utxo.tx_output_n,
//             witnessUtxo: { value: utxo.value.toNumber(), script: p2pktr.output as Buffer },
//             tapInternalKey: internalPubKey,
//         });
//         indexInputNeedToSign.push(psbt.txInputs.length - 1);
//         totalAmountFeeUTXOs = totalAmountFeeUTXOs.plus(utxo.value);
//     }
//     selectedUTXOs.push(...feeUTXOs);

//     // let fee = new BigNumber(estimateTxFee(psbt.txInputs.length, psbt.txOutputs.length, feeRate));

//     if (fee.gt(totalAmountFeeUTXOs)) {
//         fee = totalAmountFeeUTXOs;   // maximum fee can paid
//     }
//     let changeValue = totalAmountFeeUTXOs.minus(fee);

//     if (changeValue.gte(DummyUTXOValue)) {
//         // Create a new dummy utxo output for the next purchase
//         psbt.addOutput({
//             address: buyerAddress,
//             value: DummyUTXOValue,
//         });
//         changeValue = changeValue.minus(DummyUTXOValue);

//         const extraFee = new BigNumber(OutputSize * feeRatePerByte);
//         if (changeValue.gte(extraFee)) {
//             changeValue = changeValue.minus(extraFee);
//             fee = fee.plus(extraFee);
//         }
//     }

//     if (changeValue.lt(BNZero)) {
//         throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND);
//     }

//     // Change utxo
//     if (changeValue.gt(BNZero)) {
//         if (changeValue.gte(MinSats)) {
//             psbt.addOutput({
//                 address: buyerAddress,
//                 value: changeValue.toNumber(),
//             });
//         } else {
//             fee = fee.plus(changeValue);
//             changeValue = BNZero;
//         }
//     }

//     console.log("indexInputNeedToSign: ", indexInputNeedToSign);


//     return { base64Psbt: psbt.toBase64(), selectedUTXOs, indicesToSign: indexInputNeedToSign, fee, changeAmount: changeValue };
// };

// /**
// * reqListForSaleInscription creates the PSBT of the seller to list for sale inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerPrivateKey buffer private key of the seller
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the seller
// * @param sellInscriptionID id of inscription to sell
// * @param receiverBTCAddress the seller's address to receive BTC
// * @param amountPayToSeller BTC amount to pay to seller
// * @param feePayToCreator BTC fee to pay to creator
// * @param creatorAddress address of creator
// * amountPayToSeller + feePayToCreator = price that is showed on UI
// * @returns the base64 encode Psbt
// */
// const reqListForSaleInscription = async (
//     params: {
//         sellerPrivateKey: Buffer,
//         utxos: UTXO[],
//         inscriptions: { [key: string]: Inscription[] },
//         sellInscriptionID: string,
//         receiverBTCAddress: string,
//         amountPayToSeller: BigNumber,
//         feePayToCreator: BigNumber,
//         creatorAddress: string,
//         feeRatePerByte: number,
//     }
// ): Promise<ICreateTxSellResp> => {
//     const { sellerPrivateKey,
//         utxos,
//         inscriptions,
//         sellInscriptionID,
//         receiverBTCAddress,
//         feeRatePerByte
//     } = params;

//     let {
//         amountPayToSeller,
//         feePayToCreator,
//         creatorAddress,
//     } = params;

//     // validation
//     if (feePayToCreator.gt(BNZero) && creatorAddress === "") {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Creator address must not be empty.");
//     }
//     if (sellInscriptionID === "") {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "SellInscriptionID must not be empty.");
//     }
//     if (receiverBTCAddress === "") {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "receiverBTCAddress must not be empty.");
//     }
//     if (amountPayToSeller.eq(BNZero)) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "amountPayToSeller must be greater than zero.");
//     }

//     let needDummyUTXO = false;

//     if (feePayToCreator.gt(BNZero)) {
//         // creator is the selller
//         if (creatorAddress !== receiverBTCAddress) {
//             needDummyUTXO = true;
//         } else {
//             // create only one output, don't need to create 2 outputs
//             amountPayToSeller = amountPayToSeller.plus(feePayToCreator);
//             creatorAddress = "";
//             feePayToCreator = BNZero;
//         }
//     }

//     if (amountPayToSeller.lt(MinSats)) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "amountPayToSeller must not be less than " + fromSat(MinSats) + " BTC.");
//     }
//     if (feePayToCreator.gt(BNZero) && feePayToCreator.lt(MinSats)) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "feePayToCreator must not be less than " + fromSat(MinSats) + " BTC.");
//     }

//     // select inscription UTXO
//     const { inscriptionUTXO, inscriptionInfo } = selectInscriptionUTXO(utxos, inscriptions, sellInscriptionID);
//     let newInscriptionUTXO = inscriptionUTXO;

//     // select dummy UTXO 
//     // if there is no dummy UTXO, we have to create and broadcast the tx to split dummy UTXO first
//     let dummyUTXORes: any;
//     let selectedUTXOs: UTXO[] = [];
//     let splitTxID = "";
//     let splitTxRaw = "";

//     if (needDummyUTXO) {
//         try {
//             // create dummy UTXO from cardinal UTXOs
//             const res = await createDummyUTXOFromCardinal(sellerPrivateKey, utxos, inscriptions, feeRatePerByte);
//             dummyUTXORes = res.dummyUTXO;
//             selectedUTXOs = res.selectedUTXOs;
//             splitTxID = res.splitTxID;
//             splitTxRaw = res.txHex;
//         } catch (e) {
//             // create dummy UTXO from inscription UTXO
//             const { txID, txHex, newValueInscription } = createTxSplitFundFromOrdinalUTXO(sellerPrivateKey, inscriptionUTXO, inscriptionInfo, new BigNumber(DummyUTXOValue), feeRatePerByte);
//             splitTxID = txID;
//             splitTxRaw = txHex;

//             newInscriptionUTXO = {
//                 tx_hash: txID,
//                 tx_output_n: 0,
//                 value: newValueInscription,
//             };
//             dummyUTXORes = {
//                 tx_hash: txID,
//                 tx_output_n: 1,
//                 value: new BigNumber(DummyUTXOValue),
//             };
//         }
//     }
//     console.log("sell splitTxID: ", splitTxID);
//     console.log("sell dummyUTXORes: ", dummyUTXORes);
//     console.log("sell newInscriptionUTXO: ", newInscriptionUTXO);

//     const base64Psbt = createPSBTToSell({
//         inscriptionUTXO: newInscriptionUTXO,
//         amountPayToSeller: amountPayToSeller,
//         receiverBTCAddress: receiverBTCAddress,
//         sellerPrivateKey: sellerPrivateKey,
//         dummyUTXO: dummyUTXORes,
//         creatorAddress: creatorAddress,
//         feePayToCreator: feePayToCreator,
//     });

//     const inscriptionUTXOs = [inscriptionUTXO];
//     if (dummyUTXORes !== null) {
//         inscriptionUTXOs.push(dummyUTXORes);
//     }

//     return { base64Psbt, selectedUTXOs: inscriptionUTXOs, splitTxID, splitUTXOs: selectedUTXOs, splitTxRaw: splitTxRaw };
// };


// /**
// * reqListForSaleInscFromAnyWallet creates the PSBT of the seller to list for sale inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerPrivateKey buffer private key of the seller
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the seller
// * @param sellInscriptionID id of inscription to sell
// * @param receiverBTCAddress the seller's address to receive BTC
// * @param amountPayToSeller BTC amount to pay to seller
// * @param feePayToCreator BTC fee to pay to creator
// * @param creatorAddress address of creator
// * amountPayToSeller + feePayToCreator = price that is showed on UI
// * @returns the base64 encode Psbt
// */
// const reqListForSaleInscFromAnyWallet = async ({
//     pubKey,
//     utxos,
//     inscriptions,
//     sellInscriptionID,
//     receiverBTCAddress,
//     amountPayToSeller,
//     feePayToCreator,
//     creatorAddress,
//     feeRatePerByte,
//     walletType = WalletType.Xverse,
//     cancelFn,
// }: {
//     pubKey: Buffer,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     sellInscriptionID: string,
//     receiverBTCAddress: string,
//     amountPayToSeller: BigNumber,
//     feePayToCreator: BigNumber,
//     creatorAddress: string,
//     feeRatePerByte: number,
//     walletType?: number,
//     cancelFn: () => void,
// }): Promise<ICreateTxSellResp> => {
//     // validation
//     if (feePayToCreator.gt(BNZero) && creatorAddress === "") {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Creator address must not be empty.");
//     }
//     if (sellInscriptionID === "") {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "SellInscriptionID must not be empty.");
//     }
//     if (receiverBTCAddress === "") {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "receiverBTCAddress must not be empty.");
//     }
//     if (amountPayToSeller.eq(BNZero)) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "amountPayToSeller must be greater than zero.");
//     }

//     let needDummyUTXO = false;

//     if (feePayToCreator.gt(BNZero)) {
//         // creator is the selller
//         if (creatorAddress !== receiverBTCAddress) {
//             needDummyUTXO = true;
//         } else {
//             // create only one output, don't need to create 2 outputs
//             amountPayToSeller = amountPayToSeller.plus(feePayToCreator);
//             creatorAddress = "";
//             feePayToCreator = BNZero;
//         }
//     }

//     if (amountPayToSeller.lt(MinSats)) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "amountPayToSeller must not be less than " + fromSat(MinSats) + " BTC.");
//     }
//     if (feePayToCreator.gt(BNZero) && feePayToCreator.lt(MinSats)) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "feePayToCreator must not be less than " + fromSat(MinSats) + " BTC.");
//     }


//     const { address } = generateTaprootAddressFromPubKey(pubKey);

//     // select inscription UTXO
//     const { inscriptionUTXO, inscriptionInfo } = selectInscriptionUTXO(utxos, inscriptions, sellInscriptionID);
//     let newInscriptionUTXO = inscriptionUTXO;

//     // select dummy UTXO 
//     // if there is no dummy UTXO, we have to create and broadcast the tx to split dummy UTXO first
//     let dummyUTXORes: any;
//     let selectedUTXOsRes: UTXO[] = [];
//     let splitTxID = "";
//     let splitTxRaw = "";

//     if (needDummyUTXO) {
//         const { dummyUTXO, splitPsbtB64, indicesToSign, selectedUTXOs, newValueInscription } = createRawTxDummyUTXOForSale({
//             pubKey,
//             utxos,
//             inscriptions,
//             sellInscriptionID,
//             feeRatePerByte,
//         });

//         if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.tx_hash !== "") {
//             // select an available dummy UTXO
//             dummyUTXORes = dummyUTXO;

//         } else {
//             // need to create split tx 
//             // sign transaction 
//             const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
//                 base64Psbt: splitPsbtB64,
//                 indicesToSign,
//                 address,
//                 isGetMsgTx: true,
//                 walletType,
//                 cancelFn
//             });

//             splitTxID = msgTxID;
//             splitTxRaw = msgTxHex;
//             selectedUTXOsRes = selectedUTXOs;

//             if (newValueInscription.eq(BNZero)) {
//                 // split from cardinal
//                 dummyUTXORes = {
//                     tx_hash: splitTxID,
//                     tx_output_n: 0,
//                     value: new BigNumber(DummyUTXOValue),
//                 };
//                 newInscriptionUTXO = inscriptionUTXO;

//             } else {
//                 // split from ordinal
//                 newInscriptionUTXO = {
//                     tx_hash: splitTxID,
//                     tx_output_n: 0,
//                     value: newValueInscription,
//                 };
//                 dummyUTXORes = {
//                     tx_hash: splitTxID,
//                     tx_output_n: 1,
//                     value: new BigNumber(DummyUTXOValue),
//                 };
//             }
//         }
//     }
//     console.log("sell splitTxID: ", splitTxID);
//     console.log("sell dummyUTXORes: ", dummyUTXORes);
//     console.log("sell newInscriptionUTXO: ", newInscriptionUTXO);

//     const rawPsbtRes = createRawPSBTToSell({
//         inscriptionUTXO: newInscriptionUTXO,
//         amountPayToSeller: amountPayToSeller,
//         receiverBTCAddress: receiverBTCAddress,
//         internalPubKey: pubKey,
//         dummyUTXO: dummyUTXORes,
//         creatorAddress: creatorAddress,
//         feePayToCreator: feePayToCreator,
//     });

//     // sign transaction 
//     const { base64SignedPsbt } = await handleSignPsbtWithSpecificWallet({
//         base64Psbt: rawPsbtRes.base64Psbt,
//         indicesToSign: rawPsbtRes.indicesToSign,
//         address,
//         sigHashType: SigHashTypeForSale,
//         walletType,
//         cancelFn
//     });

//     const inscriptionUTXOs = [inscriptionUTXO];
//     if (dummyUTXORes !== null) {
//         inscriptionUTXOs.push(dummyUTXORes);
//     }

//     return { base64Psbt: base64SignedPsbt, selectedUTXOs: inscriptionUTXOs, splitTxID, splitUTXOs: selectedUTXOsRes, splitTxRaw: splitTxRaw };
// };

// /**
// * reqBuyInscription creates the PSBT of the seller to list for sale inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerSignedPsbtB64 buffer private key of the buyer
// * @param buyerPrivateKey buffer private key of the buyer
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the seller
// * @param sellInscriptionID id of inscription to sell
// * @param receiverBTCAddress the seller's address to receive BTC
// * @param price  = amount pay to seller + fee pay to creator
// * @returns the base64 encode Psbt
// */
// const reqBuyInscription = async (
//     params: {
//         sellerSignedPsbtB64: string,
//         buyerPrivateKey: Buffer,
//         receiverInscriptionAddress: string,
//         price: BigNumber,
//         utxos: UTXO[],
//         inscriptions: { [key: string]: Inscription[] },
//         feeRatePerByte: number,
//     }
// ): Promise<ICreateTxBuyResp> => {
//     const {
//         sellerSignedPsbtB64,
//         buyerPrivateKey,
//         receiverInscriptionAddress,
//         price,
//         utxos,
//         inscriptions,
//         feeRatePerByte
//     } = params;
//     // decode seller's signed PSBT
//     const sellerSignedPsbt = Psbt.fromBase64(sellerSignedPsbtB64, { network: tcBTCNetwork });
//     const sellerInputs = sellerSignedPsbt.data.inputs;
//     if (sellerInputs.length === 0) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Invalid seller's PSBT.");
//     }
//     const valueInscription = sellerInputs[0].witnessUtxo?.value;
//     if (valueInscription === undefined || valueInscription === 0) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
//     }

//     const newUTXOs = utxos;

//     // select or create dummy UTXO
//     const { dummyUTXO, splitTxID, selectedUTXOs, newUTXO, fee: feeSplitUTXO, txHex: splitTxRaw } = await createDummyUTXOFromCardinal(
//         buyerPrivateKey, utxos, inscriptions, feeRatePerByte);

//     console.log("buy dummyUTXO: ", dummyUTXO);
//     console.log("buy splitTxID: ", splitTxID);
//     console.log("buy selectedUTXOs for split: ", selectedUTXOs);
//     console.log("buy newUTXO: ", newUTXO);


//     // remove selected utxo or dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT 
//     if (selectedUTXOs.length > 0) {
//         for (const selectedUtxo of selectedUTXOs) {
//             const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
//             newUTXOs.splice(index, 1);
//         }
//     } else {
//         const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === dummyUTXO.tx_hash && utxo.tx_output_n === dummyUTXO.tx_output_n);
//         newUTXOs.splice(index, 1);
//     }

//     if (newUTXO !== undefined && newUTXO !== null) {
//         newUTXOs.push(newUTXO);
//     }

//     console.log("buy newUTXOs: ", newUTXOs);

//     // select cardinal UTXOs to payment
//     const { selectedUTXOs: paymentUTXOs } = selectUTXOsToCreateBuyTx({ sellerSignedPsbt: sellerSignedPsbt, price: price, utxos: newUTXOs, inscriptions, feeRate: feeRatePerByte });

//     console.log("selected UTXOs to buy paymentUTXOs: ", paymentUTXOs);

//     // create PBTS from the seller's one
//     const res = createPSBTToBuy({
//         sellerSignedPsbt: sellerSignedPsbt,
//         buyerPrivateKey: buyerPrivateKey,
//         receiverInscriptionAddress: receiverInscriptionAddress,
//         valueInscription: new BigNumber(valueInscription),
//         price: price,
//         paymentUtxos: paymentUTXOs,
//         dummyUtxo: dummyUTXO,
//         feeRate: feeRatePerByte,
//     });

//     return {
//         tx: res.tx,
//         txID: res?.txID,
//         txHex: res?.txHex,
//         fee: res?.fee.plus(feeSplitUTXO),
//         selectedUTXOs: [...paymentUTXOs, dummyUTXO],
//         splitTxID,
//         splitUTXOs: [...selectedUTXOs],
//         splitTxRaw: splitTxRaw,
//     };
// };

// /**
// * reqBuyInscription creates the PSBT of the seller to list for sale inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerSignedPsbtB64 buffer private key of the buyer
// * @param buyerPrivateKey buffer private key of the buyer
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the seller
// * @param sellInscriptionID id of inscription to sell
// * @param receiverBTCAddress the seller's address to receive BTC
// * @param price  = amount pay to seller + fee pay to creator
// * @returns the base64 encode Psbt
// */
// const reqBuyInscriptionFromAnyWallet = async ({
//     sellerSignedPsbtB64,
//     pubKey,
//     receiverInscriptionAddress,
//     price,
//     utxos,
//     inscriptions,
//     feeRatePerByte,
//     walletType = WalletType.Xverse,
//     cancelFn,
// }: {

//     sellerSignedPsbtB64: string,
//     pubKey: Buffer,
//     receiverInscriptionAddress: string,
//     price: BigNumber,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     feeRatePerByte: number,
//     walletType?: number,
//     cancelFn: () => void,
// }): Promise<ICreateTxBuyResp> => {

//     // decode seller's signed PSBT
//     const sellerSignedPsbt = Psbt.fromBase64(sellerSignedPsbtB64, { network: tcBTCNetwork });
//     const sellerInputs = sellerSignedPsbt.data.inputs;
//     if (sellerInputs.length === 0) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Invalid seller's PSBT.");
//     }
//     const valueInscription = sellerInputs[0].witnessUtxo?.value;
//     if (valueInscription === undefined || valueInscription === 0) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
//     }

//     const newUTXOs = utxos;
//     let splitTxID = "";
//     let splitTxRaw = "";
//     let dummyUTXORes: UTXO;
//     let newUTXO: any;

//     const { address } = generateTaprootAddressFromPubKey(pubKey);

//     // select or create dummy UTXO
//     const { dummyUTXO, splitPsbtB64, indicesToSign, selectedUTXOs, changeAmount, fee: feeSplitUTXO } = await createRawTxDummyUTXOFromCardinal(
//         pubKey, utxos, inscriptions, feeRatePerByte);

//     if (dummyUTXO !== undefined && dummyUTXO !== null && dummyUTXO.tx_hash !== "") {
//         // select an available dummy UTXO
//         dummyUTXORes = dummyUTXO;

//     } else {
//         // need to create split tx 
//         // sign transaction 
//         const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
//             base64Psbt: splitPsbtB64,
//             indicesToSign,
//             address,
//             isGetMsgTx: true,
//             walletType,
//             cancelFn
//         });

//         splitTxID = msgTxID;
//         splitTxRaw = msgTxHex;


//         // split from cardinal
//         dummyUTXORes = {
//             tx_hash: splitTxID,
//             tx_output_n: 0,
//             value: new BigNumber(DummyUTXOValue),
//         };

//         if (changeAmount.gt(BNZero)) {
//             newUTXO = {
//                 tx_hash: splitTxID,
//                 tx_output_n: 1,
//                 value: new BigNumber(changeAmount),
//             };
//         }
//     }
//     console.log("buy dummyUTXO: ", dummyUTXO);
//     console.log("buy splitTxID: ", splitTxID);
//     console.log("buy selectedUTXOs for split: ", selectedUTXOs);
//     console.log("buy newUTXO: ", newUTXO);

//     // remove selected utxo or dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT 
//     if (selectedUTXOs.length > 0) {
//         for (const selectedUtxo of selectedUTXOs) {
//             const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
//             newUTXOs.splice(index, 1);
//         }
//     } else {
//         const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === dummyUTXO.tx_hash && utxo.tx_output_n === dummyUTXO.tx_output_n);
//         newUTXOs.splice(index, 1);
//     }

//     if (newUTXO !== undefined && newUTXO !== null) {
//         newUTXOs.push(newUTXO);
//     }

//     console.log("buy newUTXOs: ", newUTXOs);

//     // select cardinal UTXOs to payment
//     const { selectedUTXOs: paymentUTXOs } = selectUTXOsToCreateBuyTx({ sellerSignedPsbt: sellerSignedPsbt, price: price, utxos: newUTXOs, inscriptions, feeRate: feeRatePerByte });

//     console.log("selected UTXOs to buy paymentUTXOs: ", paymentUTXOs);

//     // create PBTS from the seller's one
//     const rawBuyRes = createRawPSBTToBuy({
//         sellerSignedPsbt: sellerSignedPsbt,
//         internalPubKey: pubKey,
//         receiverInscriptionAddress: receiverInscriptionAddress,
//         valueInscription: new BigNumber(valueInscription),
//         price: price,
//         paymentUtxos: paymentUTXOs,
//         dummyUtxo: dummyUTXORes,
//         feeRate: feeRatePerByte,
//     });
//     // sign transaction 
//     const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
//         base64Psbt: rawBuyRes.base64Psbt,
//         indicesToSign: rawBuyRes.indicesToSign,
//         address,
//         isGetMsgTx: true,
//         walletType,
//         cancelFn
//     });


//     return {
//         tx: msgTx,
//         txID: msgTxID,
//         txHex: msgTxHex,
//         fee: rawBuyRes.fee.plus(feeSplitUTXO),
//         selectedUTXOs: [...paymentUTXOs, dummyUTXORes],
//         splitTxID,
//         splitUTXOs: [...selectedUTXOs],
//         splitTxRaw: splitTxRaw,
//     };
// };


// /**
// * reqBuyInscription creates the PSBT of the seller to list for sale inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerSignedPsbtB64 buffer private key of the buyer
// * @param buyerPrivateKey buffer private key of the buyer
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the seller
// * @param sellInscriptionID id of inscription to sell
// * @param receiverBTCAddress the seller's address to receive BTC
// * @param price  = amount pay to seller + fee pay to creator
// * @returns the base64 encode Psbt
// */
// const reqBuyMultiInscriptions = (
//     params: {
//         buyReqInfos: BuyReqInfo[],
//         buyerPrivateKey: Buffer,
//         utxos: UTXO[],
//         inscriptions: { [key: string]: Inscription[] },
//         feeRatePerByte: number,
//     }
// ): ICreateTxBuyResp => {
//     const {
//         buyReqInfos,
//         buyerPrivateKey,
//         utxos,
//         inscriptions,
//         feeRatePerByte
//     } = params;

//     // 
//     const { senderAddress: buyerAddress } = generateTaprootKeyPair(buyerPrivateKey);

//     // decode list of seller's signed PSBT
//     let buyReqFullInfos: BuyReqFullInfo[] = [];

//     for (let i = 0; i < buyReqInfos.length; i++) {
//         const sellerSignedPsbtB64 = buyReqInfos[i].sellerSignedPsbtB64;
//         const sellerSignedPsbt = Psbt.fromBase64(sellerSignedPsbtB64, { network: tcBTCNetwork });
//         const sellerInputs = sellerSignedPsbt.data.inputs;
//         if (sellerInputs.length === 0) {
//             throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Invalid seller's PSBT.");
//         }
//         const valueInscription = sellerInputs[0].witnessUtxo?.value;
//         if (valueInscription === undefined || valueInscription === 0) {
//             throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
//         }

//         buyReqFullInfos.push({
//             ...buyReqInfos[i],
//             sellerSignedPsbt,
//             valueInscription: new BigNumber(valueInscription),
//             paymentUTXO: null,
//         });
//     }

//     const newUTXOs = [...utxos];

//     // need to split UTXOs correspond to list of prices to payment
//     // and only one dummy UTXO for multiple inscriptions
//     const { buyReqFullInfos: buyReqFullInfosRes, dummyUTXO, splitTxID, selectedUTXOs, newUTXO, fee: feeSplitUTXO, splitTxHex } = prepareUTXOsToBuyMultiInscriptions(
//         { privateKey: buyerPrivateKey, address: buyerAddress, utxos, inscriptions, feeRatePerByte, buyReqFullInfos });

//     buyReqFullInfos = buyReqFullInfosRes;

//     console.log("buyReqFullInfos: ", buyReqFullInfos);
//     console.log("buyReqInfos: ", buyReqInfos);

//     console.log("buy dummyUTXO: ", dummyUTXO);
//     console.log("buy splitTxID: ", splitTxID);
//     console.log("buy selectedUTXOs for split: ", selectedUTXOs);
//     console.log("buy newUTXO: ", newUTXO);


//     // remove selected utxo, payment utxo, dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT
//     const tmpSelectedUTXOs = [...selectedUTXOs];
//     for (const info of buyReqFullInfos) {
//         tmpSelectedUTXOs.push(info.paymentUTXO);
//     }
//     tmpSelectedUTXOs.push(dummyUTXO);
//     for (const selectedUtxo of tmpSelectedUTXOs) {
//         const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
//         if (index !== -1) {
//             newUTXOs.splice(index, 1);
//         }
//     }

//     if (newUTXO !== undefined && newUTXO !== null) {
//         newUTXOs.push(newUTXO);
//     }

//     console.log("buy newUTXOs: ", newUTXOs);

//     // estimate fee

//     let numIns = 2 + buyReqFullInfos.length; // one for dummy utxo, one for network fee
//     let numOuts = 1 + buyReqFullInfos.length; // one for change value
//     for (const info of buyReqFullInfos) {
//         numIns += info.sellerSignedPsbt.txInputs.length;
//         numOuts += info.sellerSignedPsbt.txOutputs.length;
//     }

//     let fee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
//     // select cardinal UTXOs to pay fee
//     console.log("BUY Fee estimate: ", fee.toNumber());
//     const { selectedUTXOs: feeSelectedUTXOs, totalInputAmount } = selectCardinalUTXOs(newUTXOs, inscriptions, fee);

//     // create PBTS from the seller's one
//     const res = createPSBTToBuyMultiInscriptions({
//         buyReqFullInfos,
//         buyerPrivateKey: buyerPrivateKey,
//         feeUTXOs: feeSelectedUTXOs,
//         fee,
//         dummyUTXO,
//         feeRatePerByte,
//     });
//     fee = res.fee;

//     return {
//         tx: res.tx,
//         txID: res?.txID,
//         txHex: res?.txHex,
//         fee: res?.fee.plus(feeSplitUTXO),
//         selectedUTXOs: res.selectedUTXOs,
//         splitTxID,
//         splitUTXOs: [...selectedUTXOs],
//         splitTxRaw: splitTxHex,
//     };
// };

// /**
// * reqBuyInscription creates the PSBT of the seller to list for sale inscription. 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param sellerSignedPsbtB64 buffer private key of the buyer
// * @param buyerPrivateKey buffer private key of the buyer
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the seller
// * @param sellInscriptionID id of inscription to sell
// * @param receiverBTCAddress the seller's address to receive BTC
// * @param price  = amount pay to seller + fee pay to creator
// * @returns the base64 encode Psbt
// */
// const reqBuyMultiInscriptionsFromAnyWallet = async ({
//     buyReqInfos,
//     pubKey,
//     utxos,
//     inscriptions,
//     feeRatePerByte,
//     walletType = WalletType.Xverse,
//     cancelFn,
// }: {
//     buyReqInfos: BuyReqInfo[],
//     pubKey: Buffer,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     feeRatePerByte: number,
//     walletType?: number,
//     cancelFn: () => void
// }): Promise<ICreateTxBuyResp> => {

//     const { address: buyerAddress } = generateTaprootAddressFromPubKey(pubKey);

//     // decode list of seller's signed PSBT
//     let buyReqFullInfos: BuyReqFullInfo[] = [];

//     for (let i = 0; i < buyReqInfos.length; i++) {
//         const sellerSignedPsbtB64 = buyReqInfos[i].sellerSignedPsbtB64;
//         const sellerSignedPsbt = Psbt.fromBase64(sellerSignedPsbtB64, { network: tcBTCNetwork });
//         const sellerInputs = sellerSignedPsbt.data.inputs;
//         if (sellerInputs.length === 0) {
//             throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Invalid seller's PSBT.");
//         }
//         const valueInscription = sellerInputs[0].witnessUtxo?.value;
//         if (valueInscription === undefined || valueInscription === 0) {
//             throw new SDKError(ERROR_CODE.INVALID_PARAMS, "Invalid value inscription in seller's PSBT.");
//         }

//         buyReqFullInfos.push({
//             ...buyReqInfos[i],
//             sellerSignedPsbt,
//             valueInscription: new BigNumber(valueInscription),
//             paymentUTXO: null,
//         });
//     }

//     const newUTXOs = [...utxos];

//     // need to split UTXOs correspond to list of prices to payment
//     // and only one dummy UTXO for multiple inscriptions
//     const {
//         buyReqFullInfos: buyReqFullInfosRes,
//         dummyUTXO,
//         splitPsbtB64,
//         selectedUTXOs,
//         fee: feeSplitUTXO,
//         changeAmount,
//         needCreateDummyUTXO,
//         needPaymentUTXOs,
//         indicesToSign,
//     } = createRawTxToPrepareUTXOsToBuyMultiInscs({
//         pubKey: pubKey, address: buyerAddress, utxos, inscriptions, feeRatePerByte, buyReqFullInfos
//     });

//     // sign transaction 
//     const { base64SignedPsbt, msgTx, msgTxID, msgTxHex } = await handleSignPsbtWithSpecificWallet({
//         base64Psbt: splitPsbtB64,
//         indicesToSign: indicesToSign,
//         address: buyerAddress,
//         isGetMsgTx: true,
//         walletType,
//         cancelFn
//     });

//     const splitTxID = msgTxID;
//     const splitTxHex = msgTxHex;
//     let dummyUTXORes = dummyUTXO;
//     let newUTXO: any;

//     for (let i = 0; i < needPaymentUTXOs.length; i++) {
//         const info = needPaymentUTXOs[i];
//         const buyInfoIndex = info.buyInfoIndex;
//         if (buyReqFullInfos[buyInfoIndex].paymentUTXO != null) {
//             throw new SDKError(ERROR_CODE.INVALID_CODE);
//         }
//         const newUTXO: UTXO = {
//             tx_hash: splitTxID,
//             tx_output_n: i,
//             value: info.amount,
//         };
//         buyReqFullInfos[buyInfoIndex].paymentUTXO = newUTXO;
//     }

//     if (needCreateDummyUTXO) {
//         dummyUTXORes = {
//             tx_hash: splitTxID,
//             tx_output_n: needPaymentUTXOs.length,  // dummy utxo is the last (last - 1) output in the split tx
//             value: new BigNumber(DummyUTXOValue),
//         };
//     }

//     if (changeAmount.gt(BNZero)) {
//         const indexChangeUTXO = needCreateDummyUTXO ? needPaymentUTXOs.length + 1 : needPaymentUTXOs.length;
//         newUTXO = {
//             tx_hash: splitTxID,
//             tx_output_n: indexChangeUTXO,  // change utxo is the last output in the split tx
//             value: changeAmount,
//         };
//     }

//     buyReqFullInfos = buyReqFullInfosRes;

//     console.log("buyReqFullInfos: ", buyReqFullInfos);
//     console.log("buyReqInfos: ", buyReqInfos);

//     console.log("buy dummyUTXO: ", dummyUTXO);
//     console.log("buy splitTxID: ", splitTxID);
//     console.log("buy selectedUTXOs for split: ", selectedUTXOs);
//     console.log("buy newUTXO: ", newUTXO);


//     // remove selected utxo, payment utxo, dummyUTXO, and append new UTXO to list of UTXO to create the next PSBT
//     const tmpSelectedUTXOs = [...selectedUTXOs];
//     for (const info of buyReqFullInfos) {
//         tmpSelectedUTXOs.push(info.paymentUTXO);
//     }
//     tmpSelectedUTXOs.push(dummyUTXO);
//     for (const selectedUtxo of tmpSelectedUTXOs) {
//         const index = newUTXOs.findIndex((utxo) => utxo.tx_hash === selectedUtxo.tx_hash && utxo.tx_output_n === selectedUtxo.tx_output_n);
//         if (index !== -1) {
//             newUTXOs.splice(index, 1);
//         }
//     }

//     if (newUTXO !== undefined && newUTXO !== null) {
//         newUTXOs.push(newUTXO);
//     }

//     console.log("buy newUTXOs: ", newUTXOs);

//     // estimate fee

//     let numIns = 2 + buyReqFullInfos.length; // one for dummy utxo, one for network fee
//     let numOuts = 1 + buyReqFullInfos.length; // one for change value
//     for (const info of buyReqFullInfos) {
//         numIns += info.sellerSignedPsbt.txInputs.length;
//         numOuts += info.sellerSignedPsbt.txOutputs.length;
//     }

//     let fee = new BigNumber(estimateTxFee(numIns, numOuts, feeRatePerByte));
//     // select cardinal UTXOs to pay fee
//     console.log("BUY Fee estimate: ", fee.toNumber());
//     const { selectedUTXOs: feeSelectedUTXOs, totalInputAmount } = selectCardinalUTXOs(newUTXOs, inscriptions, fee);

//     // create PBTS from the seller's one
//     const rawBuyRes = createRawPSBTToBuyMultiInscriptions({
//         buyReqFullInfos,
//         internalPubKey: pubKey,
//         feeUTXOs: feeSelectedUTXOs,
//         fee,
//         dummyUTXO: dummyUTXORes,
//         feeRatePerByte,
//     });
//     fee = rawBuyRes.fee;
//     // sign transaction 
//     const finalRes = await handleSignPsbtWithSpecificWallet({
//         base64Psbt: rawBuyRes.base64Psbt,
//         indicesToSign: rawBuyRes.indicesToSign,
//         address: buyerAddress,
//         isGetMsgTx: true,
//         walletType,
//         cancelFn
//     });

//     return {
//         tx: finalRes.msgTx,
//         txID: finalRes.msgTxID,
//         txHex: finalRes.msgTxHex,
//         fee: rawBuyRes?.fee.plus(feeSplitUTXO),
//         selectedUTXOs: rawBuyRes.selectedUTXOs,
//         splitTxID,
//         splitUTXOs: [...selectedUTXOs],
//         splitTxRaw: splitTxHex,
//     };
// };


// /**
// * createTx creates the Bitcoin transaction (including sending inscriptions). 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param senderPrivateKey buffer private key of the sender
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the sender
// * @param sendInscriptionID id of inscription to send
// * @param receiverInsAddress the address of the inscription receiver
// * @param sendAmount satoshi amount need to send 
// * @param feeRatePerByte fee rate per byte (in satoshi)
// * @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
// * @returns the transaction id
// * @returns the hex signed transaction
// * @returns the network fee
// */

// const createTxSplitFundFromOrdinalUTXO = (
//     senderPrivateKey: Buffer,
//     inscriptionUTXO: UTXO,
//     inscriptionInfo: Inscription,
//     sendAmount: BigNumber,
//     feeRatePerByte: number,
// ): ICreateTxSplitInscriptionResp => {
//     const { keyPair } = generateTaprootKeyPair(senderPrivateKey);

//     const { resRawTx, newValueInscription } = createRawTxSplitFundFromOrdinalUTXO({
//         pubKey: toXOnly(keyPair.publicKey),
//         inscriptionUTXO, inscriptionInfo,
//         sendAmount,
//         feeRatePerByte,
//     });

//     // sign tx
//     const { signedBase64PSBT, msgTx, msgTxID, msgTxHex } = signPSBT({
//         senderPrivateKey,
//         psbtB64: resRawTx.base64Psbt,
//         indicesToSign: resRawTx.indicesToSign,
//         sigHashType: Transaction.SIGHASH_DEFAULT,
//     });

//     return { txID: msgTxID, txHex: msgTxHex, fee: resRawTx.fee, selectedUTXOs: resRawTx.selectedUTXOs, newValueInscription };
// };

// /**
// * createRawTxSplitFundFromOrdinalUTXO creates the Bitcoin transaction (including sending inscriptions). 
// * NOTE: Currently, the function only supports sending from Taproot address. 
// * @param senderPrivateKey buffer private key of the sender
// * @param utxos list of utxos (include non-inscription and inscription utxos)
// * @param inscriptions list of inscription infos of the sender
// * @param sendInscriptionID id of inscription to send
// * @param receiverInsAddress the address of the inscription receiver
// * @param sendAmount satoshi amount need to send 
// * @param feeRatePerByte fee rate per byte (in satoshi)
// * @param isUseInscriptionPayFee flag defines using inscription coin to pay fee 
// * @returns the transaction id
// * @returns the hex signed transaction
// * @returns the network fee
// */

// const createRawTxSplitFundFromOrdinalUTXO = ({
//     pubKey,
//     inscriptionUTXO,
//     inscriptionInfo,
//     sendAmount,
//     feeRatePerByte,
// }: {
//     pubKey: Buffer,
//     inscriptionUTXO: UTXO,
//     inscriptionInfo: Inscription,
//     sendAmount: BigNumber,
//     feeRatePerByte: number,
// }): { resRawTx: ICreateRawTxResp, newValueInscription: BigNumber } => {
//     // validation
//     if (sendAmount.gt(BNZero) && sendAmount.lt(MinSats)) {
//         throw new SDKError(ERROR_CODE.INVALID_PARAMS, "sendAmount must not be less than " + fromSat(MinSats) + " BTC.");
//     }

//     const { address: senderAddress, p2pktr } = generateTaprootAddressFromPubKey(pubKey);

//     const maxAmountInsSpend = inscriptionUTXO.value.minus(inscriptionInfo.offset).minus(1).minus(MinSats);

//     const fee = new BigNumber(estimateTxFee(1, 2, feeRatePerByte));

//     const totalAmountSpend = sendAmount.plus(fee);
//     if (totalAmountSpend.gt(maxAmountInsSpend)) {
//         throw new SDKError(ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE);
//     }

//     const newValueInscription = inscriptionUTXO.value.minus(totalAmountSpend);

//     const psbt = new Psbt({ network: tcBTCNetwork });
//     // add inputs
//     psbt.addInput({
//         hash: inscriptionUTXO.tx_hash,
//         index: inscriptionUTXO.tx_output_n,
//         witnessUtxo: { value: inscriptionUTXO.value.toNumber(), script: p2pktr.output as Buffer },
//         tapInternalKey: pubKey,
//     });

//     // add outputs
//     // add output inscription: must be at index 0
//     psbt.addOutput({
//         address: senderAddress,
//         value: newValueInscription.toNumber(),
//     });

//     // add output send BTC
//     psbt.addOutput({
//         address: senderAddress,
//         value: sendAmount.toNumber(),
//     });

//     const indicesToSign: number[] = [];
//     for (let i = 0; i < psbt.txInputs.length; i++) {
//         indicesToSign.push(i);
//     }

//     return {
//         resRawTx: { base64Psbt: psbt.toBase64(), fee, changeAmount: BNZero, selectedUTXOs: [inscriptionUTXO], indicesToSign },
//         newValueInscription: newValueInscription
//     };
// };

// const selectDummyUTXO = (
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
// ): UTXO => {
//     const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
//     if (smallestUTXO.value.lte(DummyUTXOValue)) {
//         return smallestUTXO;
//     }
//     throw new SDKError(ERROR_CODE.NOT_FOUND_DUMMY_UTXO);
// };

// const createDummyUTXOFromCardinal = (
//     senderPrivateKey: Buffer,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     feeRatePerByte: number,
// ): { dummyUTXO: UTXO, splitTxID: string, selectedUTXOs: UTXO[], newUTXO: any, fee: BigNumber, txHex: string } => {

//     // create dummy UTXO from cardinal UTXOs
//     let dummyUTXO;
//     let newUTXO = null;
//     const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
//     if (smallestUTXO.value.lte(DummyUTXOValue)) {
//         dummyUTXO = smallestUTXO;
//         return { dummyUTXO: dummyUTXO, splitTxID: "", selectedUTXOs: [], newUTXO: newUTXO, fee: BNZero, txHex: "" };
//     } else {
//         const { senderAddress } = generateTaprootKeyPair(senderPrivateKey);

//         const { txID, txHex, fee, selectedUTXOs, changeAmount } = createTx(senderPrivateKey, senderAddress, utxos, inscriptions, "", senderAddress, new BigNumber(DummyUTXOValue), feeRatePerByte, false);

//         // init dummy UTXO rely on the result of the split tx
//         dummyUTXO = {
//             tx_hash: txID,
//             tx_output_n: 0,
//             value: new BigNumber(DummyUTXOValue),
//         };

//         if (changeAmount.gt(BNZero)) {
//             newUTXO = {
//                 tx_hash: txID,
//                 tx_output_n: 1,
//                 value: changeAmount,
//             };
//         }

//         return { dummyUTXO: dummyUTXO, splitTxID: txID, selectedUTXOs, newUTXO: newUTXO, fee, txHex };
//     }
// };


// const createRawTxDummyUTXOFromCardinal = (
//     pubKey: Buffer,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     feeRatePerByte: number,
// ): { dummyUTXO: any, splitPsbtB64: string, indicesToSign: number[], changeAmount: BigNumber, selectedUTXOs: UTXO[], fee: BigNumber } => {

//     // create dummy UTXO from cardinal UTXOs
//     let dummyUTXO;
//     const smallestUTXO = selectTheSmallestUTXO(utxos, inscriptions);
//     if (smallestUTXO.value.lte(DummyUTXOValue)) {
//         dummyUTXO = smallestUTXO;
//         return { dummyUTXO: dummyUTXO, splitPsbtB64: "", indicesToSign: [], changeAmount: BNZero, selectedUTXOs: [], fee: BNZero };
//     } else {
//         const { address: senderAddress } = generateTaprootAddressFromPubKey(pubKey);

//         const { base64Psbt, fee, changeAmount, selectedUTXOs, indicesToSign } = createRawTx({
//             pubKey: pubKey,
//             utxos: utxos,
//             inscriptions: inscriptions,
//             sendInscriptionID: "",
//             receiverInsAddress: senderAddress,
//             sendAmount: new BigNumber(DummyUTXOValue),
//             feeRatePerByte,
//             isUseInscriptionPayFeeParam: false,
//         });



//         // TODO: 0x2525

//         // init dummy UTXO rely on the result of the split tx
//         // dummyUTXO = {
//         //     tx_hash: txID,
//         //     tx_output_n: 0,
//         //     value: new BigNumber(DummyUTXOValue),
//         // };

//         // if (changeAmount.gt(BNZero)) {
//         //     newUTXO = {
//         //         tx_hash: txID,
//         //         tx_output_n: 1,
//         //         value: changeAmount,
//         //     };
//         // }

//         return { dummyUTXO: dummyUTXO, splitPsbtB64: base64Psbt, indicesToSign, selectedUTXOs, fee, changeAmount };
//     }
// };

// const prepareUTXOsToBuyMultiInscriptions = ({
//     privateKey,
//     address,
//     utxos,
//     inscriptions,
//     feeRatePerByte,
//     buyReqFullInfos,
// }: {
//     privateKey: Buffer,
//     address: string,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     feeRatePerByte: number,
//     buyReqFullInfos: BuyReqFullInfo[],
// }): { buyReqFullInfos: BuyReqFullInfo[], dummyUTXO: any, splitTxID: string, selectedUTXOs: UTXO[], newUTXO: any, fee: BigNumber, splitTxHex: string } => {
//     let splitTxID = "";
//     let splitTxHex = "";
//     let newUTXO: any;
//     let dummyUTXO: any;
//     let selectedUTXOs: UTXO[] = [];
//     let fee = BNZero;

//     // filter to get cardinal utxos
//     const { cardinalUTXOs, totalCardinalAmount } = filterAndSortCardinalUTXOs(utxos, inscriptions);

//     // select dummy utxo
//     let needCreateDummyUTXO = false;
//     try {
//         dummyUTXO = selectDummyUTXO(cardinalUTXOs, {});
//     } catch (e) {
//         console.log("Can not find dummy UTXO, need to create it.");
//         needCreateDummyUTXO = true;
//     }

//     // find payment utxos for each buy info
//     interface needPayment {
//         buyInfoIndex: number,
//         amount: BigNumber,
//     }
//     const needPaymentUTXOs: needPayment[] = [];

//     for (let i = 0; i < buyReqFullInfos.length; i++) {
//         const info = buyReqFullInfos[i];
//         try {
//             const { utxo } = findExactValueUTXO(cardinalUTXOs, info.price);
//             buyReqFullInfos[i].paymentUTXO = utxo;
//         } catch (e) {
//             needPaymentUTXOs.push({ buyInfoIndex: i, amount: info.price });
//         }
//     }

//     console.log("buyReqFullInfos: ", buyReqFullInfos);

//     // create split tx to create enough payment uxtos (if needed)
//     if (needPaymentUTXOs.length > 0 || needCreateDummyUTXO) {
//         const paymentInfos: PaymentInfo[] = [];

//         for (const info of needPaymentUTXOs) {
//             paymentInfos.push({ address: address, amount: info.amount });
//         }
//         if (needCreateDummyUTXO) {
//             paymentInfos.push({ address: address, amount: new BigNumber(DummyUTXOValue) });
//         }

//         const res = createTxSendBTC({ senderPrivateKey: privateKey, utxos: cardinalUTXOs, inscriptions: {}, paymentInfos, feeRatePerByte });
//         splitTxID = res.txID;
//         splitTxHex = res.txHex;
//         selectedUTXOs = res.selectedUTXOs;
//         fee = res.fee;


//         for (let i = 0; i < needPaymentUTXOs.length; i++) {
//             const info = needPaymentUTXOs[i];
//             const buyInfoIndex = info.buyInfoIndex;
//             if (buyReqFullInfos[buyInfoIndex].paymentUTXO != null) {
//                 throw new SDKError(ERROR_CODE.INVALID_CODE);
//             }
//             const newUTXO: UTXO = {
//                 tx_hash: splitTxID,
//                 tx_output_n: i,
//                 value: info.amount,
//             };
//             buyReqFullInfos[buyInfoIndex].paymentUTXO = newUTXO;
//         }

//         if (needCreateDummyUTXO) {
//             dummyUTXO = {
//                 tx_hash: splitTxID,
//                 tx_output_n: needPaymentUTXOs.length,  // dummy utxo is the last (last - 1) output in the split tx
//                 value: new BigNumber(DummyUTXOValue),
//             };
//         }

//         if (res.changeAmount.gt(BNZero)) {
//             const indexChangeUTXO = needCreateDummyUTXO ? needPaymentUTXOs.length + 1 : needPaymentUTXOs.length;
//             newUTXO = {
//                 tx_hash: splitTxID,
//                 tx_output_n: indexChangeUTXO,  // change utxo is the last output in the split tx
//                 value: res.changeAmount,
//             };
//         }

//     }
//     return { buyReqFullInfos, dummyUTXO, splitTxID, selectedUTXOs, newUTXO, fee, splitTxHex };
// };


// const createRawTxToPrepareUTXOsToBuyMultiInscs = ({
//     pubKey,
//     address,
//     utxos,
//     inscriptions,
//     feeRatePerByte,
//     buyReqFullInfos,
// }: {
//     pubKey: Buffer,
//     address: string,
//     utxos: UTXO[],
//     inscriptions: { [key: string]: Inscription[] },
//     feeRatePerByte: number,
//     buyReqFullInfos: BuyReqFullInfo[],
// }): {
//     buyReqFullInfos: BuyReqFullInfo[],
//     dummyUTXO: any,
//     selectedUTXOs: UTXO[],
//     fee: BigNumber,
//     changeAmount: BigNumber,
//     needPaymentUTXOs: NeedPaymentUTXO[],
//     needCreateDummyUTXO: boolean,
//     splitPsbtB64: string,
//     indicesToSign: number[]
// } => {

//     let splitPsbtB64 = "";
//     let dummyUTXO: any;
//     let selectedUTXOs: UTXO[] = [];
//     let fee = BNZero;
//     let changeAmount = BNZero;
//     let indicesToSign: number[] = [];

//     // filter to get cardinal utxos
//     const { cardinalUTXOs } = filterAndSortCardinalUTXOs(utxos, inscriptions);

//     // select dummy utxo
//     let needCreateDummyUTXO = false;
//     try {
//         dummyUTXO = selectDummyUTXO(cardinalUTXOs, {});
//     } catch (e) {
//         console.log("Can not find dummy UTXO, need to create it.");
//         needCreateDummyUTXO = true;
//     }

//     // find payment utxos for each buy info
//     const needPaymentUTXOs: NeedPaymentUTXO[] = [];

//     for (let i = 0; i < buyReqFullInfos.length; i++) {
//         const info = buyReqFullInfos[i];
//         try {
//             const { utxo } = findExactValueUTXO(cardinalUTXOs, info.price);
//             buyReqFullInfos[i].paymentUTXO = utxo;
//         } catch (e) {
//             needPaymentUTXOs.push({ buyInfoIndex: i, amount: info.price });
//         }
//     }

//     console.log("buyReqFullInfos: ", buyReqFullInfos);

//     // create split tx to create enough payment uxtos (if needed)
//     if (needPaymentUTXOs.length > 0 || needCreateDummyUTXO) {
//         const paymentInfos: PaymentInfo[] = [];

//         for (const info of needPaymentUTXOs) {
//             paymentInfos.push({ address: address, amount: info.amount });
//         }
//         if (needCreateDummyUTXO) {
//             paymentInfos.push({ address: address, amount: new BigNumber(DummyUTXOValue) });
//         }

//         const res = createRawTxSendBTC({ pubKey: pubKey, utxos: cardinalUTXOs, inscriptions: {}, paymentInfos, feeRatePerByte });

//         selectedUTXOs = res.selectedUTXOs;
//         fee = res.fee;
//         splitPsbtB64 = res.base64Psbt;
//         changeAmount = res.changeAmount;
//         indicesToSign = res.indicesToSign;

//     }
//     return { buyReqFullInfos, dummyUTXO, needPaymentUTXOs, splitPsbtB64, selectedUTXOs, fee, changeAmount: changeAmount, needCreateDummyUTXO, indicesToSign };
// };
// export {
//     createRawPSBTToSell,
//     createPSBTToSell,
//     createPSBTToBuy,
//     reqListForSaleInscription,
//     reqBuyInscription,
//     reqBuyMultiInscriptions,
//     reqListForSaleInscFromAnyWallet,
//     reqBuyInscriptionFromAnyWallet,
//     reqBuyMultiInscriptionsFromAnyWallet,
 // createRawTxDummyUTXOForSale,
//  createTxSplitFundFromOrdinalUTXO,
//  createRawTxSplitFundFromOrdinalUTXO,
//  createDummyUTXOFromCardinal,
 // createRawTxDummyUTXOFromCardinal,
//  prepareUTXOsToBuyMultiInscriptions,
//     createRawTxToPrepareUTXOsToBuyMultiInscs,

// };