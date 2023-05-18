import {
    BNZero,
    DefaultSequenceRBF,
    Inscription,
    MinSats,
    NetworkType,
    Regtest,
    UTXO,
    broadcastTx,
    convertPrivateKey,
    convertPrivateKeyFromStr,
    createTx,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    selectUTXOs,
    setBTCNetwork,
} from "../dist";
import {
    Mainnet,
    MasterWallet,
    StorageService,
    TcClient,
    decryptAES,
    encryptAES,
    getStorageHDWallet,
    randomMnemonic,
    setStorageHDWallet,
    setupConfig,
    validateHDWallet
} from "../dist";

import BigNumber from "bignumber.js";
import { DefaultDeserializer } from "v8";
import { assert } from "chai";
import { getUTXOsFromBlockStream } from '../src/tc/blockstream';
import { globalAgent } from "http";
import { networks } from 'bitcoinjs-lib';
import { number } from "bitcoinjs-lib/src/script";

require("dotenv").config({ path: __dirname + "/.env" });

var privateKeyWIF1 = process.env.PRIV_KEY_1 || "";
var privateKey1 = convertPrivateKeyFromStr(privateKeyWIF1);
let address1 = process.env.ADDRESS_1 || "";

let privateKeyWIF2 = process.env.PRIV_KEY_2 || "";
let address2 = process.env.ADDRESS_2_P2WPKH_REGTEST || "";
let privateKey2 = convertPrivateKeyFromStr(privateKeyWIF2);



describe("Create tx with multiple UTXOs Tests", () => {
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

    const tcClient = new TcClient(Regtest)
    setupConfig({
        storage,
        tcClient: tcClient,
        netType: NetworkType.Regtest
    })
    // @ts-ignore
    globalThis.storage = storage;

    it("send insciption offset != 0 : should use inscription to pay fee", async () => {
        let sendInscriptionID = "";
        let isUseInscriptionPayFeeParam = false;
        let sendAmount = new BigNumber(100000);
        let receiverAddress = "bcrt1pj2t2szx6rqzcyv63t3xepgdnhuj2zd3kfggrqmd9qwlg3vsx37fq7lj7tn";

        let utxos: UTXO[] = [
            {
                tx_hash: "df9705a0d332f98c4bd7d690788b04967f5c2b39ee43418be667225bb2f67cb1",
                tx_output_n: 1,
                value: new BigNumber(396638)
            },
            {
                tx_hash: "ed93a71f4d873208125d9f5433bb510e38b66afeea897b91f058aecaa749f0b3",
                tx_output_n: 0,
                value: new BigNumber(92220)
            },
            {
                tx_hash: "c31f0c13d282eefe39fd5815e45b3512c3c976e161ca22b9b8e3f94a0531dad5",
                tx_output_n: 0,
                value: new BigNumber(532620)
            },
            {
                tx_hash: "c155d03caf2151845b49bbd7ce117312bd4c72639a2ed91ae5f343cd062c5930",
                tx_output_n: 0,
                value: new BigNumber(30520)
            },
            {
                tx_hash: "e2431b7b0b719bfa074ecdfd9428f046fd65285c18b48544b6046e3bccfd5f32",
                tx_output_n: 0,
                value: new BigNumber(23520)
            },
            {
                tx_hash: "ca66df6c32842846e34df437364835ed14e332af58e089b36d351012db302fed",
                tx_output_n: 0,
                value: new BigNumber(35680)
            },
        ];

        // taproot address
        let utxos2: UTXO[] = [
            {
                tx_hash: "df9705a0d332f98c4bd7d690788b04967f5c2b39ee43418be667225bb2f67cb1",
                tx_output_n: 1,
                value: new BigNumber(396638)
            },
            {
                tx_hash: "ed93a71f4d873208125d9f5433bb510e38b66afeea897b91f058aecaa749f0b3",
                tx_output_n: 0,
                value: new BigNumber(92220)
            },
        ]

        // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
        //   UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
        // console.log("selectedUTXOs ", selectedUTXOs);

        const { txID, txHex, fee: feeRes } = createTx({
            senderPrivateKey: privateKey2,
            senderAddress: address2,
            utxos,
            inscriptions: {},
            sendInscriptionID,
            receiverInsAddress: address2,
            sendAmount,
            feeRatePerByte: 5,
            isUseInscriptionPayFeeParam,
            sequence: DefaultSequenceRBF,
        });

        // const finalTXID = await broadcastTx(txHex);
        // console.log("finalTXID: ", finalTXID);
        console.log(txID, txHex, feeRes);
    });
});