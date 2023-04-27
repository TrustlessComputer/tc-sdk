import * as bip39 from "bip39";
import BIP32Factory from "bip32";
import { initEccLib, payments } from "bitcoinjs-lib";
import * as ecc from "@bitcoinerlab/secp256k1";
import { BTCTaprootDerivationPath } from "@/wallet";
import {convertPrivateKey, toXOnly} from "@/bitcoin";
import { ERROR_CODE, SDKError } from "@/constants";

initEccLib(ecc);
const bip32 = BIP32Factory(ecc);

const generateTaprootHDNodeFromMnemonic = async (mnemonic: string) => {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const rootKey = bip32.fromSeed(seed);
    const childNode = rootKey.derivePath(BTCTaprootDerivationPath);

    const { address } = payments.p2tr({
        internalPubkey: toXOnly(childNode.publicKey),
    });

    const privateKeyBuffer = childNode.privateKey;
    if (!privateKeyBuffer || !address) {
        throw new SDKError(ERROR_CODE.TAPROOT_FROM_MNEMONIC);
    }
    const privateKeyStr = convertPrivateKey(privateKeyBuffer);
    return privateKeyStr;
};

export {
    generateTaprootHDNodeFromMnemonic
};