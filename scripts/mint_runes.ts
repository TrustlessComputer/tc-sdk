import {
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
    setBTCNetwork,
    setupConfig,
    generateTaprootAddress,
    generateTaprootKeyPair,
    createInscribeTxMintRunes,
    getUTXOsFromBlockStream,
    BNZero,
    getRuneBalance,
    getRuneBalanceByRuneID,

} from "../dist";

import BigNumber from 'bignumber.js';

const fs = require('fs').promises;

// require("dotenv").config({ path: __dirname + "/.env" });
// console.log(__dirname + "../test/.env");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


// UPDATE RUNE INFO
const RUNE_TOKEN_NAME = "BITCOIN•BRAIN•AI";
const RUNE_ID_BLOCK_HEIGHT = 872045n;
const RUNE_ID_TX_INDEX = 1174n;

const getPrivateKeys = async (): Promise<Buffer[]> => {
    const data = await fs.readFile(__dirname + '/main_privatekeys.json');
    const privateKeyStrs = JSON.parse(data);
    // console.log(privateKeyStrs);

    const privateKeys: Buffer[] = [];

    for (const p of privateKeyStrs) {
        privateKeys.push(convertPrivateKeyFromStr(p));
    }
    // console.log(privateKeys);
    return privateKeys;
}

const getUTXOs = async (address: string): Promise<{ utxos: UTXO[], balance: BigNumber }> => {
    let utxos = await getUTXOsFromBlockStream(address, true);
    let pendingutxos = await getUTXOsFromBlockStream(address, false);
    // console.log("pendingutxos: ", pendingutxos);
    utxos.push(...pendingutxos)

    // only get utxos have value >= 1000 sats
    utxos = utxos.filter(u => u.value.comparedTo(new BigNumber(1000)) === 1);

    let balance = new BigNumber(0);
    for (const u of utxos) {
        balance = BigNumber.sum(balance, u.value)
    }
    return { utxos, balance };
}



// const mintTokens = async () => {
//     // **** setup env
//     const LocalStorage = require('node-localstorage').LocalStorage
//     const localStorage = new LocalStorage('./scratch');
//     const storage = new StorageService()
//     storage.implement({
//         namespace: undefined,
//         getMethod(key: string): Promise<any> {
//             return localStorage.getItem(key);
//         },
//         removeMethod(key: string): Promise<any> {
//             return localStorage.removeItem(key);
//         },
//         setMethod(key: string, data: string): Promise<any> {
//             return localStorage.setItem(key, data);
//         }
//     });

//     const tcClient = new TcClient(Mainnet)
//     setupConfig({
//         storage,
//         tcClient: tcClient,
//         netType: NetworkType.Mainnet
//     })
//     setBTCNetwork(NetworkType.Mainnet);
//     // @ts-ignore
//     globalThis.storage = storage;

//     // *** get list private keys
//     const privateKeys = await getPrivateKeys();

//     // *** get fee rate
//     const feeRate = 3;

//     // *** expected round
//     const expectedRound = 2;

//     // *** TODO: 2525 UPDATE RUNE INFO
//     // const RUNE_TOKEN_NAME = "THE•LUCKY•GENESIS";
//     // const RUNE_ID_BLOCK_HEIGHT = 871605n;
//     // const RUNE_ID_TX_INDEX = 4241n;

//     const RUNE_TOKEN_NAME = "THE•LUCKY•GENESIS";
//     const RUNE_ID_BLOCK_HEIGHT = 871605n;
//     const RUNE_ID_TX_INDEX = 4241n;

//     // sumary
//     let totalMintSuccess = 0;
//     let totalNetworkFee = new BigNumber(0);
//     let round = 1;

//     while (round < expectedRound) {

//         for (let [index, privateKey] of privateKeys.entries()) {
//             const { keyPair, tweakedSigner, senderAddress } = generateTaprootKeyPair(privateKey);

//             // *** get utxos
//             const { utxos, balance } = await getUTXOs(senderAddress);

//             console.log("Address: ", senderAddress, " utxos: ", utxos);

//             // *** create tx mint
//             const { txHex, txID, totalFee } = await createInscribeTxMintRunes({
//                 senderPrivateKey: privateKey,
//                 senderAddress: senderAddress,
//                 utxos: utxos,
//                 inscriptions: {},
//                 feeRatePerByte: feeRate,
//                 runeIDBlockHeight: RUNE_ID_BLOCK_HEIGHT,
//                 runeIDTxIndex: RUNE_ID_TX_INDEX,
//                 runeName: RUNE_TOKEN_NAME,
//             });

//             // TODO: 2525 UNCOMMENT HERE
//             await broadcastTx(txHex);

//             // console.log("commitTxHex: ", commitTxHex);
//             // console.log("commitTxID: ", commitTxID);
//             // console.log("revealTxHex: ", revealTxHex);
//             // console.log("revealTxID: ", revealTxID);
//             // console.log("totalFee: ", totalFee);

//             totalNetworkFee = BigNumber.sum(totalNetworkFee, totalFee);
//             totalMintSuccess++;

//             console.log("\n\n----------------------------------------- *********** -----------------------------------------");
//             console.log(`Address ${index} : ${senderAddress} : ${balance.toString(10)}`);
//             console.log(`Tx mint: ${txID}`)
//             console.log(`Number of mints: ${totalMintSuccess} - Total network fee: ${totalNetworkFee.toString(10)}`);
//             console.log("----------------------------------------- *********** -----------------------------------------\n\n");
//         }

//         console.log(`Finish round ${round}`);
//         round++;
//         await sleep(5 * 60 * 1000); // 5 mins
//     }
// }

const setup = () => {
    // **** setup env
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
}

const mintTokensV2 = async () => {
    setup();

    // *** get list private keys
    const privateKeys = await getPrivateKeys();

    // *** get fee rate
    const feeRate = 30;

    // *** expected round
    const expectedRound = 2;

    // *** TODO: 2525 UPDATE RUNE INFO
    // const RUNE_TOKEN_NAME = "THE•LUCKY•GENESIS";
    // const RUNE_ID_BLOCK_HEIGHT = 871605n;
    // const RUNE_ID_TX_INDEX = 4241n;




    // sumary
    let totalMintSuccess = 0;
    let totalNetworkFee = new BigNumber(0);
    let NumberAcc = 50;   // NOTE: only trying with the first account
    let NumberMintPerAcc = 10;


    for (let [index, privateKey] of privateKeys.entries()) {


        // if (index === 0 || index === 1) {
        //     continue
        // }

        // if (index + 1 > NumberAcc) {
        //     return
        // }

        // if (index < 41 || index > 50) {
        //     continue
        // }

        // if (index != 1) {
        //     continue
        // }

        const { keyPair, tweakedSigner, senderAddress } = generateTaprootKeyPair(privateKey);

        // *** get utxos
        const { utxos, balance } = await getUTXOs(senderAddress);
        if (balance.toNumber() < 10000) {
            // skip acc has small balance
            continue
        }
        console.log("Address: ", senderAddress, " utxos: ", utxos);

        let mints = 0;
        for (let utxo of utxos) {
            if (utxo.value.toNumber() <= 10000) {
                // skip small UTXOs
                continue
            }

            let utxosToCreateTx: UTXO[] = [utxo];

            // hard code to test
            // let utxosToCreateTx: UTXO[] = [{
            //     tx_hash: "b024426ad4b405be00440e7499baab9deb19217b53dbec4f6f552f6d5a65e518",
            //     tx_output_n: 1,
            //     value: new BigNumber(29000),
            // }];

            while (mints < NumberMintPerAcc) {
                // *** create tx mint
                const { txHex, txID, totalFee, changeAmount } = await createInscribeTxMintRunes({
                    senderPrivateKey: privateKey,
                    senderAddress: senderAddress,
                    utxos: utxosToCreateTx,
                    inscriptions: {},
                    feeRatePerByte: feeRate,
                    runeIDBlockHeight: RUNE_ID_BLOCK_HEIGHT,
                    runeIDTxIndex: RUNE_ID_TX_INDEX,
                    runeName: RUNE_TOKEN_NAME,
                });

                if (changeAmount.toNumber() < 10000) {
                    console.log("\n\n----------------------------------------- *********** -----------------------------------------");
                    console.log(`Address ${index} : ${senderAddress} mint completed - Total txs: ${mints} - there is insuffient balance to mint`);
                    console.log(`Total number of mints: ${totalMintSuccess} - Total network fee: ${totalNetworkFee.toString(10)}`);
                    console.log("----------------------------------------- *********** -----------------------------------------\n\n");
                    break
                }

                // TODO: 2525 UNCOMMENT HERE
                try {
                    const txIDRep = await broadcastTx(txHex);
                    if (txIDRep != txID) {
                        console.log("Send tx err: ", txIDRep);
                        break
                    }
                } catch (e) {
                    break;
                }


                totalNetworkFee = BigNumber.sum(totalNetworkFee, totalFee);
                totalMintSuccess++;
                mints++;

                const newUTXOs: UTXO[] = [{
                    tx_hash: txID,
                    tx_output_n: 1,
                    value: changeAmount,
                }];
                utxosToCreateTx = newUTXOs;

                console.log("\n\n----------------------------------------- *********** -----------------------------------------");
                console.log(`Address ${index} : ${senderAddress}`);
                console.log(`Tx mint: ${txID}`)
                console.log(`Total number of mints: ${totalMintSuccess} - Total network fee: ${totalNetworkFee.toString(10)}`);
                console.log("----------------------------------------- *********** -----------------------------------------\n\n");
            }

        }

    }
}

const getAllBalance = async () => {
    setup();

    // *** get list private keys
    const privateKeys = await getPrivateKeys();

    let totalBalance = BNZero;

    for (let [index, privateKey] of privateKeys.entries()) {

        const { keyPair, tweakedSigner, senderAddress } = generateTaprootKeyPair(privateKey);

        // *** get utxos
        const { utxos, balance } = await getUTXOs(senderAddress);

        totalBalance = BigNumber.sum(totalBalance, balance);

    }

    console.log("Total balance: ", totalBalance.toString());

}

const getAllRuneBalance = async () => {
    setup();

    // *** get list private keys
    const privateKeys = await getPrivateKeys();

    let totalBalance = BNZero;

    for (let [index, privateKey] of privateKeys.entries()) {

        const { keyPair, tweakedSigner, senderAddress } = generateTaprootKeyPair(privateKey);

        // *** get utxos
        // const runeID = `${RUNE_ID_BLOCK_HEIGHT}:${RUNE_ID_TX_INDEX}}`;
        const balance = await getRuneBalance(senderAddress);

        totalBalance = BigNumber.sum(totalBalance, balance);
        console.log("Total balance: ", totalBalance.toString());

        await sleep(2000);

    }

    console.log("Final Total balance: ", totalBalance.toString());

}

const main = async () => {
    try {
        // await mintTokensV2();
        // await getAllRuneBalance();
        await getAllBalance();
    } catch (e) {
        console.error("Mint token error: ", e);
    }

}

main()

