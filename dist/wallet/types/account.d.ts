interface IDeriveKey {
    name: string;
    index: number;
    privateKey: string;
    address: string;
}
interface IHDWallet {
    name: string;
    mnemonic: string;
    nodes: Array<IDeriveKey>;
    deletedIndexs: Array<number>;
    btcPrivateKey: string;
}
type IMasterless = IDeriveKey;
interface IDeriveReq {
    mnemonic: string;
    index: number;
    name?: string;
}
interface IDeriveMasterlessReq {
    name: string;
    privateKey: string;
}
export { IDeriveKey, IHDWallet, IMasterless, IDeriveReq, IDeriveMasterlessReq };
