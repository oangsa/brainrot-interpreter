import { ValueType, RuntimeValue, NumberValue, MK_NULL } from './values';
import { AssignmentExpr, BinaryExpr, Identifier, NoteType, NumericLiteral, Program, Statement, VarDeclaration } from '../frontend/ast';
import Environment from './environment';
import { evaluate_program, eval_var_declaration } from './evals/statements';
import { eval_assignment, eval_idenifier, evaluate_binary_expr } from './evals/expressions';

export function evaluate(astNote: Statement, env: Environment): RuntimeValue {

    switch (astNote.kind) {
        case "NumericLiteral":
            return { value: ((astNote as NumericLiteral).value), type: "number" } as RuntimeValue

        case "Identifier":
            return eval_idenifier(astNote as Identifier, env);

        case "AssignmentExpr":
            return eval_assignment(astNote as AssignmentExpr, env);

        case 'BinaryExpr':
            return evaluate_binary_expr(astNote as BinaryExpr, env);

        case 'Program':
            return evaluate_program(astNote as Program, env);

        case "VariableDeclaration":
            return eval_var_declaration(astNote as VarDeclaration, env)

        default:
            console.error(astNote)
            throw("[Runtime Error] This AST Note has not yet implement.")
    }
}


