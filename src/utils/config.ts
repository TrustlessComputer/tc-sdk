import { TcClient } from "@/tc";
import { StorageService } from "@/utils/storage";
import { networks } from "bitcoinjs-lib";
import { NetworkType } from "@/bitcoin";

interface ISetupPayload {
    storage: StorageService,
    tcClient: TcClient,
    netType: number
}

const setupConfig = ({ storage, tcClient, netType }: ISetupPayload) => {
    let network;
    switch (netType) {
        case NetworkType.Mainnet: {
            network = networks.bitcoin;
            break;
        }
        case NetworkType.Testnet: {
            network = networks.testnet;
            break;
        }
        case NetworkType.Regtest: {
            network = networks.regtest;
            break;
        }
    }

    const _global = global || globalThis;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _global.tcStorage = storage;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _global.tcClient = tcClient;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _global.tcBTCNetwork = network;
};

export {
    setupConfig
};