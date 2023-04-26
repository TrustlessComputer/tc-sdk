import { IDeriveKey, IHDWallet } from "@/wallet";
declare class HDWallet {
    name: string | undefined;
    mnemonic: string | undefined;
    derives: Array<IDeriveKey> | undefined;
    constructor();
    set: (wallet: IHDWallet) => void;
    saveWallet: (wallet: IHDWallet) => Promise<void>;
    static restore: (password: string) => Promise<IHDWallet | undefined>;
}
export { HDWallet };
