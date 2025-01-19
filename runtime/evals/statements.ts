import { FunctionDeclaration, Program, VarDeclaration } from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { RuntimeValue, MK_NULL, UserDefinedFnValue } from "../values";

export function evaluate_program(program: Program, env: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = MK_NULL();

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env);
    }
    return lastEvaluated;
}

export function eval_var_declaration(declaration: VarDeclaration, env: Environment): RuntimeValue {
    const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL();

    return env.declareVar(declaration.identifier, value, declaration.isConstant);
}

export function eval_func_declaration(declaration: FunctionDeclaration, env: Environment): RuntimeValue {

    const fn = {
        type: 'user-defined-fn',
        params: declaration.params,
        name: declaration.name,
        declarationEnv: env,
        body: declaration.body,
    } as UserDefinedFnValue

    return env.declareVar(declaration.name, fn, true)

}
