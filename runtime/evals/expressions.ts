import { AssignmentExpr, BinaryExpr, Identifier, VarDeclaration } from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { NumberValue, RuntimeValue, MK_NULL } from "../values";

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

export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeValue {
    if (node.assigne.kind !== "Identifier") {
        throw `You have no part of symphony 🐬🐬\n[Runtime Error]: Invalid expression.\n${JSON.stringify(node.assigne)}`;
    }

    const varName = (node.assigne as Identifier).symbol;

    return env.assignVar(varName, evaluate(node.value, env));
}


