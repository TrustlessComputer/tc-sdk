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
export { DUTXO, DWallet, };
