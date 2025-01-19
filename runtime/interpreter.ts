import { RuntimeValue } from './values';
import { AssignmentExpr, BinaryExpr, CallExpr, FunctionDeclaration, Identifier, MemberExpr, NumericLiteral, ObjectLiteral, Program, RelationalExpr, Statement, StringLiteral, VarDeclaration } from '../frontend/ast';
import Environment from './environment';
import { evaluate_program, eval_var_declaration, eval_func_declaration } from './evals/statements';
import { eval_assignment, eval_call_expr, eval_idenifier, eval_member_expr, eval_object_expr, evaluate_binary_expr, evaluate_relation_expr } from './evals/expressions';

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {

    switch (astNode.kind) {

        case "NumericLiteral":
            return { value: ((astNode as NumericLiteral).value), type: "number" } as RuntimeValue

        case "StringLiteral":
            return { value: ((astNode as StringLiteral).value), type: "string" } as RuntimeValue

        case "Identifier":
            return eval_idenifier(astNode as Identifier, env);

        case "ObjectLiteral":
            return eval_object_expr(astNode as ObjectLiteral, env);

        case "CallExpr":
            return eval_call_expr(astNode as CallExpr, env);

        case "MemberExpr":
            return eval_member_expr(env, undefined, astNode as MemberExpr);

        case "AssignmentExpr":
            return eval_assignment(astNode as AssignmentExpr, env);

        case 'BinaryExpr':
            return evaluate_binary_expr(astNode as BinaryExpr, env);

        case 'Program':
            return evaluate_program(astNode as Program, env);

        case "VariableDeclaration":
            return eval_var_declaration(astNode as VarDeclaration, env)

        case "FunctionDeclaration":
            return eval_func_declaration(astNode as FunctionDeclaration, env)

        default:
            console.error(astNode)
            throw("[Runtime Error] This AST Node has not yet implement.")
    }
}
