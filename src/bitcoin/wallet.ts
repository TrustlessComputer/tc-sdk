import * as ecc from "@bitcoinerlab/secp256k1";

import { AES, enc } from "crypto-js";
import { ECPairAPI, ECPairFactory, ECPairInterface } from 'ecpair';
import { IKeyPairInfo, Inscription, UTXO, Wallet } from "./types";
import {
    Signer,
    crypto,
    initEccLib,
    payments
} from "bitcoinjs-lib";
import { Transaction, address } from 'bitcoinjs-lib';
import { ethers, utils } from "ethers";

import { AddressPurposes } from "sats-connect";
import BIP32Factory from "bip32";
import { BIP32Interface } from "bip32";
import BigNumber from "bignumber.js";
import { ERROR_CODE } from '../constants/error';
import { Network } from "./network";
import SDKError from '../constants/error';
import Web3 from "web3";
import { filterAndSortCardinalUTXOs } from "./selectcoin";
import { hdkey } from "ethereumjs-wallet";
import { keccak256 } from "js-sha3";
import wif from "wif";

initEccLib(ecc);
const ECPair: ECPairAPI = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

const ETHWalletDefaultPath = "m/44'/60'/0'/0/0";
const BTCSegwitWalletDefaultPath = "m/84'/0'/0'/0/0";



/**
* convertPrivateKey converts buffer private key to WIF private key string
* @param bytes buffer private key
* @returns the WIF private key string
*/
const convertPrivateKey = (bytes: Buffer): string => {
    return wif.encode(128, bytes, true);
};

/**
* convertPrivateKeyFromStr converts private key WIF string to Buffer
* @param str private key string
* @returns buffer private key
*/
const convertPrivateKeyFromStr = (str: string): Buffer => {
    const res = wif.decode(str);
    return res?.privateKey;
};

function toXOnly(pubkey: Buffer): Buffer {
    if (pubkey.length === 33) {
        return pubkey.subarray(1, 33);
    }
    return pubkey;
}

function tweakSigner(signer: Signer, opts: any = {}): Signer {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey: Uint8Array | undefined = signer.privateKey!;
    if (!privateKey) {
        throw new Error("Private key is required for tweaking signer!");
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc.privateNegate(privateKey);
    }

    const tweakedPrivateKey = ecc.privateAdd(
        privateKey,
        tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash),
    );

    if (!tweakedPrivateKey) {
        throw new Error("Invalid tweaked private key!");
    }

    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
    return crypto.taggedHash(
        "TapTweak",
        Buffer.concat(h ? [pubKey, h] : [pubKey]),
    );
}

const generateTaprootAddress = (privateKey: Buffer): string => {
    const keyPair = ECPair.fromPrivateKey(privateKey, { network: tcBTCNetwork });
    const internalPubkey = toXOnly(keyPair.publicKey);

    const { address } = payments.p2tr({
        internalPubkey,
        network: tcBTCNetwork,
    });

    return address ? address : "";
};

const generateTaprootAddressFromPubKey = (pubKey: Buffer) => {
    // const internalPubkey = toXOnly(pubKey);
    const internalPubkey = pubKey;

    const p2pktr = payments.p2tr({
        internalPubkey,
        network: tcBTCNetwork,
    });

    return { address: p2pktr.address || "", p2pktr };
};

const generateTaprootKeyPair = (privateKey: Buffer) => {
    // init key pair from senderPrivateKey
    const keyPair = ECPair.fromPrivateKey(privateKey, { network: tcBTCNetwork });
    // Tweak the original keypair
    const tweakedSigner = tweakSigner(keyPair, { network: tcBTCNetwork });

    // Generate an address from the tweaked public key
    const p2pktr = payments.p2tr({
        pubkey: toXOnly(tweakedSigner.publicKey),
        network: tcBTCNetwork
    });
    const senderAddress = p2pktr.address ? p2pktr.address : "";
    if (senderAddress === "") {
        throw new Error("Can not get sender address from private key");
    }

    return { keyPair, senderAddress, tweakedSigner, p2pktr };
};

const generateP2PKHKeyPair = (privateKey: Buffer) => {
    // init key pair from senderPrivateKey
    const keyPair = ECPair.fromPrivateKey(privateKey, { network: tcBTCNetwork });

    // Generate an address from the tweaked public key
    const p2pkh = payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: tcBTCNetwork
    });
    const address = p2pkh.address ? p2pkh.address : "";
    if (address === "") {
        throw new Error("Can not get sender address from private key");
    }

    return { keyPair, address, p2pkh: p2pkh, privateKey };
};

const generateP2PKHKeyFromRoot = (root: BIP32Interface) => {
    const childSegwit = root.derivePath(BTCSegwitWalletDefaultPath);
    const privateKey = childSegwit.privateKey as Buffer;

    return generateP2PKHKeyPair(privateKey);
};

const generateP2WPKHKeyPair = (privateKey: Buffer) => {
    // init key pair from senderPrivateKey
    const keyPair = ECPair.fromPrivateKey(privateKey, { network: tcBTCNetwork });

    // Generate an address from the tweaked public key
    const p2wpkh = payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: tcBTCNetwork
    });
    const address = p2wpkh.address ? p2wpkh.address : "";
    if (address === "") {
        throw new Error("Can not get sender address from private key");
    }

    return { keyPair, address, p2wpkh, privateKey };
};

const generateP2WPKHKeyPairFromPubKey = (pubKey: Buffer) => {
    // Generate an address from the tweaked public key
    const p2wpkh = payments.p2wpkh({
        pubkey: pubKey,
        network: tcBTCNetwork
    });
    const address = p2wpkh.address ? p2wpkh.address : "";
    if (address === "") {
        throw new Error("Can not get sender address from private key");
    }

    return { address, p2wpkh };
};


const getKeyPairInfo = ({
    privateKey, address,
}: {
    privateKey: Buffer, address: string
}): IKeyPairInfo => {
    // init key pair from senderPrivateKey
    const keyPair = ECPair.fromPrivateKey(privateKey, { network: tcBTCNetwork });

    // get address type 
    const addressType = getAddressType({ btcAddress: address, pubKey: keyPair.publicKey });

    // get payment and signer for each address type
    let payment: payments.Payment;
    let signer: any;
    let sigHashTypeDefault: number;

    switch (addressType) {
        case BTCAddressType.P2TR: {
            // Tweak the original keypair
            const tweakedSigner = tweakSigner(keyPair, { network: tcBTCNetwork });
            signer = tweakSigner;
            sigHashTypeDefault = Transaction.SIGHASH_DEFAULT;

            // Generate an address from the tweaked public key
            payment = payments.p2tr({
                pubkey: toXOnly(tweakedSigner.publicKey),
                network: tcBTCNetwork
            });
            break;
        }
        case BTCAddressType.P2WPKH: {
            signer = keyPair;
            sigHashTypeDefault = Transaction.SIGHASH_ALL;

            payment = payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network: tcBTCNetwork
            });

            break;
        }
        default:
            throw new SDKError(ERROR_CODE.INVALID_BTC_ADDRESS_TYPE);
    }

    return { address, addressType, keyPair, payment, signer, sigHashTypeDefault };
};


/**
* getBTCBalance returns the Bitcoin balance from cardinal utxos. 
*/
const getBTCBalance = (
    params: {
        utxos: UTXO[],
        inscriptions: { [key: string]: Inscription[] },
    }
): BigNumber => {
    const { utxos, inscriptions } = params;
    const { totalCardinalAmount } = filterAndSortCardinalUTXOs(utxos, inscriptions);
    return totalCardinalAmount;
};


/**
* importBTCPrivateKey returns the bitcoin private key and the corresponding taproot address. 
*/
const importBTCPrivateKey = (
    wifPrivKey: string
): {
    taprootPrivKeyBuffer: Buffer, taprootAddress: string,
} => {
    const privKeyBuffer = convertPrivateKeyFromStr(wifPrivKey);
    const { senderAddress } = generateTaprootKeyPair(privKeyBuffer);

    return {
        taprootPrivKeyBuffer: privKeyBuffer,
        taprootAddress: senderAddress,
    };
};

/**
* deriveSegwitWallet derives bitcoin segwit wallet from private key taproot. 
* @param privKeyTaproot private key taproot is used to a seed to generate segwit wall
* @returns the segwit private key and the segwit address
*/
const deriveSegwitWallet = (
    privKeyTaproot: Buffer
): {
    segwitPrivKeyBuffer: Buffer, segwitAddress: string
} => {
    const seedSegwit = ethers.utils.arrayify(
        ethers.utils.keccak256(ethers.utils.arrayify(privKeyTaproot))
    );
    const root = bip32.fromSeed(Buffer.from(seedSegwit), tcBTCNetwork);

    const { privateKey: segwitPrivKey, address: segwitAddress } = generateP2PKHKeyFromRoot(root);

    return {
        segwitPrivKeyBuffer: segwitPrivKey,
        segwitAddress: segwitAddress,
    };
};

/**
* deriveETHWallet derives eth wallet from private key taproot. 
* @param privKeyTaproot private key taproot is used to a seed to generate eth wallet
* @returns the eth private key and the eth address
*/
const deriveETHWallet = (privKeyTaproot: Buffer): { ethPrivKey: string, ethAddress: string } => {
    const seed = ethers.utils.arrayify(
        ethers.utils.keccak256(ethers.utils.arrayify(privKeyTaproot))
    );

    const hdwallet = hdkey.fromMasterSeed(Buffer.from(seed));
    const ethWallet = hdwallet.derivePath(ETHWalletDefaultPath).getWallet();

    return {
        ethPrivKey: ethWallet.getPrivateKeyString(),
        ethAddress: ethWallet.getAddressString(),
    };
};

/**
* signByETHPrivKey creates the signature on the data by ethPrivKey. 
* @param ethPrivKey private key with either prefix "0x" or non-prefix
* @param data data toSign is a hex string, MUST hash prefix "0x"
* @returns the signature with prefix "0x"
*/
const signByETHPrivKey = (ethPrivKey: string, data: string): string => {
    const web3 = new Web3();
    const {
        signature,
    } = web3.eth.accounts.sign(data, ethPrivKey);

    return signature;
};

const getBitcoinKeySignContent = (message: string): Buffer => {
    return Buffer.from(message);
};

/**
* derivePasswordWallet derive the password from ONE SPECIFIC evm address. 
* This password is used to encrypt and decrypt the imported BTC wallet.
* NOTE: The client should save the corresponding evm address to retrieve the same BTC wallet. 
* @param provider ETH provider
* @param evmAddress evm address is chosen to create the valid signature on IMPORT_MESSAGE
* @returns the password string
*/
const derivePasswordWallet = async (evmAddress: string, provider: ethers.providers.Web3Provider): Promise<string> => {
    // sign message with first sign transaction
    const IMPORT_MESSAGE =
        "Sign this message to import your Bitcoin wallet. This key will be used to encrypt your wallet.";
    const toSign =
        "0x" + getBitcoinKeySignContent(IMPORT_MESSAGE).toString("hex");
    const signature = await provider.send("personal_sign", [
        toSign,
        evmAddress.toString(),
    ]);

    // const signature = randomBytes(64);

    const password = keccak256(utils.arrayify(signature));
    return password;
};

/**
* encryptWallet encrypts Wallet object by AES algorithm. 
* @param wallet includes the plaintext private key need to encrypt
* @param password the password to encrypt
* @returns the signature with prefix "0x"
*/
const encryptWallet = (wallet: Wallet, password: string) => {
    // convert wallet to string
    const walletStr = JSON.stringify(wallet);
    const ciphertext = AES.encrypt(walletStr, password).toString();
    return ciphertext;
};

/**
* decryptWallet decrypts ciphertext to Wallet object by AES algorithm. 
* @param ciphertext ciphertext
* @param password the password to decrypt
* @returns the Wallet object
*/
const decryptWallet = (ciphertext: string, password: string): Wallet => {
    const plaintextBytes = AES.decrypt(ciphertext, password);

    // parse to wallet object
    const wallet = JSON.parse(plaintextBytes.toString(enc.Utf8));

    return wallet;
};

const BTCAddressType = {
    P2TR: 1,
    P2WPKH: 2,
};

/**
* getAddressType return the type of btc address. 
* @param address Bitcoin address. Currently, only support Taproot and Segwit (P2WPKH)
* @returns the address type
*/
const getAddressType = ({
    btcAddress,
    pubKey,
}: {
    btcAddress: string, pubKey: Buffer
}): number => {

    const { address: taprootAddress } = generateTaprootAddressFromPubKey(toXOnly(pubKey));
    const { address: p2wpkhAddress } = generateP2WPKHKeyPairFromPubKey(pubKey);
    switch (btcAddress) {
        case taprootAddress:
            return BTCAddressType.P2TR;
        case p2wpkhAddress:
            return BTCAddressType.P2WPKH;
        default:
            throw new SDKError(ERROR_CODE.INVALID_BTC_ADDRESS_TYPE);
    }
};


export {
    ECPair,
    convertPrivateKey,
    convertPrivateKeyFromStr,
    toXOnly,
    tweakSigner,
    tapTweakHash,
    generateTaprootAddress,
    generateTaprootKeyPair,
    generateP2PKHKeyPair,
    generateP2PKHKeyFromRoot,
    getBTCBalance,
    importBTCPrivateKey,
    derivePasswordWallet,
    getBitcoinKeySignContent,
    encryptWallet,
    decryptWallet,
    deriveSegwitWallet,
    deriveETHWallet,
    signByETHPrivKey,
    generateTaprootAddressFromPubKey,
    getAddressType,
    BTCAddressType,
    generateP2WPKHKeyPair,
    generateP2WPKHKeyPairFromPubKey,
    getKeyPairInfo,
};