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
    const childNode = deriveHDNodeByIndex({
        mnemonic,
        index: 0,
        name: undefined
    });
    return {
        name: "Anon",
        mnemonic,
        nodes: [childNode],
        btcAddress,
        btcPrivateKey,
        deletedIndexs: []
    };
};

const validateHDWallet = (wallet: IHDWallet | undefined, methodName: string) => {
    new Validator(`${methodName}-` + "validate-mnemonic", wallet?.mnemonic).mnemonic().required();
    new Validator(`${methodName}-` + "validate-name", wallet?.name).string().required();
    new Validator(`${methodName}-` + "validate-nodes", wallet?.nodes).required();
    new Validator(`${methodName}-` + "validate-btcAddress", wallet?.btcAddress).required();
    new Validator(`${methodName}-` + "validate-btcPrivateKey", wallet?.btcPrivateKey).required();
    if (wallet?.nodes) {
        for (const node of wallet.nodes) {
            new Validator(`${methodName}-` + "validate-derive-name", node.name).required();
            new Validator(`${methodName}-` + "validate-derive-index", node.index).required();
            new Validator(`${methodName}-` + "validate-derive-privateKey", node.privateKey).required();
            new Validator(`${methodName}-` + "validate-derive-address", node.address).required();
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
    validateHDWallet(wallet, "getStorageHDWallet");
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