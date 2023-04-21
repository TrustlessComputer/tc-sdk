type Target = "_blank" | "_parent" | "_self" | "_top";

enum RequestFunction {
    sign= "sign",
    request = "request"
}

interface CallWalletPayload {
    method: string;
    hash: string;
    dappURL: string;
    isRedirect: boolean;
    target?: Target
}

enum RequestMethod {
    account = "account"
}

interface RequestPayload {
    method: RequestMethod;
    redirectURL: string;
    target?: Target
}

interface RequestAccountResponse {
    redirectURL: string;
    target?: Target;
    tcAddress: string;
    tpAddress: string;
}

export {
    RequestFunction,
    CallWalletPayload,
    Target,
    RequestMethod,
    RequestPayload,
    RequestAccountResponse
};
