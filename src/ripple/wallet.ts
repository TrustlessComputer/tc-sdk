import { randomBytes } from "crypto";
import { encodeBase58WithChecksum } from "../utils";
import { Wallet } from "xrpl";

const randomWallet = (): Wallet => {
    // random seed : 16 bytes

    // const seedBytes = randomBytes(16);

    // const encodedSeed = encodeBase58WithChecksum(seedBytes);

    const wallet1 = Wallet.generate();
    console.log(`randomWallet wallet1: ${wallet1}`);
    console.log(`randomWallet address: ${wallet1.address}`);
    console.log(`randomWallet  wallet1.seed: ${wallet1.seed}`);
    console.log(`randomWallet  wallet1.privateKey: ${wallet1.privateKey}`);


    // const walletFromSecret = Wallet.fromSecret(encodedSeed);
    // console.log(`randomWallet walletFromSecret: ${walletFromSecret}`)


    // console.log(`randomWallet encodedSeed: ${encodedSeed}`)

    // const wallet = Wallet.fromSeed(encodedSeed);
    // console.log(`randomWallet Wallet: ${wallet}`);
    // console.log(`randomWallet address: ${wallet.address}`);

    return wallet1;

}

const generateWalletFromSeed = (seed: string): Wallet => {
    // random seed : 16 bytes

    // const seedBytes = randomBytes(16);

    // const encodedSeed = encodeBase58WithChecksum(seedBytes);

    const wallet1 = Wallet.fromSeed(seed);
    console.log(`randomWallet address: ${wallet1.address}`);




    // const walletFromSecret = Wallet.fromSecret(encodedSeed);
    // console.log(`randomWallet walletFromSecret: ${walletFromSecret}`)


    // console.log(`randomWallet encodedSeed: ${encodedSeed}`)

    // const wallet = Wallet.fromSeed(encodedSeed);
    // console.log(`randomWallet Wallet: ${wallet}`);
    // console.log(`randomWallet address: ${wallet.address}`);

    return wallet1;

}



export {
    randomWallet,
    generateWalletFromSeed,
}