import BigNumber from "bignumber.js";

const increaseGasPrice = (wei: BigNumber): BigNumber => {
    const res = wei.plus(new BigNumber(1000000000));
    return res;
};

export {
    increaseGasPrice,
};

