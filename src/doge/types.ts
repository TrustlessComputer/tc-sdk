import BigNumber from "bignumber.js";

interface DUTXO {
    txid: string;
    vout: number;
    satoshis: number;
    script: string;
}

interface DWallet {
    privKey: string;
    address: string;
    utxos: DUTXO[];
}


// // key : "TxID:OutcoinIndex" : Inscription[]
// interface Inscription {
//     offset: BigNumber,
//     id: string,
// }

// interface PaymentInfo {
//     address: string,
//     amount: BigNumber
// }

// interface InscPaymentInfo {
//     address: string,
//     inscID: string,
// }


export {
    DUTXO,
    DWallet,
    // Inscription,
    // PaymentInfo,
    // InscPaymentInfo,
}
