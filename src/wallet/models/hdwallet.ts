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

    constructor() {
        this.name = undefined;
        this.mnemonic = undefined;
        this.nodes = undefined;
        this.deletedIndexs = undefined;
        this.btcPrivateKey = undefined;
    }

    set = (wallet: IHDWallet) => {
        validateHDWallet(wallet, "hdset");
        this.name = wallet.name;
        this.mnemonic = wallet.mnemonic;
        this.nodes = wallet.nodes;
        this.deletedIndexs = wallet.deletedIndexs;

        this.btcPrivateKey = wallet.btcPrivateKey;
    };

    saveWallet = async (wallet: IHDWallet, password: string) => {
        this.set(wallet);
        await setStorageHDWallet(wallet, password);
    };

    createNewAccount = async ({ password, name, accounts }: {
        password: string,
        name: string,
        accounts: IDeriveKey[]
    }) => {
        const wallet: IHDWallet | undefined = await getStorageHDWallet(password);
        validateHDWallet(wallet, "create-new-account");
        if (!wallet) return;
        const { mnemonic, nodes, deletedIndexs } = wallet;

        const isExistedName = nodes.some(node =>
            node.name.toLowerCase() === name.toLowerCase()
        );

        if (isExistedName) {
            throw new Error("This name has been existed.");
        }

        const latestNode = maxBy(nodes, item => Number(item.index));
        let newNodeIndex = (latestNode?.index || 0) + 1;
        for (const deletedIndex of deletedIndexs) {
            if (newNodeIndex <= deletedIndex) {
                newNodeIndex += 1;
            }
        }

        const validateExistNode = (newNode: IDeriveKey, nodes: IDeriveKey[]) => {
            const isExist = nodes.some(node =>
                node.address.toLowerCase() === newNode.address.toLowerCase()
            );
            return !isExist;
        };

        let newNode: IDeriveKey | undefined = undefined;
        let isBreak = false;
        while (!isBreak) {
            const childNode = deriveHDNodeByIndex({
                mnemonic,
                index: newNodeIndex,
                name
            });
            const isValid = validateExistNode(childNode, accounts);
            if (isValid) {
                newNode = childNode;
                isBreak = true;
            } else {
                isBreak = false;
                ++newNodeIndex;
            }
        }

        if (newNode) {
            nodes.push(newNode);
            await this.saveWallet(wallet, password);
            return newNode;
        }

        throw new SDKError(ERROR_CODE.CANNOT_FIND_ACCOUNT);
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