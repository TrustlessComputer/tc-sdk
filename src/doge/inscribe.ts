const dogecore = require('bitcore-lib-doge')
const fs = require('fs')
const dotenv = require('dotenv')
const mime = require('mime-types')
const express = require('express')
const { PrivateKey, Address, Transaction, Script, Opcode } = dogecore
const { Hash, Signature } = dogecore.crypto
import BigNumber from "bignumber.js";
import { DUTXO, DWallet } from "./types"
import { MinSats } from "./constants"
import axios, { AxiosResponse } from "axios";

dotenv.config()

// if (process.env.TESTNET == 'true') {
//     dogecore.Networks.defaultNetwork = dogecore.Networks.testnet
// }

const NetworkType = {
    Mainnet: 1,
    Testnet: 2,
};

const setDogeNetwork = (netType: number) => {
    switch (netType) {
        case NetworkType.Mainnet: {
            dogecore.Networks.defaultNetwork = dogecore.Networks.mainnet;
            // BlockStreamURL = "https://blockstream.info/api";
            break;
        }
        case NetworkType.Testnet: {
            dogecore.Networks.defaultNetwork = dogecore.Networks.testnet;
            // BlockStreamURL = "https://blockstream.info/testnet/api";
            break;
        }
    }
};

if (process.env.FEE_PER_KB) {
    Transaction.FEE_PER_KB = parseInt(process.env.FEE_PER_KB)
} else {
    Transaction.FEE_PER_KB = 100000000
}

// const WALLET_PATH = process.env.WALLET || '.wallet.json'


// async function main() {
//     let cmd = process.argv[2]

//     if (fs.existsSync('pending-txs.json')) {
//         console.log('found pending-txs.json. rebroadcasting...')
//         const txs = JSON.parse(fs.readFileSync('pending-txs.json'))
//         await broadcastAll(txs.map(tx => new Transaction(tx)), false)
//         return
//     }

//     if (cmd == 'mint') {
//         await mint()
//     } else if (cmd == 'wallet') {
//         await wallet()
//     } else if (cmd == 'server') {
//         await server()


//     } else {
//         throw new Error(`unknown command: ${cmd}`)
//     }
// }


// async function wallet() {
//     let subcmd = process.argv[3]

//     if (subcmd == 'new') {
//         walletNew()
//     } else if (subcmd == 'sync') {
//         await walletSync()
//     } else if (subcmd == 'balance') {
//         walletBalance()
//     } else if (subcmd == 'send') {
//         await walletSend()
//     } else if (subcmd == 'split') {
//         await walletSplit()
//     } else {
//         throw new Error(`unknown subcommand: ${subcmd}`)
//     }
// }


// function walletNew() {
//     if (!fs.existsSync(WALLET_PATH)) {
//         const privateKey = new PrivateKey()
//         const privkey = privateKey.toWIF()
//         const address = privateKey.toAddress().toString()
//         const json = { privkey, address, utxos: [] }
//         fs.writeFileSync(WALLET_PATH, JSON.stringify(json, 0, 2))
//         console.log('address', address)
//     } else {
//         throw new Error('wallet already exists')
//     }
// }


// async function walletSync() {
//     if (process.env.TESTNET == 'true') throw new Error('no testnet api')

//     let wallet = JSON.parse(fs.readFileSync(WALLET_PATH))

//     console.log('syncing utxos with dogechain.info api')

//     let response = await axios.get(`https://dogechain.info/api/v1/address/unspent/${wallet.address}`)
//     wallet.utxos = response.data.unspent_outputs.map(output => {
//         return {
//             txid: output.tx_hash,
//             vout: output.tx_output_n,
//             script: output.script,
//             satoshis: output.value
//         }
//     })

//     fs.writeFileSync(WALLET_PATH, JSON.stringify(wallet, 0, 2))

//     let balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0)

//     console.log('balance', balance)
// }


// async function walletSync() {
//     if (process.env.TESTNET == 'true') throw new Error('no testnet api')

//     let wallet = JSON.parse(fs.readFileSync(WALLET_PATH))

//     console.log('syncing utxos with dogechain.info api')

//     let response = await axios.get(`https://dogeblocks.com/api/utxo/${wallet.address}`)
//     console.log("syncing utxos response ", response);
//     wallet.utxos = response.data.map(output => {
//         return {
//             txid: output.txid,
//             vout: output.vout,
//             script: output.scriptPubKey,
//             satoshis: output.satoshis
//         }
//     })


//     fs.writeFileSync(WALLET_PATH, JSON.stringify(wallet, 0, 2))

//     let balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0)

//     console.log('balance', balance)
// }


// function walletBalance() {
//     let wallet = JSON.parse(fs.readFileSync(WALLET_PATH))

//     let balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0)

//     console.log(wallet.address, balance)
// }


// async function walletSend() {
//     const argAddress = process.argv[4]
//     const argAmount = process.argv[5]

//     let wallet = JSON.parse(fs.readFileSync(WALLET_PATH))

//     let balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0)
//     if (balance == 0) throw new Error('no funds to send')

//     let receiver = new Address(argAddress)
//     let amount = parseInt(argAmount)

//     let tx = new Transaction()
//     if (amount) {
//         tx.to(receiver, amount)
//         fund(wallet, tx)
//     } else {
//         tx.from(wallet.utxos)
//         tx.change(receiver)
//         tx.sign(wallet.privkey)
//     }

//     await broadcast(tx, true)

//     console.log(tx.hash)
// }


// async function walletSplit() {
//     let splits = parseInt(process.argv[4])

//     let wallet = JSON.parse(fs.readFileSync(WALLET_PATH))

//     let balance = wallet.utxos.reduce((acc, curr) => acc + curr.satoshis, 0)
//     if (balance == 0) throw new Error('no funds to split')

//     let tx = new Transaction()
//     tx.from(wallet.utxos)
//     for (let i = 0; i < splits - 1; i++) {
//         tx.to(wallet.address, Math.floor(balance / splits))
//     }
//     tx.change(wallet.address)
//     tx.sign(wallet.privkey)

//     await broadcast(tx, true)

//     console.log(tx.hash)
// }


const MAX_SCRIPT_ELEMENT_SIZE = 520

// async function mint() {
//     const argAddress = process.argv[3]
//     const argContentTypeOrFilename = process.argv[4]
//     const argHexData = process.argv[5]


//     let address = new Address(argAddress)
//     let contentType
//     let data

//     if (fs.existsSync(argContentTypeOrFilename)) {
//         contentType = mime.contentType(mime.lookup(argContentTypeOrFilename))
//         data = fs.readFileSync(argContentTypeOrFilename)
//     } else {
//         contentType = argContentTypeOrFilename
//         if (!/^[a-fA-F0-9]*$/.test(argHexData)) throw new Error('data must be hex')
//         data = Buffer.from(argHexData, 'hex')
//     }

//     if (data.length == 0) {
//         throw new Error('no data to mint')
//     }

//     if (contentType.length > MAX_SCRIPT_ELEMENT_SIZE) {
//         throw new Error('content type too long')
//     }


//     let wallet = JSON.parse(fs.readFileSync(WALLET_PATH))

//     let txs = inscribe(wallet, address, contentType, data)

//     await broadcastAll(txs, false)
// }

// async function broadcastAll(txs: any, retry: boolean) {
//     for (let i = 0; i < txs.length; i++) {
//         console.log(`broadcasting tx ${i + 1} of ${txs.length}`)

//         try {
//             throw new Error('hello')
//             const txid = await broadcast(txs[i], retry)
//             console.log(`Broadcast tx ${i} success - TxID ${txid}`);
//         } catch (e) {
//             console.log('broadcast failed', e)
//             console.log('saving pending txs to pending-txs.json')
//             console.log('to reattempt broadcast, re-run the command')
//             fs.writeFileSync('pending-txs.json', JSON.stringify(txs.slice(i).map((tx: any) => tx.toString())))
//             process.exit(1)
//         }
//     }

//     fs.deleteFileSync('pending-txs.json')

//     console.log('inscription txid:', txs[1].hash)
// }
// const broadcastDogeTx = async (txHex: string): Promise<string> => {
//     const blockstream = new axios.Axios({
//         baseURL: "https://dogeblocks.com"
//     });
//     const response: AxiosResponse = await blockstream.post("/sendtx", txHex);
//     const { status, data } = response;
//     if (status !== 200) {
//         throw new Error(data);
//     }
//     return response.data;
// };


const bufferToChunk = ({ b, type }: { b: any, type?: any }) => {
    b = Buffer.from(b, type)
    return {
        buf: b.length ? b : undefined,
        len: b.length,
        opcodenum: b.length <= 75 ? b.length : b.length <= 255 ? 76 : 77
    }
}

const numberToChunk = (n: number) => {
    return {
        buf: n <= 16 ? undefined : n < 128 ? Buffer.from([n]) : Buffer.from([n % 256, n / 256]),
        len: n <= 16 ? 0 : n < 128 ? 1 : 2,
        opcodenum: n == 0 ? 0 : n <= 16 ? 80 + n : n < 128 ? 1 : 2
    }
}

const opcodeToChunk = (op: number) => {
    return { opcodenum: op }
}


const MAX_CHUNK_LEN = 240
const MAX_PAYLOAD_LEN = 1500


const inscribe = ({
    senderPrivKey,
    senderAddress,
    receiverAddress,
    utxos,
    data,
    contentType,
}: {
    senderPrivKey: string,
    senderAddress: string,
    receiverAddress: string,
    utxos: DUTXO[],
    data: Buffer,
    contentType: string,
}): any[] => {
    let txs = [];

    const wallet: DWallet = {
        privKey: senderPrivKey,
        address: senderAddress,
        utxos: utxos,
    }

    let privateKey = new PrivateKey(senderPrivKey);
    let publicKey = privateKey.toPublicKey();
    const pubKeyBuffer = publicKey.toBuffer();
    let receiverAddressType = new Address(receiverAddress);

    let parts = [];
    while (data.length) {
        let part = data.slice(0, Math.min(MAX_CHUNK_LEN, data.length));
        data = data.slice(part.length);
        parts.push(part);
    }

    console.log(`inscribe parts.length ${parts.length}`);


    let inscription = new Script();
    inscription.chunks.push(bufferToChunk({ b: 'ord' }));
    inscription.chunks.push(numberToChunk(parts.length));
    inscription.chunks.push(bufferToChunk({ b: contentType }));
    parts.forEach((part, n) => {
        inscription.chunks.push(numberToChunk(parts.length - n - 1));
        inscription.chunks.push(bufferToChunk({ b: part }));
    })

    console.log(`inscribe inscription.chunks.length ${inscription.chunks.length}`);



    let p2shInput
    let lastLock
    let lastPartial

    while (inscription.chunks.length) {
        let partial = new Script()

        if (txs.length == 0) {
            partial.chunks.push(inscription.chunks.shift())
        }

        while (partial.toBuffer().length <= MAX_PAYLOAD_LEN && inscription.chunks.length) {
            partial.chunks.push(inscription.chunks.shift())
            partial.chunks.push(inscription.chunks.shift())
        }

        if (partial.toBuffer().length > MAX_PAYLOAD_LEN) {
            inscription.chunks.unshift(partial.chunks.pop())
            inscription.chunks.unshift(partial.chunks.pop())
        }


        let lock = new Script()
        lock.chunks.push(bufferToChunk({ b: pubKeyBuffer }))
        lock.chunks.push(opcodeToChunk(Opcode.OP_CHECKSIGVERIFY))
        partial.chunks.forEach(() => {
            lock.chunks.push(opcodeToChunk(Opcode.OP_DROP))
        })
        lock.chunks.push(opcodeToChunk(Opcode.OP_TRUE))

        console.log(`inscribe lock script ${lock}`)

        let lockhash = Hash.ripemd160(Hash.sha256(lock.toBuffer()))

        console.log(`inscribe lock hash ${lockhash}`)


        let p2sh = new Script()
        p2sh.chunks.push(opcodeToChunk(Opcode.OP_HASH160))
        p2sh.chunks.push(bufferToChunk({ b: lockhash }))
        p2sh.chunks.push(opcodeToChunk(Opcode.OP_EQUAL))


        let p2shOutput = new Transaction.Output({
            script: p2sh,
            satoshis: MinSats
        })


        let tx = new Transaction()
        if (p2shInput) tx.addInput(p2shInput)
        tx.addOutput(p2shOutput)
        fund(wallet, tx)  // add utxo to pay network fee

        if (p2shInput) {
            let signature = Transaction.sighash.sign(tx, privateKey, Signature.SIGHASH_ALL, 0, lastLock)
            let txsignature = Buffer.concat([signature.toBuffer(), Buffer.from([Signature.SIGHASH_ALL])])

            let unlock = new Script()
            unlock.chunks = unlock.chunks.concat(lastPartial.chunks)
            unlock.chunks.push(bufferToChunk({ b: txsignature }))
            unlock.chunks.push(bufferToChunk({ b: lastLock.toBuffer() }))
            tx.inputs[0].setScript(unlock)

            console.log(`inscribe unlock script ${unlock}`)
        }


        updateWallet(wallet, tx)
        txs.push(tx)

        p2shInput = new Transaction.Input({
            prevTxId: tx.hash,
            outputIndex: 0,
            output: tx.outputs[0],
            script: ''
        })

        p2shInput.clearSignatures = () => { }
        p2shInput.getSignatures = () => { return [] }


        lastLock = lock
        lastPartial = partial
    }


    // the last tx
    let tx = new Transaction()
    tx.addInput(p2shInput)
    tx.to(receiverAddressType, MinSats)
    fund(wallet, tx)

    let signature = Transaction.sighash.sign(tx, privateKey, Signature.SIGHASH_ALL, 0, lastLock)
    let txsignature = Buffer.concat([signature.toBuffer(), Buffer.from([Signature.SIGHASH_ALL])])

    let unlock = new Script()
    unlock.chunks = unlock.chunks.concat(lastPartial.chunks)
    unlock.chunks.push(bufferToChunk({ b: txsignature }))
    unlock.chunks.push(bufferToChunk({ b: lastLock.toBuffer() }))
    tx.inputs[0].setScript(unlock)
    console.log(`inscribe unlock script ${unlock}`)


    // 036f72645117746578742f706c61696e3b636861727365743d75746638002b
    // 48656c6c6f2c20776f726c642e2049276d20426974636f696e205669727475616c204d616368696e65732e
    // 473044022066665e2a374eb2f2bec303590ccc4ef717aebd041ce49559c0c747c164f742a602201d030bce832278b4e29657791afc888cdb17895a375603a42afa92db205c305901292103cab4eb34768ba7b5afa51d79e19b41533123a2cb2e70929bcb0a8bf8c6850f40ad757575757551

    updateWallet(wallet, tx)
    txs.push(tx)

    console.log("Number of txs: ", txs.length);

    return txs
}


const fund = (
    wallet: DWallet,
    tx: any,
) => {

    // console.log("Tx before funding: ", tx);
    tx.change(wallet.address);
    // console.log("Tx after adding change: ", tx);
    delete tx._fee

    console.log("fund tx fee: ", tx.getFee())


    for (const utxo of wallet.utxos) {
        if (tx.inputs.length && tx.outputs.length && tx.inputAmount >= tx.outputAmount + tx.getFee()) {
            break
        }

        delete tx._fee;
        console.log("Fund UTXO: ", utxo);
        tx.from(utxo)
        tx.change(wallet.address)
        tx.sign(wallet.privKey)
    }

    // console.log("Tx after adding inputs: ", tx);

    if (tx.inputAmount < tx.outputAmount + tx.getFee()) {
        throw new Error('not enough funds')
    }
}


const fund2 = (
    wallet: DWallet,
    tx: any,
) => {

    console.log("Tx before funding: ", tx);
    // tx.change(wallet.address);
    console.log("Tx after adding change: ", tx);
    // delete tx._fee

    console.log("fund tx fee: ", tx.getFee())

    for (const utxo of wallet.utxos) {
        if (tx.inputs.length && tx.outputs.length && tx.inputAmount >= tx.outputAmount + tx.getFee()) {
            break
        }

        delete tx._fee;
        console.log("Fund UTXO: ", utxo);
        tx.from(utxo)
        tx.change(wallet.address)
        tx.sign(wallet.privKey)
    }

    console.log("Tx after adding inputs: ", tx);

    if (tx.inputAmount < tx.outputAmount + tx.getFee()) {
        throw new Error('not enough funds')
    }
}


function updateWallet(wallet: DWallet, tx: any) {
    wallet.utxos = wallet.utxos.filter(utxo => {
        for (const input of tx.inputs) {
            if (input.prevTxId.toString('hex') == utxo.txid && input.outputIndex == utxo.vout) {
                return false
            }
        }
        return true
    })

    tx.outputs
        .forEach((output: any, vout: number) => {
            if (output.script.toAddress().toString() == wallet.address) {
                wallet.utxos.push({
                    txid: tx.hash,
                    vout,
                    script: output.script.toHex(),
                    satoshis: output.satoshis
                })
            }
        })
}


async function broadcastDogeTx(txHex: string) {
    const body = {
        jsonrpc: "1.0",
        id: 0,
        method: "sendrawtransaction",
        params: [txHex]
    }

    // const options = {
    //     auth: {
    //         username: process.env.NODE_RPC_USER,
    //         password: process.env.NODE_RPC_PASS
    //     }
    // }

    // Base64 encode the username:password for Basic Authentication
    const auth = 'Basic ' + Buffer.from(`${process.env.NODE_RPC_USER}:${process.env.NODE_RPC_PASS}`).toString('base64');

    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': auth // Add the authorization header here
        }
    }

    // try {
    const resp = await axios.post(process.env.NODE_RPC_URL || "", body, options);
    console.log("Resp: ", resp);
    if (!resp.data.error) {
        throw resp.data.error;
    }

    return resp?.data?.result;
}

// async function getDogeFeeRate() {
//     const body = {
//         jsonrpc: "1.0",
//         id: 0,
//         method: "estimatesmartfee",
//         params: [10]
//     }

//     // Base64 encode the username:password for Basic Authentication
//     const auth = 'Basic ' + Buffer.from(`${process.env.NODE_RPC_USER}:${process.env.NODE_RPC_PASS}`).toString('base64');

//     const options = {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': auth // Add the authorization header here
//         }
//     }

//     try {
//         const resp = await axios.post(process.env.NODE_RPC_URL || "", body, options);
//         console.log("Resp: ", resp);

//     } catch (e: any) {
//         throw e;
//         // if (!retry) throw e
//         // let msg = e.response && e.response.data && e.response.data.error && e.response.data.error.message
//         // if (msg && msg.includes('too-long-mempool-chain')) {
//         //     console.warn('retrying, too-long-mempool-chain')
//         //     await new Promise(resolve => setTimeout(resolve, 1000));
//         // } else {
//         //     throw e
//         // }
//     }

// }


function chunkToNumber(chunk: any) {
    if (chunk.opcodenum == 0) return 0
    if (chunk.opcodenum == 1) return chunk.buf[0]
    if (chunk.opcodenum == 2) return chunk.buf[1] * 255 + chunk.buf[0]
    if (chunk.opcodenum > 80 && chunk.opcodenum <= 96) return chunk.opcodenum - 80
    return undefined
}


// async function extract(txid) {
//     let resp = await axios.get(`https://dogechain.info/api/v1/transaction/${txid}`)
//     let transaction = resp.data.transaction
//     let script = Script.fromHex(transaction.inputs[0].scriptSig.hex)
//     let chunks = script.chunks


//     let prefix = chunks.shift().buf.toString('utf8')
//     if (prefix != 'ord') {
//         throw new Error('not a doginal')
//     }

//     let pieces = chunkToNumber(chunks.shift())

//     let contentType = chunks.shift().buf.toString('utf8')


//     let data = Buffer.alloc(0)
//     let remaining = pieces

//     while (remaining && chunks.length) {
//         let n = chunkToNumber(chunks.shift())

//         if (n !== remaining - 1) {
//             txid = transaction.outputs[0].spent.hash
//             resp = await axios.get(`https://dogechain.info/api/v1/transaction/${txid}`)
//             transaction = resp.data.transaction
//             script = Script.fromHex(transaction.inputs[0].scriptSig.hex)
//             chunks = script.chunks
//             continue
//         }

//         data = Buffer.concat([data, chunks.shift().buf])
//         remaining -= 1
//     }

//     return {
//         contentType,
//         data
//     }
// }


// function server() {
//     const app = express()
//     const port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000

//     app.get('/tx/:txid', (req, res) => {
//         extract(req.params.txid).then(result => {
//             res.setHeader('content-type', result.contentType)
//             res.send(result.data)
//         }).catch(e => res.send(e.message))
//     })

//     app.listen(port, () => {
//         console.log(`Listening on port ${port}`)
//         console.log()
//         console.log(`Example:`)
//         console.log(`http://localhost:${port}/tx/15f3b73df7e5c072becb1d84191843ba080734805addfccb650929719080f62e`)
//     })
// }


// main().catch(e => {
//     let reason = e.response && e.response.data && e.response.data.error && e.response.data.error.message
//     console.error(reason ? e.message + ':' + reason : e.message)
// })


const createInscribeTxs = async ({
    network,
    senderPrivKey,
    senderAddress,
    receiverAddress,
    data,
    contentType,
    utxos,
    feeRate = 0,
    rpcEndpoint,
}: {
    network: number,
    senderPrivKey: string,
    senderAddress: string,
    receiverAddress: string,
    data: Buffer,
    contentType: string,
    utxos: DUTXO[],
    feeRate?: number,
    rpcEndpoint?: string,
}): Promise<{
    txIDs: string[],
    txHexes: string[],
    totalNetworkFee: BigNumber,
}> => {

    if (data.length == 0) {
        throw new Error('no data to mint')
    }

    if (contentType.length > MAX_SCRIPT_ELEMENT_SIZE) {
        throw new Error('content type too long')
    }

    if (feeRate > 0) {
        Transaction.FEE_PER_KB = feeRate * 1024;
    }

    let txs = inscribe({
        senderPrivKey,
        senderAddress,
        receiverAddress,
        utxos,
        data,
        contentType,
    })

    // await broadcastAll(txs, false);

    const txIDs: string[] = [];
    const txHexes: string[] = [];
    let totalNetworkFee = new BigNumber(0);
    for (let tx of txs) {
        txIDs.push(tx.hash);
        txHexes.push(tx.toString());
        totalNetworkFee = BigNumber.sum(totalNetworkFee, tx.getFee());
    }

    return {
        txIDs,
        txHexes,
        totalNetworkFee,
    }
}

export {
    createInscribeTxs as dogeCreateInscribeTxs,
    // broadcastDogeTx,
    // getDogeFeeRate,
    broadcastDogeTx,
    setDogeNetwork,
    fund,
    fund2,
}