import { IDeriveKey, IHDWallet } from "@/wallet/types";
import { decryptAES, Validator } from "@/utils";
import { getStorageHDWallet, setStorageHDWallet, validateHDWallet } from "@/wallet/utils/hdwallet";
import { ERROR_CODE, SDKError } from "@/constants";

class HDWallet {
    name: string | undefined;

    mnemonic: string | undefined;
    derives: Array<IDeriveKey> | undefined;

    btcPrivateKey: string | undefined;
    btcAddress: string | undefined;

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

        this.btcPrivateKey = wallet.btcPrivateKey;
        this.btcAddress = wallet.btcAddress;
    };

    saveWallet = async (wallet: IHDWallet, password: string) => {
        this.set(wallet);
        await setStorageHDWallet(wallet, password);
    };

    static restore = async (password: string): Promise<IHDWallet | undefined> => {
        new Validator("restore-password: ", password).string().required();
        try {
            const wallet: IHDWallet | undefined = await getStorageHDWallet(password);
            return wallet;
        } catch (error) {
            let message = "";
            if (error instanceof Error)  {
                message = error.message;
            }
            throw new SDKError(ERROR_CODE.RESTORE_HD_WALLET, message);
        }
    };
}

export {
    HDWallet
};