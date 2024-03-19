import BigNumber from "bignumber.js";

// const BlockStreamURL = "https://blockstream.info/api";
const MinSats = 1000;    // TODO: update
const DummyUTXOValue = 1000;
const InputSize = 68;
const OutputSize = 43;
const BNZero = new BigNumber(0);
const MinSats2 = 546;
const MinSats3 = 796;

// const MinSats2 = 333;

const DefaultSequence = 4294967295;
const DefaultSequenceRBF = 4294967293;

const MaxTxSize = 357376; // 349 KB


const WalletType = {
    Xverse: 1,
    Hiro: 2,
};

export {
    // BlockStreamURL,
    MinSats,
    MinSats2,
    MinSats3,
    DummyUTXOValue,
    InputSize,
    OutputSize,
    BNZero,
    WalletType,
    DefaultSequence,
    DefaultSequenceRBF,
    MaxTxSize
};