/// <reference types="node" />
import { U128 } from "big-varuint-js";
export declare class Rune {
    readonly rune: U128;
    constructor(rune: U128);
    static fromString(str: string): Rune;
    commitBuffer(): Buffer;
    toString(): string;
    toJSON(): string;
}
