import { U32, U64 } from "big-varuint-js";
export declare class RuneId {
    readonly block: U64;
    readonly tx: U32;
    constructor(block: U64, tx: U32);
    delta(next: RuneId): RuneId;
    next(next: RuneId): RuneId;
    toJSON(): {
        block: string;
        tx: string;
    };
}
