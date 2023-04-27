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
    btcAddress: string;
}
interface IMasterless {
    name: string | undefined;
    privateKey: string;
    address: string;
}
interface IDeriveReq {
    mnemonic: string;
    index: number;
    name?: string;
}
export { IDeriveKey, IHDWallet, IMasterless, IDeriveReq };
