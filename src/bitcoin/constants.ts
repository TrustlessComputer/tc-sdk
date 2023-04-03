import BigNumber from "bignumber.js";

const BlockStreamURL = "https://blockstream.info/api";
const MinSats = 1000;
const DummyUTXOValue = 1000;
const InputSize = 68;
const OutputSize = 43;
const BNZero = new BigNumber(0);


const WalletType = {
    Xverse: 1,
    Hiro: 2,
};

export {
    BlockStreamURL,
    MinSats,
    DummyUTXOValue,
    InputSize,
    OutputSize,
    BNZero,
    WalletType,
};