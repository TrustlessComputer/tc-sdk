import { Memo, Client } from "xrpl";
import { sha256Hash, getAccountInfo } from "./utils";
import BigNumber from "bignumber.js";
import { createRawRippleTransaction, createRippleTransaction } from "./tx";
import { generateWalletFromSeed } from "./wallet";

const getNumberHex = ({
    n,
    expectedLen = 2,
}: {
    n: number,
    expectedLen?: number
}): string => {
    // Convert the number to a hexadecimal string
    const hex = n.toString(16);
    // Ensure it's at least 2 characters by padding with a leading zero
    return hex.padStart(expectedLen, '0');
}

function numberToBytes(number: number, byteLength: number) {
    const buffer = new ArrayBuffer(byteLength); // Create an ArrayBuffer
    const view = new DataView(buffer);         // Create a DataView to interact with the buffer

    // Write the number into the buffer (big-endian by default)
    if (byteLength === 1) {
        view.setUint8(0, number);
    } else if (byteLength === 2) {
        view.setUint16(0, number);
    } else if (byteLength === 4) {
        view.setUint32(0, number);
    } else {
        throw new Error("Unsupported byte length");
    }

    // Convert the buffer into a Uint8Array (byte array)
    return new Uint8Array(buffer);
}

const chunkData = (data: Buffer, chunkSize: number): Buffer[] => {
    const result = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        result.push(data.slice(i, i + chunkSize));
    }
    return result;
}


const createScripts = (data: Buffer, encodeVersion: number): Buffer[] => {

    const ProtocolID = "BVMV1";  // TODO 2525: custom protocol ID
    const protocolIDBuff = Buffer.from(ProtocolID, "utf-8");

    const MAX_CHUNK_LEN = 960; // 1000 - 40  // protocolID || dataID || Op_N || len chunk (2 byte) = 40 bytes

    // 32 bytes
    const dataID = sha256Hash(data); // sha256 hash data to get id

    console.log("createScripts dataID: ", dataID.toString("hex"));

    let encodeVersionByte = numberToBytes(encodeVersion, 1);

    // nunber of chunks
    const chunks = chunkData(data, MAX_CHUNK_LEN);
    let n = chunks.length;

    // len chunk

    const scripts: Buffer[] = [];
    for (let i = 0; i < n; i++) {
        // let script: Buffer = [];
        let opN = numberToBytes(n - i - 1, 1); // start from n - 1 to 0

        if (i == 0) {
            // append prefix 4-byte zero & encode version byte before opN of the first chunk

            opN = Buffer.concat([Buffer.from("00000000", "hex"), encodeVersionByte, opN]);
        }

        const lenChunk = numberToBytes(chunks[i].length, 2);


        let script = Buffer.concat([protocolIDBuff, dataID, opN, lenChunk, chunks[i]]);

        console.log(`Script in bytes ${i} : ${script}`);
        // console.log("createScripts dataID: ", dataID.toString("hex"));
        // let script = Buffer.concat([protocolIDBuff, dataID]);
        // let script = Buffer.concat([protocolIDBuff, dataID]);


        // script.push(...protocolIDBuff);
        // script.push(...dataID);

        // const num = ;
        // script.push(...num);  // op_N index chunk 
        // script.push(...)  // len chunk
        // script.push(...chunks[i]); // chunk data

        scripts.push(script);
    }

    return scripts;

    // chunk data
}

const createInscribeTxsV0 = async ({
    senderSeed,
    receiverAddress,
    amount,
    data,
    encodeVersion,
    fee = new BigNumber(0),
    rpcEndpoint,
}: {
    senderSeed: string,
    receiverAddress: string,
    amount: BigNumber,
    data: Buffer,
    encodeVersion: number,
    fee?: BigNumber,
    rpcEndpoint: string,
}): Promise<{
    txIDs: string[],
    totalNetworkFee: BigNumber,
}> => {
    const wallet = generateWalletFromSeed(senderSeed);

    const scripts = createScripts(data, encodeVersion);

    console.log(`createInscribeTxs scripts length ${scripts.length} - need to create ${scripts.length} txs`);

    // Step 1: Connect to the XRPL testnet
    const client = new Client(rpcEndpoint); // Testnet URL
    await client.connect();
    console.log("Connected to XRPL testnet");

    const accountInfo = await getAccountInfo(wallet.address, client);
    console.log("Account Sequence:", accountInfo.result.account_data?.Sequence);
    let sequence = accountInfo.result.account_data?.Sequence;

    const txIDs: string[] = [];
    let totalNetworkFee = new BigNumber(0);

    for (let s of scripts) {

        const scriptHex = s.toString("hex");
        console.log(`Script in hex : ${scriptHex}`);
        const memos = [{
            Memo: {
                MemoData: scriptHex,
            }
        }]

        const { txID, txFee } = await createRippleTransaction({
            client,
            wallet,
            receiverAddress,
            amount,
            memos: memos,
            fee: fee,
            rpcEndpoint,
            sequence,
            isWait: false,
        });

        txIDs.push(txID);
        totalNetworkFee = BigNumber.sum(totalNetworkFee, new BigNumber(txFee));
        sequence++;
    }

    // Step 7: Disconnect from the client
    await client.disconnect();
    console.log("Disconnected from XRPL");

    return {
        txIDs,
        totalNetworkFee
    };
}

const createInscribeTxs = async ({
    senderSeed,
    receiverAddress,
    amount,
    data,
    encodeVersion,
    fee = new BigNumber(0),
    rpcEndpoint,
}: {
    senderSeed: string,
    receiverAddress: string,
    amount: BigNumber,
    data: Buffer,
    encodeVersion: number,
    fee?: BigNumber,
    rpcEndpoint: string,
}): Promise<{
    txIDs: string[],
    totalNetworkFee: BigNumber,
}> => {
    const wallet = generateWalletFromSeed(senderSeed);

    const scripts = createScripts(data, encodeVersion);

    console.log(`createInscribeTxs scripts length ${scripts.length} - need to create ${scripts.length} txs`);

    // Step 1: Connect to the XRPL testnet
    const client = new Client(rpcEndpoint); // Testnet URL
    await client.connect();
    console.log("Connected to XRPL testnet");

    const accountInfo = await getAccountInfo(wallet.address, client);
    console.log("Account Sequence:", accountInfo.result.account_data?.Sequence);
    let sequence = accountInfo.result.account_data?.Sequence;

    const curLedgerHeight = await client.getLedgerIndex()

    // check balance 
    let balance = new BigNumber(accountInfo.result.account_data.Balance, 10);
    if (balance.comparedTo(new BigNumber(10000)) != 1) {
        throw new Error("Balance is insuffient");
    }

    const txIDs: string[] = [];
    let totalNetworkFee = new BigNumber(0);

    const signedTxs = [];

    for (let s of scripts) {
        const scriptHex = s.toString("hex");
        // console.log(`Script in hex : ${scriptHex}`);
        const memos = [{
            Memo: {
                MemoData: scriptHex,
            }
        }]

        const signedTx = await createRawRippleTransaction({
            client,
            wallet,
            receiverAddress,
            amount,
            memos: memos,
            fee: fee,
            sequence,
            curLedgerHeight,
        });
        signedTxs.push(signedTx);

        // txIDs.push(txID);
        // totalNetworkFee = BigNumber.sum(totalNetworkFee, new BigNumber(txFee));
        sequence++;

        // NOTE: ONLY FOR TESTING: ONLY SUBMIT THE FIRST CHUNK
        // break;
    }

    const submitTxTasks = [];
    for (let signedTx of signedTxs) {
        const resp = client.submit(signedTx.tx_blob);
        submitTxTasks.push(resp);
    }

    const submitTxResps = await Promise.all(submitTxTasks);

    for (let r of submitTxResps) {
        console.log("Submit tx resp: ", r);
        // TODO: 2525 validate success 
        if (!r.result.accepted || !r.result.applied) {
            throw new Error("submit tx error " + r.result.engine_result_message);
        }
        txIDs.push(r.result.tx_json.hash || "");
        totalNetworkFee = BigNumber.sum(totalNetworkFee, new BigNumber(r.result.tx_json.Fee || ""));
    }

    // Step 7: Disconnect from the client
    await client.disconnect();
    console.log("Disconnected from XRPL");

    return {
        txIDs,
        totalNetworkFee
    };
}

export {
    createScripts,
    createInscribeTxs,
}