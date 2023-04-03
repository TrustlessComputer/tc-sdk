import { ECPair, broadcastTx, convertPrivateKeyFromStr, fromSat, generateTaprootKeyPair, signPSBT2, toXOnly } from "../src/index";
import {
    Psbt,
    networks,
    payments
} from "bitcoinjs-lib";

import BigNumber from "bignumber.js";
import { assert } from "chai";

const network = networks.bitcoin;  // mainnet


// describe("Broadcast Tx Tests", async () => {
//     it("Must return error", async () => {
//         const txHex = "020000000001042753e3ff7ce580974f6be8a4217b0dead005a7777a66780c784770fbbfd04b440000000000ffffffffc900d2e9f80251bdd91a2f60a28a34de123df5cee237c8d43fd835c02d52db1b0000000000ffffffffb2a4c3c7bf5f71aa9ac52fe8bf02ef6fc8c3833c035f730dee81b68607b3f2430000000000ffffffff2753e3ff7ce580974f6be8a4217b0dead005a7777a66780c784770fbbfd04b440100000000ffffffff05e20a0000000000002251209296a808da18058233515c4d90a1b3bf24a136364a10306da503be88b2068f9234080000000000002251201b1cf94fe0f0aec24646e7f2428246d9ec1129c870daacfa78cd694eef48f84ce8030000000000002251200c1ce68358188765ffb523f834ef00c9e7e72d70619a6896d51f18d7bce638d8e8030000000000002251209296a808da18058233515c4d90a1b3bf24a136364a10306da503be88b2068f9218300000000000002251209296a808da18058233515c4d90a1b3bf24a136364a10306da503be88b2068f920140dbfa53114e6480e377289ab5088eb5c8f451aa09786deb2dc510b50dd82dd8f042428419ff1944cbbf20fe6578ae02b75e4d1c923c64e70c7c046308f66e36740141c5083b59e5fb215d3bdcb458063b2d6275c2797841ddf43f86131a3fcb1b7967e00ea56b0d983388451c0033122b689d93b8b0e9112d056d65791d2079cdd0bf8301416df3dc54a577da209cc2e5fba353009a18a39d35fa077d09b6983228dffd58fc5f079282322f87ffcfb865f5c6b03a5b78dbac90d226a481475fb0367125a213830140c6cee3dfd23cca507bf93f4dc7960bfa1680afa921c4964ef37953c4a15fdcc0036268f462d458f8e8dc0e46b224bceaa5837cbdcca59d2520c0ef1f034e9fe400000000";
//         let er;
//         try {
//             const res = await broadcastTx(txHex);
//             console.log("res: ", res);
//         } catch (e) {
//             er = e;
//         }

//         assert.notEqual(er, null);
//     })
// });

// describe("Convert from sat Tests", async () => {
//     it("should return 0.00001", async () => {
//         const amt = 1000;
//         const res = fromSat(amt);
//         console.log("res: ", res);

//         assert.equal(res, 0.00001);

//         const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
//         // const arr = [0];
//         const newArr = arr.splice(0, arr.length - 1);
//         console.log("arr: ", arr);
//         console.log("newArr: ", newArr);
//     })
// });

// describe("Decode PSBT", async () => {
//     it("should return 0.00001", async () => {
//         // const base64Str = "cHNidP8BAP13AQEAAAAFA/mgF0WCFhKeWhiMGLHw1VyADfIBgkKnarwdwsvS878AAAAAAAUAAAAOuatSiMiEwxtqN6f2wgKSokteOxuUMfXmJ4G6KqQ74wAAAAAA//////W8asQZveWXibznEltdFEb9mlYzcCRMhDqm+eLq3+HEAAAAAAD/////UcqfCgnIdxdTnD4a9fRBdi/pnY3ZhDHPkMM+lzfKwlABAAAAAAUAAABRyp8KCch3F1OcPhr19EF2L+mdjdmEMc+Qwz6XN8rCUAAAAAAABQAAAATKDgAAAAAAACJRIJKWqAjaGAWCM1FcTZChs78koTY2ShAwbaUDvoiyBo+S0QcAAAAAAAAiUSCSlqgI2hgFgjNRXE2QobO/JKE2NkoQMG2lA76IsgaPkugDAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+ExcCgAAAAAAABYAFJ+qlZhsufSpYHkvlc/Nm2ZLm1H5AAAAAAABAR/oAwAAAAAAABYAFJ+qlZhsufSpYHkvlc/Nm2ZLm1H5AQhsAkgwRQIhAL0Yj9mMOGCUah20da6nV1ae316ljgl8TmFtWN3i6rs7AiAmItC/D3eauaxZUbDEY10F2cywED+8B0ATd+/W42JR9AEhAjEqIhqe5lX5qGcppNcix4c+RkiwoL/c1j7fNfk1PX15AAEBK+IKAAAAAAAAIlEgkpaoCNoYBYIzUVxNkKGzvyShNjZKEDBtpQO+iLIGj5IBCEMBQZAJPfy9FaCUvArehHclAmCFLgeYPXUD+4RGFW++6Fmxw1vpcZtjnrCmiXtBDCxSlQ6+M7LiJqDOQSJfoOICCzmDAAEBK+gDAAAAAAAAIlEgkpaoCNoYBYIzUVxNkKGzvyShNjZKEDBtpQO+iLIGj5IBCEMBQRPmV73v+yKAMRCT/rBqFR0Fxn+/LeQwEnKBdQUZOnIDzBuuWDxyvu/NzgsoeuO196iHjx3engB9nfhUSVoArHaDAAEBH4YTAAAAAAAAFgAUn6qVmGy59KlgeS+Vz82bZkubUfkBCGwCSDBFAiEAqOIgNxQUxYYzVtK9sFKdIZ9nKnV1tatu4gOfnx3BZccCICM8R4/EK8xBBUf3fyJTwzUZws5pQ2jT2haF1bdTz9uZASECMSoiGp7mVfmoZymk1yLHhz5GSLCgv9zWPt81+TU9fXkAAQEf0AcAAAAAAAAWABSfqpWYbLn0qWB5L5XPzZtmS5tR+QEIbAJIMEUCIQC8sdfadRZPd/o/GAZXOCUgAiQ7decw8TNoC41DEZ21zQIgYImK5h8dINXN75QrKQhkVlpSRSWMaXm/Vm37S/On7tEBIQIxKiIanuZV+ahnKaTXIseHPkZIsKC/3NY+3zX5NT19eQAAAAAA";

//         // const reBase64Str = "cHNidP8BALICAAAAAg65q1KIyITDG2o3p/bCApKiS147G5Qx9eYngboqpDvjAAAAAAD/////9bxqxBm95ZeJvOcSW10URv2aVjNwJEyEOqb54urf4cQAAAAAAP////8C0QcAAAAAAAAiUSCSlqgI2hgFgjNRXE2QobO/JKE2NkoQMG2lA76IsgaPkugDAAAAAAAAIlEgGxz5T+DwrsJGRufyQoJG2ewRKchw2qz6eM1pTu9I+EwAAAAAAAEBK+IKAAAAAAAAIlEgkpaoCNoYBYIzUVxNkKGzvyShNjZKEDBtpQO+iLIGj5IBCEMBQZAJPfy9FaCUvArehHclAmCFLgeYPXUD+4RGFW++6Fmxw1vpcZtjnrCmiXtBDCxSlQ6+M7LiJqDOQSJfoOICCzmDAAEBK+gDAAAAAAAAIlEgkpaoCNoYBYIzUVxNkKGzvyShNjZKEDBtpQO+iLIGj5IBCEMBQRPmV73v+yKAMRCT/rBqFR0Fxn+/LeQwEnKBdQUZOnIDzBuuWDxyvu/NzgsoeuO196iHjx3engB9nfhUSVoArHaDAAAA";

//         const privateKey = "";
//         const privateKeyBuffer = convertPrivateKeyFromStr(privateKey);

//         const { tweakedSigner, senderAddress } = generateTaprootKeyPair(privateKeyBuffer)
//         console.log("Address:", senderAddress);
//         // const pubKeyBuffer = payments.p2wpkh(null)

//         // const keyPair = ECPair.fromPrivateKey(privateKeyBuffer);
//         // pubKeyBuffer.pubkey

//         // const sellerSignedPsbt = Psbt.fromBase64(reBase64Str, { network });
//         // sellerSignedPsbt.txInputs.forEach((utxo, index) => {
//         //     // if (index >= 1 && index <= 2) {
//         //     try {
//         //         const isValid = sellerSignedPsbt.validateSignaturesOfInput(index, verifySchnorr, tweakedSigner.publicKey);
//         //         if (!isValid) {
//         //             console.log("Tx signature is invalid " + index);
//         //         }
//         //     } catch (e) {
//         //         console.log("Tx signature is invalid " + index);
//         //     }
//         //     // }
//         // });

//     })

// });


// describe("Generate address from private key", async () => {
//     it("should return the valid address", async () => {
//         // Enter your private key
//         const privateKey = "";
//         const privateKeyBuffer = convertPrivateKeyFromStr(privateKey);

//         const { tweakedSigner, senderAddress, p2pktr } = generateTaprootKeyPair(privateKeyBuffer)
//         console.log("Address:", senderAddress);
//         console.log("PubKey: ", tweakedSigner.publicKey.toString('hex'));

//         const tapInternalPubKey = toXOnly(tweakedSigner.publicKey);
//         console.log("Tap internal PubKey: ", tapInternalPubKey.toString("hex"));
//     })
// });

describe("Sign msg Tx", async () => {
    it("should return the valid tx", async () => {
        // Enter your private key
        const privateKey = "";
        const privateKeyBuffer = convertPrivateKeyFromStr(privateKey);
        console.log("privateKeyBuffer: ", privateKeyBuffer);
        const inputHexTx = "70736274ff0100fd310101000000030ee633984a9a05d6932f3c1cefda8d461c1e86027ba95a80273eadc1f604edae0000000000fdffffffa80e773fda5be00d40984da72427f8fb3638aa0840b30da10f8c92e428f458060200000000fdffffff0ee633984a9a05d6932f3c1cefda8d461c1e86027ba95a80273eadc1f604edae0100000000fdffffff04f401000000000000225120c920e06060005c98739fa4ea58e9fd1859e6affef1b3edbef65257175fa780af044c00000000000022512076c8edc1322a1eb3582be0db0794d140c0a3b5b8663cb6e04adc4acab9a938cd2202000000000000225120c920e06060005c98739fa4ea58e9fd1859e6affef1b3edbef65257175fa780af1c02000000000000225120d11b52ebc5e8a1d3010b1d1494ea526494e651bfe81d7e9ba3b7779623f954ba000000000001012bf84d000000000000225120c920e06060005c98739fa4ea58e9fd1859e6affef1b3edbef65257175fa780af0001012b220200000000000022512076c8edc1322a1eb3582be0db0794d140c0a3b5b8663cb6e04adc4acab9a938cd0001012b9525000000000000225120c920e06060005c98739fa4ea58e9fd1859e6affef1b3edbef65257175fa780af0000000000";

        const psbt = Psbt.fromHex(inputHexTx);
        const indicesToSign: number[] = [];
        for (let i = 0; i < psbt.txInputs.length; i++) {
            indicesToSign.push(i);
        }

        const res = signPSBT2({
            senderPrivateKey: privateKeyBuffer,
            psbtB64: psbt.toBase64(),
            indicesToSign: indicesToSign,
        })
        console.log(res);

        // console.log("msgTx: ", msgTx);
        // console.log("msgTxHex: ", msgTxHex);
        // console.log("msgTxID: ", msgTxID);
    })
});

// describe("Big Number Tests", async () => {
//     it("should return 0.00001", async () => {
//         const a = new BigNumber(1);
//         const b = new BigNumber(3);
//         const c = b.minus(a).minus(1).plus(5);

//         assert.equal(c.toNumber(), 6);
//         assert.equal(b.toNumber(), 3);
//         assert.equal(a.toNumber(), 1);
//     })
// });