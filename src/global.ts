import { TcClient } from "./tc";
import { StorageService } from "./utils";

declare global {
  const storage: StorageService;
  const tcClient: TcClient;
}
