interface IDeriveKey {
    name: string;
    index: number;
    privateKey: string;
    address: string;
}
interface IHDWallet {
    name: string | undefined;
    mnemonic: string | undefined;
    derives: Array<IDeriveKey> | undefined;
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
