import { TcClient } from "@/tc";
import { StorageService } from "@/utils/storage";
interface ISetupPayload {
    storage: StorageService;
    tcClient: TcClient;
}
declare const setupConfig: ({ storage, tcClient }: ISetupPayload) => void;
export { setupConfig };
