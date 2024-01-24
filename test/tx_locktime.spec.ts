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
    createBatchInscribeTxs,
    createTx,
    createTxSendBTC,
    createTxWithSpecificUTXOs,
    isRBFable,
    replaceByFeeInscribeTx,
    selectUTXOs,
    setBTCNetwork,

    createTxWithLockTime,
    createTxSpendInputWithLockTime,
    TestTx,
} from "../dist";
import { toXOnly } from "../dist";
import { generateP2WSHKeyPair } from "../dist";
import { MinSats2 } from "../dist";
import { generateTaprootKeyPair } from "../dist";
import { generateP2WPKHKeyPair } from "../dist";
import { getKeyPairInfo } from "../dist";
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

require("dotenv").config({ path: __dirname + "/.env" });

console.log("path:", __dirname + "/.env");




// MAINNET

var privateKeyWIF1 = "";
var privateKey1 = convertPrivateKeyFromStr(privateKeyWIF1);
let address1 = "";

var privateKeyWIF2 = "";
var privateKey2 = convertPrivateKeyFromStr(privateKeyWIF2);
let address2 = "";
let keyPair2 = generateTaprootKeyPair(privateKey2);



describe("Create tx with lock time Tests", () => {
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

    it("send insciption offset != 0 : should use inscription to pay fee", async () => {

        let isUseInscriptionPayFeeParam = false;
        let sendAmount = new BigNumber(0);
        // let feeRatePerByte = 110;

        // TestTx();

        const d = new Date(Date.UTC(2023, 11, 26, 8, 35, 0, 0));
        console.log("d. date", d.toDateString())

        // let lockTime = d.getTime() / 1000;

        let lockTime = 823142;  // TODO: 

        console.log("Param lockTime: ", lockTime);

        // let sendInscriptionID = "";
        // let utxos: UTXO[] = [
        //     {
        //         tx_hash: "b61fc2f6d4cda825d714a7e0ed35056cacf48549f1c07cc55dc67acfd7dad564",
        //         tx_output_n: 1,
        //         value: new BigNumber(24481)
        //     },
        // ];
        // let inscriptions = {};


        // MAINNET
        let feeRatePerByte = 180;
        let sendInscriptionID = "34e4f2e5cfc34741d9e17b527f37f5045e5831cb4bff979fe44ce103e8b897c3i0";
        let utxos: UTXO[] = [
            {
                tx_hash: "dbf9137e83b7035f54fd60c2e4829b2b2be2ce30f359d20641dab26846bad374",
                tx_output_n: 0,
                value: new BigNumber(546)
            },
            {
                tx_hash: "34e4f2e5cfc34741d9e17b527f37f5045e5831cb4bff979fe44ce103e8b897c3",
                tx_output_n: 0,
                value: new BigNumber(546)
            },
            {
                tx_hash: "9b6e78cbf495489ef4cdc58f0865d1e0770b49e6c3b93fe7f8567a199bd6f9bb",
                tx_output_n: 1,
                value: new BigNumber(85318)
            },
        ];

        let inscriptions = {
            // unspent
            "dbf9137e83b7035f54fd60c2e4829b2b2be2ce30f359d20641dab26846bad374:0": [
                {
                    id: "dbf9137e83b7035f54fd60c2e4829b2b2be2ce30f359d20641dab26846bad374i0",
                    offset: new BigNumber(0),
                    // sat: 1277661004849427
                }
            ],

            "34e4f2e5cfc34741d9e17b527f37f5045e5831cb4bff979fe44ce103e8b897c3:0": [
                {
                    id: "34e4f2e5cfc34741d9e17b527f37f5045e5831cb4bff979fe44ce103e8b897c3i0",
                    offset: new BigNumber(0),
                    // sat: 1277661004849427
                }
            ],
        }




        // receiver address
        // const keyPairInfo = getKeyPairInfo({ privateKey: privateKey2, address: address2 });

        const receiverPubKey = keyPair2.tweakedSigner.publicKey;

        // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
        //     utxos, {}, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam, true);
        // console.log("selectedUTXOs ", selectedUTXOs);

        const { txID, txHex, fee: feeRes } = createTxWithLockTime({
            senderPrivateKey: privateKey1,
            senderAddress: address1,
            utxos: utxos,
            inscriptions: inscriptions,
            sendInscriptionID,
            receiverInsAddress: address2,
            receiverPubKey: receiverPubKey.toString("hex"),
            sendAmount,
            feeRatePerByte: feeRatePerByte,
            lockTime: lockTime,
            isUseInscriptionPayFeeParam: isUseInscriptionPayFeeParam,
            sequence: DefaultSequenceRBF,
        });


        console.log("Tx Create txID: ", txID);
        console.log("Tx Create txHex: ", txHex);

        // const finalTxID = await broadcastTx(txHex);



        const newUTXO: UTXO = {
            value: new BigNumber(MinSats2),
            tx_hash: txID,
            tx_output_n: 0,
        }

        const utxosSpend = [
            {
                value: new BigNumber(4060286),
                tx_hash: "1bdf8f6b09a96face3d50d4c366e5d01dc3ddec5f427443d7d22476794628f3f",
                tx_output_n: 1,
            }
        ]

        const { txID: spendTxID, txHex: spendTxHex, } = createTxSpendInputWithLockTime({
            senderPrivateKey: privateKey2,
            senderAddress: address2,
            utxo: newUTXO,
            utxos: utxosSpend,
            inscriptions: {},
            receiverAddress: address1,
            sendAmount,
            feeRatePerByte: feeRatePerByte,
            lockTime: lockTime,
            isUseInscriptionPayFeeParam: isUseInscriptionPayFeeParam,
            sequence: 4294967294,
        });

        console.log("Tx Spend txID: ", spendTxID);
        console.log("Tx Spend txHex: ", spendTxHex);

        // const finalSpendTxID = await broadcastTx(spendTxHex);
    });
});