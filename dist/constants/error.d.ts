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
    RPC_GET_TAPSCRIPT_INFO: string;
    RESTORE_HD_WALLET: string;
    DECRYPT: string;
    TAPROOT_FROM_MNEMONIC: string;
    MNEMONIC_GEN_TAPROOT: string;
    CANNOT_FIND_ACCOUNT: string;
    NOT_FOUND_TX_TO_RBF: string;
    COMMIT_TX_EMPTY: string;
    REVEAL_TX_EMPTY: string;
    OLD_VIN_EMPTY: string;
    INVALID_NEW_FEE_RBF: string;
    GET_UTXO_VALUE_ERR: string;
    IS_NOT_RBFABLE: string;
    INVALID_BTC_ADDRESS_TYPE: string;
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
