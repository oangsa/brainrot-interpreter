import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral, VarDeclaration } from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { NumberValue, RuntimeValue, MK_NULL, ObjectValue, InternalFnValue, UserDefinedFnValue } from "../values";

export function evaluate_numeric_binary_expr(lhs: NumberValue, rhs: NumberValue, operator: string): NumberValue {
    let result: number = 0;

    if (operator == "+") {
        result = lhs.value + rhs.value;
    }
    else if (operator == "-") {
        result = lhs.value - rhs.value;
    }
    else if (operator == "*") {
        result = lhs.value * rhs.value;
    }
    else if (operator == "/") {
        result = lhs.value / rhs.value;
    }
    else {
        result = lhs.value % rhs.value;
    }

    return {value: result, type: "number"}
}

export function evaluate_binary_expr (biop: BinaryExpr, env: Environment): RuntimeValue {
    const lhs = evaluate(biop.lhs, env);
    const rhs = evaluate(biop.rhs, env);

    if (lhs.type == 'number' && rhs.type == 'number') {
        return evaluate_numeric_binary_expr(lhs as NumberValue, rhs as NumberValue, biop.operator);
    }

    return MK_NULL();
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

export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeValue {
    if (node.assigne.kind !== "Identifier") {
        throw `You have no part of symphony 🐬🐬\n[Runtime Error]: Invalid expression.\n${JSON.stringify(node.assigne)}`;
    }

    const varName = (node.assigne as Identifier).symbol;

    return env.assignVar(varName, evaluate(node.value, env));
}


