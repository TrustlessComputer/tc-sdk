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

require("dotenv").config({ path: __dirname + "/.env" });

var privateKeyWIF1 = process.env.PRIV_KEY_1 || "";
var privateKey1 = convertPrivateKeyFromStr(privateKeyWIF1);
let address1 = process.env.ADDRESS_1 || "";

// let privateKeyWIF2 = process.env.PRIV_KEY_2 || "";
// // let address2 = process.env.ADDRESS_2_P2WPKH_REGTEST || "";
// let address2Taproot = process.env.ADDRESS_2_REGTEST || "";
// let address2 = process.env.ADDRESS_2 || "";
// let privateKey2 = convertPrivateKeyFromStr(privateKeyWIF2);

let privateKeyWIF2 = "KwYP4RiENTb4K1kwbrVKFrFqX57c4uBEZYmpuwFAYcsG4pjCGuQz";
let address2 = "bc1pgvzr6m0cxv488prlzxcr7myk22pfewzq0vtyryx7uvna9mgnh9hsecq0lx";
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

    const tcClient = new TcClient(Mainnet)
    setupConfig({
        storage,
        tcClient: tcClient,
        netType: NetworkType.Mainnet
    })
    // @ts-ignore
    globalThis.storage = storage;

    it("send insciption offset != 0 : should use inscription to pay fee", async () => {
        let sendInscriptionID = "";
        let isUseInscriptionPayFeeParam = false;
        let sendAmount = new BigNumber(216041);

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
                tx_hash: "27505b6375c6b215da2859880a4ca147a02fcd5265db54ed842899d075bd8b55",
                tx_output_n: 1,
                value: new BigNumber(41025)
            },
        ]

        let utxosMain: UTXO[] = [
            {
                tx_hash: "8a9feeaed1126305b62d0c3ecf60a755930db4209361ff04407ba0f88e321083",
                tx_output_n: 1,
                value: new BigNumber(219891)
            }
        ]

        let utxosMain2: UTXO[] = [
            {
                tx_hash: "059b91d1989347a21c4758c0feeb215913613d7d9257561857004b95e536397e",
                tx_output_n: 1,
                value: new BigNumber(433680)
            }
        ]



        // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
        //   UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
        // console.log("selectedUTXOs ", selectedUTXOs);

        // const { txID, txHex, fee: feeRes } = createTx({
        //     senderPrivateKey: privateKey2,
        //     senderAddress: address2,
        //     utxos: utxosMain,
        //     inscriptions: {},
        //     sendInscriptionID,
        //     receiverInsAddress: "bc1pgvzr6m0cxv488prlzxcr7myk22pfewzq0vtyryx7uvna9mgnh9hsecq0lx",
        //     sendAmount,
        //     feeRatePerByte: 25,
        //     isUseInscriptionPayFeeParam,
        //     sequence: DefaultSequenceRBF,
        // });


        const tcTxDetails: any[] = [
            {
                Nonce: 25,
                Hash: "0xcae14854df09e45c477617f1b8e15258885561a57266d4fc2dadbda9af9273bc",
            },
            {
                Nonce: 26,
                Hash: "0x8192f26f7995690e449cd5ce18e4ef39f7a0e5872a329fedc4f241c4ded3b320",
            },
        ];

        // const resp = await createBatchInscribeTxs({
        //     senderPrivateKey: privateKey2,
        //     senderAddress: address2,
        //     tcTxDetails: tcTxDetails,
        //     utxos: utxosMain2,
        //     inscriptions: {},
        //     feeRatePerByte: 100,
        //     sequence: DefaultSequenceRBF,
        // });



        const resp = await isRBFable({
            revealTxID: "ef9f13ae56ce9f22a433e74f92c474485c01301ea5ec780a86c0d542a4db4d72",
            tcAddress: "0x367719f7D365Ee2bf380F08ed0830BfF76DaCC43",
            btcAddress: "bc1p7pynrf4a9sf599decqpn6kuec6sdksdmlc4esu4k6dpj9cphuynszs3vtu",
        })
        console.log("resp: ", resp);

        // const resp = await replaceByFeeInscribeTx({
        //     senderPrivateKey: privateKey2,
        //     btcAddress: address2,
        //     tcAddress: "0x367719f7D365Ee2bf380F08ed0830BfF76DaCC43",
        //     revealTxID: "ef9f13ae56ce9f22a433e74f92c474485c01301ea5ec780a86c0d542a4db4d72",
        //     utxos: utxosMain2,
        //     inscriptions: {},
        //     feeRatePerByte: 30,
        //     // sequence: DefaultSequenceRBF,
        // })






        // const finalTXID = await broadcastTx(txHex);
        // console.log("finalTXID: ", finalTXID);
        // console.log(txID, txHex, feeRes)s;
    });
});