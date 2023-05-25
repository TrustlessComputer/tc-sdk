import {assert} from "chai";

require("dotenv").config({ path: __dirname + "/.env" });
import {
    StorageService,
    MasterWallet,
    encryptAES,
    decryptAES,
    randomMnemonic,
    getStorageHDWallet,
    setStorageHDWallet,
    validateHDWallet,
    setupConfig,
    Mainnet,
    TcClient,
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

    const tcClient = new TcClient(Mainnet, 'https://tc-node.trustless.computer')
    setupConfig({
        storage,
        tcClient: tcClient,
        netType: 0
    })
    // @ts-ignore
    globalThis.storage = storage;

    it('encrypt | decrypt', () => {
        const mnemonic = 'record silent butter mind damage gospel flush blur piece also toe desert';
        const cipher = encryptAES(mnemonic, password)
        const decrypted = decryptAES(cipher, password)
        assert.equal(mnemonic, decrypted)
    });

    it('Random', async function () {
        const hdWallet = await randomMnemonic();
        await setStorageHDWallet(hdWallet, password);
        const masterWallet = new MasterWallet();
        await masterWallet.load(password);
        // const btcPrivateKeyBuffer = convertPrivateKeyFromStr(hdWallet.btcPrivateKey);
        // const { address } = generateP2WPKHKeyPair(btcPrivateKeyBuffer);
        // console.log('BTC Segwit address:', address)
        assert.equal(hdWallet.btcPrivateKey, masterWallet.getBTCPrivateKey())
    });

    it('Create new node', async function () {
        const masterWallet = new MasterWallet();
        await masterWallet.load(password);

        const hdWallet = masterWallet.getHDWallet();
        if (hdWallet) {
            await hdWallet.createNewAccount({
                password,
                name: new Date().getTime().toString(),
                accounts: [],
            })
        }
    });

    it('Restore', async function () {
        const storedWallet = await getStorageHDWallet(password);
        if (Boolean(storedWallet)) {
            const masterWallet = new MasterWallet();
            await masterWallet.load(password);
            const hdWallet = masterWallet.getHDWallet();
            console.log('nodes: ', hdWallet.nodes)
            console.log('mnemonic: ', hdWallet.mnemonic)
            console.log('bitcoin deletedIndexs: ', hdWallet.deletedIndexs)

        } else {
            // try random new mnemonic
            assert(false, 'load wallet error')
        }
    });

    it('Delete node', async function () {
        const masterWallet = new MasterWallet();
        await masterWallet.load(password);

        const hdWallet = masterWallet.getHDWallet();

        const accountNeedDelete = hdWallet.nodes?.[1]!;

        if (!accountNeedDelete) {
            assert(false, 'Can not load account for delete')
        }
        await hdWallet.deletedAccount({
            password,
            address: accountNeedDelete.address
        })

        assert(!(hdWallet.nodes || [])
            .some(item =>
                item.address.toLowerCase() === accountNeedDelete.address.toLowerCase()
            ),
            'Delete node error'
        )
    });

    // it('Import Private Key', async function () {
    //     const masterWallet = new MasterWallet();
    //     await masterWallet.load(password);
    //
    //     const privateKey = "";
    //     if (privateKey) {
    //         const masterlessIns = masterWallet.getMasterless();
    //         const newAccount = await masterlessIns.importNewAccount({
    //             nodes: [],
    //             password,
    //             name: "test",
    //             privateKey: ""
    //         })
    //         console.log('Imported accounts: ', newAccount)
    //     }
    // });
});
