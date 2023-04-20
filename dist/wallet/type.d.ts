type Target = "_blank" | "parent";
interface CallWalletPayload {
    method: string;
    hash: string;
    dappURL: string;
    isRedirect: boolean;
    target?: Target;
}
export { CallWalletPayload, Target };
