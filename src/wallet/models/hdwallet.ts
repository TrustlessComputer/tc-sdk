import { IDeriveKey, IHDWallet } from "@/wallet/types";
import { Validator } from "@/utils";
import { deriveHDNodeByIndex, getStorageHDWallet, setStorageHDWallet, validateHDWallet } from "@/wallet/utils/hdwallet";
import { ERROR_CODE, SDKError } from "@/constants";
import maxBy from "lodash/maxBy";

class HDWallet {
    name: string | undefined;

    mnemonic: string | undefined;
    nodes: Array<IDeriveKey> | undefined;
    deletedIndexs: Array<number> | undefined;

    btcPrivateKey: string | undefined;
    btcAddress: string | undefined;

    constructor() {
        this.name = undefined;
        this.mnemonic = undefined;
        this.nodes = undefined;
        this.deletedIndexs = undefined;
        this.btcPrivateKey = undefined;
        this.btcAddress = undefined;
    }

    set = (wallet: IHDWallet) => {
        validateHDWallet(wallet, "hdset");
        this.name = wallet.name;
        this.mnemonic = wallet.mnemonic;
        this.nodes = wallet.nodes;
        this.deletedIndexs = wallet.deletedIndexs;

        this.btcPrivateKey = wallet.btcPrivateKey;
        this.btcAddress = wallet.btcAddress;
    };

    saveWallet = async (wallet: IHDWallet, password: string) => {
        this.set(wallet);
        await setStorageHDWallet(wallet, password);
    };

    createNewAccount = async ({ password, name }: { password: string, name?: string }) => {
        const wallet: IHDWallet | undefined = await getStorageHDWallet(password);
        validateHDWallet(wallet, "create-new-account");
        if (!wallet) return;
        const { mnemonic, nodes, deletedIndexs } = wallet;
        const latestNode = maxBy(nodes, item => Number(item.index));
        let newNodeIndex = (latestNode?.index || 0) + 1;
        for (const deletedIndex of deletedIndexs) {
            if (newNodeIndex <= deletedIndex) {
                newNodeIndex += 1;
            }
        }
        const childNode = deriveHDNodeByIndex({
            mnemonic,
            index: newNodeIndex,
            name
        });
        nodes.push(childNode);
        await this.saveWallet(wallet, password);
    };

    deletedAccount = async ({ password, address }: { password: string, address: string }) => {
        const wallet: IHDWallet | undefined = await getStorageHDWallet(password);
        validateHDWallet(wallet, "delete-account");
        if (!wallet) return;
        const { nodes, deletedIndexs } = wallet;
        const node = nodes.find(node => node.address.toLowerCase() === address.toLowerCase());
        if (!node) {
            throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
        }
        deletedIndexs.push(node.index);
        const newNodes = nodes.filter(node => node.address.toLowerCase() !== address.toLowerCase());
        await this.saveWallet({
            ...wallet,
            nodes: newNodes
        }, password);
    };

    restore = async (password: string): Promise<IHDWallet | undefined> => {
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