import {ETHDerivationPath, generateTaprootHDNodeFromMnemonic, IDeriveKey, IDeriveReq, IHDWallet} from "@/wallet";
import { ethers } from "ethers";
import {decryptAES, encryptAES, Validator} from "@/utils";
import { StorageKeys } from "@/index";

const deriveHDNodeByIndex = (payload: IDeriveReq): IDeriveKey => {
    const hdNode = ethers.utils.HDNode
        .fromMnemonic(payload.mnemonic)
        .derivePath(ETHDerivationPath + "/" + payload.index);
    const privateKey = hdNode.privateKey;
    const address = hdNode.address;
    const accountName = payload.name || `Account ${payload.index + 1}`;
    return {
        name: accountName,
        index: payload.index,
        privateKey: privateKey,
        address: address,
    };
};

const randomMnemonic = async (): Promise<IHDWallet> => {
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    new Validator("Generate mnemonic", mnemonic).mnemonic().required();

    const { address: btcAddress, privateKey: btcPrivateKey } = await generateTaprootHDNodeFromMnemonic(mnemonic);
    const deriveKey = deriveHDNodeByIndex({
        mnemonic,
        index: 0,
        name: undefined
    });
    return {
        name: "Anon",
        mnemonic,
        derives: [deriveKey],
        btcAddress,
        btcPrivateKey
    };
};

const validateHDWallet = (wallet: IHDWallet | undefined) => {
    new Validator("saveWallet-mnemonic", wallet?.mnemonic).mnemonic().required();
    new Validator("saveWallet-name", wallet?.name).string().required();
    new Validator("saveWallet-derives", wallet?.derives).required();
    new Validator("saveWallet-btcAddress", wallet?.btcAddress).required();
    new Validator("saveWallet-btcPrivateKey", wallet?.btcPrivateKey).required();
    if (wallet?.derives) {
        for (const child of wallet.derives) {
            new Validator("saveWallet-derive-name", child.name).required();
            new Validator("saveWallet-derive-index", child.index).required();
            new Validator("saveWallet-derive-privateKey", child.privateKey).required();
            new Validator("saveWallet-derive-address", child.address).required();
        }
    }
};

const getStorageHDWallet = async (password: string): Promise<IHDWallet | undefined> => {
    const cipherText = await storage.get(StorageKeys.HDWallet);
    if (!cipherText) {
        return undefined;
    }
    const rawText = decryptAES(cipherText, password);
    const wallet: IHDWallet = JSON.parse(rawText);
    validateHDWallet(wallet);
    return wallet;
};

const setStorageHDWallet = async (wallet: IHDWallet, password: string) => {
    const cipherText = encryptAES(JSON.stringify(wallet), password);
    await storage.set(StorageKeys.HDWallet, cipherText);
};

export {
    validateHDWallet,

    randomMnemonic,
    deriveHDNodeByIndex,

    getStorageHDWallet,
    setStorageHDWallet
};