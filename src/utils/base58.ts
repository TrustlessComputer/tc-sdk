const baseX = require("base-x");
import { createHash } from "crypto";

// Define the Base58 alphabet
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const base58 = baseX(BASE58_ALPHABET);

// Encode a buffer or string into Base58
function encodeBase58(input: string | Uint8Array): string {
    const buffer = typeof input === "string" ? Buffer.from(input) : Buffer.from(input);
    return base58.encode(buffer);
}

// Decode a Base58 string back to its original form
function decodeBase58(encoded: string): Uint8Array {
    return base58.decode(encoded);
}

// Function to compute SHA-256 hash
function sha256(data: Buffer): Buffer {
    return createHash("sha256").update(data).digest();
}

// Function to encode with checksum
function encodeBase58WithChecksum(data: Buffer): string {
    // Step 1: Compute checksum (first 4 bytes of double SHA-256)
    const checksum = sha256(sha256(data)).slice(0, 4);

    // Step 2: Append checksum to the data
    const dataWithChecksum = Buffer.concat([data, checksum]);

    // Step 3: Encode the data (with checksum) in Base58
    return base58.encode(dataWithChecksum);
}

// Function to decode and verify the checksum
// function decodeBase58WithChecksum(encoded: string): Buffer {
//     // Step 1: Decode the Base58 string
//     const decoded = base58.decode(encoded);

//     // Step 2: Separate data and checksum
//     const data = decoded.slice(0, -4); // Exclude the last 4 bytes (checksum)
//     const checksum = decoded.slice(-4); // Last 4 bytes are the checksum

//     // Step 3: Verify the checksum
//     const computedChecksum = sha256(sha256(data)).slice(0, 4);
//     if (!checksum.equals(computedChecksum)) {
//         throw new Error("Invalid checksum");
//     }

//     // Step 4: Return the original data
//     return data;
// }

export {
    encodeBase58,
    decodeBase58,
    encodeBase58WithChecksum,
}