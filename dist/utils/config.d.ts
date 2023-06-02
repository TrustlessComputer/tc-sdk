import { StorageService } from "@/utils/storage";
import { TcClient } from "@/tc";
interface ISetupPayload {
    storage: StorageService;
    tcClient: TcClient;
    netType: number;
}
declare const setupConfig: ({ storage, tcClient, netType }: ISetupPayload) => void;
export { setupConfig };
