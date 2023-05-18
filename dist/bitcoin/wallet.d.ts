/// <reference types="node" />
import { ECPairAPI, ECPairInterface } from 'ecpair';
import { IKeyPairInfo, Inscription, UTXO, Wallet } from "./types";
import { Signer, payments } from "bitcoinjs-lib";
import { ethers } from "ethers";
import { BIP32Interface } from "bip32";
import BigNumber from "bignumber.js";
declare const ECPair: ECPairAPI;
/**
* convertPrivateKey converts buffer private key to WIF private key string
* @param bytes buffer private key
* @returns the WIF private key string
*/
declare const convertPrivateKey: (bytes: Buffer) => string;
/**
* convertPrivateKeyFromStr converts private key WIF string to Buffer
* @param str private key string
* @returns buffer private key
*/
declare const convertPrivateKeyFromStr: (str: string) => Buffer;
declare function toXOnly(pubkey: Buffer): Buffer;
declare function tweakSigner(signer: Signer, opts?: any): Signer;
declare function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer;
declare const generateTaprootAddress: (privateKey: Buffer) => string;
declare const generateTaprootAddressFromPubKey: (pubKey: Buffer) => {
    address: string;
    p2pktr: payments.Payment;
};
declare const generateTaprootKeyPair: (privateKey: Buffer) => {
    keyPair: ECPairInterface;
    senderAddress: string;
    tweakedSigner: Signer;
    p2pktr: payments.Payment;
};
declare const generateP2PKHKeyPair: (privateKey: Buffer) => {
    keyPair: ECPairInterface;
    address: string;
    p2pkh: payments.Payment;
    privateKey: Buffer;
};
declare const generateP2PKHKeyFromRoot: (root: BIP32Interface) => {
    keyPair: ECPairInterface;
    address: string;
    p2pkh: payments.Payment;
    privateKey: Buffer;
};
declare const generateP2WPKHKeyPair: (privateKey: Buffer) => {
    keyPair: ECPairInterface;
    address: string;
    p2wpkh: payments.Payment;
    privateKey: Buffer;
};
declare const generateP2WPKHKeyPairFromPubKey: (pubKey: Buffer) => {
    address: string;
    p2wpkh: payments.Payment;
};
declare const getKeyPairInfo: ({ privateKey, address, }: {
    privateKey: Buffer;
    address: string;
}) => IKeyPairInfo;
/**
* getBTCBalance returns the Bitcoin balance from cardinal utxos.
*/
declare const getBTCBalance: (params: {
    utxos: UTXO[];
    inscriptions: {
        [key: string]: Inscription[];
    };
}) => BigNumber;
/**
* importBTCPrivateKey returns the bitcoin private key and the corresponding taproot address.
*/
declare const importBTCPrivateKey: (wifPrivKey: string) => {
    taprootPrivKeyBuffer: Buffer;
    taprootAddress: string;
};
/**
* deriveSegwitWallet derives bitcoin segwit wallet from private key taproot.
* @param privKeyTaproot private key taproot is used to a seed to generate segwit wall
* @returns the segwit private key and the segwit address
*/
declare const deriveSegwitWallet: (privKeyTaproot: Buffer) => {
    segwitPrivKeyBuffer: Buffer;
    segwitAddress: string;
};
/**
* deriveETHWallet derives eth wallet from private key taproot.
* @param privKeyTaproot private key taproot is used to a seed to generate eth wallet
* @returns the eth private key and the eth address
*/
declare const deriveETHWallet: (privKeyTaproot: Buffer) => {
    ethPrivKey: string;
    ethAddress: string;
};
/**
* signByETHPrivKey creates the signature on the data by ethPrivKey.
* @param ethPrivKey private key with either prefix "0x" or non-prefix
* @param data data toSign is a hex string, MUST hash prefix "0x"
* @returns the signature with prefix "0x"
*/
declare const signByETHPrivKey: (ethPrivKey: string, data: string) => string;
declare const getBitcoinKeySignContent: (message: string) => Buffer;
/**
* derivePasswordWallet derive the password from ONE SPECIFIC evm address.
* This password is used to encrypt and decrypt the imported BTC wallet.
* NOTE: The client should save the corresponding evm address to retrieve the same BTC wallet.
* @param provider ETH provider
* @param evmAddress evm address is chosen to create the valid signature on IMPORT_MESSAGE
* @returns the password string
*/
declare const derivePasswordWallet: (evmAddress: string, provider: ethers.providers.Web3Provider) => Promise<string>;
/**
* encryptWallet encrypts Wallet object by AES algorithm.
* @param wallet includes the plaintext private key need to encrypt
* @param password the password to encrypt
* @returns the signature with prefix "0x"
*/
declare const encryptWallet: (wallet: Wallet, password: string) => string;
/**
* decryptWallet decrypts ciphertext to Wallet object by AES algorithm.
* @param ciphertext ciphertext
* @param password the password to decrypt
* @returns the Wallet object
*/
declare const decryptWallet: (ciphertext: string, password: string) => Wallet;
declare const BTCAddressType: {
    P2TR: number;
    P2WPKH: number;
};
/**
* getAddressType return the type of btc address.
* @param address Bitcoin address. Currently, only support Taproot and Segwit (P2WPKH)
* @returns the address type
*/
declare const getAddressType: ({ btcAddress, pubKey, }: {
    btcAddress: string;
    pubKey: Buffer;
}) => number;
export { ECPair, convertPrivateKey, convertPrivateKeyFromStr, toXOnly, tweakSigner, tapTweakHash, generateTaprootAddress, generateTaprootKeyPair, generateP2PKHKeyPair, generateP2PKHKeyFromRoot, getBTCBalance, importBTCPrivateKey, derivePasswordWallet, getBitcoinKeySignContent, encryptWallet, decryptWallet, deriveSegwitWallet, deriveETHWallet, signByETHPrivKey, generateTaprootAddressFromPubKey, getAddressType, BTCAddressType, generateP2WPKHKeyPair, generateP2WPKHKeyPairFromPubKey, getKeyPairInfo, };
