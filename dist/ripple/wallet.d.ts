import { Wallet } from "xrpl";
declare const randomWallet: () => Wallet;
declare const generateWalletFromSeed: (seed: string) => Wallet;
export { randomWallet, generateWalletFromSeed, };
