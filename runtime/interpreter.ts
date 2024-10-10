import { ValueType, RuntimeValue, NullValue, NumberValue } from './values';
import { BinaryExpr, NoteType, NumericLiteral, Program, Statement } from '../frontend/ast';


function evaluate_numeric_binary_expr (lhs: NumberValue, rhs: NumberValue, operator: string): NumberValue {
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

function evaluate_binary_expr (biop: BinaryExpr): RuntimeValue {
    const lhs = evaluate(biop.lhs);
    const rhs = evaluate(biop.rhs);

    if (lhs.type == 'number' && rhs.type == 'number') {
        return evaluate_numeric_binary_expr(lhs as NumberValue, rhs as NumberValue, biop.operator);
    }

    return { type: "null", value: "null" } as NullValue;
}



function evaluate_program (program: Program): RuntimeValue {
    let lastEvaluated: RuntimeValue = { type: 'null', value: 'null' } as NullValue

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement);
    }
    return lastEvaluated;
}

export function evaluate (astNote: Statement): RuntimeValue {


    switch (astNote.kind) {
        case "NumericLiteral":
            return { value: ((astNote as NumericLiteral).value), type: "number" } as RuntimeValue

        case "NullLiteral":
            return {value: "null", type: "null"} as NullValue;

        case 'BinaryExpr':
            return evaluate_binary_expr(astNote as BinaryExpr);

        case 'Program':
            return evaluate_program(astNote as Program);

        default:
            console.error(astNote)
            throw("[Interpreter Error] This AST Note has not yet implement.")
    }
}