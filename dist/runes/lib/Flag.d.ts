import { U8 } from "big-varuint-js";
export declare enum FlagEnum {
    Etching = 0,
    Terms = 1,
    Cenotaph = 127
}
export declare class Flag {
    private flag;
    constructor(value: U8);
    set(flag: FlagEnum): void;
    hasFlag(flag: FlagEnum): boolean;
    toValue(): U8;
}
