import { Transaction } from "bitcoinjs-lib";
/**
* handleSignPsbtWithXverse calls Xverse signTransaction and finalizes signed raw psbt.
* extract to msgTx (if isGetMsgTx is true)
* @param base64Psbt the base64 encoded psbt need to sign
* @param indicesToSign indices of inputs need to sign
* @param address address of signer
* @param sigHashType default is SIGHASH_DEFAULT
* @param isGetMsgTx flag used to extract to msgTx or not
* @param cancelFn callback function for handling cancel signing
* @returns the base64 encode signed Psbt
*/
declare const handleSignPsbtWithSpecificWallet: ({ base64Psbt, indicesToSign, address, sigHashType, isGetMsgTx, walletType, cancelFn, }: {
    base64Psbt: string;
    indicesToSign: number[];
    address: string;
    sigHashType?: number | undefined;
    isGetMsgTx?: boolean | undefined;
    walletType?: number | undefined;
    cancelFn: () => void;
}) => Promise<{
    base64SignedPsbt: string;
    msgTx: Transaction;
    msgTxID: string;
    msgTxHex: string;
}>;
export { handleSignPsbtWithSpecificWallet };
