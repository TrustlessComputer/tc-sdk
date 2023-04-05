export declare const ERROR_CODE: {
    INVALID_CODE: string;
    INVALID_PARAMS: string;
    NOT_SUPPORT_SEND: string;
    NOT_FOUND_INSCRIPTION: string;
    NOT_ENOUGH_BTC_TO_SEND: string;
    NOT_ENOUGH_BTC_TO_PAY_FEE: string;
    ERR_BROADCAST_TX: string;
    INVALID_SIG: string;
    INVALID_VALIDATOR_LABEL: string;
    NOT_FOUND_UTXO: string;
    NOT_FOUND_DUMMY_UTXO: string;
    WALLET_NOT_SUPPORT: string;
    SIGN_XVERSE_ERROR: string;
    CREATE_COMMIT_TX_ERR: string;
    INVALID_TAPSCRIPT_ADDRESS: string;
    INVALID_NETWORK_TYPE: string;
    RPC_ERROR: string;
    RPC_GET_INSCRIBEABLE_INFO_ERROR: string;
    RPC_SUBMIT_BTCTX_ERROR: string;
};
export declare const ERROR_MESSAGE: {
    [x: string]: {
        message: string;
        desc: string;
    };
};
declare class SDKError extends Error {
    message: string;
    code: string;
    desc: string;
    constructor(code: string, desc?: string);
    getMessage(): string;
}
export default SDKError;
