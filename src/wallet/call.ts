import { CallWalletPayload, Target } from "./type";
import Validator from "../utils/validator";
import { URL } from "./constant";

const window = globalThis || global;

export const signTransaction = async (payload: CallWalletPayload) => {
    new Validator("Transaction hash", payload.hash).string().required();
    new Validator("Method", payload.method).string().required();
    const _target: Target = payload.target || "_blank";
    if (window && URLSearchParams) {
        let params = `hash=${payload.hash}?method=${payload.method}?dappURL=${payload.dappURL}`;
        if (payload.isRedirect) {
            params += `?isRedirect=${payload.isRedirect}`;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window?.open(`${URL}/${params}`, _target);
    }
};