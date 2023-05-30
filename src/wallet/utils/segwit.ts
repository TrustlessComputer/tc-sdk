import * as bip39 from "bip39";
import BIP32Factory from "bip32";
import { initEccLib } from "bitcoinjs-lib";
import * as ecc from "@bitcoinerlab/secp256k1";
import { BTCSegwitDerivationPath } from "@/wallet";
import { convertPrivateKey } from "@/bitcoin";
import { ERROR_CODE, SDKError } from "@/constants";
import { validateMnemonicBTC } from "@/wallet/utils/taproot";

initEccLib(ecc);
const bip32 = BIP32Factory(ecc);


const generateSegwitHDNodeFromMnemonic = async (mnemonic: string) => {
    const isValid = validateMnemonicBTC(mnemonic);
    if (!isValid) {
        throw new SDKError(ERROR_CODE.MNEMONIC_GEN_SEGWIT);
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const rootKey = bip32.fromSeed(seed);
    const childNode = rootKey.derivePath(BTCSegwitDerivationPath);
    const privateKeyBuffer = childNode.privateKey;
    if (!privateKeyBuffer) {
        throw new SDKError(ERROR_CODE.SEGWIT_FROM_MNEMONIC);
    }
    const privateKeyStr = convertPrivateKey(privateKeyBuffer);
    return privateKeyStr;
};

export {
    generateSegwitHDNodeFromMnemonic,
};