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
    getUTXOsFromBlockStream,
    createTxSendMultiReceivers,
    InscPaymentInfo,
    PaymentInfo,
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

// var privateKeyWIF1 = process.env.PRIV_KEY_1 || "";
// var privateKey1 = convertPrivateKeyFromStr(privateKeyWIF1);
// let address1 = process.env.ADDRESS_1 || "";

let privateKeyWIF2 = process.env.PRIV_KEY_2 || "";
// // let address2 = process.env.ADDRESS_2_P2WPKH_REGTEST || "";
// let address2Taproot = process.env.ADDRESS_2_REGTEST || "";
let address2 = process.env.ADDRESS_2 || "";
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

    // it("send insciption offset != 0 : should use inscription to pay fee", async () => {
    //     let sendInscriptionID = "07904d4b7306995871a0ed238bff1f3bcd9f050374e81671252cb89b7db6b781i0";
    //     let isUseInscriptionPayFeeParam = false;
    //     let sendAmount = new BigNumber(0);

    //     let utxos: UTXO[] = [
    //         {
    //             tx_hash: "07904d4b7306995871a0ed238bff1f3bcd9f050374e81671252cb89b7db6b781",
    //             tx_output_n: 0,
    //             value: new BigNumber(546)
    //         },
    //         {
    //             tx_hash: "f53340d53a1b9cf44df5bcb63eb552cacee3f34a0854a9cdb80dbb6ef4475270",
    //             tx_output_n: 1,
    //             value: new BigNumber(11090)
    //         },
    //     ];


    //     let insciptions = {
    //         "07904d4b7306995871a0ed238bff1f3bcd9f050374e81671252cb89b7db6b781:0": [
    //             {
    //                 id: "07904d4b7306995871a0ed238bff1f3bcd9f050374e81671252cb89b7db6b781i0",
    //                 offset: new BigNumber(0),
    //                 sat: 1277661004849427
    //             }
    //         ],
    //     }





    //     // const { selectedUTXOs, isUseInscriptionPayFee, valueOutInscription, changeAmount, fee } = selectUTXOs(
    //     //   UTXOs, inscriptions, sendInscriptionID, sendAmount, feeRatePerByte, isUseInscriptionPayFeeParam);
    //     // console.log("selectedUTXOs ", selectedUTXOs);

    //     const { txID, txHex, fee: feeRes } = createTx({
    //         senderPrivateKey: privateKey2,
    //         senderAddress: address2,
    //         utxos: utxos,
    //         inscriptions: insciptions,
    //         sendInscriptionID,
    //         receiverInsAddress: "",
    //         sendAmount,
    //         feeRatePerByte: 38,
    //         isUseInscriptionPayFeeParam,
    //         sequence: DefaultSequenceRBF,
    //     });

    //     console.log({ txID, txHex, feeRes });


    //     // const tcTxDetails: any[] = [
    //     //     {
    //     //         Nonce: 25,
    //     //         Hash: "0xcae14854df09e45c477617f1b8e15258885561a57266d4fc2dadbda9af9273bc",
    //     //     },
    //     //     {
    //     //         Nonce: 26,
    //     //         Hash: "0x8192f26f7995690e449cd5ce18e4ef39f7a0e5872a329fedc4f241c4ded3b320",
    //     //     },
    //     // ];

    //     // const resp = await createBatchInscribeTxs({
    //     //     senderPrivateKey: privateKey2,
    //     //     senderAddress: address2,
    //     //     tcTxDetails: tcTxDetails,
    //     //     utxos: utxosMain2,
    //     //     inscriptions: {},
    //     //     feeRatePerByte: 100,
    //     //     sequence: DefaultSequenceRBF,
    //     // });



    //     // const resp = await isRBFable({
    //     //     revealTxID: "ef9f13ae56ce9f22a433e74f92c474485c01301ea5ec780a86c0d542a4db4d72",
    //     //     tcAddress: "0x367719f7D365Ee2bf380F08ed0830BfF76DaCC43",
    //     //     btcAddress: "bc1p7pynrf4a9sf599decqpn6kuec6sdksdmlc4esu4k6dpj9cphuynszs3vtu",
    //     // })
    //     // console.log("resp: ", resp);

    //     // const resp = await replaceByFeeInscribeTx({
    //     //     senderPrivateKey: privateKey2,
    //     //     btcAddress: address2,
    //     //     tcAddress: "0x367719f7D365Ee2bf380F08ed0830BfF76DaCC43",
    //     //     revealTxID: "ef9f13ae56ce9f22a433e74f92c474485c01301ea5ec780a86c0d542a4db4d72",
    //     //     utxos: utxosMain2,
    //     //     inscriptions: {},
    //     //     feeRatePerByte: 30,
    //     //     // sequence: DefaultSequenceRBF,
    //     // })

    //     // const finalTXID = await broadcastTx(txHex);
    //     // console.log("finalTXID: ", finalTXID);
    //     // console.log(txID, txHex, feeRes)s;
    // });


    // it("send multiple inscriptions", async () => {

    //     let utxos: UTXO[] = await getUTXOsFromBlockStream(address2, true);

    //     let insciptions: {
    //         [key: string]: Inscription[];
    //     } =
    //     {

    //     };

    //     // let insciptions = {
    //     //     "07904d4b7306995871a0ed238bff1f3bcd9f050374e81671252cb89b7db6b781:0": [
    //     //         {
    //     //             id: "07904d4b7306995871a0ed238bff1f3bcd9f050374e81671252cb89b7db6b781i0",
    //     //             offset: new BigNumber(0),
    //     //             sat: 1277661004849427
    //     //         }
    //     //     ],
    //     // }

    //     let numInscToSend = 3;

    //     let inscPaymentInfos: InscPaymentInfo[] = [];

    //     let receiverAddress = [
    //         "bc1pcnz30qlng8s4kuc0p949rp3uc6hu8jqy7sqd3pszn8h0juhd8hgqupnutq",
    //         "bc1p65j57tzjufnjmt4fgx5xexfry6f3f87sggl02gl7fcxuky4x34fsz4wsau",
    //         "bc1pd9swmqhw2zn0y6x0wxjjdpqsjphdwfq92en68m7qzq7w9tnrhm7q3l9r7p",
    //         "bc1ppswwdq6crzrktla4y0urfmcqe8n7wttsvxdx39k4ruvd008x8rvqmnwpk9",
    //         "bc1qn74ftxrvh862jcre972ulnvmve9ek50ewngwyx",
    //     ]


    //     for (let i = 0; i < utxos.length; i++) {
    //         let u = utxos[i];
    //         if (utxos[i].value.toNumber() === 546) {
    //             let key = u.tx_hash + ":" + u.tx_output_n;
    //             let id = u.tx_hash + "i" + u.tx_output_n;
    //             insciptions[key] = [
    //                 {
    //                     id: id,
    //                     offset: new BigNumber(0),
    //                 }
    //             ]

    //             if (inscPaymentInfos.length < numInscToSend) {
    //                 inscPaymentInfos.push({
    //                     address: receiverAddress[inscPaymentInfos.length],
    //                     inscID: id,
    //                 })
    //             }
    //         }
    //     }

    //     console.log("inscPaymentInfos: ", inscPaymentInfos);

    //     let paymentInfos: PaymentInfo[] = [];

    //     const { txID, txHex, fee: feeRes } = createTxSendMultiReceivers({
    //         senderPrivateKey: privateKey2,
    //         senderAddress: address2,
    //         utxos: utxos,
    //         inscriptions: insciptions,
    //         inscPaymentInfos,
    //         paymentInfos,
    //         feeRatePerByte: 27,
    //         sequence: DefaultSequenceRBF,
    //     });

    //     console.log({ txID, txHex, feeRes });
    // });


    it("send BTC multiple receivers", async () => {

        let utxos: UTXO[] = [
            {
                tx_hash: "c2e47221072ee49605aef801ac13f361c9d11f4ef02310a795c7677e6e2e97f1",
                tx_output_n: 8,
                value: new BigNumber(389940),
            },
        ]

        let insciptions: {
            [key: string]: Inscription[];
        } =
        {

        };

        let inscPaymentInfos: InscPaymentInfo[] = [];

        console.log("inscPaymentInfos: ", inscPaymentInfos);

        let paymentInfos: PaymentInfo[] = [
            {
                address: "bc1p8u2xkzew6ts4h8y6j7wpmmphr7ffcncvuqehuedd7x28qlwumrsshgyw5w",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1pyf4mgv6hacflaq3m62qjn4cx0d8g6j5va8ylam8t53vwksr8f88qqzmsul",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1p36nryqzvlpz8pufh3jsm3m6mnjnj35cshpjj7cm6ecy4pw92s6eqpy48hy",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1pju8ztkwd4ulgwhkzznzd6t77shthjarmrf3enhpcxmfga877dtfqwhr9qn",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1p3uc9nxd7ghu259hf3pjy9ux0l7j5ef6xdsd2kh6gwzdlqe0z8uvql3dpdp",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1py02qh9v2gzc57q2gmdtfzwhn76v6sp3gtdwpd8r6k7032g0hrtusj7crqt",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1pj08tlagxkypmfg8lpxvzmzjztcpgzzwtgqmycyflmyeewk2lqlsq679vs6",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1pptecyxer3ltf50xmhykf54vu4n05rvd6ytzrahwav0hl2cunm3gq6a3mst",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1pn97632fey0cjcxht50mn5rjwqualaq6nf3y9nv0rp5vlpqa988msjnp3z3",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1ps26tz3x8lcp9zgjglvk43a287l5kg8s2cr0f9u6k5ajcp7vkg3kqkkkuhx",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1ptgde8yd5sjfdsz5xlvqhlmxuy90y4k593pjhp496csyjlesrxx9qh5wjut",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1pyf4mgv6hacflaq3m62qjn4cx0d8g6j5va8ylam8t53vwksr8f88qqzmsul",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1p7d8cztqxkf0qatdn6fkw6j8552ld42qgpkapevua7rkdqcxek70qaw6j55",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1p8gvpz87rjneqa9wjmkhh78tldptxp4pusg3w5fscu544qnpwqncq7gwqqk",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1pj3jm7ujxz39epmu5ssx59thx3jh0fpfn6nxhnpugnx75j5nhy7gsgzr4dv",
                amount: new BigNumber(11196),
            },
            {
                address: "bc1pcv5rug4jws9sc04eq26vsh8d7qkgd35rs6rm3ww5usvman3ng5eqskj59x",
                amount: new BigNumber(11196),
            },

        ];

        const { txID, txHex, fee: feeRes } = createTxSendMultiReceivers({
            senderPrivateKey: privateKey2,
            senderAddress: address2,
            utxos: utxos,
            inscriptions: insciptions,
            inscPaymentInfos,
            paymentInfos,
            feeRatePerByte: 30,
            sequence: DefaultSequenceRBF,
        });

        console.log({ txID, txHex, feeRes });

        // await broadcastTx(txHex)
    });
});