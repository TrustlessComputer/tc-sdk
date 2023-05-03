import { IDeriveKey, IDeriveReq, IHDWallet } from "@/wallet";
declare const deriveHDNodeByIndex: (payload: IDeriveReq) => IDeriveKey;
declare const generateHDWalletFromMnemonic: (mnemonic: string) => Promise<IHDWallet>;
declare const randomMnemonic: () => Promise<IHDWallet>;
declare const validateHDWallet: (wallet: IHDWallet | undefined, methodName: string) => void;
declare const getStorageHDWalletCipherText: () => Promise<any>;
declare const getStorageHDWallet: (password: string) => Promise<IHDWallet | undefined>;
declare const setStorageHDWallet: (wallet: IHDWallet, password: string) => Promise<void>;
export { validateHDWallet, randomMnemonic, generateHDWalletFromMnemonic, deriveHDNodeByIndex, getStorageHDWalletCipherText, getStorageHDWallet, setStorageHDWallet };
