import BigNumber from "bignumber.js";

// const BlockStreamURL = "https://blockstream.info/api";
const MinSats = 1000;    // TODO: update
const DummyUTXOValue = 1000;
const InputSize = 68;
const OutputSize = 43;
const BNZero = new BigNumber(0);
const MinSats2 = 546;

const DefaultSequence = 4294967295;
const DefaultSequenceRBF = 4294967293;


const WalletType = {
    Xverse: 1,
    Hiro: 2,
};

export {
    // BlockStreamURL,
    MinSats,
    MinSats2,
    DummyUTXOValue,
    InputSize,
    OutputSize,
    BNZero,
    WalletType,
    DefaultSequence,
    DefaultSequenceRBF,
};