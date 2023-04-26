import { IDeriveKey, IHDWallet } from "@/wallet";
import { decryptAES, Validator } from "@/utils";
import {getStorageHDWallet, setStorageHDWallet, validateHDWallet} from "@/wallet/utils";
import { ERROR_CODE, SDKError } from "@/constants";

class HDWallet {
    name: string | undefined;
    mnemonic: string | undefined;
    derives: Array<IDeriveKey> | undefined;

    constructor() {
        this.name = undefined;
        this.mnemonic = undefined;
        this.derives = undefined;
    }

    set = (wallet: IHDWallet) => {
        validateHDWallet(wallet);
        this.name = wallet.name;
        this.mnemonic = wallet.mnemonic;
        this.derives = wallet.derives;
    };

    saveWallet = async (wallet: IHDWallet) => {
        this.set(wallet);
        await setStorageHDWallet(wallet);
    };

    static restore = async (password: string): Promise<IHDWallet | undefined> => {
        new Validator("restore-password: ", password).string().required();
        const cipherText: string | undefined = await getStorageHDWallet();
        new Validator("restore-cipher: ", cipherText).string().required();
        if (cipherText) {
            try {
                const rawText = decryptAES(cipherText, password);
                const wallet: IHDWallet = JSON.parse(rawText);
                validateHDWallet(wallet);
                return wallet;
            } catch (error) {
                let message = "";
                if (error instanceof Error)  {
                    message = error.message;
                }
                throw new SDKError(ERROR_CODE.RESTORE_HD_WALLET, message);
            }
        }
        return undefined;
    };
}

export {
    HDWallet
};