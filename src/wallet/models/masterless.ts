import {
    deriveMasterless,
    getStorageMasterless,
    IDeriveKey,
    IMasterless,
    setStorageMasterless,
    validateMasterless
} from "@/wallet";
import { Validator } from "@/utils";
import { ERROR_CODE, SDKError } from "@/constants";

class Masterless {
    nodes: Array<IMasterless> | undefined;

    constructor() {
        this.nodes = undefined;
    }

    set = (listMasterless: Array<IMasterless>) => {
        validateMasterless(listMasterless, "mlset");
        this.nodes = listMasterless;
    };

    saveWallet = async (listMasterless: Array<IMasterless>, password: string) => {
        this.set(listMasterless);
        await setStorageMasterless(listMasterless, password);
    };

    importNewAccount = async ({ password, name, privateKey, nodes }: {
        password: string,
        name: string,
        privateKey: string,
        nodes: IDeriveKey[]
    }) => {
        const listMasterless: Array<IMasterless> | undefined = await getStorageMasterless(password);
        validateMasterless(listMasterless, "import-masterless");
        if (!listMasterless) return;
        const masterless = deriveMasterless({
            name,
            privateKey
        });
        for (const node of nodes) {
            if (node.address.toLowerCase() === masterless.address.toLowerCase()) {
                throw new Error(`This account is existed with address ${masterless.address}`);
            }
            if (node.name.toLowerCase() === masterless.name.toLowerCase()) {
                throw new Error("This account name is existed.");
            }
        }
        listMasterless.push(masterless);
        await this.saveWallet(listMasterless, password);
        return masterless;
    };

    deletedMasterless = async ({ password, address }: { password: string, address: string }) => {
        const listMasterless: Array<IMasterless> | undefined = await getStorageMasterless(password);
        validateMasterless(listMasterless, "delete-masterless");
        if (!listMasterless) return;
        const masterless = listMasterless.find(node => node.address.toLowerCase() === address.toLowerCase());
        if (!masterless) {
            throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
        }
        const newListMasterless = listMasterless.filter(node => node.address.toLowerCase() !== address.toLowerCase());
        await this.saveWallet(newListMasterless, password);
    };

    restore = async (password: string): Promise<IMasterless[]> => {
        new Validator("restore-password: ", password).string().required();
        try {
            const wallet: IMasterless[] | undefined = await getStorageMasterless(password);
            this.set(wallet);
            return wallet;
        } catch (error) {
            let message = "";
            if (error instanceof Error)  {
                message = error.message;
            }
            throw new SDKError(ERROR_CODE.RESTORE_MASTERLESS_WALLET, message);
        }
    };
}

export {
    Masterless
};