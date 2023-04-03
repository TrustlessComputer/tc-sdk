import dts from "rollup-plugin-dts";
// rollup.config.js
import { nodeResolve as resolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const config = [
    {
        input: "build/compiled/index.js",
        output: {
            file: "dist/index.js",
            format: "cjs",
            sourcemap: true,
        },
        external: ["axios", "os", "url", "ecpair", "@bitcoinerlab/secp256k1", "bitcoinjs-lib", "@ethersproject", "crypto-js", "ethers", "js-sha3", "bip32", "web3", "wif", "ethereumjs-wallet", "sats-connect", "varuint-bitcoin"],
        plugins: [resolve(), typescript()]
    }, {
        input: "build/compiled/index.d.ts",
        output: {
            file: "dist/index.d.ts",
            format: "es"
        },
        plugins: [dts()]
    }
];

export default config;