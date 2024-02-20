import * as CryptoJS from "crypto-js";

const ARC4Encrypt = (secretKey: string, msg: string): CryptoJS.lib.CipherParams => {
    const msgBuff = CryptoJS.enc.Hex.parse(msg);
    const secretKeyBuff = CryptoJS.enc.Hex.parse(secretKey);

    const res = CryptoJS.RC4.encrypt(msgBuff, secretKeyBuff);
    return res;
}

const ARC4Decrypt = (secretKey: string, ciphertext: CryptoJS.lib.CipherParams): string => {
    const secretKeyBuff = CryptoJS.enc.Hex.parse(secretKey);

    const res = CryptoJS.RC4.decrypt(ciphertext, secretKeyBuff);
    return res.toString(CryptoJS.enc.Hex);
}

export {
    ARC4Encrypt,
    ARC4Decrypt,
}