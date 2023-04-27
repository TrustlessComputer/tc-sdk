import { TcClient } from "./tc";
import { StorageService } from "./utils";
import { networks } from "bitcoinjs-lib";

declare global {
  const tcStorage: StorageService;
  const tcClient: TcClient;
  const tcBTCNetwork: typeof networks.bitcoin | typeof networks.regtest | typeof networks.testnet;
}
