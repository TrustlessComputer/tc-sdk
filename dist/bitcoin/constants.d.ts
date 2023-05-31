import BigNumber from "bignumber.js";
declare const MinSats = 1000;
declare const DummyUTXOValue = 1000;
declare const InputSize = 68;
declare const OutputSize = 43;
declare const BNZero: BigNumber;
declare const MinSats2 = 546;
declare const DefaultSequence = 4294967295;
declare const DefaultSequenceRBF = 4294967293;
declare const WalletType: {
    Xverse: number;
    Hiro: number;
};
export { MinSats, MinSats2, DummyUTXOValue, InputSize, OutputSize, BNZero, WalletType, DefaultSequence, DefaultSequenceRBF, };
