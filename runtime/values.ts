import { Statement } from "../frontend/ast";
import Environment from "./environment";

export type ValueType = "null" | "number" | "boolean" | "object" | "internal-fn" | "user-defined-fn" | "string";

export interface RuntimeValue {
    type: ValueType;
}

export interface NullValue extends RuntimeValue {
    type: "null";
    value: null;
}

export interface NumberValue extends RuntimeValue {
    type: "number";
    value: number;
}

export interface StringValue extends RuntimeValue {
    type: "string";
    value: string;
}

export interface BooleanValue extends RuntimeValue {
    type: "boolean";
    value: boolean;
}

export interface ObjectValue extends RuntimeValue {
    type: "object";
    properties: Map<string, RuntimeValue>;
}

export type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue;
export interface InternalFnValue extends RuntimeValue {
    type: "internal-fn";
    call: FunctionCall
}


export interface UserDefinedFnValue extends RuntimeValue {
    type: "user-defined-fn";
    name: string;
    params: string[];
    declarationEnv: Environment;
    body: Statement[];
}

export function MK_NUM(n = 0) {
    return { type: "number", value: n } as NumberValue
}

export function MK_STR(s = "") {
    return { type: "string", value: s } as StringValue
}

export function MK_NULL() {
    return { type: "null", value: null } as NullValue
}

export function MK_BOOL(b = true) {
    return { type: "boolean", value: b } as BooleanValue
}

export function MK_OBJECT(obj: Map<string, RuntimeValue>): ObjectValue {
    return { type: "object", properties: obj } as ObjectValue;
}

export function MK_INTERNAL_FN(call: FunctionCall) {
    return { type: "internal-fn", call: call } as InternalFnValue
}