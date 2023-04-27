import { IDeriveKey, IHDWallet } from "@/wallet/types";
declare class HDWallet {
    name: string | undefined;
    mnemonic: string | undefined;
    derives: Array<IDeriveKey> | undefined;
    btcPrivateKey: string | undefined;
    btcAddress: string | undefined;
    constructor();
    set: (wallet: IHDWallet) => void;
    saveWallet: (wallet: IHDWallet, password: string) => Promise<void>;
    static restore: (password: string) => Promise<IHDWallet | undefined>;
}
export { HDWallet };
