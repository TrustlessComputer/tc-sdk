import { HDWallet, Masterless } from "@/wallet";
declare class MasterWallet {
    private _hdWallet;
    private _masterless;
    constructor();
    private restoreHDWallet;
    private restoreMasterless;
    load: (password: string) => Promise<{
        hdWallet: import("../types/account").IHDWallet | undefined;
        masterless: import("../types/account").IDeriveKey[];
    }>;
    getHDWallet: () => HDWallet;
    getMasterless: () => Masterless;
    getBTCPrivateKey: () => string | undefined;
}
export { MasterWallet };
