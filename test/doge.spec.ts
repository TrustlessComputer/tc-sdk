import BigNumber from "bignumber.js";
import { broadcastDogeTx, dogeCreateInscribeTxs, DUTXO, NetworkType, randomDogeWallet, setDogeNetwork, createSendDogeTxV2 } from "../dist";
import dotenv from "dotenv";
const fs = require('fs').promises;
dotenv.config({ path: __dirname + "/.env" });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


const privKey = process.env.DOGE_PRIV_KEY || "";
const address = process.env.DOGE_ADDRESS || "";

const readFile = async (fileName: string): Promise<Buffer> => {
    const data = await fs.readFile(__dirname + fileName);
    console.log('File content:', data);
    return data;
}

// main().then(res => {
//     console.log("Res: ", res);
// })

// const bytes = randomBytes(3);

// const memoType = Buffer.from("text/plain", "utf-8").toString("hex");
// const memoData = Buffer.from("BVM.BVM.BVM", "utf-8").toString("hex");

// const memoData2 = Buffer.from("BVM.BVM.BVM.BVM", "utf-8").toString("hex");

// console.log(`Memos: ${memoType} ${memoData}, ${memoData2}`);

// const memos: Memo[] = [
//     {
//         Memo: {
//             MemoData: memoData,
//             MemoType: memoType
//         }

//     },
//     {
//         Memo: {
//             MemoData: memoData2,
//             MemoType: memoType
//         }

//     },
// ]


// createRippleTransaction({
//     wallet,
//     receiverAddress,
//     amount,
//     memos: memos

// }).then(res => {
//     console.log("Res: ", res);
// })





describe("XRPL create txs inscribe data", async () => {
    // it("data length is smaller than 1KB: need to create one tx", async () => {

    //     // const data = randomBytes(800);
    //     // console.log("data: ", data.toString("hex"));

    //     const dataHex = "1b691c008ed45637f8621d21c9eccfe39cf5534cdad206b87223538502e79d799ab5cd71ffe43d6422d6fcffd314992495b11311838931f2cad07b7259b3c9d704bacb42d718f35d9e700889dfcd267be142b95af394dab29452542fee9ba5d4ae905806e11814f68564b0e75fc33f7accbe2dc26b348f75384444e27bdf85c351bdf878750b8967858b7e7288cac6ddbafe787529e83a04d53a74481afa7b2c868e6a7e562f0587de771a82a03315b22d56eff2a1c3a77d63a56fd7e601f8ae5a6fc9eddbe9454f93a6b7e48f3df6c680c5a4e0d25b1fc4ee978c4aa9e46b98e83ef8b1f5d8d54446174a8771d93a63e2b93f2f810de42c2515c2a54f1bc1e7cbaae02c635e59e30bb0a837bc71cf8564ed757c222eb9dd58a754de42576467fb8f9fe3c2e305b3f4ea5708de62ecbdf94d0a171999cfae9c0c17909bb4173ec505b3c9ed39573d89f34f90fbab6697e2ac1dc6d7cd7f9f3fa5536be9e9fbb10b6152ce015147a07f3fe458ff833a554f3ca9e7443207cb9747a91d904558b5636d1beea45f48bebfeb4e4d20d966e0192f45a9de4b2d90c14886ec58fe8bdbae73ace7162a272a0c8321ae8a2ddcb2faafe134caabdbb6b8dfc1651b16a453c908d352ca5635b4826831b4e6fb28d7d72657943accdaa2e985a689e320277d7941c14d0233d765efe9896c2e0915ea4c5508d996b86aa872d80a594ceda54ade8cd90d02c3967cf82c2cc0981bf38fc0ac37ac7acb20e83d274a6d1862f36f614f959f6e35698653d01f87fc6ac99732f40ce6ffac51dde782772c5caa791a904c3c41ca93388454d115c1fc011a55605ac087792f68e8d4a0bf338c7d7e74aa0cfd13a3f4c56d9aa1a461b83177ac06f5e15422ceaa33d2c18ebef6d7631a05f9f2ce84cb8b797b356641cd81047363de991a553aadbded861b8817739bb524e66a1a5514d2eea99f77fa93e0f457574915501fa13c948e67deaf216c27443c25e940b983031d86b596739ca2584cc4d329c1399d29d316bb7cf67b5a3b7b20fbe52a71d0705e987d11f49bbc4865b7d44a7bbb07a605e06004b3d76942efa5b1d8b0c72e38beba66f4f2a5e3cb1bd523db3a0b5e6afb2293f4c23b271b6706871c4c1230ada33f1e96e2115952d737ea3a5e413684a29708b3bd516a91ff8fed3b332dd9d0d0a9c6a6dcfae8d75b2ffea4db7b7dc7b7272ff8f4d38a055f5df38ed89c7e47399ab77fe7c47b929db4837317e66cd414c57063ce791a551485f9093444307b46949210b31270ccc060891ec58a34ea3ae68c8f5211272133d2d16d65483a659014c9800197d2b2930a3474d0d6bad04d0239d59c243b122e05ffcd639b998e64269dfaaa3fb129678ff283a628984da2b48b45cc8cd26e13ccf9284a930a4b06e0e5a680415d766cc1ac1deb948f5fed6b8b434c12e4fc73e03b60b2706a0539af5d4f7bfb46f76424a837d4bdb139eee30be4dbcfdd76e4af8d675785ff5af8c273c6c87b060e7277f5d43d5079317b2c6d51e89497db35f75d50ef79e7fb5d729fafb24fedc3dcfbc12454bf578bb44c428f03da6ba23c43c5d329fbe3792d9b585dd67e2a28879bef4341675794b2483cadecb1c97ecc5b522f284f3b0d7c0f0c32b7300dd260c3af06ad16780c90bb422963a2e2aa418ea9d8ecd52e12eb9fb2a7165c6b224aa76935c73f518784845474441ad1198852302c18470d9f586278d976c3e6fc3d0bfe570bb9495b65dbc024756bbd0d65c2393edd874e87a60081fe84e48d2351ba252ecc3a7eba4dbd8f1aa6cf44dec282298b6cbc4f0d4302562d5644a91010ab26b81d72e15c8d6f68e214163064015b1c3f3d59cb54a80359654c36a77153e2f0c93694b6816b17bca6811cc78229f1b833518bbec3fcdf31b2e94f940d1d335d9d3a6982aad6b696f54ebe6c1dba268eab5b4edb39652bdbb9583f075818859ea628731b8a2dbfdc23a12d2cb90cc581b64af70eb42d19c8f2c012b852cae06e2cc9d3ea61b0201edfdb6fc41809d830c4c222c4a28be3e81d1ca5587e5f945a2cad0b5580aca7890d397e41885d2fdc58fcae661095868b3f1dabb0c08144caf72166d84ed77e53903860f0ded28ef3ef16a25330159bdfb039418578e1b3a62c9f03e3d258742a36f86bbd0c7e1b6384da43ceaed2c5af935316622e1f16376b402c2c3e078b2742208cc5a38c4ef43d10a5210bbd7745291c0c57e67df3a354fd171b929e2dcc24428ab311d1911c559dc8132c2ebaa9915ebf906816989a14122cb3800df69c5ab56c43e0b5ec1fd8f018d06af5511e60aacd886dd8048bde8ad276bd8fc6d7adb30017da66127362895363aa25c865f6011d76402145236e183d5432c5e55f275d809746b6fc727f4409da2252acebbbbcab16494ddef2696fd7bc77538f51353bd63de8c62feefdf1a1ca352b5ab5efb87ea3de0c7618c8aefaf2af292c39a97d264b4c855abfdcfd86b6253888c01d064e26dbb0946bd37dc3d2dbdb2c17d838963ea6c189422ca928522173578d5b66ce01935836014b4f4b5bf7ee8ba91a1b685815136048c096f39696ca759d5fa910780e6e86982b508d1dcb9e4961d92b7218976ccef1b253584ff0285b4756407724066da0d6b233e99847c7695b3f6b5373e8c9834eaffb9056b825b40d026974a50a16725d19575e14db80698174dd2c613387d55a47cdc04539d14d62b0e94d2c989248244cf86d18dc85ee519a620b1bdd35201fc81434669cb5a2ae17b453699652d0d5eb6bed5039c131666597ea07e73d7a57eeb7bf2a01f7bd992e9e2c47b0a5ad057708c8db0514f4cc0739196898dc3e70c2067d1d96b769e0b0735e3ca88718238cb94cada9bf9f0a2c6fd4b80a854c05d98a45164c9dbe60d14275fa346704ca4fc043292309b2a1f25052806c12955383b9b07cd0b9e938270651a18604264f2431e224562f658c08126ae7a49da8898cc2097a7ee1dcfa19cefa824c85c990adf6d10e6bdb901d704c1497b8936114b14e32ed18774aa881602845788b84f3f3d21dd220a84629f161706c110c31c98b27c4dc9b2972fc20136b4ecba086138f8fb65df580951bdd9c2a7a3b40a657c44d125f299fe4866ae38420c48db56d068e24c87a8a0893342482aa154d360f4ef4a41bbd8f6b05a9740b5f27fcf790a115820e890219b25b7299df1ecd19ace793c81cb64513d2355bd18c3ced0b979567e7e3d6988cfdafdc2db5b5063b7c95d443dc0953af68207b820782108b219593962f6721ddb62469e957edb5af4519bc813df4fb9ffffc6b177d7fe1ba29bb0618bd5f3bbdcf1d7d60e4002a17bef6ea8b8f0fb505767f1d070806e4f8468aabfa46443caa0c7c3786272eb264f541e710ae9d86f9320c0e03dbece881bb746c6d88bef1f63170f60ca8edd3030dc677aa3c8a2a37041ddc37fbbf086415824c0edbba7061c5bf1a04398f7ddda3deedffe1b52b97bd70dfd2530d7befc88cbef5ff9697ae97461cbe68fee1c10ffe9b49807c40855a5375722e474ca6ca8c8589551fd58739fd43592f232eaae90d72338470a5612b2a58fb603a962d140cd8bab8a0f6a1cb960a06b2155cdfb0c0f774d73ab1ea2a5db226b927c11a5b3417eb65c0d7cb27a1c9248bf9f08cc59ab8c541e6b5a36783236dffa709440c43058f6ccb4143f41ab0b57a8d5ab56cf5c62a5fb6c3c97707096d61ab85e979c582ab7e2ce607875cce51ea437fa3d698e0688d2e5eb49e42cb009c84fbba6cf51221fa914fdfd0ba6cede20d170ef2c82bfa6f3fe8bd8f8b777a8f7fd7541c493ea13e72f8b2f38c5b1c734ff889a3d35b37ac59d932d5912f396a3964ae9b559e3f68cd894b6efdf0ae4999bb7af8d45bfc797ffddd3485be762ebd75cc339ba75db7f19ea235ad0be6fd7afbfd4f9cd8fe98e97cf7a724b9a5fab79cd2c7aebceb47bfbd16";
    //     const data = Buffer.from(dataHex, "hex")

    //     const { txIDs, totalNetworkFee } = await createInscribeTxs({
    //         senderSeed: seed,
    //         receiverAddress,
    //         amount,
    //         data,
    //         encodeVersion: 1,
    //         rpcEndpoint: XRPL_WSC_TESTNET,
    //     })

    //     console.log("txIDs, totalNetworkFee: ", txIDs, totalNetworkFee);
    // });

    // it("DOGE inscribe data", async () => {

    //     const data = await readFile("/shardai/final.js");
    //     const contentType = "text/javascript";
    //     console.log("Data: ", data.length);
    //     const utxos: DUTXO[] = [{
    //         txid: "c11087175a68c0111c544ebc57429262da3cf061001deda97702bb22d4c14c75",
    //         vout: 1,
    //         satoshis: 171200000,
    //         script: "76a9141d20435f39233a6d892294eae3fcd7099d57a38d88ac",
    //     }]

    //     const { txIDs, txHexes, totalNetworkFee } = await dogeCreateInscribeTxs({
    //         network: NetworkType.Mainnet,

    //         senderPrivKey: privKey,
    //         senderAddress: address,
    //         receiverAddress: address,
    //         data,
    //         utxos,
    //         contentType,
    //         feeRate: 982,
    //     })

    //     console.log("txIDs: ", txIDs);
    //     console.log("txHexes: ", txHexes);
    //     console.log("totalNetworkFee: ", totalNetworkFee);

    //     // await getDogeFeeRate()

    //     for (let tx of txHexes) {
    //         console.log("Broadcasting tx: ", tx);
    //         try {
    //             const txID = await broadcastDogeTx(tx);
    //             console.log("Broadcast tx successfully: ", txID);
    //             await sleep(2 * 1000);
    //         } catch (e) {
    //             console.log("ERR: ", e);
    //         }

    //     }

    // });


    it("DOGE send DOGE", async () => {

        setDogeNetwork(NetworkType.Testnet);


        const utxos: DUTXO[] = [{
            txid: "d89a4488ab0225b0bed4aa425d9f6a59bde41d6f956aff72536861894bfbddcc",
            vout: 1,
            satoshis: 9825700000,
            script: "76a914a5995be761e148c7d09c0ef52e614e952e72237c88ac",
        }]

        const { txID, txHex, networkFee } = await createSendDogeTxV2({
            network: NetworkType.Testnet,
            senderPrivKey: privKey,
            senderAddress: address,
            receiverAddress: "nodfH15aiwA5gk4sbm3suoXQdo9GBARKTS",
            amount: new BigNumber(10e8),
            utxos,
            feeRate: 982,
        })

        console.log("txID: ", txID);
        console.log("txHex: ", txHex);
        console.log("networkFee: ", networkFee);



        // await getDogeFeeRate()

        // for (let tx of txHexes) {
        //     console.log("Broadcasting tx: ", tx);
        //     try {
        //         const txID = await broadcastDogeTx(tx);
        //         console.log("Broadcast tx successfully: ", txID);
        //         await sleep(2 * 1000);
        //     } catch (e) {
        //         console.log("ERR: ", e);
        //     }

        // }

    });

    // it("random wallet", async () => {
    //     setDogeNetwork(NetworkType.Testnet);
    //     randomDogeWallet();
    // })

})