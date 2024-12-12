/// <reference types="node" />
/// <reference types="node" />
declare function encodeBase58(input: string | Uint8Array): string;
declare function decodeBase58(encoded: string): Uint8Array;
declare function encodeBase58WithChecksum(data: Buffer): string;
export { encodeBase58, decodeBase58, encodeBase58WithChecksum, };
