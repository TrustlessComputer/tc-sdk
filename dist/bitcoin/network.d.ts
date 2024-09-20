import { networks } from "bitcoinjs-lib";
declare let Network: networks.Network;
declare let BlockStreamURL: string;
declare const NetworkType: {
    Mainnet: number;
    Testnet: number;
    Regtest: number;
    Fractal: number;
};
declare const setBTCNetwork: (netType: number) => void;
export { Network, NetworkType, setBTCNetwork, BlockStreamURL, };
