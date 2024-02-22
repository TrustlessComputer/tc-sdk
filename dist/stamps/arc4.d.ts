import * as CryptoJS from "crypto-js";
declare const ARC4Encrypt: (secretKey: string, msg: string) => CryptoJS.lib.CipherParams;
declare const ARC4Decrypt: (secretKey: string, ciphertext: CryptoJS.lib.CipherParams) => string;
export { ARC4Encrypt, ARC4Decrypt, };
