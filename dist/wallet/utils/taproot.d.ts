declare const validateMnemonicBTC: (mnemonic: string) => boolean;
declare const generateTaprootHDNodeFromMnemonic: (mnemonic: string) => Promise<string>;
export { generateTaprootHDNodeFromMnemonic, validateMnemonicBTC };
