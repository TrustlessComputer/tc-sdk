declare const generateTaprootHDNodeFromMnemonic: (mnemonic: string) => Promise<{
    privateKey: string;
    privateKeyBuffer: Buffer;
    address: string;
}>;
export { generateTaprootHDNodeFromMnemonic };
