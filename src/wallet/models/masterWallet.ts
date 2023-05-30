import { HDWallet, Masterless } from "@/wallet";
import { Validator } from "@/utils";

class MasterWallet {
    private _hdWallet: HDWallet | undefined;
    private _masterless: Masterless | undefined;

    constructor() {
        this._hdWallet = undefined;
        this._masterless = undefined;
    }

    private restoreHDWallet = async (password: string) => {
        const hdWalletIns = new HDWallet();
        const wallet = await hdWalletIns.restore(password);
        if (wallet) {
            hdWalletIns.set({
                ...wallet
            });
            this._hdWallet = hdWalletIns;
            return wallet;
        }
    };

    private restoreMasterless = async (password: string) => {
        const masterlessIns = new Masterless();
        const masterless = await masterlessIns.restore(password);
        this._masterless = masterlessIns;
        return masterless;
    };

    load = async (password: string) => {
        new Validator("password", password).string().required();
        const hdWallet = await this.restoreHDWallet(password);
        const masterless = await this.restoreMasterless(password);
        return {
            hdWallet,
            masterless
        };
    };

    getHDWallet = (): HDWallet => {
        new Validator("Get HDWallet", this._hdWallet).required("Please restore wallet.");
        return this._hdWallet!;
    };

    getMasterless = (): Masterless => {
        new Validator("Get Masterless", this._masterless).required("Please restore wallet.");
        return this._masterless!;
    };

    getBTCPrivateKey = (): string | undefined => {
        return this._hdWallet?.btcPrivateKey;
    };
}

export {
    MasterWallet
};