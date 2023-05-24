import { IDeriveMasterlessReq, IMasterless } from "@/wallet";
declare const validateMasterless: (listMasterless: Array<IMasterless> | undefined, methodName: string) => void;
declare const deriveMasterless: (payload: IDeriveMasterlessReq) => IMasterless;
declare const getStorageMasterlessCipherText: () => Promise<any>;
declare const getStorageMasterless: (password: string) => Promise<Array<IMasterless>>;
declare const setStorageMasterless: (wallet: Array<IMasterless>, password: string) => Promise<void>;
export { validateMasterless, deriveMasterless, getStorageMasterlessCipherText, getStorageMasterless, setStorageMasterless, };
