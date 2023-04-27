import {assert} from "chai";

require("dotenv").config({ path: __dirname + "/.env" });
import {
    StorageService,
    MasterWallet,
    encryptAES,
    decryptAES,
    Validator,
    randomMnemonic,
    getStorageHDWallet,
    setStorageHDWallet,
} from "../dist";

describe("Wallet", async () => {
    const password = '1234';
    const LocalStorage = require('node-localstorage').LocalStorage
    const localStorage = new LocalStorage('./scratch');
    const storage = new StorageService()
    storage.implement({
        namespace: undefined,
        getMethod(key: string): Promise<any> {
            return localStorage.getItem(key);
        },
        removeMethod(key: string): Promise<any> {
            return localStorage.removeItem(key);
        },
        setMethod(key: string, data: string): Promise<any>  {
            return localStorage.setItem(key, data);
        }
    });
    // @ts-ignore
    globalThis.storage = storage;

    it('encrypt | decrypt', () => {
        const mnemonic = 'record silent butter mind damage gospel flush blur piece also toe desert';
        const cipher = encryptAES(mnemonic, password)
        const decrypted = decryptAES(cipher, password)
        console.log('cipher: ', cipher)
        console.log('decrypted: ', decrypted)
        assert.equal(mnemonic, decrypted)
    });

    it('Random wallet', async function () {
        const hdWallet = await randomMnemonic();
        await setStorageHDWallet(hdWallet, password);
        const masterWallet = new MasterWallet();
        await masterWallet.restore(password);
    });
});
