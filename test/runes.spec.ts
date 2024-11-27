import {
    BNZero,
    DefaultSequenceRBF,
    Inscription,
    Mainnet,
    MinSats,
    NetworkType,
    Regtest,
    StorageService,
    TcClient,
    UTXO,
    broadcastTx,
    convertPrivateKey,
    convertPrivateKeyFromStr,
    createBatchInscribeTxs,
    createInscribeTx,
    createTx,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    ordCreateInscribeTx,
    createInscribeImgTx,
    selectUTXOs,
    setBTCNetwork,
    setupConfig,
    generateTaprootAddress,
    mintRunes,
    generateTaprootKeyPair,
    Testnet,
    createInscribeTxMintRunes,
    createInscribeTxEtchRunes,
    randomTaprootWallet,

} from "../dist";

import BigNumber from 'bignumber.js';
import { assert } from 'chai';
import { ethers } from "ethers";
import { script } from "bitcoinjs-lib";

const fs = require('fs').promises;

require("dotenv").config({ path: __dirname + "/.env" });
console.log(__dirname + "../test/.env");
var Web3 = require('web3');

// TODO: fill the private key
// var privateKeyWIF1 = process.env.PRIV_KEY_1 || "";
// var privateKey1 = convertPrivateKeyFromStr(privateKeyWIF1);
// let address1 = process.env.ADDRESS_1 || "";

let privateKeyWIF2 = process.env.PRIV_KEY_2 || "";
let address2 = process.env.ADDRESS_2 || "";
// let address2 = process.env.ADDRESS_2_REGTEST || "";
let privateKey2 = convertPrivateKeyFromStr(privateKeyWIF2);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function writeToFile(data: any, fileName: string) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(fileName, jsonData, 'utf8');
        console.log('Data written to file successfully.');
    } catch (err) {
        console.error('Error writing to file:', err);
    }
}



describe("Sign msg Tx", async () => {
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
        setMethod(key: string, data: string): Promise<any> {
            return localStorage.setItem(key, data);
        }
    });

    const tcClient = new TcClient(Mainnet)
    setupConfig({
        storage,
        tcClient: tcClient,
        netType: NetworkType.Mainnet
    })
    setBTCNetwork(NetworkType.Mainnet);
    // @ts-ignore
    globalThis.storage = storage;

    // it("Generate wallets", async () => {
    //     const N = 100;
    //     const privateKeys: string[] = [];
    //     const addresses: string[] = [];

    //     for (let i = 0; i < N; i++) {
    //         const { privateKey, address } = randomTaprootWallet();
    //         console.log(`${i} ${privateKey} ${address} `);
    //         privateKeys.push(privateKey);
    //         addresses.push(address);
    //     }

    //     await writeToFile(privateKeys, "main_privatekeys.json");
    //     await writeToFile(addresses, "main_addresses.json");

    // });

    it("RUNES mint token", async () => {
        // private key 2
        let utxos: UTXO[] = [
            {
                tx_hash: "8febf8e0289386daaa516bb5e9dc2e76bdb48b21533f478c967954da2b7c7eb0",
                tx_output_n: 1,
                value: new BigNumber(96604)
            }

        ];


        const { commitTxHex, commitTxID, totalFee, revealTxHex, revealTxID } = await createInscribeTxEtchRunes({
            senderPrivateKey: privateKey2,
            senderAddress: address2,
            utxos: utxos,
            inscriptions: {},
            feeRatePerByte: 7,
            runeName: "THE•LUCKY•GENESIS",
            // runeName: "THE•RUNIX•TOKEN",
            // symbol: "🍀",
            symbol: "R",
            receiverInsc: address2,
            receiverRune: "bc1pggfjl6an4z6krgev4ataqsvln8nw5jru6tv9adxt393akgn963jq8tgpzh",
        });



        console.log("commitTxHex: ", commitTxHex);
        console.log("commitTxID: ", commitTxID);
        console.log("revealTxHex: ", revealTxHex);
        console.log("revealTxID: ", revealTxID);
        console.log("totalFee: ", totalFee);


    });
});