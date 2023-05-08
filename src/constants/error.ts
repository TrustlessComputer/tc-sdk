export const ERROR_CODE = {
    INVALID_CODE: "0",
    INVALID_PARAMS: "-1",
    NOT_SUPPORT_SEND: "-2",
    NOT_FOUND_INSCRIPTION: "-3",
    NOT_ENOUGH_BTC_TO_SEND: "-4",
    NOT_ENOUGH_BTC_TO_PAY_FEE: "-5",
    ERR_BROADCAST_TX: "-6",
    INVALID_SIG: "-7",
    INVALID_VALIDATOR_LABEL: "-8",
    NOT_FOUND_UTXO: "-9",
    NOT_FOUND_DUMMY_UTXO: "-10",
    WALLET_NOT_SUPPORT: "-11",
    SIGN_XVERSE_ERROR: "-12",
    CREATE_COMMIT_TX_ERR: "-13",
    INVALID_TAPSCRIPT_ADDRESS: "-14",
    INVALID_NETWORK_TYPE: "-15",
    RPC_ERROR: "-16",
    RPC_GET_INSCRIBEABLE_INFO_ERROR: "-17",
    RPC_SUBMIT_BTCTX_ERROR: "-18",
    RPC_GET_TAPSCRIPT_INFO: "-19",
    NOT_FOUND_TX_TO_RBF: "-30",
    COMMIT_TX_EMPTY: "-31",
    REVEAL_TX_EMPTY: "-32",
    OLD_VIN_EMPTY: "-33",
    INVALID_NEW_FEE_RBF: "-34",
    GET_UTXO_VALUE_ERR: "-35",
    IS_NOT_RBFABLE: "-36",
};

export const ERROR_MESSAGE = {
    [ERROR_CODE.INVALID_CODE]: {
        message: "Something went wrong.",
        desc: "Something went wrong.",
    },
    [ERROR_CODE.INVALID_PARAMS]: {
        message: "Invalid input params.",
        desc: "Invalid input params.",
    },
    [ERROR_CODE.NOT_SUPPORT_SEND]: {
        message: "This inscription is not supported to send.",
        desc: "This inscription is not supported to send.",
    },
    [ERROR_CODE.NOT_FOUND_INSCRIPTION]: {
        message: "Can not find inscription UTXO in your wallet.",
        desc: "Can not find inscription UTXO in your wallet.",
    },
    [ERROR_CODE.NOT_ENOUGH_BTC_TO_SEND]: {
        message: "Your balance is insufficient. Please top up BTC to your wallet.",
        desc: "Your balance is insufficient. Please top up BTC to your wallet.",
    },
    [ERROR_CODE.NOT_ENOUGH_BTC_TO_PAY_FEE]: {
        message: "Your balance is insufficient. Please top up BTC to pay network fee.",
        desc: "Your balance is insufficient. Please top up BTC to pay network fee.",
    },
    [ERROR_CODE.ERR_BROADCAST_TX]: {
        message: "There was an issue when broadcasting the transaction to the BTC network.",
        desc: "There was an issue when broadcasting the transaction to the BTC network.",
    },
    [ERROR_CODE.INVALID_SIG]: {
        message: "Signature is invalid in the partially signed bitcoin transaction.",
        desc: "Signature is invalid in the partially signed bitcoin transaction.",
    },
    [ERROR_CODE.INVALID_VALIDATOR_LABEL]: {
        message: "Missing or invalid label.",
        desc: "Missing or invalid label.",
    },
    [ERROR_CODE.NOT_FOUND_UTXO]: {
        message: "Can not find UTXO with exact value.",
        desc: "Can not find UTXO with exact value.",
    },
    [ERROR_CODE.NOT_FOUND_DUMMY_UTXO]: {
        message: "Can not find dummy UTXO in your wallet.",
        desc: "Can not find dummy UTXO in your wallet.",
    },
    [ERROR_CODE.SIGN_XVERSE_ERROR]: {
        message: "Can not sign with Xverse.",
        desc: "Can not sign with Xverse.",
    },
    [ERROR_CODE.WALLET_NOT_SUPPORT]: {
        message: "Your wallet is not supported currently.",
        desc: "Your wallet is not supported currently.",
    },
    [ERROR_CODE.CREATE_COMMIT_TX_ERR]: {
        message: "Create commit tx error.",
        desc: "Create commit tx error.",
    },
    [ERROR_CODE.INVALID_TAPSCRIPT_ADDRESS]: {
        message: "Can not generate valid tap script address to inscribe.",
        desc: "Can not generate valid tap script address to inscribe.",
    },
    [ERROR_CODE.INVALID_NETWORK_TYPE]: {
        message: "Invalid network type params.",
        desc: "Invalid network type params.",
    },
    [ERROR_CODE.RPC_ERROR]: {
        message: "Call RPC TC node error.",
        desc: "Call RPC TC node error.",
    },
    [ERROR_CODE.RPC_GET_INSCRIBEABLE_INFO_ERROR]: {
        message: "Call RPC get inscribeable info error.",
        desc: "Call RPC get inscribeable info error.",
    },
    [ERROR_CODE.RPC_SUBMIT_BTCTX_ERROR]: {
        message: "Call RPC submit btc tx error.",
        desc: "Call RPC submit btc tx error.",
    },
    [ERROR_CODE.NOT_FOUND_TX_TO_RBF]: {
        message: "BTC transaction was not found from TC node.",
        desc: "BTC transaction was not found from TC node.",
    },
    [ERROR_CODE.COMMIT_TX_EMPTY]: {
        message: "Commit tx need to RBF is empty.",
        desc: "Commit tx need to RBF is empty.",
    },
    [ERROR_CODE.REVEAL_TX_EMPTY]: {
        message: "Reveal tx need to RBF is empty.",
        desc: "Reveal tx need to RBF is empty.",
    },
    [ERROR_CODE.OLD_VIN_EMPTY]: {
        message: "Can not get vin from inscribe tx to RBF.",
        desc: "Can not get vin from inscribe tx to RBF.",
    },
    [ERROR_CODE.INVALID_NEW_FEE_RBF]: {
        message: "New fee for RBF tx must be greater than the old one.",
        desc: "New fee for RBF tx must be greater than the old one.",
    },
    [ERROR_CODE.GET_UTXO_VALUE_ERR]: {
        message: "Get UTXO value from blockstream not found.",
        desc: "Get UTXO value from blockstream not found.",
    },
    [ERROR_CODE.IS_NOT_RBFABLE]: {
        message: "This transaction doesn't support to speed up.",
        desc: "This transaction doesn't support to speed up.",
    },




};

class SDKError extends Error {
    message: string;
    code: string;
    desc: string;
    constructor(code: string, desc?: string) {
        super();
        const _error = ERROR_MESSAGE[code];
        this.message = `${_error.message} (${code})` || "";
        this.code = code;
        this.desc = desc || _error?.desc;
    }
    getMessage() {
        return this.message;
    }
}

export default SDKError;