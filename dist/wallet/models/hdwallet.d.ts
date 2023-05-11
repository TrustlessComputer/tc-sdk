import { IDeriveKey, IHDWallet } from "@/wallet/types";
declare class HDWallet {
    name: string | undefined;
    mnemonic: string | undefined;
    nodes: Array<IDeriveKey> | undefined;
    deletedIndexs: Array<number> | undefined;
    btcPrivateKey: string | undefined;
    constructor();
    set: (wallet: IHDWallet) => void;
    saveWallet: (wallet: IHDWallet, password: string) => Promise<void>;
    createNewAccount: ({ password, name }: {
        password: string;
        name?: string | undefined;
    }) => Promise<IDeriveKey | undefined>;
    deletedAccount: ({ password, address }: {
        password: string;
        address: string;
    }) => Promise<void>;
    restore: (password: string) => Promise<IHDWallet | undefined>;
}
export { HDWallet };
