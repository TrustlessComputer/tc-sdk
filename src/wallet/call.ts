import { CallWalletPayload, Target, RequestPayload, RequestFunction, RequestAccountResponse } from "./type";
import Validator from "../utils/validator";
import { URL } from "./constant";

const window = globalThis || global;

const openWindow = ({ url = URL, search, target }: { url?: string, search: string, target: Target }) => {
    if (window) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window?.open(`${url}/${search}`, target);
    }
};

export const signTransaction = (payload: CallWalletPayload) => {
    new Validator("Transaction hash", payload.hash).string().required();
    new Validator("Method", payload.method).string().required();
    const _target: Target = payload.target || "_blank";
    if (window && URLSearchParams) {
        let search = `?function=${RequestFunction.sign}&hash=${payload.hash}&method=${payload.method}&dappURL=${payload.dappURL}`;
        if (payload.isRedirect) {
            search += `&isRedirect=${payload.isRedirect}`;
        }
        openWindow({
            search,
            target: _target
        });
    }
};

export const actionRequest = async (payload: RequestPayload) => {
    new Validator("Missing method", payload.method).string().required();
    new Validator("Missing redirect url", payload.redirectURL).string().required();
    const _target: Target = payload.target || "_parent";
    if (window && URLSearchParams) {
        const search = `?function=${RequestFunction.request}&method=${payload.method}&redirectURL=${payload.redirectURL}`;
        openWindow({
            search,
            target: _target
        });
    }
};

export const requestAccountResponse = async (payload: RequestAccountResponse) => {
    new Validator("Missing redirect url", payload.redirectURL).string().required();
    new Validator("Missing tc address", payload.tcAddress).string().required();
    new Validator("Missing taproot address", payload.tpAddress).string().required();
    const _target: Target = payload.target || "_parent";

    const redirectURL = payload.redirectURL;
    // const lastChar = redirectURL.substr(redirectURL.length - 1);
    // const divide = "/";
    // if (lastChar !== divide) {
    //     redirectURL = redirectURL + divide;
    // }

    if (window && URLSearchParams) {
        const search = `?tcAddress=${payload.tcAddress}&tpAddress=${payload.tpAddress}&target=${_target}`;
        openWindow({
            url: redirectURL,
            search: search,
            target: _target
        });
    }
};