import { TcClient } from "@/tc";
import { StorageService } from "@/utils/storage";
interface ISetupPayload {
    storage: StorageService;
    tcClient: TcClient;
    netType: number;
}
declare const setupConfig: ({ storage, tcClient, netType }: ISetupPayload) => void;
export { setupConfig };
