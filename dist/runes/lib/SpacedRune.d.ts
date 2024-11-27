import { U32 } from "big-varuint-js";
import { Rune } from "./Rune";
export declare class SpacedRune {
    readonly rune: Rune;
    readonly spacers: U32;
    constructor(rune: Rune, spacers: U32);
    static fromString(str: string): SpacedRune;
    toString(): string;
    toJSON(): string;
}
