/// <reference types="node" />
import { Varuint } from "big-varuint-js";
export declare enum Tag {
    Body = 0,
    Flags = 2,
    Rune = 4,
    Premine = 6,
    Cap = 8,
    Amount = 10,
    HeightStart = 12,
    HeightEnd = 14,
    OffsetStart = 16,
    OffsetEnd = 18,
    Mint = 20,
    Pointer = 22,
    Cenotaph = 126,
    Divisibility = 1,
    Spacers = 3,
    Symbol = 5,
    Nop = 127
}
export declare enum ValueType {
    U8 = 0,
    U16 = 1,
    U32 = 2,
    U64 = 3,
    U128 = 4
}
export declare class TagPayload {
    payloads: number[];
    edicts: bigint[];
    tagMap: Map<number, bigint[]>;
    constructor(buff?: Buffer);
    decode(): void;
    getValue(tag: Tag, valueType: ValueType, index?: number): Varuint | undefined;
    private pushVaruint;
    encodeTagPush(tag: Tag, ...ns: (Varuint | undefined)[]): void;
    encodeMultiplePush(ns: (Varuint | undefined)[]): void;
    toBuffer(): Buffer;
}
