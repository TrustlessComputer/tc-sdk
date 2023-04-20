import { networks } from "bitcoinjs-lib";
declare let Network: networks.Network;
declare const NetworkType: {
    Mainnet: number;
    Testnet: number;
    Regtest: number;
};
declare const setBTCNetwork: (netType: number) => void;
export { Network, NetworkType, setBTCNetwork, };
