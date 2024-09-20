import { networks } from "bitcoinjs-lib";

// default is bitcoin mainnet
let Network = networks.bitcoin;
let BlockStreamURL = "https://blockstream.info/api";

const NetworkType = {
    Mainnet: 1,
    Testnet: 2,
    Regtest: 3,
    Fractal: 4,  // mainnet
};

const setBTCNetwork = (netType: number) => {
    switch (netType) {
        case NetworkType.Mainnet: {
            Network = networks.bitcoin;
            BlockStreamURL = "https://blockstream.info/api";
            break;
        }
        case NetworkType.Testnet: {
            Network = networks.testnet;
            BlockStreamURL = "https://blockstream.info/testnet/api";
            break;
        }
        case NetworkType.Regtest: {
            Network = networks.regtest;
            BlockStreamURL = "https://blockstream.regtest.trustless.computer/regtest/api";
            break;
        }
        case NetworkType.Fractal: {
            Network = networks.bitcoin;
            BlockStreamURL = "https://mempool.fractalbitcoin.io/api";
            break;
        }
    }
};

export {
    Network,
    NetworkType,
    setBTCNetwork,
    BlockStreamURL,
};