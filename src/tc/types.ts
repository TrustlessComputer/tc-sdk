import BigNumber from "bignumber.js";

interface TCTxDetail {
    Nonce: number
    GasPrice: number,
    Gas: number,
    To: string,
    Value: number,
    Input: any,
    V: number,
    R: BigNumber,
    S: BigNumber,
    Hash: string,
    From: string,
    Type: number
}

interface BatchInscribeTxResp {
    tcTxIDs: string[],
    commitTxHex: string,
    commitTxID: string,
    revealTxHex: string,
    revealTxID: string,
    totalFee: BigNumber,
}

interface GetTxByHashResp {
    blockHash: string,
    blockNumber: string,
    transactionIndex: string,
    hash: string,
    status: string
}

interface GetPendingInscribeTxsResp {
    TCHash: string,
    OnHold: boolean,
    Commit: BTCVinVout,
    Reveal: BTCVinVout,
}

interface Vin {
    coinbase: string,
    txid: string,
    vout: number,
    // ScriptSig * ScriptSig`json:"scriptSig"`
    Sequence: number,
    Witness: string[],
}

interface Vout {
    value: number,
    n: number,
    scriptPubKey: ScriptPubKeyResult
}

interface ScriptPubKeyResult {
    asm: string,
    hex: string,
    // reqSigs   int32`json:"reqSigs,omitempty"`
    type: string,
    addresses: string[]
}

interface BTCVinVout {
    BTCHash: string,
    Vin: Vin[],
    Vout: Vout[],
}

interface UTXOFromBlockStream {
    txid: string
    vout: number
    status: UTXOStatusFromBlockStream
    value: number
}

interface UTXOStatusFromBlockStream {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
}

export {
    TCTxDetail,
    BatchInscribeTxResp,
    GetTxByHashResp,
    GetPendingInscribeTxsResp,
    Vin,
    Vout,
    ScriptPubKeyResult,
    BTCVinVout,
    UTXOStatusFromBlockStream,
    UTXOFromBlockStream,
};