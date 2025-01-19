import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, MemberExpr, ObjectLiteral, RelationalExpr } from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { NumberValue, RuntimeValue, MK_NULL, ObjectValue, InternalFnValue, UserDefinedFnValue, BooleanValue, MK_NUM, MK_BOOL, StringValue, NullValue } from "../values";

export function evaluate_numeric_binary_expr(lhs: RuntimeValue, rhs: RuntimeValue, operator: string): RuntimeValue {
    switch(operator) {
        case "||":
            if(lhs.type !== "boolean" || rhs.type !== "boolean") return MK_BOOL(false);
            return MK_BOOL((lhs as BooleanValue).value || (rhs as BooleanValue).value);

        case "&&":
            if(lhs.type !== "boolean" || rhs.type !== "boolean") return MK_BOOL(false);
            return MK_BOOL((lhs as BooleanValue).value && (rhs as BooleanValue).value);

        case "!=":
            return equals(lhs, rhs, false);

        case "==":
            return equals(lhs, rhs, true);

        default: {
            if (lhs.type !== 'number' || rhs.type !== 'number') return MK_BOOL(false);

            const llhs = lhs as NumberValue;
            const rrhs = rhs as NumberValue;

            switch (operator) {
                case "+":
                    return MK_NUM(llhs.value + rrhs.value);

                case "-":
                    return MK_NUM(llhs.value - rrhs.value);

                case "*":
                    return MK_NUM(llhs.value * rrhs.value);

                case "/":
                    return MK_NUM(llhs.value / rrhs.value);

                case "%":
                    return MK_NUM(llhs.value % rrhs.value);

                case "<":
                    return MK_BOOL(llhs.value < rrhs.value);

                case ">":
                    return MK_BOOL(llhs.value > rrhs.value);

                case "<=":
                    return MK_BOOL(llhs.value <= rrhs.value);

                case ">=":
                    return MK_BOOL(llhs.value >= rrhs.value);

                default:
                    throw `Unknown operator provided in operation: ${lhs}, ${rhs}.`
            }
        }
    }
}

function equals(lhs: RuntimeValue, rhs: RuntimeValue, strict: boolean): RuntimeValue {
    const compare = strict ? (a: unknown, b: unknown) => a === b : (a: unknown, b: unknown) => a !== b;

    switch (lhs.type) {
        case 'boolean':
            return MK_BOOL(compare((lhs as BooleanValue).value, (rhs as BooleanValue).value));
        case 'number':
            return MK_BOOL(compare((lhs as NumberValue).value, (rhs as NumberValue).value));
        case 'string':
            return MK_BOOL(compare((lhs as StringValue).value, (rhs as StringValue).value));
        case 'user-defined-fn':
            return MK_BOOL(compare((lhs as UserDefinedFnValue).body, (rhs as UserDefinedFnValue).body));
        case 'internal-fn':
            return MK_BOOL(compare((lhs as InternalFnValue).call, (rhs as InternalFnValue).call));
        case 'null':
            return MK_BOOL(compare((lhs as NullValue).value, (rhs as NullValue).value));
        case 'object':
            return MK_BOOL(compare((lhs as ObjectValue).properties, (rhs as ObjectValue).properties));
        // case 'array':
        //     return MK_BOOL(compare((lhs as ArrayVal).values, (rhs as ArrayVal).values ));
        default:
            throw `[RunTime Error]: Unhandled type in equals function: ${lhs.type}, ${rhs.type}`
    }
}

export function evaluate_binary_expr(biop: BinaryExpr, env: Environment): RuntimeValue {
    const lhs = evaluate(biop.lhs, env);
    const rhs = evaluate(biop.rhs, env);

    return evaluate_numeric_binary_expr(lhs, rhs, biop.operator);
}


export function eval_idenifier(ident: Identifier, env: Environment): RuntimeValue {
    const val = env.lookFor(ident.symbol);

    return val;
}

export function eval_object_expr(obj: ObjectLiteral, env: Environment): RuntimeValue {
    const object = { type: "object", properties: new Map() } as ObjectValue;

    for (const { key, value } of obj.properties) {
        // Handle valid key: value
        const runtimeValue = (value == undefined ? env.lookFor(key) : evaluate(value, env));

        object.properties.set(key, runtimeValue);
    }

    return object;
}

export function eval_call_expr(expr: CallExpr, env: Environment): RuntimeValue {
    const args = expr.args.map((arg) => evaluate(arg, env));
    const fn = evaluate(expr.caller, env);

    if (fn.type == "internal-fn") {
        const res = (fn as InternalFnValue).call(args, env);
        return res;

    }
    else if (fn.type == "user-defined-fn") {
        const func = fn as UserDefinedFnValue;
        const scope = new Environment(func.declarationEnv);
        // create variable for params
        for (let i = 0; i < func.params.length; i++) {
            //TODO: Check the bounds here.
            //Verify arity here.
            const varName = func.params[i];
            scope.declareVar(varName, args[i], false)
        }

        let res: RuntimeValue = MK_NULL()

        for (const stmt of func.body) {
            res = evaluate(stmt, scope)
        }

        return res;
    }

    throw `You have no part of symphony 🐬🐬\n[Runtime Error]: '${JSON.stringify(fn)}' is not a function.`

}

export function eval_member_expr(env: Environment, node: AssignmentExpr, expr: MemberExpr): RuntimeValue {
    if (expr) return env.lookObj(expr);
    if (node) return env.lookObj(node.assigne as MemberExpr, evaluate(node.value, env));

    throw `You have no part of symphony 🐬🐬\n[Runtime Error]: Variable named '${(node as AssignmentExpr).assigne} is not an object.'`;
}

export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeValue {
    if (node.assigne.kind !== "Identifier") {
        throw `You have no part of symphony 🐬🐬\n[Runtime Error]: Invalid expression.\n${JSON.stringify(node.assigne)}`;
    }

    const varName = (node.assigne as Identifier).symbol;

    return env.assignVar(varName, evaluate(node.value, env));
}
