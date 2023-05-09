import { CallWalletPayload, RequestPayload, RequestAccountResponse } from "./type";
export declare const signTransaction: (payload: CallWalletPayload) => void;
export declare const actionRequest: (payload: RequestPayload) => Promise<void>;
export declare const requestAccountResponse: (payload: RequestAccountResponse) => Promise<void>;
