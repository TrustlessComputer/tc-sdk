import { NetworkType, setBTCNetwork } from '@/bitcoin';

import { StorageService } from "@/utils/storage";
import { TcClient } from "@/tc";
import { networks } from "bitcoinjs-lib";

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


    if (storage) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _global.tcStorage = storage;
    }
    if (tcClient) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _global.tcClient = tcClient;
    }


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _global.tcBTCNetwork = network;
    setBTCNetwork(netType);
};

export {
    setupConfig
};