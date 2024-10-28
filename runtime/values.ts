export type ValueType = "null" | "number" | "boolean";

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

export interface BooleanValue extends RuntimeValue {
    type: "boolean";
    value: boolean;
}

export function MK_NUM(n = 0) {
    return { type: "number", value: n } as NumberValue
}

export function MK_NULL() {
    return { type: "null", value: null } as NullValue
}

export function MK_BOOL(b = true) {
    return { type: "boolean", value: b } as BooleanValue
}