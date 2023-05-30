import { IDeriveKey, IMasterless } from "@/wallet";
declare class Masterless {
    nodes: Array<IMasterless> | undefined;
    constructor();
    set: (listMasterless: Array<IMasterless>) => void;
    saveWallet: (listMasterless: Array<IMasterless>, password: string) => Promise<void>;
    importNewAccount: ({ password, name, privateKey, nodes }: {
        password: string;
        name: string;
        privateKey: string;
        nodes: IDeriveKey[];
    }) => Promise<IDeriveKey | undefined>;
    deletedMasterless: ({ password, address }: {
        password: string;
        address: string;
    }) => Promise<void>;
    restore: (password: string) => Promise<IMasterless[]>;
}
export { Masterless };
