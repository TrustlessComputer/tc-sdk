import { networks } from "bitcoinjs-lib";

// default is bitcoin mainnet
let Network = networks.bitcoin;

const NetworkType = {
    Mainnet: 1,
    Testnet: 2,
    Regtest: 3,
};

const setBTCNetwork = (netType: number) => {
    switch (netType) {
        case NetworkType.Mainnet: {
            Network = networks.bitcoin;
            break;
        }
        case NetworkType.Testnet: {
            Network = networks.testnet;
            break;
        }
        case NetworkType.Regtest: {
            Network = networks.regtest;
            break;
        }
    }
};

export {
    Network,
    NetworkType,
    setBTCNetwork,
};