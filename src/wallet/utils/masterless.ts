import {
    IDeriveMasterlessReq,
    IMasterless,
} from "@/wallet";
import { decryptAES, encryptAES, Validator } from "@/utils";
import { StorageKeys } from "@/constants";
import { ethers } from "ethers";

const validateMasterless = (listMasterless: Array<IMasterless> | undefined, methodName: string) => {
    if (listMasterless) {
        for (const node of listMasterless) {
            new Validator(`${methodName}-` + "validate-derive-name", node.name).required();
            new Validator(`${methodName}-` + "validate-derive-index", node.index).required();
            new Validator(`${methodName}-` + "validate-derive-privateKey", node.privateKey).required();
            new Validator(`${methodName}-` + "validate-derive-address", node.address).required();
        }
    }
};

const deriveMasterless = (payload: IDeriveMasterlessReq): IMasterless => {
    const newMasterless = new ethers.Wallet(payload.privateKey);
    return {
        name: payload.name,
        index: Number(new Date().getTime()),
        privateKey: newMasterless.privateKey,
        address: newMasterless.address,
    };
};

const getStorageMasterlessCipherText =  () => {
    return tcStorage.get(StorageKeys.Masterless);
};

const getStorageMasterless = async (password: string): Promise<Array<IMasterless>> => {
    const cipherText = await getStorageMasterlessCipherText();
    if (!cipherText) {
        return [];
    }
    const rawText = decryptAES(cipherText, password);
    const listMasterless: Array<IMasterless> = JSON.parse(rawText);
    validateMasterless(listMasterless, "getStorageMasterless");
    return listMasterless;
};

const setStorageMasterless = async (wallet: Array<IMasterless>, password: string) => {
    const cipherText = encryptAES(JSON.stringify(wallet), password);
    await tcStorage.set(StorageKeys.Masterless, cipherText);
};

export {
    validateMasterless,
    deriveMasterless,

    getStorageMasterlessCipherText,
    getStorageMasterless,
    setStorageMasterless,
};