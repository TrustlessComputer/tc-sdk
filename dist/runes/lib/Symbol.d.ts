import { U8 } from "big-varuint-js";
export declare class Symbol {
    readonly symbol: U8;
    constructor(symbol: U8);
    static fromString(symbolStr: string): Symbol;
    toString(): string;
    toJSON(): string;
}
