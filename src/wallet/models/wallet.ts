import { HDWallet, Masterless } from "@/wallet";
import {Validator} from "@/utils";

class Wallet {
    private _hdWallet: HDWallet | undefined;
    private _masterless: Masterless[] | undefined; // TODO next step

    constructor() {
        this._hdWallet = undefined;
        this._masterless = undefined;
    }

    private restoreHDWallet = async (password: string) => {
        const storedHDWallet = await HDWallet.restore(password);
        if (storedHDWallet) {
            const wallet = new HDWallet();
            wallet.set({
                name: storedHDWallet.name,
                mnemonic: storedHDWallet.mnemonic,
                derives: storedHDWallet.derives,
            });
            this._hdWallet = wallet;
        }
        return storedHDWallet;
    };

    restore = async (password: string) => {
        new Validator("password", password).string().required();
        const hdWallet = await this.restoreHDWallet(password);
        return {
            hdWallet
        };
    };

    getHDWallet = () => {
        new Validator("Get HDWallet", this._hdWallet).required("Please restore wallet.");
        return this._hdWallet;
    };
}

export default Wallet;