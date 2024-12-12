/// <reference types="node" />
/// <reference types="node" />
import { U32 } from "big-varuint-js";
import { Edict, Etching, RunestoneParams } from "./types";
import { RuneId } from "./RuneId";
export declare class Runestone {
    readonly edicts: Edict[];
    readonly etching?: Etching;
    readonly mint?: RuneId;
    readonly pointer?: U32;
    constructor(runestone: RunestoneParams);
    static dechiper(buff: Buffer): Runestone;
    enchiper(): Buffer;
}
