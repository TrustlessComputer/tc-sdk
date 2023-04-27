import { TcClient } from "@/tc";
import { StorageService } from "@/utils/storage";

interface ISetupPayload {
    storage: StorageService,
    tcClient: TcClient
}

const setupConfig = ({ storage, tcClient }: ISetupPayload) => {
    // TODO

};

export {
    setupConfig
};