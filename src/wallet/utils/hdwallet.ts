import { derivationPath, IDeriveKey, IDeriveReq, IHDWallet } from "@/wallet";
import { ethers } from "ethers";
import { Validator } from "@/utils";
import { StorageKeys, storage } from "@/storage";

const deriveHDNodeByIndex = (payload: IDeriveReq): IDeriveKey => {
    const hdNode = ethers.utils.HDNode
        .fromMnemonic(payload.mnemonic)
        .derivePath(derivationPath + "/" + payload.index);
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

const randomMnemonic = (): IHDWallet => {
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    new Validator("Generate mnemonic", mnemonic).mnemonic().required();
    const deriveKey = deriveHDNodeByIndex({
        mnemonic,
        index: 0,
        name: undefined
    });
    return {
        name: "Anon",
        mnemonic,
        derives: [deriveKey]
    };
};

const validateHDWallet = (wallet: IHDWallet | undefined) => {
    new Validator("saveWallet-mnemonic", wallet?.mnemonic).mnemonic().required();
    new Validator("saveWallet-name", wallet?.name).string().required();
    new Validator("saveWallet-derives", wallet?.derives).required();
    if (wallet?.derives) {
        for (const child of wallet.derives) {
            new Validator("saveWallet-derive-name", child.name).required();
            new Validator("saveWallet-derive-index", child.index).required();
            new Validator("saveWallet-derive-privateKey", child.privateKey).required();
            new Validator("saveWallet-derive-address", child.address).required();
        }
    }
};

const getStorageHDWallet = async (): Promise<string | undefined> => {
    return await storage.get(StorageKeys.HDWallet);
};

const setStorageHDWallet = async (wallet: IHDWallet) => {
    await storage.set(StorageKeys.HDWallet, wallet);
};

export {
    validateHDWallet,

    randomMnemonic,
    deriveHDNodeByIndex,

    getStorageHDWallet,
    setStorageHDWallet
};