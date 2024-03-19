import { ECPair, Mainnet, Network, NetworkType, TcClient, Wallet, convertPrivateKey, convertPrivateKeyFromStr, decryptWallet, deriveETHWallet, deriveSegwitWallet, encryptWallet, generateP2WPKHKeyPair, generateTaprootAddress, getBitcoinKeySignContent, getUTXOs, importBTCPrivateKey, setBTCNetwork, signByETHPrivKey } from "../src/index";
import { Transaction, networks } from 'bitcoinjs-lib';

import { assert } from "chai";
import { Regtest, StorageService, setupConfig } from "../dist";

const network = networks.regtest;  // mainnet
require("dotenv").config({ path: __dirname + "/.env" });

describe("Import Wallet", async () => {

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
        storage: storage,
        tcClient: tcClient,
        netType: NetworkType.Regtest
    })
    setBTCNetwork(NetworkType.Regtest);
    // it("Import BTC private key - encrypt and decrypt wallet", async () => {
    //     // TODO: enter the private key
    //     const privKeyStr = process.env.PRIV_KEY_1 || "";
    //     const password = "hsbefjwkbfkw";

    //     const wallet: Wallet = {
    //         privKey: privKeyStr
    //     };

    //     // import btc private key
    //     const { taprootPrivKeyBuffer, taprootAddress } = importBTCPrivateKey(privKeyStr);
    //     console.log("Taproot address: ", taprootAddress);

    //     // encrypt
    //     const cipherText = encryptWallet(wallet, password);

    //     // decrypt
    //     const decryptedWallet = decryptWallet(cipherText, password);

    //     assert.notEqual(decryptedWallet, undefined);
    //     assert.equal(decryptedWallet?.privKey, privKeyStr);

    // });

    // it("Import BTC private key - derive segwit wallet and eth wallet", async () => {
    //     // TODO: enter the private key
    //     const privKeyStr = process.env.PRIV_KEY_1 || "";
    //     const password = "hsbefjwkbfkw";

    //     const wallet: Wallet = {
    //         privKey: privKeyStr
    //     };

    //     // import btc private key
    //     const { taprootPrivKeyBuffer, taprootAddress } = importBTCPrivateKey(privKeyStr);
    //     console.log("Taproot address: ", taprootAddress);

    //     // derive segwit wallet
    //     const { segwitPrivKeyBuffer, segwitAddress } = deriveSegwitWallet(taprootPrivKeyBuffer);
    //     console.log("segwitPrivKeyBuffer, segwitAddress: ", segwitPrivKeyBuffer, segwitAddress);

    //     // derive eth wallet
    //     const { ethPrivKey, ethAddress } = deriveETHWallet(taprootPrivKeyBuffer);
    //     console.log("ethPrivKey, ethAddress: ", ethPrivKey, ethAddress);
    // });

    // it("Import BTC private key - derive eth wallet and sign by eth private key", async () => {
    //     // TODO: enter the private key
    //     const privKeyStr = process.env.PRIV_KEY_1 || "";

    //     const wallet: Wallet = {
    //         privKey: privKeyStr
    //     };

    //     // import btc private key
    //     const { taprootPrivKeyBuffer, taprootAddress } = importBTCPrivateKey(privKeyStr);
    //     console.log("Taproot address: ", taprootAddress);

    //     // for (let i = 0; i < 100; i++) {
    //     // }
    //     // derive segwit wallet
    //     const { segwitPrivKeyBuffer, segwitAddress } = deriveSegwitWallet(taprootPrivKeyBuffer);
    //     console.log("segwitPrivKeyBuffer, segwitAddress: ", segwitPrivKeyBuffer.toString("hex"), segwitAddress);

    //     // derive eth wallet
    //     const { ethPrivKey, ethAddress } = deriveETHWallet(taprootPrivKeyBuffer);
    //     console.log("ethPrivKey, ethAddress: ", ethPrivKey, ethAddress);
    //     const nonceMessage = "abc";

    //     const SIGN_MESSAGE = "";

    //     const toSign = '0x' + getBitcoinKeySignContent(SIGN_MESSAGE).toString('hex');

    //     const signature = signByETHPrivKey(ethPrivKey, toSign);
    //     assert.notEqual(signature, "");
    //     assert.equal(signature.substring(0, 2), "0x");

    //     assert.equal(segwitAddress, "1KVQhoJHeviEambmxDquRckDK7opXJx9U4");
    //     assert.equal(ethAddress, "0x4809081b2cca77207634faa47a453f83cc99eb9b");
    // });

    // it("Sign by eth private key - compare signature was from metamask", async () => {
    //     const ethPrivKey = process.env.ETH_PRIV_KEY || "";
    //     const ethAddress = process.env.ETH_ADDRESS || "";
    //     console.log("ethPrivKey, ethAddress: ", ethPrivKey, ethAddress);
    //     const nonceMessage = "9935928c-452d-dd02-6aa3-62795c5cc875";
    //     const taprootAddress = "bc1pj2t2szx6rqzcyv63t3xepgdnhuj2zd3kfggrqmd9qwlg3vsx37fqywwhyx";
    //     const segwitAddress = "1FkVNdA26Fbtqm5npqbzy3RuKGCZa1HCSi";

    //     const SIGN_MESSAGE = "";
    //     const toSign = '0x' + getBitcoinKeySignContent(SIGN_MESSAGE).toString('hex');

    //     const signature = signByETHPrivKey(ethPrivKey, toSign);
    //     assert.equal(signature, "0xa081f4f6e06bdc0b6d503d847fc2332d150b09838aa3391c6e417c2903994cbd00afc2a0d8582d252d8e9a7714572a766600bf1fc588858ae3ce799832d110911c");
    // });

    // it("Generate Taproot address by custom network", async () => {
    //     const privKey = process.env.PRIV_KEY_2 || "";
    //     // const privKeyBuffer = convertPrivateKeyFromStr(privKey);
    //     setBTCNetwork(NetworkType.Regtest);

    //     const randomKeyPAir = ECPair.makeRandom({ network: Network });
    //     const privKeyBuffer: Buffer = randomKeyPAir.privateKey || new Buffer(2);
    //     // convertPrivateKey(privKeyBuffer);
    //     // generateTaprootAddress(privKeyBuffer)
    //     console.log("Private key : ", convertPrivateKey(privKeyBuffer))




    //     const address = generateTaprootAddress(privKeyBuffer);
    //     console.log("address: ", address);
    // });
    it("Generate Taproot address by custom network", async () => {
        // const hexTx = "020000000001019b2e38c980a2430ae92335615ddf407fd6a33f95ea1e7187a35edf29779007360100000000000000000100000000000000001c6a1a68747470733a2f2f74727573746c6573732e636f6d707574657203401de9043ebf4504b7c4ec2197ad46a504867a969c13c5da4ac630d2fad8519f19a39a317a175d3387b99f0cd2a4ed04ae4c1962ee5830a66cccd44a293b99cef3fd1d0620cb96e818f05e24166f2fc2e35b68e304aac6b505df3692db4e0f09cc38045f55ac00634d080262766d76316363ec9eab02866c69e5a28e675ed07cbfadb7f900000ba4f905cf8201da850d595b2996830268b394880ef174a1d7d1dbc0bce9a496ede32fcfbf975a80b905646a76120200000000000000000000000063bfac4d88aed85e0a0880e501ed4b9e1d64a47b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036000000000000000000000000000000000000000000000000000000000000001e45530f4a5000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000004d08020000000001600000000000000000000000000000000000000000000000000000000000000003000000000000000000000000fb83c18569fb43f1abcbae09baf7090bffc8cbbd000000000000000000000000fb83c18569fb43f1abcbae09baf7090bffc8cbbd000000000000000000000000fb83c18569fb43f1abcbae09baf7090bffc8cbbd0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000138e95db68f84bd2b328e1995ecfbe4066036042000000000000000000000000eab422a1c21738d2741224e4ed5247100753cc7f000000000000000000000000880ef174a1d7d1dbc0bce9a496ede32fcfbf975a000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000b147c91e4ac000000000000000000000000000000000000000000000000000002928de77a094000000000000000000000000000000000000000000000000000000b5e620f480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c777568b82da81ce6f092a52c2580b23c6e4efecd95094413385a30659c0749b215ff44489e19e73a04c2288918184b59721eebc74020d24a53fa7aa19f7dbf2891b49c2739ee34ddf014b71e61b6b0d77f54116d2a02222a7593af942bb7bbdeec84ef9b42dac44ed1116d0c56b45d9448ead86fa45e7937072078c11fcb108e4d15423461baa58e83f4376447c47e5d4fa80e5c7a2bef43c086bf1364fa866f557f336ba6d4e3fd60d29086e3884c9bcaf1c5858457a93d0f5c8b484c3c82d10ffbc621e7c1bbf49c2097bad02a08fda65c38cd3ac2ef7d9bfcf5dbbd95def6559fad3c7c98538e74ca7303bee1a24eb656ff07e563b79c0787b57f21381fb896f5a024e8c861c3948bf72cc1790050146138544feb112389581a0eb22b171f7adf0db63c869c15e0ffcfc5c96f80306aee4afd320d38b1fc8524ddabb99ce96250c45980095891b9e0c008459b342f7a4d302e08047e6405fecc1825aea4104d2822ffd870a5210365bb8fb4b57f22ae9703f3a46bd8a9fc38c321cbc594a3fa4a0c97eb8da84251b1957cb019ae1e0e98269f337aec4bbdd5ce169189b4b840d1a914813e2c386f60056c33f3775b0e7c0e109489cbe41da0cb94ae349883c8a29bea1fd0ab98f671c0000000000000000000000000000000000000000000000000082adada0fcae23c7ca9add4872c0778c1d87c99e0b5d9c9ca85afd61381d94901830eca7a02cef0b10b8437794efb2d756a9ac14a6e26e76f12c78639d60f6fcc0f84383d56821c0cb96e818f05e24166f2fc2e35b68e304aac6b505df3692db4e0f09cc38045f5500000000";
        // const msgtx = Transaction.fromHex(hexTx)
        // console.log("msgtx: ", msgtx);
        // console.log("msgtx: ", msgtx.ins[0].witness, msgtx.ins[0].witness.length)

        setBTCNetwork(NetworkType.Regtest);


        const privateKey = "KzEe3Q35Cxg2Vj7tm6ASV81kvr46wPkbkqtVbemppLoBmrjrSbde";
        const privateKeyBuffer = convertPrivateKeyFromStr(privateKey
        );
        const address = generateTaprootAddress(privateKeyBuffer);
        console.log(
            address
        );


    });

    // it("Get UTXOs", async () => {
    //     const btcAddress = "bc1p5ht5j0v8kddv3wp84hy07lpwc8sjjwuw7yj2p92mrzgvyehtdc8qszs7pc";
    //     const tcAddress = "0x35F5d3C48169292bA4D2A79c3Be97540999C9468";
    //     const tcClient = new TcClient(Mainnet)
    //     const { availableUTXOs, availableBalance, incomingUTXOs, incomingBalance } = await getUTXOs({
    //         btcAddress,
    //         tcAddress,
    //         tcClient,

    //     });

    //     console.log("availableUTXOs: ", availableUTXOs);
    //     console.log("availableBalance: ", availableBalance);
    //     console.log("incomingUTXOs: ", incomingUTXOs);
    //     console.log("incomingBalance: ", incomingBalance);

    // })



});
