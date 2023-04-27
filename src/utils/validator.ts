import { payments } from "bitcoinjs-lib";
import { utils } from "ethers";
import { ECPair, Network, toXOnly, tweakSigner } from "@/bitcoin";
import { SDKError, ERROR_CODE } from "@/constants";

function isPrivateKey(privateKey: Buffer) {
    let isValid = false;
    try {
        // init key pair from senderPrivateKey
        const keyPair = ECPair.fromPrivateKey(privateKey);
        // Tweak the original keypair
        const tweakedSigner = tweakSigner(keyPair, { network: Network });

        // Generate an address from the tweaked public key
        const p2pktr = payments.p2tr({
            pubkey: toXOnly(tweakedSigner.publicKey),
            network: Network
        });
        const senderAddress = p2pktr.address ? p2pktr.address : "";
        isValid = senderAddress !== "";
    } catch (e) {
        isValid = false;
    }
    return isValid;
}

class Validator {
    value: any;
    label: string;
    isRequired: boolean;

    constructor(label: string, value: any) {
        if (!label && typeof label !== "string") {
            throw new SDKError(ERROR_CODE.INVALID_VALIDATOR_LABEL);
        }
        this.value = value;
        this.label = label;
        this.isRequired = false;
    }

    _throwError(message: string) {
        throw new Error(
            `Validating "${this.label}" failed: ${message}. Found ${this.value
            } (type of ${typeof this.value})`
        );
    }

    _isDefined() {
        return this.value !== null && this.value !== undefined;
    }

    _onCondition(condition: () => any, message: string) {
        if (
            ((!this.isRequired && this._isDefined()) || this.isRequired) &&
            !condition()
        ) {
            this._throwError(message);
        }

        return this;
    }

    required(message = "Required") {
        this.isRequired = true;
        return this._onCondition(() => this._isDefined(), message);
    }

    string(message = "Must be string") {
        return this._onCondition(() => typeof this.value === "string", message);
    }

    buffer(message = "Must be buffer") {
        return this._onCondition(() => Buffer.isBuffer(this.value), message);
    }

    function(message = "Must be a function") {
        return this._onCondition(() => typeof this.value === "function", message);
    }

    boolean(message = "Must be boolean") {
        return this._onCondition(() => typeof this.value === "boolean", message);
    }

    number(message = "Must be number") {
        return this._onCondition(() => Number.isFinite(this.value), message);
    }

    array(message = "Must be array") {
        return this._onCondition(() => this.value instanceof Array, message);
    }

    privateKey(message = "Invalid private key") {
        return this._onCondition(
            () => this.buffer() && isPrivateKey(this.value),
            message
        );
    }

    mnemonic(message = "Invalid mnemonic") {
        return this._onCondition(
            () => utils.isValidMnemonic(this.value),
            message
        );
    }
}

export default Validator;