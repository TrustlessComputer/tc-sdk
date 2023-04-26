import { IDeriveKey, IDeriveReq, IHDWallet } from "@/wallet";
declare const deriveHDNodeByIndex: (payload: IDeriveReq) => IDeriveKey;
declare const randomMnemonic: () => IHDWallet;
declare const validateHDWallet: (wallet: IHDWallet | undefined) => void;
declare const getStorageHDWallet: () => Promise<string | undefined>;
declare const setStorageHDWallet: (wallet: IHDWallet) => Promise<void>;
export { validateHDWallet, randomMnemonic, deriveHDNodeByIndex, getStorageHDWallet, setStorageHDWallet };
