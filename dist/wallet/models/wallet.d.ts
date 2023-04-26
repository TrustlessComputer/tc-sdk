import { HDWallet } from "@/wallet";
declare class Wallet {
    private _hdWallet;
    private _masterless;
    constructor();
    private restoreHDWallet;
    restore: (password: string) => Promise<{
        hdWallet: import("../types/account").IHDWallet | undefined;
    }>;
    getHDWallet: () => HDWallet | undefined;
}
export default Wallet;
