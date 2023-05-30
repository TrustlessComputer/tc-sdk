import * as CryptoJS from "crypto-js";
import { ERROR_CODE, SDKError } from "@/constants";

const doubleHash = (key: string) => {
    const hash = CryptoJS.SHA256(key);
    return CryptoJS.SHA256(hash).toString();
};

const encryptAES = (text: string, key: string) => {
    const password = doubleHash(key);
    return CryptoJS.AES.encrypt(text, password).toString();
};

const decryptAES = (cipherText: string, key: string): string => {
    const password = doubleHash(key);
    const decrypted = CryptoJS.AES.decrypt(cipherText, password);
    if (decrypted) {
        try {
            const str = decrypted.toString(CryptoJS.enc.Utf8);
            if (str.length > 0) {
                return str;
            } else {
                throw new SDKError(ERROR_CODE.DECRYPT);
            }
        } catch (e) {
            throw new SDKError(ERROR_CODE.DECRYPT);
        }
    }
    throw new SDKError(ERROR_CODE.DECRYPT);
};

export {
    encryptAES,
    decryptAES
};
