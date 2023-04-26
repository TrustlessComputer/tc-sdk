import {assert} from "chai";

require("dotenv").config({ path: __dirname + "/.env" });
import {
    storage,
    Wallet,
    HDWallet,
    encryptAES,
    decryptAES,
    Validator,
    randomMnemonic,
    getStorageHDWallet,
    setStorageHDWallet
} from "../dist";

describe("Wallet", async () => {
    it('encrypt | decrypt', () => {
        const mnemonic = 'record silent butter mind damage gospel flush blur piece also toe desert';
        const password = '1234';
        const cipher = encryptAES(mnemonic, password)
        const decrypted = decryptAES(cipher, password)
        console.log('cipher: ', cipher)
        console.log('decrypted: ', decrypted)
        assert.equal(mnemonic, decrypted)
    });
    it('Random wallet', async function () {
        const LocalStorage = require('node-localstorage').LocalStorage
        const localStorage = new LocalStorage('./scratch');
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
        })


        // await storage.set('123', {
        //     test: 'SANG'
        // })
        //
        // console.log('SANG TEST:', storage)
        //
        // await getStorageHDWallet()
        //
        //
        // // const cipher = getStorageHDWallet()
        // const hdWallet = randomMnemonic();
        // await setStorageHDWallet(hdWallet)
        // const storedWallet = await getStorageHDWallet();
        // console.log('Random wallet ', {
        //     hdWallet,
        //     derives: hdWallet.derives,
        //     storedWallet
        // })
    });
});
