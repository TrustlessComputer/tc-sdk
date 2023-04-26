import { ECPair, Network, NetworkType, Wallet, convertPrivateKey, convertPrivateKeyFromStr, decryptWallet, deriveETHWallet, deriveSegwitWallet, encryptWallet, generateTaprootAddress, getBitcoinKeySignContent, importBTCPrivateKey, setBTCNetwork, signByETHPrivKey } from "../src/index";
import { Transaction, networks } from 'bitcoinjs-lib';

import { assert } from "chai";

const network = networks.bitcoin;  // mainnet
require("dotenv").config({ path: __dirname + "/.env" });
import {
    signTransaction
} from "../src/index";

describe("Import Wallet", async () => {
    signTransaction({
        hash: "1213232", method: "lhkhfkdwkfdw", dappURL: "", isRedirect: false
    })
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
        const hexTx = "020000000001010e5b128489ad04a9125c239530b51c363d8ab5d540ef9f624379f7b413caab240000000000ffffffff01e803000000000000225120af775218eb8a31e3233e6fbf27a5b9570b93bb74b2ab77a7081dcd16d173094d0340b8ac64a0f189a22976c948e5ad38ac2e2b91e3e185ac9c65f2cadf44191e965b26a3450a616f2a30938fab710e1107c03a88b5fa8315152fe23ddd1b123e71fdfdc1062037ca3b9043269336c5aa8f6204d4d4f10d8f44dd48ebd6afd9938a918acf69f8ac00634d99064d080262766d7631bc785d855012105820be6d8ffa7f644062a91bca00000ce2f9066e148502540be400848d8f9fc09412e258a3307deddb26478d274a3c9343cf9107d680b9060445bf4d080000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000026000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000bc785d855012105820be6d8ffa7f644062a91bca00000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000034d0802c0000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000005200000000000000000000000000000000000000000000000000000000000000540000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000560000000000000000000000000000000000000000000000000000000000000058000000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000000000000000000000000000000000000000000e54657374207a6970206172726179000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000754616e6a69726f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e54657374207a6970206172726179000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004f68747470733a2f4d08022f63646e2e6465762e67656e657261746976652e78797a2f75706c6f61642f313638303235313639333836363031353438362d313638303235313639332d73616c7574652e706e67000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004c760000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000082adaea0be68c8941d36e554dbee4b65a744283f65513675c34e7eaa254cccee5c39b1afa04bf29a0910bb50342ce8c5f48f2188a9a30ce534b5c7213760b2ef735ad4b0816821c02d6d48de2a39f67b1ccb3010c5b42fa06db254adee32c8a9e9a9152d532b6ff900000000";
        const msgtx = Transaction.fromHex(hexTx)
        console.log("msgtx: ", msgtx.ins[0].witness, msgtx.ins[0].witness.length)
    });



});
