import { Client, AccountInfoResponse } from "xrpl";
declare function getAccountInfo(address: string, client: Client): Promise<AccountInfoResponse>;
declare const decodeBlobTx: (blobTx: string) => void;
declare const sha256Hash: (data: Buffer) => Buffer;
export { getAccountInfo, decodeBlobTx, sha256Hash, };
