import { HDWallet } from "@/wallet";
declare class MasterWallet {
    private _hdWallet;
    private _masterless;
    constructor();
    private restoreHDWallet;
    load: (password: string) => Promise<{
        hdWallet: import("../types/account").IHDWallet | undefined;
    }>;
    getHDWallet: () => HDWallet;
    getBTCAddress: () => string | undefined;
    getBTCPrivateKey: () => string | undefined;
}
export { MasterWallet };
